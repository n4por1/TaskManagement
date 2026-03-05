from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import models
from database import engine
from routers import goals, tasks

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="TaskManagement API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(goals.router)
app.include_router(tasks.router)


@app.get("/health")
def health():
    return {"status": "ok"}
