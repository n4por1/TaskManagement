from datetime import date, datetime
from pydantic import BaseModel


# ─── Goal schemas ────────────────────────────────────────────────────────────

class GoalBase(BaseModel):
    title: str
    description: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    status: str = "未着手"
    priority: str = "中"
    success_criteria: str | None = None
    parent_goal_id: int | None = None


class GoalCreate(GoalBase):
    pass


class GoalUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    status: str | None = None
    priority: str | None = None
    success_criteria: str | None = None
    parent_goal_id: int | None = None


class GoalOut(GoalBase):
    id: int
    created_at: datetime
    progress: float = 0.0
    task_count: int = 0
    completed_task_count: int = 0

    model_config = {"from_attributes": True}


# ─── Task schemas ─────────────────────────────────────────────────────────────

class TaskBase(BaseModel):
    title: str
    description: str | None = None
    due_date: date | None = None
    status: str = "未着手"
    priority: str = "中"
    goal_id: int | None = None
    parent_task_id: int | None = None


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    due_date: date | None = None
    status: str | None = None
    priority: str | None = None
    goal_id: int | None = None
    parent_task_id: int | None = None


class TaskOut(TaskBase):
    id: int
    created_at: datetime
    completed_at: datetime | None = None
    children: list["TaskOut"] = []
    progress: float = 0.0

    model_config = {"from_attributes": True}


TaskOut.model_rebuild()
