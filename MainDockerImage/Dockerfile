FROM python:latest

WORKDIR /app

COPY . .

RUN python -m pip install --upgrade pip && \
    pip install --upgrade git+https://github.com/huggingface/transformers.git accelerate datasets[audio] && \
    apt-get update
RUN apt-get install -y ffmpeg 
RUN pip install -r requirements.txt