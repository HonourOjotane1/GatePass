from fastapi import FastAPI
from app.api.v1.routes.user import user_router
from app.api.v1.routes.guests import guest_router
app = FastAPI()

app.include_router(user_router, prefix="/users", tags=["User"])
app.include_router(guest_router, prefix="/guests", tags=["Guest"])

@app.get("/")
def Home():
    return {"message": "Welcome to GatePass!"}
