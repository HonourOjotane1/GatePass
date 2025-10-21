from uuid import UUID
from fastapi import HTTPException
from app.api.v1.schemas.guests import Guest, GuestCreate, GuestUpdate, GuestDelete

guests = []


class GuestCrud:
    @staticmethod
    def get_guests():
        return guests

    @staticmethod
    def register(guest: GuestCreate):
        new_guest = Guest(id=len(GuestCrud.get_guests()) + 1, **guest.model_dump())
        guests.append(new_guest)
        return new_guest

    @staticmethod
    def update_guest(
        guest: GuestUpdate,
        full_name,
        email,
        status,
        is_verified,
        is_checked_in,
        created_at,
        updated_at,
    ):
        for guest in guests:
            if id != guest.id:
                raise HTTPException(status_codes=401, detail="user not found!")
            guest.full_name == full_name
            guest.email == email
            guest.status == status
            guest.is_verified == is_verified
            guest.is_checked_in == is_checked_in
            guest.created_at == created_at
            guest.updated_at == updated_at
            return guest
        
        @staticmethod
        def guest_delete(id: UUID):
            guest = GuestCrud.get_guest(id)
            if not guest:
                raise HTTPException(status_code=401, detail="guest not found!")
            guests.remove(guest)
            return {"message": "deleted successfuly!"}
                                    



guests_crud = GuestCrud()
