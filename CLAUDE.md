# CLAUDE.md — TaskManagement

AI アシスタント向けのプロジェクトガイドです。構造・規約・開発ワークフローを記載します。

---

## プロジェクト概要

**TaskManagement** は目標達成を支援する WBS ベースのタスク管理ツールです。

- 目標管理（Goal）
- タスク管理（Task）、3階層 WBS（Goal → 親タスク → 子タスク）
- 進捗可視化（Leaf Task ベースの進捗率計算）
- ステータス: 未着手 / 進行中 / 待ち / 完了（目標は + 中止）

将来的にチーム利用・モバイル対応・AI 機能を追加予定。

---

## 技術スタック

| レイヤー | 技術 |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| UI | Tailwind CSS v4 |
| State / Fetch | TanStack Query (React Query) |
| Routing | React Router v7 |
| Backend | FastAPI (Python) |
| ORM | SQLAlchemy 2.0 |
| DB | SQLite |

---

## ディレクトリ構成

```
TaskManagement/
├── CLAUDE.md
├── .gitignore
├── backend/
│   ├── main.py            # FastAPI エントリポイント、CORS 設定
│   ├── models.py          # SQLAlchemy モデル（Goal, Task）
│   ├── schemas.py         # Pydantic スキーマ
│   ├── database.py        # DB 接続・セッション
│   ├── utils.py           # 進捗計算ロジック
│   ├── requirements.txt
│   └── routers/
│       ├── goals.py       # GET/POST/PATCH/DELETE /goals
│       └── tasks.py       # GET/POST/PATCH/DELETE /tasks
└── frontend/
    ├── src/
    │   ├── api/client.ts  # axios ラッパー（goalsApi, tasksApi）
    │   ├── types/index.ts # 共通型定義
    │   ├── components/    # 再利用コンポーネント
    │   │   ├── GoalForm.tsx
    │   │   ├── TaskForm.tsx
    │   │   ├── WbsTree.tsx
    │   │   ├── Modal.tsx
    │   │   ├── StatusBadge.tsx
    │   │   ├── PriorityBadge.tsx
    │   │   └── ProgressBar.tsx
    │   └── pages/
    │       ├── Dashboard.tsx   # 目標一覧
    │       └── GoalDetail.tsx  # 目標詳細 + WBS
    ├── package.json
    └── vite.config.ts
```

---

## データモデル

### Goal

| カラム | 型 | 説明 |
|---|---|---|
| id | int PK | |
| title | str | 必須 |
| description | str? | |
| start_date | date? | |
| end_date | date? | |
| status | str | 未着手/進行中/完了/中止 |
| priority | str | 低/中/高 |
| success_criteria | str? | |
| parent_goal_id | int? | FK→Goal（将来の人生OS拡張用） |
| created_at | datetime | |

### Task

| カラム | 型 | 説明 |
|---|---|---|
| id | int PK | |
| title | str | 必須 |
| description | str? | |
| due_date | date? | |
| status | str | 未着手/進行中/待ち/完了 |
| priority | str | 低/中/高 |
| goal_id | int? | FK→Goal（任意） |
| parent_task_id | int? | FK→Task（WBS 親子） |
| created_at | datetime | |
| completed_at | datetime? | status=完了時に自動セット |

---

## ビジネスロジック

### WBS 深さ制限

**最大3階層**: Goal → 親タスク（depth=1）→ 子タスク（depth=2）

depth=2 のタスクには子タスクを追加できない（API で 400 を返す）。

### 進捗計算（`utils.py`）

- **Leaf Task**（children なし）: status=完了 → 1.0、それ以外 → 0.0
- **親タスク**: 子タスクの progress の平均
- **Goal**: 全 Leaf Task のうち完了数 / 総数

### 親タスクのステータス自動計算

子タスクの status 変更時に親タスクのステータスを自動更新:

| 条件 | 親ステータス |
|---|---|
| 全子 未着手 | 未着手 |
| 全子 完了 | 完了 |
| それ以外 | 進行中 |

### 「待ち」ステータス

子タスク（Leaf Task）のみ手動で設定可能。他人の作業待ちを表す。
親タスクの自動計算では「進行中」扱い。

---

## API エンドポイント

### Goals

| Method | Path | 説明 |
|---|---|---|
| GET | /goals | 一覧（parent_goal_id=null のみ） |
| POST | /goals | 作成 |
| GET | /goals/{id} | 取得 |
| PATCH | /goals/{id} | 更新 |
| DELETE | /goals/{id} | 削除（タスクも cascade） |

### Tasks

| Method | Path | 説明 |
|---|---|---|
| GET | /tasks | 一覧（?goal_id=&status= フィルタ可） |
| POST | /tasks | 作成 |
| GET | /tasks/{id} | 取得 |
| PATCH | /tasks/{id} | 更新（status 変更で親を自動更新） |
| DELETE | /tasks/{id} | 削除（子タスクも cascade） |

---

## 起動方法

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
# → http://localhost:8000
# → API ドキュメント: http://localhost:8000/docs
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

Frontend の `/api/*` は Vite proxy 経由で `http://localhost:8000` に転送される。

---

## Git 設定

- **Remote:** `http://local_proxy@127.0.0.1:49981/git/n4por1/TaskManagement`
- **作業ブランチ:** `claude/add-claude-documentation-hKsTD`
- **Commit signing:** SSH (`/home/claude/.ssh/commit_signing_key.pub`)
- **Git user:** Claude <noreply@anthropic.com>

### ブランチ命名規則

| プレフィックス | 用途 |
|---|---|
| `claude/` | AI アシスタントのブランチ |
| `feature/` | 新機能 |
| `fix/` | バグ修正 |
| `docs/` | ドキュメント |

### コミットメッセージ

```
<type>(<scope>): <概要>
```

例: `feat(tasks): 子タスク追加 API を実装`

---

## 開発規約

### Frontend

- コンポーネントは `src/components/` に配置
- ページは `src/pages/` に配置
- API 呼び出しは必ず `src/api/client.ts` 経由
- 型は `src/types/index.ts` で集中管理
- Tailwind のユーティリティクラスを使用、CSS ファイルは最小限

### Backend

- ルーターは `routers/` に機能単位で分割
- ビジネスロジック（進捗計算等）は `utils.py` に集約
- Pydantic スキーマと SQLAlchemy モデルを明確に分離
- secrets / credentials は絶対にコミットしない

---

## 将来拡張（v2 以降）

- AI による WBS 自動生成
- 週次レビュー機能
- KPI 分解（目標 → 週次 → 日次）
- ユーザー認証・チーム共有
- ガントチャート
- クラウド同期・モバイルアプリ（React Native）

---

*Last updated: 2026-03-05 — MVP 実装完了（Goal/Task CRUD + WBS + 進捗管理）*
