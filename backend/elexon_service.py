import httpx
import pandas as pd
import numpy as np
from datetime import datetime , timedelta 
from typing import Dict, Any, List


ELEXON_BASE_URL = "https://data.elexon.co.uk/bmrs/api/v1/datasets"



class ElexonService:
    def __init__(self):
        self.headers = {"User-Agent": "Gridbricks-EnergyPortal/1.0"}
    async def fetch_actuals(self, target_date: str) -> List[Dict[str, Any]]:
        """
        Fetches Half-Hourly actual generation (FUELHH) for WIND on target_date (YYYY-MM-DD).
        """
        url = f"{ELEXON_BASE_URL}/FUELHH/stream"
        params = {
            "publishDateTimeFrom": f"{target_date}T00:00:00Z",
            "publishDateTimeTo": f"{target_date}T23:59:59Z"
        }
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(url, params=params, headers=self.headers)
            if resp.status_code != 200:
                return []
            data = resp.json()
        wind_records = [
            {
                "startTime": item["startTime"],
                "settlementPeriod": item.get("settlementPeriod"),
                "actual_generation": item.get("generation", 0)
            }
            for item in data
            if item.get("fuelType") == "WIND"
        ]
        return wind_records
    async def fetch_day_ahead_forecasts(self, target_date: str) -> List[Dict[str, Any]]:
        """
        Fetches WINDFOR forecasts published on Day D-1 (day-ahead decision day)
        targeting delivery on target_date (D).
        """
        dt_target = datetime.strptime(target_date, "%Y-%m-%d")
        dt_day_before = dt_target - timedelta(days=1)
        day_before_str = dt_day_before.strftime("%Y-%m-%d")
        url = f"{ELEXON_BASE_URL}/WINDFOR/stream"
        params = {
            "publishDateTimeFrom": f"{day_before_str}T00:00:00Z",
            "publishDateTimeTo": f"{day_before_str}T23:59:59Z"
        }
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(url, params=params, headers=self.headers)
            if resp.status_code != 200:
                return []
            data = resp.json()
        # Filter only forecasts whose delivery startTime falls on the target_date
        target_forecasts = [
            item for item in data
            if item.get("startTime", "").startswith(target_date)
        ]
        return target_forecasts
    async def get_day_analysis(self, target_date: str) -> Dict[str, Any]:
        """
        Merges Actuals with latest Day-Ahead forecasts and computes quantitative error metrics.
        """
        actuals = await self.fetch_actuals(target_date)
        forecasts = await self.fetch_day_ahead_forecasts(target_date)
        if not actuals or not forecasts:
            return {"error": "Data unavailable for date or network issue", "date": target_date}
        df_act = pd.DataFrame(actuals)
        df_fc = pd.DataFrame(forecasts)
        # For each settlement delivery startTime, pick the latest published forecast on Day D-1
        df_fc_latest = (
            df_fc.sort_values("publishTime")
            .groupby("startTime")
            .last()
            .reset_index()
            .rename(columns={"generation": "forecast_generation"})
        )
        # Merge actuals and forecasts on startTime
        merged = pd.merge(
            df_act,
            df_fc_latest[["startTime", "publishTime", "forecast_generation"]],
            on="startTime",
            how="inner"
        ).sort_values("startTime")
        if merged.empty:
            return {"error": "No overlapping intervals found", "date": target_date}
        # Calculate Error Metrics
        merged["error_mw"] = merged["forecast_generation"] - merged["actual_generation"]
        merged["abs_error"] = merged["error_mw"].abs()
        mae = float(merged["abs_error"].mean())
        rmse = float(np.sqrt((merged["error_mw"] ** 2).mean()))
        
        # Avoid division by zero in MAPE
        nonzero_actuals = merged[merged["actual_generation"] > 0]
        mape = float((nonzero_actuals["abs_error"] / nonzero_actuals["actual_generation"]).mean() * 100) if not nonzero_actuals.empty else 0.0
        bias = float(merged["error_mw"].mean())
        return {
            "date": target_date,
            "metrics": {
                "mae_mw": round(mae, 2),
                "rmse_mw": round(rmse, 2),
                "mape_percent": round(mape, 2),
                "bias_mw": round(bias, 2),
                "risk_status": "Over-Forecasting (Shortfall Risk)" if bias > 0 else "Under-Forecasting (Excess Power Procured)"
            },
            "intervals": merged.to_dict(orient="records")
        }