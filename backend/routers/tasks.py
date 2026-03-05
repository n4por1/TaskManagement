from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db
from utils import compute_task_progress, compute_parent_status

router = APIRouter(prefix="/tasks", tags=["tasks"])

VALID_STATUSES = {"未着手", "進行中", "待ち", "完了"}
VALID_PRIORITIES = {"低", "中", "高"}
MAX_DEPTH = 2  # goal(0) → root task(1) → child task(2)


def _depth_of(task: models.Task) -> int:
    """Return 1 for root task, 2 for child task."""
    return 2 if task.parent_task_id else 1


def _enrich(task: models.Task) -> schemas.TaskOut:
    out = schemas.TaskOut.model_validate(task)
    out.progress = compute_task_progress(task)
    out.children = [_enrich(c) for c in task.children]
    return out


def _propagate_parent(task: models.Task, db: Session):
    """Auto-update parent task status when a child changes."""
    if not task.parent_task_id:
        return
    parent = db.get(models.Task, task.parent_task_id)
    if parent:
        parent.status = compute_parent_status(parent)
        db.commit()


@router.get("/", response_model=list[schemas.TaskOut])
def list_tasks(
    goal_id: int | None = None,
    status: str | None = None,
    db: Session = Depends(get_db),
):
    q = db.query(models.Task).filter(models.Task.parent_task_id.is_(None))
    if goal_id is not None:
        q = q.filter(models.Task.goal_id == goal_id)
    if status:
        q = q.filter(models.Task.status == status)
    return [_enrich(t) for t in q.all()]


@router.post("/", response_model=schemas.TaskOut, status_code=201)
def create_task(payload: schemas.TaskCreate, db: Session = Depends(get_db)):
    if payload.status not in VALID_STATUSES:
        raise HTTPException(400, f"Invalid status: {payload.status}")
    if payload.priority not in VALID_PRIORITIES:
        raise HTTPException(400, f"Invalid priority: {payload.priority}")

    # Enforce max depth
    if payload.parent_task_id:
        parent = db.get(models.Task, payload.parent_task_id)
        if not parent:
            raise HTTPException(404, "Parent task not found")
        if _depth_of(parent) >= MAX_DEPTH:
            raise HTTPException(400, "WBS depth limit reached (max 3 levels: Goal → Task → SubTask)")

    task = models.Task(**payload.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    _propagate_parent(task, db)
    return _enrich(task)


@router.get("/{task_id}", response_model=schemas.TaskOut)
def get_task(task_id: int, db: Session = Depends(get_db)):
    task = db.get(models.Task, task_id)
    if not task:
        raise HTTPException(404, "Task not found")
    return _enrich(task)


@router.patch("/{task_id}", response_model=schemas.TaskOut)
def update_task(task_id: int, payload: schemas.TaskUpdate, db: Session = Depends(get_db)):
    task = db.get(models.Task, task_id)
    if not task:
        raise HTTPException(404, "Task not found")
    data = payload.model_dump(exclude_unset=True)
    if "status" in data and data["status"] not in VALID_STATUSES:
        raise HTTPException(400, f"Invalid status: {data['status']}")
    if "priority" in data and data["priority"] not in VALID_PRIORITIES:
        raise HTTPException(400, f"Invalid priority: {data['priority']}")

    for key, value in data.items():
        setattr(task, key, value)

    # Set completed_at timestamp
    if data.get("status") == "完了" and not task.completed_at:
        task.completed_at = datetime.now(timezone.utc)
    elif data.get("status") != "完了":
        task.completed_at = None

    db.commit()
    db.refresh(task)
    _propagate_parent(task, db)
    return _enrich(task)


@router.delete("/{task_id}", status_code=204)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.get(models.Task, task_id)
    if not task:
        raise HTTPException(404, "Task not found")
    parent_task_id = task.parent_task_id
    db.delete(task)
    db.commit()
    # Re-propagate parent after deletion
    if parent_task_id:
        parent = db.get(models.Task, parent_task_id)
        if parent:
            parent.status = compute_parent_status(parent)
            db.commit()
