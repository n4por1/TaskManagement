from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db
from utils import compute_goal_progress

router = APIRouter(prefix="/goals", tags=["goals"])

VALID_STATUSES = {"未着手", "進行中", "完了", "中止"}
VALID_PRIORITIES = {"低", "中", "高"}


def _enrich(goal: models.Goal, db: Session) -> schemas.GoalOut:
    progress, total, done = compute_goal_progress(goal, db)
    out = schemas.GoalOut.model_validate(goal)
    out.progress = progress
    out.task_count = total
    out.completed_task_count = done
    return out


@router.get("/", response_model=list[schemas.GoalOut])
def list_goals(db: Session = Depends(get_db)):
    goals = db.query(models.Goal).filter(models.Goal.parent_goal_id.is_(None)).all()
    return [_enrich(g, db) for g in goals]


@router.post("/", response_model=schemas.GoalOut, status_code=201)
def create_goal(payload: schemas.GoalCreate, db: Session = Depends(get_db)):
    if payload.status not in VALID_STATUSES:
        raise HTTPException(400, f"Invalid status: {payload.status}")
    if payload.priority not in VALID_PRIORITIES:
        raise HTTPException(400, f"Invalid priority: {payload.priority}")
    goal = models.Goal(**payload.model_dump())
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return _enrich(goal, db)


@router.get("/{goal_id}", response_model=schemas.GoalOut)
def get_goal(goal_id: int, db: Session = Depends(get_db)):
    goal = db.get(models.Goal, goal_id)
    if not goal:
        raise HTTPException(404, "Goal not found")
    return _enrich(goal, db)


@router.patch("/{goal_id}", response_model=schemas.GoalOut)
def update_goal(goal_id: int, payload: schemas.GoalUpdate, db: Session = Depends(get_db)):
    goal = db.get(models.Goal, goal_id)
    if not goal:
        raise HTTPException(404, "Goal not found")
    data = payload.model_dump(exclude_unset=True)
    if "status" in data and data["status"] not in VALID_STATUSES:
        raise HTTPException(400, f"Invalid status: {data['status']}")
    if "priority" in data and data["priority"] not in VALID_PRIORITIES:
        raise HTTPException(400, f"Invalid priority: {data['priority']}")
    for key, value in data.items():
        setattr(goal, key, value)
    db.commit()
    db.refresh(goal)
    return _enrich(goal, db)


@router.delete("/{goal_id}", status_code=204)
def delete_goal(goal_id: int, db: Session = Depends(get_db)):
    goal = db.get(models.Goal, goal_id)
    if not goal:
        raise HTTPException(404, "Goal not found")
    db.delete(goal)
    db.commit()
