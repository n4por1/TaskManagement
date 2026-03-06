import json
import os

import requests
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
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


@router.get("", response_model=list[schemas.GoalOut])
def list_goals(db: Session = Depends(get_db)):
    goals = db.query(models.Goal).filter(models.Goal.parent_goal_id.is_(None)).all()
    return [_enrich(g, db) for g in goals]


@router.post("", response_model=schemas.GoalOut, status_code=201)
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


class SuggestedTask(BaseModel):
    title: str
    description: str
    subtasks: list[str] = []


class SuggestTasksResponse(BaseModel):
    tasks: list[SuggestedTask]


OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://localhost:11434")
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "qwen2.5:7b")

PROMPT_TEMPLATE = """以下のJSON形式のみで回答してください。タスク名・説明・サブタスクはすべて日本語で書いてください。目標の内容に関わらず、必ず日本語で出力してください。

例:
{{
  "tasks": [
    {{
      "title": "現状分析",
      "description": "現在の状況を把握し、課題を明確にする。",
      "subtasks": ["現状をリストアップする", "問題点を整理する", "優先順位を決める"]
    }},
    {{
      "title": "計画立案",
      "description": "達成に向けた具体的な行動計画を作成する。",
      "subtasks": ["マイルストーンを設定する", "スケジュールを作成する"]
    }}
  ]
}}

{goal_info}

上記の目標を達成するために必要なタスクをJSON形式で出力してください。title・description・subtasksはすべて日本語で書いてください。英語を使わないでください。JSONのみ出力し、説明文は不要です。"""


def _extract_json(text: str) -> str:
    if "```" in text:
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    start = text.find("{")
    end = text.rfind("}") + 1
    if start == -1 or end == 0:
        raise ValueError("JSON not found")
    return text[start:end]


@router.post("/{goal_id}/suggest-tasks", response_model=SuggestTasksResponse)
def suggest_tasks(goal_id: int, db: Session = Depends(get_db)):
    goal = db.get(models.Goal, goal_id)
    if not goal:
        raise HTTPException(404, "Goal not found")

    goal_info = f"目標: {goal.title}"
    if goal.description:
        goal_info += f"\n説明: {goal.description}"
    if goal.success_criteria:
        goal_info += f"\n成功条件: {goal.success_criteria}"
    if goal.end_date:
        goal_info += f"\n期限: {goal.end_date}"

    user_prompt = PROMPT_TEMPLATE.format(goal_info=goal_info)

    def call_ollama(prompt: str) -> str:
        resp = requests.post(
            f"{OLLAMA_URL}/api/generate",
            json={
                "model": OLLAMA_MODEL,
                "stream": False,
                "prompt": prompt,
                "options": {"temperature": 0.3},
                "system": "あなたは日本語専門のタスク計画アシスタントです。必ず日本語のみで回答してください。",
            },
            timeout=120,
        )
        resp.raise_for_status()
        return resp.json()["response"].strip()

    def is_mostly_japanese(text: str) -> bool:
        """Return True if the text contains sufficient Japanese characters."""
        japanese = sum(1 for c in text if "\u3000" <= c <= "\u9fff" or "\uff00" <= c <= "\uffef")
        ascii_alpha = sum(1 for c in text if c.isalpha() and ord(c) < 128)
        return japanese > ascii_alpha

    try:
        raw = call_ollama(user_prompt)

        # If response is not in Japanese, translate field by field
        if not is_mostly_japanese(raw):
            try:
                parsed = json.loads(_extract_json(raw))

                def translate_str(text: str) -> str:
                    if not text or is_mostly_japanese(text):
                        return text
                    prompt = f"Translate to Japanese (one short phrase only): {text}\n\nJapanese translation:"
                    result = call_ollama(prompt).strip().splitlines()[0].strip()
                    return result

                for task in parsed.get("tasks", []):
                    task["title"] = translate_str(task.get("title", ""))
                    task["description"] = translate_str(task.get("description", ""))
                    task["subtasks"] = [translate_str(s) for s in task.get("subtasks", [])]
                raw = json.dumps(parsed, ensure_ascii=False)
            except Exception:
                pass  # Use original raw if translation fails
    except Exception as e:
        raise HTTPException(500, f"Ollama への接続に失敗しました: {e}")

    try:
        data = json.loads(_extract_json(raw))
        return SuggestTasksResponse(tasks=data["tasks"])
    except Exception:
        raise HTTPException(500, "AIの応答を解析できませんでした")
