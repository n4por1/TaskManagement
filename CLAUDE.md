# CLAUDE.md — TaskManagement

AI アシスタント向けのプロジェクトガイドです。構造・規約・開発ワークフローを記載します。

---

## プロジェクト概要

**TaskManagement** は目標達成を支援する WBS ベースのタスク管理ツールです。

- 目標管理（Goal）
- タスク管理（Task）、3階層 WBS（Goal → 親タスク → 子タスク）
- 進捗可視化（Leaf Task ベースの進捗率計算）
- ステータス: 未着手 / 進行中 / 待ち / 完了（目標は + 中止）
- AI タスク提案（Ollama 連携による WBS 自動生成）

将来的にチーム利用・モバイル対応・追加 AI 機能を予定。

---

## 技術スタック

| レイヤー | 技術 | バージョン |
|---|---|---|
| Frontend | React + TypeScript + Vite | React 19.2.0, TS 5.9.3, Vite 7.3.1 |
| UI | Tailwind CSS v4 | 4.2.1 |
| State / Fetch | TanStack Query (React Query) | 5.90.21 |
| Routing | React Router | 7.13.1 |
| HTTP | Axios | 1.13.6 |
| Backend | FastAPI (Python) | 0.111.0 |
| ORM | SQLAlchemy | 2.0.30 |
| Validation | Pydantic | 2.7.1 |
| DB | SQLite | - |
| AI | Ollama API（qwen2.5:7b） | anthropic >=0.40.0 |

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
│       ├── __init__.py
│       ├── goals.py       # GET/POST/PATCH/DELETE /goals + AI suggest-tasks
│       └── tasks.py       # GET/POST/PATCH/DELETE /tasks
└── frontend/
    ├── src/
    │   ├── main.tsx           # React エントリポイント（QueryClient + Router）
    │   ├── App.tsx            # ルーティング定義、ナビゲーションバー
    │   ├── index.css          # Tailwind v4 設定、共通クラス定義
    │   ├── api/
    │   │   └── client.ts      # axios ラッパー（goalsApi, tasksApi）
    │   ├── types/
    │   │   └── index.ts       # 共通型定義（Goal, Task, SuggestedTask 等）
    │   ├── components/
    │   │   ├── GoalForm.tsx    # 目標作成・編集フォーム
    │   │   ├── TaskForm.tsx    # タスク作成・編集フォーム
    │   │   ├── WbsTree.tsx     # WBS ツリー表示・操作（インライン状態変更）
    │   │   ├── Modal.tsx       # モーダルダイアログラッパー
    │   │   ├── StatusBadge.tsx # ステータスバッジ
    │   │   ├── PriorityBadge.tsx # 優先度バッジ
    │   │   ├── ProgressBar.tsx # 進捗バー
    │   │   └── DueDate.tsx     # 期日ユーティリティ・表示コンポーネント
    │   └── pages/
    │       ├── Dashboard.tsx   # 目標一覧 + 統計バー
    │       └── GoalDetail.tsx  # 目標詳細 + WBS + AI タスク提案モーダル
    ├── package.json
    ├── vite.config.ts
    ├── tsconfig.json
    ├── tsconfig.app.json
    └── tsconfig.node.json
```

---

## データモデル

### Goal

| カラム | 型 | 説明 |
|---|---|---|
| id | int PK | |
| title | str(255) | 必須 |
| description | str? | |
| start_date | date? | |
| end_date | date? | |
| status | str | 未着手/進行中/完了/中止、デフォルト: 未着手 |
| priority | str | 低/中/高、デフォルト: 中 |
| success_criteria | text? | |
| parent_goal_id | int? | FK→Goal（将来の人生OS拡張用） |
| created_at | datetime | 自動セット |

### Task

| カラム | 型 | 説明 |
|---|---|---|
| id | int PK | |
| title | str(255) | 必須 |
| description | text? | |
| due_date | date? | |
| status | str | 未着手/進行中/待ち/完了、デフォルト: 未着手 |
| priority | str | 低/中/高、デフォルト: 中 |
| goal_id | int? | FK→Goal（任意） |
| parent_task_id | int? | FK→Task（WBS 親子） |
| created_at | datetime | 自動セット |
| completed_at | datetime? | status=完了時に UTC で自動セット、他ステータスに戻すとクリア |

---

## ビジネスロジック

### WBS 深さ制限

**最大3階層**: Goal → 親タスク（depth=1）→ 子タスク（depth=2）

- depth=2 のタスクには子タスクを追加できない（API で 400 を返す）
- フロントエンドでも深さ判定し、depth=2 には子追加ボタンを表示しない

### 進捗計算（`utils.py`）

- **Leaf Task**（children なし）: status=完了 → 1.0、それ以外 → 0.0
- **親タスク**: 子タスクの progress の平均（`compute_task_progress`）
- **Goal**: 全 Leaf Task のうち完了数 / 総数（`compute_goal_progress`）
  - タスクが0件の場合は 0.0

### 親タスクのステータス自動計算（`compute_parent_status`）

子タスクの status 変更時に親タスクのステータスを自動更新:

| 条件 | 親ステータス |
|---|---|
| 全子 未着手 | 未着手 |
| 全子 完了 | 完了 |
| それ以外（待ち含む） | 進行中 |

### 「待ち」ステータス

子タスク（Leaf Task）のみ手動で設定可能。他人の作業待ちを表す。
親タスクの自動計算では「進行中」扱い。

### completed_at の自動管理

- `PATCH /tasks/{id}` で `status="完了"` にすると `completed_at` を UTC でセット
- 完了以外に変更すると `completed_at` を `None` に戻す

### AI タスク提案（`routers/goals.py`）

- **エンドポイント**: `POST /goals/{goal_id}/suggest-tasks`
- **モデル**: Ollama API の `qwen2.5:7b`（環境変数で設定可能）
- **環境変数**:
  - `OLLAMA_URL`: デフォルト `http://localhost:11434`
  - `OLLAMA_MODEL`: デフォルト `qwen2.5:7b`
