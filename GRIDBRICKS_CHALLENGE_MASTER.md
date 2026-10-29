# ⚡ Gridbricks Full-Stack SWE Challenge — Master Blueprint

> **Status:** Official Hiring Assessment Received  
> **Company:** Gridbricks  
> **Contact / Recruiter:** Harisankar H via Wellfound Match  
> **Role:** Full-Stack Software Engineer (Python + React)  
> **Submission Form:** [Full Stack SWE challenge submission v4](https://docs.google.com/forms/)  
> **Time Budget:** Max 16 hours recommended | No strict deadline, but earlier the better  

---

## 1. Context & Business Domain

### 🌍 The Client Scenario
- **Who is the client?** An Energy Utility in the United Kingdom.
- **What is their core problem?** 
  - They buy electricity from the **UK wholesale Day-Ahead market** to serve consumer demand.
  - Wind power generation is weather-dependent and volatile.
  - The day-ahead power purchase decisions must be made **one day before the delivery day**.
  - To decide how much additional thermal/conventional power to procure, they need to know:
    1. How much wind power will be available (Forecast).
    2. How accurate that forecast historically is (Quantified Error & Risk buffer).
- **Target Evaluation Window:** Data relevant for purchase decisions made in **January 2026**.

---

## 2. Core Requirements

The Web App must solve two distinct objectives:
1. **Latest Forecast Visibility:** Clearly understand the latest renewable generation forecasts available when making day-ahead wholesale purchase decisions.
2. **Quantitative Accuracy Evaluation:** Quantitatively evaluate the error of the forecasts against actuals so procurement traders can calculate margin of error / risk buffers.

---

## 3. Data Source Specifications (Elexon BMRS API)

Only national-level generation data from **Elexon BMRS API** is allowed (no external weather/third-party data):

### 3.1 Actual Generation Data
- **Documentation & Endpoint:**  
  `https://bmrs.elexon.co.uk/api-documentation/endpoint/datasets/FUELHH/stream`
- **Filter:** `fuelType` = `"WIND"`
- **Key Fields:**
  - `startTime`: Target delivery settlement period time (30-minute resolution).
  - `generation`: Actual wind power generated (MW).

### 3.2 Forecasted Generation Data
- **Documentation & Endpoint:**  
  `https://bmrs.elexon.co.uk/api-documentation/endpoint/datasets/WINDFOR/stream`
- **Key Fields:**
  - `startTime`: Target delivery settlement period time (matches `startTime` in actuals).
  - `publishTime`: Timestamp when this specific forecast was created/published.
  - `generation`: Forecasted wind power generation (MW).

> **Crucial Day-Ahead Rule:** For a target delivery day $D$, the purchase decision is made on day $D-1$ (e.g. before gate closure / 11:00 or 12:00 UTC). We must select the *latest forecast published prior to the decision cut-off time* for each settlement period.

---

## 4. Quantitative Metrics to Implement

To impress both the client and the tech lead, the dashboard must calculate:
1. **MAE (Mean Absolute Error):**  
   $$\text{MAE} = \frac{1}{n} \sum | \text{Forecast} - \text{Actual} |$$
2. **RMSE (Root Mean Squared Error):**  
   $$\text{RMSE} = \sqrt{\frac{1}{n} \sum (\text{Forecast} - \text{Actual})^2}$$
3. **MAPE (Mean Absolute Percentage Error):**  
   $$\text{MAPE} = \frac{1}{n} \sum \left| \frac{\text{Forecast} - \text{Actual}}{\text{Actual}} \right| \times 100$$
4. **Bias (Over-prediction vs Under-prediction):**  
   Indicates whether the utility over-bought thermal power (forecast was too low) or had shortfall risk (forecast was too high).

---

## 5. Technical Architecture & Stack

```
[ Elexon BMRS API ]
       │
       ▼ (Fetch & Cache January 2026 Actuals + Forecasts)
[ Python Backend (FastAPI) ]
  ├── /api/data/overview        -> Time-series comparison for Jan 2026
  ├── /api/data/accuracy-metrics -> Quantified MAE, RMSE, MAPE, Bias
  └── Dockerized Container
       │
       ▼ (REST API JSON)
[ React Frontend (Vite + Tailwind + Recharts/Chart.js) ]
  ├── Day-Ahead Decision View (Forecast vs Target Delivery)
  ├── Actual vs Forecast Overlay & Error Delta Charts
  ├── Quantitative Risk & Metrics KPI Cards
  └── Date Range & Settlement Period Drilldown
```

- **Frontend:** React.js (Interactive time-series charts, settlement period selector, KPI summary cards).
- **Backend:** Python (FastAPI — clean asynchronous data handling, vectorized pandas error calculation, caching).
- **DevOps:** Docker (`Dockerfile` + `docker-compose.yml`) + Deployment on Vercel / Render.
- **AI Tooling Disclosure:** Document in `README.md` as explicitly permitted.

---

## 6. Required Deliverables Checklist

- [ ] **1. Public GitHub Repository:**
  - Anonymous repository name (e.g. `gridbricks-energy-portal` or random string `kjhwr`).
  - Comprehensive `README.md` detailing:
    - Files and directory structure
    - How to run locally (with & without Docker)
    - Live deployment URLs
    - AI tools usage disclosure statement
- [ ] **2. Live Deployment:**
  - Frontend on Vercel / Netlify
  - Python Backend on Render / Heroku / Railway
- [ ] **3. Video Walkthrough (Max 10 minutes total on Unlisted YouTube):**
  - **Part 1 (Max 5 mins):** Client Presentation (Pitch the portal, explain how utility saves money & manages risk on Day-Ahead decisions).
  - **Part 2 (Max 5 mins):** Tech Lead Review (Architecture, API data pipeline, error formulas, Docker, code organization).
- [ ] **4. Google Form Submission:**
  - Open all links in Incognito to verify public access before submitting.

---

## 7. Next Action Plan

1. **Step 1:** Run Python exploratory data fetch script for Elexon API (`FUELHH` + `WINDFOR` for January 2026).
2. **Step 2:** Build FastAPI endpoints for data delivery and metric computations.
3. **Step 3:** Build React UI dashboard with modern dark/light mode aesthetic.
4. **Step 4:** Containerize with Docker & deploy to Vercel/Render.
5. **Step 5:** Record YouTube demo video following the exact 2-part script.
