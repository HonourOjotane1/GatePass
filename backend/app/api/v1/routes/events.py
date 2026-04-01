from fastapi import APIRouter, Depends
from sqlalchemy.orm import session
from app.api.v1.services.events import EventsCrud
from app.api.v1.schemas.event import EventCreate
from app.db.database import get_db

event_router = APIRouter()
@event_router.get("/")
def get_event(db:session=Depends(get_db)):
    events= EventsCrud.get_event(db)
    return {"message":"successful", "data": events}

@event_router.post("/create")
def event_create(payload:EventCreate, db:session=Depends(get_db)):
    user_id =1 # replace with auth later
    event = EventsCrud.eventcreate(db, payload, user_id)
    return {"message":"eventcreated successfully.","data": event}