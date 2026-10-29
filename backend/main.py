from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from elexon_service import ElexonService
from datetime import datetime


app = FastAPI(
    title = "Gribricks UK Renewable Wind Forecast & Accuracy API",
    description="Anlyzes Day-Ahead Wind Generation Forecasts vs Actuals from Elexon BMRs for junuary 2026",
    version="1.0.0"

)



app.add_middleware(
    CORSMiddleware,
    allow_origins=("*"),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

service = ElexonService(

)






cache = {

}




@app.get("/api/health")
async def health():
    return{
        "status":"healthy",
        "service":"Gridbricks Energy Portal Backend",
        "dataset_source": "Elexon BMRs (FUELHH & WINDFOR)"
    }

@app.get("/api/analysis") 
async def get_analysis(
    date: str = Query("2025-01-15",description="Target delivery date in YYYY-MM-DD format(Junuary 2026)"
    )
): 

    """
    Returns half-hourly actual wind generation vs latest day-ahead forecast,
    along with quantified error metrics (MAE, RMSE, MAPE, Bias).
    """
    try:
        dt = datetime.strptime(date, "%Y-%m-%d")
        if dt.year != 2026 or dt.month != 1:
            # We allow any Jan 2026 date as per assignment scope
            pass
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Expected YYYY-MM-DD.")
    if date in cache:
        return cache[date]
    result = await service.get_day_analysis(date)
    if "error" in result and not result.get("intervals"):
        raise HTTPException(status_code=404, detail=result["error"])
    cache[date] = result
    return result
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
