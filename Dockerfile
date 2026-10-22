# ==============================================================================
# Yukti AI - Hugging Face Spaces & Cloud Dockerfile
# ==============================================================================

FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    DEBIAN_FRONTEND=noninteractive \
    PORT=7860 \
    HF_SPACE=1

WORKDIR /app

# Install system libraries needed by PyTorch, OpenCV, Pillow, and networking
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgl1 \
    libglib2.0-0 \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Create Hugging Face standard non-root user (UID 1000)
RUN useradd -m -u 1000 user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH

# Install Python requirements
COPY --chown=user:user requirements-hf.txt ./requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application source code and models
COPY --chown=user:user . .

# Ensure storage directories exist with write permissions
RUN mkdir -p static/shared_images incoming_telemetry incoming_telemetry/processed && \
    chown -R user:user /app

USER user
EXPOSE 7860

CMD ["python", "app.py"]
