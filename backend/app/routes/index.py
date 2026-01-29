from fastapi import APIRouter

app = APIRouter()


@app.get("/")
async def root():
    return {"message": "Welcome to Real-Time Football Dashboard API"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


