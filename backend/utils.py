from __future__ import annotations
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from sqlalchemy.orm import Session
    import models


def compute_task_progress(task: "models.Task") -> float:
    """
    Leaf task: 1.0 if 完了, else 0.0
    Parent task: mean of children's progress
    """
    if not task.children:
        return 1.0 if task.status == "完了" else 0.0
    if len(task.children) == 0:
        return 0.0
    return sum(compute_task_progress(c) for c in task.children) / len(task.children)


def compute_parent_status(parent: "models.Task") -> str:
    """
    Auto-derive parent task status from its children.
    全子未着手 → 未着手 / 全子完了 → 完了 / それ以外 → 進行中
    """
    children = parent.children
    if not children:
        return parent.status
    statuses = {c.status for c in children}
    if statuses == {"未着手"}:
        return "未着手"
    if statuses == {"完了"}:
        return "完了"
    return "進行中"


def compute_goal_progress(
    goal: "models.Goal", db: "Session"
) -> tuple[float, int, int]:
    """
    Returns (progress 0.0-1.0, total_leaf_tasks, completed_leaf_tasks).
    Counts only leaf tasks (tasks with no children).
    """
    root_tasks = [t for t in goal.tasks if t.parent_task_id is None]

    leaf_tasks: list["models.Task"] = []
    for rt in root_tasks:
        _collect_leaves(rt, leaf_tasks)

    total = len(leaf_tasks)
    if total == 0:
        return 0.0, 0, 0
    done = sum(1 for t in leaf_tasks if t.status == "完了")
    return done / total, total, done


def _collect_leaves(task: "models.Task", acc: list) -> None:
    if not task.children:
        acc.append(task)
    else:
        for child in task.children:
            _collect_leaves(child, acc)
