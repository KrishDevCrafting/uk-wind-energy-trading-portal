import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  AreaChart,
  Area,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  Wind,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Zap,
  RefreshCw,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://gridbricks-energy-backend.onrender.com";

export default function App() {
  const [selectedDate, setSelectedDate] = useState("2025-01-15");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async (date) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/analysis`, {
        params: { date },
      });
      setData(response.data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
          "Failed to fetch energy data from Elexon API.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedDate);
  }, [selectedDate]);

  // Format half-hour intervals for charting
  const chartData = (data?.intervals || []).map((item) => {
    const timeStr = item.startTime
      ? item.startTime.substring(11, 16)
      : `P${item.settlementPeriod}`;
    return {
      period: `SP ${item.settlementPeriod}`,
      time: timeStr,
      actual: item.actual_generation,
      forecast: item.forecast_generation,
      error: item.error_mw,
    };
  });

  const isOverForecasting = data?.metrics?.bias_mw > 0;

  return (
    <div
      style={{
        backgroundColor: "#0b0f19",
        color: "#f3f4f6",
        minHeight: "100vh",
        fontFamily: "system-ui, sans-serif",
        padding: "24px 32px",
      }}
    >
      {/* 1. Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #1f293d",
          paddingBottom: "20px",
          marginBottom: "28px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                backgroundColor: "#0ea5e9",
                padding: "8px",
                borderRadius: "10px",
                display: "flex",
              }}
            >
              <Wind size={24} color="#ffffff" />
            </div>
            <h1
              style={{
                fontSize: "24px",
                fontWeight: "700",
                margin: 0,
                letterSpacing: "-0.5px",
              }}
            >
              Gridbricks <span style={{ color: "#38bdf8" }}>Energy Portal</span>
            </h1>
          </div>
          <p
            style={{ color: "#94a3b8", fontSize: "14px", margin: "6px 0 0 0" }}
          >
            UK Day-Ahead Renewable Wind Forecasts & Quantitative Accuracy
            Evaluation (Elexon BMRS)
          </p>
        </div>

        {/* Date Selector & Refresh */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "#131b2e",
              padding: "8px 14px",
              borderRadius: "8px",
              border: "1px solid #1e293b",
            }}
          >
            <Calendar size={18} color="#38bdf8" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                backgroundColor: "transparent",
                color: "#ffffff",
                border: "none",
                outline: "none",
                fontSize: "14px",
                cursor: "pointer",
              }}
            />
          </div>
          <button
            onClick={() => fetchData(selectedDate)}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: "#0284c7",
              color: "#ffffff",
              border: "none",
              padding: "9px 16px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "14px",
            }}
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            {loading ? "Analyzing..." : "Refresh"}
          </button>
        </div>
      </div>

      {error ? (
        <div
          style={{
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            border: "1px solid #ef4444",
            padding: "20px",
            borderRadius: "12px",
            color: "#fca5a5",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      ) : (
        <>
          {/* 2. Top Executive KPI Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "18px",
              marginBottom: "28px",
            }}
          >
            {/* Card 1: MAE */}
            <div
              style={{
                backgroundColor: "#131b2e",
                padding: "20px",
                borderRadius: "12px",
                border: "1px solid #1e293b",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  color: "#94a3b8",
                  fontSize: "13px",
                  fontWeight: "600",
                }}
              >
                <span>MEAN ABSOLUTE ERROR</span>
                <TrendingUp size={18} color="#38bdf8" />
              </div>
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  color: "#ffffff",
                  margin: "10px 0 4px 0",
                }}
              >
                {data?.metrics?.mae_mw?.toLocaleString()}{" "}
                <span style={{ fontSize: "16px", color: "#94a3b8" }}>MW</span>
              </div>
              <div style={{ fontSize: "12px", color: "#64748b" }}>
                Average magnitude of forecast error
              </div>
            </div>

            {/* Card 2: RMSE */}
            <div
              style={{
                backgroundColor: "#131b2e",
                padding: "20px",
                borderRadius: "12px",
                border: "1px solid #1e293b",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  color: "#94a3b8",
                  fontSize: "13px",
                  fontWeight: "600",
                }}
              >
                <span>ROOT MEAN SQ ERROR</span>
                <Zap size={18} color="#a855f7" />
              </div>
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  color: "#ffffff",
                  margin: "10px 0 4px 0",
                }}
              >
                {data?.metrics?.rmse_mw?.toLocaleString()}{" "}
                <span style={{ fontSize: "16px", color: "#94a3b8" }}>MW</span>
              </div>
              <div style={{ fontSize: "12px", color: "#64748b" }}>
                Penalizes large outlier swings
              </div>
            </div>

            {/* Card 3: MAPE */}
            <div
              style={{
                backgroundColor: "#131b2e",
                padding: "20px",
                borderRadius: "12px",
                border: "1px solid #1e293b",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  color: "#94a3b8",
                  fontSize: "13px",
                  fontWeight: "600",
                }}
              >
                <span>PERCENTAGE ERROR</span>
                <AlertTriangle size={18} color="#f59e0b" />
              </div>
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  color: "#ffffff",
                  margin: "10px 0 4px 0",
                }}
              >
                {data?.metrics?.mape_percent}%
              </div>
              <div style={{ fontSize: "12px", color: "#64748b" }}>
                Mean relative margin of error
              </div>
            </div>

            {/* Card 4: Risk / Bias Status */}
            <div
              style={{
                backgroundColor: "#131b2e",
                padding: "20px",
                borderRadius: "12px",
                border: `1px solid ${isOverForecasting ? "#ef4444" : "#10b981"}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  color: "#94a3b8",
                  fontSize: "13px",
                  fontWeight: "600",
                }}
              >
                <span>TRADER RISK BIAS</span>
                {isOverForecasting ? (
                  <ShieldAlert size={18} color="#ef4444" />
                ) : (
                  <CheckCircle2 size={18} color="#10b981" />
                )}
              </div>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  color: isOverForecasting ? "#f87171" : "#34d399",
                  margin: "12px 0 4px 0",
                }}
              >
                {isOverForecasting ? "+ Shortfall Risk" : "- Excess Power"}
              </div>
              <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                Bias:{" "}
                {data?.metrics?.bias_mw > 0
                  ? `+${data?.metrics?.bias_mw}`
                  : data?.metrics?.bias_mw}{" "}
                MW
              </div>
            </div>
          </div>

          {/* 3. Procurement Action Recommendation Box */}
          <div
            style={{
              backgroundColor: "#111827",
              borderLeft: `4px solid ${isOverForecasting ? "#f59e0b" : "#38bdf8"}`,
              padding: "16px 20px",
              borderRadius: "8px",
              marginBottom: "28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "700",
                  color: "#f8fafc",
                  marginBottom: "4px",
                }}
              >
                ⚡ Day-Ahead Procurement Recommendation ({selectedDate}):
              </div>
              <div style={{ fontSize: "13px", color: "#94a3b8" }}>
                {isOverForecasting
                  ? `Forecast systematically over-predicted wind by ~${data?.metrics?.mae_mw} MW. The utility should contract an additional ~${data?.metrics?.mae_mw} MW from thermal generators to avoid grid balancing penalties.`
                  : `Wind generation exceeded forecast. No emergency thermal buffer needed; potential opportunity to sell excess capacity.`}
              </div>
            </div>
          </div>

          {/* 4. Primary Chart: Forecast vs Actual Generation */}
          <div
            style={{
              backgroundColor: "#131b2e",
              padding: "24px",
              borderRadius: "12px",
              border: "1px solid #1e293b",
              marginBottom: "28px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <div>
                <h2 style={{ fontSize: "18px", fontWeight: "600", margin: 0 }}>
                  Day-Ahead Wind Forecast vs Actual Generation
                </h2>
                <span style={{ fontSize: "12px", color: "#64748b" }}>
                  Half-hourly settlement periods (MW Outturn)
                </span>
              </div>
              <div style={{ display: "flex", gap: "16px", fontSize: "13px" }}>
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    color: "#38bdf8",
                  }}
                >
                  <span
                    style={{
                      width: "12px",
                      height: "12px",
                      backgroundColor: "#38bdf8",
                      borderRadius: "3px",
                    }}
                  ></span>{" "}
                  Actual Generation (FUELHH)
                </span>
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    color: "#fbbf24",
                  }}
                >
                  <span
                    style={{
                      width: "12px",
                      height: "12px",
                      backgroundColor: "#fbbf24",
                      borderRadius: "3px",
                    }}
                  ></span>{" "}
                  Day-Ahead Forecast (WINDFOR)
                </span>
              </div>
            </div>

            <div style={{ height: "380px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="actualGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} unit=" MW" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                    formatter={(value, name) => [
                      `${value?.toLocaleString()} MW`,
                      name === "actual"
                        ? "Actual Generation"
                        : "Day-Ahead Forecast",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="actual"
                    stroke="#38bdf8"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#actualGradient)"
                    name="actual"
                  />
                  <Line
                    type="monotone"
                    dataKey="forecast"
                    stroke="#fbbf24"
                    strokeWidth={2.5}
                    dot={{ r: 2 }}
                    name="forecast"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 5. Error Delta Bar Chart */}
          <div
            style={{
              backgroundColor: "#131b2e",
              padding: "24px",
              borderRadius: "12px",
              border: "1px solid #1e293b",
            }}
          >
            <div style={{ marginBottom: "16px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "600", margin: 0 }}>
                Quantified Forecast Error Delta (MW)
              </h2>
              <span style={{ fontSize: "12px", color: "#64748b" }}>
                Positive = Over-Forecast (Shortfall Risk) | Negative =
                Under-Forecast (Excess Wind)
              </span>
            </div>

            <div style={{ height: "240px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} unit=" MW" />
                  <ReferenceLine y={0} stroke="#64748b" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                    formatter={(value) => [
                      `${value?.toLocaleString()} MW`,
                      "Error Delta",
                    ]}
                  />
                  <Bar dataKey="error" fill="#f87171" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