- **動作**: 目標タイトル・説明・達成条件・期日を含む JSON プロンプトを生成 → Ollama で WBS を JSON 形式で返す → 非日本語の場合は自動翻訳
- **レスポンス**: `SuggestTasksResponse { tasks: SuggestedTask[] }`
  - `SuggestedTask`: `{ title: str, description: str, subtasks: str[] }`
- **エラー処理**: Ollama 未起動時や解析失敗時は 500 を返す

---

## API エンドポイント

### Goals

| Method | Path | 説明 |
|---|---|---|
| GET | /goals | 一覧（parent_goal_id=null のみ）、progress 付き |
| POST | /goals | 作成（status/priority バリデーション有り） |
| GET | /goals/{id} | 取得（progress, task_count 付き） |
| PATCH | /goals/{id} | 更新 |
| DELETE | /goals/{id} | 削除（タスクも cascade） |
| POST | /goals/{id}/suggest-tasks | AI によるタスク提案 |

### Tasks

| Method | Path | 説明 |
|---|---|---|
| GET | /tasks | 一覧（`?goal_id=` `?status=` フィルタ可、root のみ） |
| POST | /tasks | 作成（WBS 深さ制限チェック） |
| GET | /tasks/{id} | 取得（children 付き） |
| PATCH | /tasks/{id} | 更新（status 変更で親を自動更新, completed_at 自動管理） |
| DELETE | /tasks/{id} | 削除（子タスクも cascade、親の status 再計算） |

### その他

| Method | Path | 説明 |
|---|---|---|
| GET | /health | ヘルスチェック |

---

## フロントエンド詳細

### TanStack Query キー設計

| クエリキー | 用途 |
|---|---|
| `['goals']` | 目標一覧（Dashboard） |
| `['goal', goalId]` | 目標詳細（GoalDetail） |
| `['tasks', goalId]` | 目標別タスク一覧 |

ミューテーション後は影響するクエリを `invalidateQueries` で無効化する。

### Mutation 後の invalidation パターン

タスク作成・更新・削除時は以下をすべて無効化:
- `['goal', goalId]` - 進捗が変化する可能性
- `['tasks', goalId]` - タスク一覧が変化
- `['goals']` - ダッシュボードの統計が変化

### コンポーネント詳細

**WbsTree.tsx**
- `TaskRow` コンポーネントで再帰レンダリング
- ステータスバッジをクリックしてインライン変更（`StatusDropdown`）
- ホバーで編集・削除・子タスク追加ボタンを表示
- depth=2 の子タスクには「子追加」ボタン非表示

**DueDate.tsx**
- `getDueDateState(dueDate)`: `'overdue' | 'soon' | 'ok' | null` を返すユーティリティ
  - overdue: 期日 < 今日
  - soon: 0 ≤ 残り日数 ≤ 3
  - ok: 残り日数 > 3
- `DueDateLabel` コンポーネント: 期日状態に応じて赤/アンバー/グレーで表示

**Dashboard.tsx**
- `StatsBar`: アクティブ目標数・完了目標数・タスク完了数・全体進捗率を表示

**GoalDetail.tsx**
- `SuggestTasksModal`: AI タスク提案を受け取り、チェックボックスで選択後一括作成
  - 親タスクを作成後、subtasks から子タスクを作成
  - 一括作成後に関連クエリをすべて無効化

### 共通スタイルクラス（index.css）

| クラス | 説明 |
|---|---|
| `.input` | テキスト入力フィールド |
| `.label` | フォームラベル |
| `.btn-primary` | 青い送信ボタン |
| `.btn-ghost` | アウトライン付きボタン |

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

AI タスク提案機能を使う場合は Ollama を別途起動:

```bash
ollama serve
ollama pull qwen2.5:7b
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

- **Remote:** `http://local_proxy@127.0.0.1:44374/git/n4por1/TaskManagement`
- **作業ブランチ:** `claude/add-claude-documentation-kKGD0`
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
- Tailwind のユーティリティクラスを使用、CSS ファイルは最小限（`index.css` のみ）
- TanStack Query v5 の API を使用（`useQuery`, `useMutation`, `useQueryClient`）
- ミューテーション後は `queryClient.invalidateQueries` で関連クエリを無効化

### Backend

- ルーターは `routers/` に機能単位で分割
- ビジネスロジック（進捗計算等）は `utils.py` に集約
- Pydantic スキーマと SQLAlchemy モデルを明確に分離
- SQLAlchemy 2.0 スタイル（`Mapped` 型ヒント）を使用
- secrets / credentials は絶対にコミットしない
- バリデーションエラーは 400、存在しないリソースは 404 を返す

### 型定義

| 型 | 値 |
|---|---|
| `GoalStatus` | `'未着手' \| '進行中' \| '完了' \| '中止'` |
| `TaskStatus` | `'未着手' \| '進行中' \| '待ち' \| '完了'` |
| `Priority` | `'低' \| '中' \| '高'` |

---

## 将来拡張（v2 以降）

- 週次レビュー機能
- KPI 分解（目標 → 週次 → 日次）
- ユーザー認証・チーム共有
- ガントチャート
- クラウド同期・モバイルアプリ（React Native）
- 人生 OS（`parent_goal_id` を使ったネスト目標）

---

*Last updated: 2026-03-08 — AI タスク提案・期日警告・ダッシュボード統計追加*
