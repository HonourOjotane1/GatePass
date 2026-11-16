from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi import UploadFile, File
import csv
import io
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.api.v1.schemas.guest import (
    GuestInviteSingle,
    GuestInviteBulk,
    RSVPResponse,
    GuestResponse,
    GuestListResponse,
    RSVPStatus,
    InviteMethod,
)
from app.api.v1.services.guest import (
    invite_guest,
    invite_guests_bulk,
    respond_to_rsvp,
    update_guest_status,
    get_guest_list,
    remove_guest,
    resend_invite,
)
from app.api.v1.models.user import User, UserRole
from app.core.security import get_current_user
from app.db.database import get_db

guest_router = APIRouter()


def require_organizer(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.organizer:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only organizers can access this resource.",
        )
    return current_user


@guest_router.post("/{event_id}/invite", response_model=GuestResponse)
async def invite_single(
    event_id: str,
    payload: GuestInviteSingle,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_organizer),
):
    return await invite_guest(db, event_id, current_user.id, payload)


@guest_router.post("/{event_id}/invite/bulk")
async def invite_bulk(
    event_id: str,
    payload: GuestInviteBulk,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_organizer),
):
    return await invite_guests_bulk(db, event_id, current_user.id, payload)


@guest_router.post("/{event_id}/guests/{guest_id}/resend")
async def resend(
    event_id: str,
    guest_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_organizer),
):
    return await resend_invite(db, guest_id, event_id, current_user.id)


# CSV GUEST BULK IMPORT
@guest_router.post("/{event_id}/import")
async def import_guests_from_file(
    event_id: str,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_organizer),
):
    """CSV or .xlsx with columns: first_name, last_name, email, phone_number"""
    filename = (file.filename or "").lower()
    contents = await file.read()
    rows = []

    if filename.endswith(".csv"):
        reader = csv.DictReader(io.StringIO(contents.decode("utf-8-sig")))
        rows = [{(k or "").strip().lower(): (v or "").strip() for k, v in r.items()} for r in reader]
    elif filename.endswith(".xlsx"):
        import openpyxl
        ws = openpyxl.load_workbook(io.BytesIO(contents)).active
        data = list(ws.iter_rows(values_only=True))
        if not data:
            raise HTTPException(status_code=400, detail="File is empty.")
        headers = [str(h or "").strip().lower() for h in data[0]]
        for values in data[1:]:
            rows.append({h: str(v or "").strip() for h, v in zip(headers, values)})
    else:
        raise HTTPException(status_code=400, detail="Only .csv and .xlsx files are supported.")

    guests, invalid = [], []
    for r in rows:
        if not r.get("email"):
            continue
        try:
            guests.append(GuestInviteSingle(
                first_name=r.get("first_name") or None,
                last_name=r.get("last_name") or None,
                email=r["email"],
                phone_number=r.get("phone_number") or None,
                invite_method=InviteMethod.email,
            ))
        except Exception:
            invalid.append({"email": r["email"], "reason": "Invalid email format"})

    result = await invite_guests_bulk(db, event_id, current_user.id, GuestInviteBulk(guests=guests))
    result["skipped"].extend(invalid)
    return {"message": f"Processed {len(guests)} guests from file.", **result}

# @guest_router.post("/{event_id}/import")
# async def import_guests_from_file(
#     event_id: str,
#     file: UploadFile = File(...),
#     db: AsyncSession = Depends(get_db),
#     current_user: User = Depends(require_organizer),
# ):
#     """Upload a CSV or Excel file with guest list. Expected columns: first_name, last_name, email, phone_number"""
#     allowed_types = [
#         "text/csv",
#         "application/vnd.ms-excel",
#         "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
#     ]
#     if file.content_type not in allowed_types:
#         raise HTTPException(
#             status_code=400, detail="Only CSV and Excel files are supported."
#         )
#     contents = await file.read()
#     guests_data = []

#     if file.content_type == "text/csv":
#         decoded = contents.decode("utf-8")
#         reader = csv.DictReader(io.StringIO(decoded))
#         for row in reader:
#             guests_data.append(
#                 {
#                     "first_name": row.get("first_name", "").strip(),
#                     "last_name": row.get("last_name", "").strip(),
#                     "email": row.get("email", "").strip(),
#                     "phone_number": row.get("phone_number", "").strip(),
#                 }
#             )
#         else:

#             # Excel - requires openpyxl
#             try:
#                 import openpyxl
#                 from io import BytesIO

#                 wb = openpyxl.load_workbook(BytesIO(contentes))
#                 ws = wb.active
#                 headers = [cell.value for cell in ws[1]]
#                 for row in ws.iter_rows(min_row=2, values_only=True):
#                     row_dict = dict(zip(headers, rows))
#                     guests_data.append(
#                         {
#                             "first_name": str(
#                                 row_dict.get("first_name", "") or ""
#                             ).strip(),
#                             "last_name": str(
#                                 row_dict.get("last_name", "") or ""
#                             ).strip(),
#                             "email": str(row_dict.get("email", "") or "").strip(),
#                             "phone_number": str(
#                                 row_dict.get("phone_number", "") or ""
#                             ).strip()
#                             or None,
#                         }
#                     )
#             except ImportError:
#                 raise HTTPException(
#                     status_code=500,
#                     detail="Excel support requires openpyxl. Contact support.",
#                 )

#         # filter out rows with no email
#         valid = [g for g in guests_data if g["email"]]

#         from app.api.v1.schemas.guest import (
#             GuestInviteSingle,
#             GuestInviteBulk,
#             InviteMethod,
#         )
#         from app.api.v1.services.guest import invite_guests_bulk

#         bulk_payload = GuestInviteBulk(
#             guests=[
#                 GuestInviteSingle(
#                     first_name=g["first_name"] or None,
#                     last_name=g["last_name"] or None,
#                     email=g["email"],
#                     phone_number=g["phone_number"],
#                     invite_method=InviteMethod.email,
#                 )
#                 for g in valid
#             ]
#         )

#         result = await invite_guests_bulk(db, event_id, current_user.id, bulk_payload)
#         return {"message": f"Proceed {len(valid)} guests from file.", **result}


@guest_router.post("/rsvp", response_model=GuestResponse)
async def rsvp(payload: RSVPResponse, db: AsyncSession = Depends(get_db)):
    return await respond_to_rsvp(db, payload)


@guest_router.get("/{event_id}/guests", response_model=GuestListResponse)
async def list_guests(
    event_id: str,
    status: Optional[RSVPStatus] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_organizer),
):
    return await get_guest_list(db, event_id, current_user.id, status, page, page_size)


@guest_router.patch(
    "/{event_id}/guests/{guest_id}/status", response_model=GuestResponse
)
async def update_status(
    event_id: str,
    guest_id: str,
    new_status: RSVPStatus,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_organizer),
):
    return await update_guest_status(
        db, guest_id, event_id, current_user.id, new_status
    )


@guest_router.delete("/{event_id}/guests/{guest_id}")
async def remove(
    event_id: str,
    guest_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_organizer),
):
    return await remove_guest(db, guest_id, event_id, current_user.id)
