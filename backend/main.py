from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base
from database import engine

from routers.auth import router as auth_router
from routers.rag import router as rag_router

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(rag_router)


@app.get("/")
def home():
    return {
        "message": "Multi-Tenant Document Query System Running"
    }