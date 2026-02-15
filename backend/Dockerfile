# Django Backend Dockerfile

FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create superuser migrations directory
RUN mkdir -p /app/analytics/migrations

# Expose port
EXPOSE 8000

# Run Django with Daphne (ASGI server for WebSockets)
CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "backend.asgi:application"]
