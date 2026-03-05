from datetime import date, datetime
from sqlalchemy import Date, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class Goal(Base):
    __tablename__ = "goals"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    start_date: Mapped[date | None] = mapped_column(Date)
    end_date: Mapped[date | None] = mapped_column(Date)
    status: Mapped[str] = mapped_column(String(20), default="未着手")
    priority: Mapped[str] = mapped_column(String(10), default="中")
    success_criteria: Mapped[str | None] = mapped_column(Text)
    parent_goal_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("goals.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    tasks: Mapped[list["Task"]] = relationship(
        "Task", back_populates="goal", cascade="all, delete-orphan"
    )
    sub_goals: Mapped[list["Goal"]] = relationship("Goal")


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    due_date: Mapped[date | None] = mapped_column(Date)
    status: Mapped[str] = mapped_column(String(20), default="未着手")
    priority: Mapped[str] = mapped_column(String(10), default="中")
    goal_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("goals.id"))
    parent_task_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("tasks.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    completed_at: Mapped[datetime | None] = mapped_column(DateTime)

    goal: Mapped["Goal | None"] = relationship("Goal", back_populates="tasks")
    children: Mapped[list["Task"]] = relationship(
        "Task",
        back_populates="parent",
        cascade="all, delete-orphan",
    )
    parent: Mapped["Task | None"] = relationship(
        "Task", back_populates="children", remote_side="Task.id"
    )
