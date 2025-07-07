from fastapi import FastAPI
from app.api.v1.routes.user import user_router

app = FastAPI()

app.include_router(user_router, prefix="/users", tags=["User"])


@app.get("/")
def Home():
    return {"message": "Welcome to GatePass!"}
