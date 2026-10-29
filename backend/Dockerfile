# 1. Use lightweight official Python image
FROM python:3.11-slim

# 2. Prevent Python from buffering stdout/stderr
ENV PYTHONUNBUFFERED=1

# 3. Set container working directory
WORKDIR /app

# 4. Copy dependencies first for Docker Layer Caching
COPY requirements.txt .

# 5. Install dependencies cleanly without caching wheels
RUN pip install --no-cache-dir -r requirements.txt

# 6. Copy application source code
COPY . .

# 7. Expose FastAPI backend port
EXPOSE 8000

# 8. Start Uvicorn server bound to 0.0.0.0
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
