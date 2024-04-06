We use openai/whisper-large-v3 as LLM to recognise voice
https://huggingface.co/openai/whisper-large-v3

How to send mp3 file with curl.
curl -X POST -F "file=@D:\\audio.mp3" http://127.0.0.1:8001/upload/ | ForEach-Object {$_ -replace '\\n', "`n"}

curl -X POST -F "file=@D:\\Stella.mp3" http://34.116.213.70/upload/ | ForEach-Object {$_ -replace '\\n', "`n"}
curl -X POST -F "file=@D:\\WeeklyMeetingExample.mp3" http://34.116.213.70/upload/ | ForEach-Object {$_ -replace '\\n', "`n"}
curl -X POST -F "file=@D:\\TheExpertWrongAngle.mp3" http://34.116.213.70/upload/ | ForEach-Object {$_ -replace '\\n', "`n"}
