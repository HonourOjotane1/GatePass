from app.api.v1.models.events import Events
from app.api.v1.schemas.event import Event, EventCreate


class EventsCrud:
    @staticmethod
    def get_event(db):
        return db.query(Events).all()

# Event creation:
# 1. Receive event data from user
# 2. Validate using EventCreate schema
# 3. Create new Events object
# 4. Save to database
# 5. Return created event
    @staticmethod
    def event_create(db, event: EventCreate,user_id:int):
        new_event = Events(
            name=event.name,
            description=event.description,
            type=event.type,
            category=event.category,
            cover_image=event.cover_image,
            start_time=event.start_time,
            end_time=event.end_time,
            venue=event.venue,
            is_virtual=event.is_virtual,
            address=event.address,
            map_coordinates=event.map_coordinates,
            created_by=user_id
        )
        # error handling
        try:
            db.add(new_event)
            db.commit()
            db.refresh(new_event)
            return new_event
        except Exception:
            db.rollback()
            raise

event_crud = EventsCrud()