FROM python:3.11-slim

# System libs required by WeasyPrint (PDF), ffmpeg (video posters) and bcrypt
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpango-1.0-0 libpangoft2-1.0-0 libharfbuzz-subset0 \
    libxml2 libxslt1.1 libjpeg62-turbo \
    ffmpeg curl \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app/backend

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . ./

ENV PYTHONUNBUFFERED=1
EXPOSE 8001

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s \
  CMD curl -fsS http://localhost:8001/api/health || exit 1

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001"]
