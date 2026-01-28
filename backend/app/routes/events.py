from app.services.xml_reader import read_full_xml_async
from fastapi import APIRouter

app = APIRouter()
@app.get("/events/")
async def load_match():
    return await read_full_xml_async("data/events/f24-23-2023-2372222-eventdetails.xml")