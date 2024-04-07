FROM al1fe/meeting_summariser_main

WORKDIR /app

COPY . .

RUN pip install ffmpeg-python

CMD [ "python", "main.py" ]