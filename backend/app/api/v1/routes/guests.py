from uuid import UUID
from fastapi import APIRouter
from app.api.v1.services.guests import GuestCrud, guests
from app.api.v1.schemas.guests import GuestUpdate, GuestCreate

guest_router = APIRouter()


@guest_router.get("/")
def get_guests():
    return GuestCrud.get_guests


@guest_router.post("/register")
def register(payload: GuestCreate):
    new_guest = GuestCrud.register(payload)
    guests.append(new_guest)
    return {"message":"success", "data":(new_guest)}


@guest_router.put("/update{id}")
def guest_update(id: UUID, payload: GuestUpdate):
    guest = GuestCrud.get_guests(id)
    updated_guest = GuestCrud.UpdateGuest(guest, payload)
    return {"message": "success", "data": updated_guest}
