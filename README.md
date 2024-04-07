To utilize the LLM (Language Model) for voice recognition, we employ the openai/whisper-large-v3 model, which you can access via this link: 
https://huggingface.co/openai/whisper-large-v3

To deploy the model on your local PC, follow these steps:

Copy the Docker-compose.yml file.
Create a .env file and include your OPENAI_API_KEY token.
Execute the command "docker compose up".
Once deployed, the model will be accessible at http://127.0.0.1:80. If you wish to alter the port, modify it in the Docker-compose.yml file.

Additionally, you can use curl to send requests.
curl -X POST -F "file=@D:\\Path\\to\\you\\file.mp3" http://34.116.213.70/upload/ | ForEach-Object {$_ -replace '\\n', "`n"}
