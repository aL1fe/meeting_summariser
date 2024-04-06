FROM al1fe/meeting_summariser_main

WORKDIR /app

COPY . .

CMD [ "python", "main.py" ]
