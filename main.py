from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
import torch
from transformers import AutoModelForSpeechSeq2Seq, AutoProcessor, pipeline
from typing import List
import os
from openai import OpenAI
import configparser
from fastapi.staticfiles import StaticFiles
from starlette.responses import FileResponse
import ffmpeg

device = "cuda:0" if torch.cuda.is_available() else "cpu"
torch_dtype = torch.float16 if torch.cuda.is_available() else torch.float32

model_id = "openai/whisper-large-v3"

model = AutoModelForSpeechSeq2Seq.from_pretrained(
    model_id, torch_dtype=torch_dtype, low_cpu_mem_usage=True, use_safetensors=True
)
model.to(device)

processor = AutoProcessor.from_pretrained(model_id)

pipe = pipeline(
    "automatic-speech-recognition",
    model=model,
    tokenizer=processor.tokenizer,
    feature_extractor=processor.feature_extractor,
    max_new_tokens=128,
    chunk_length_s=30,
    batch_size=16,
    return_timestamps=True,
    torch_dtype=torch_dtype,
    device=device,
    generate_kwargs={"language": "en"}
)

app = FastAPI()

app.mount('/src', StaticFiles(directory='src', html=True), name='src')

def convert_to_mp3(input_file, output_file):
    (
        ffmpeg
        .input(input_file)
        .output(output_file, format='mp3')
        .run()
    )

@app.get("/")
def read_root():
    return FileResponse('src/index.html')
   
@app.post("/testData")
def testData():
    return {"message": "Test Message", "message2": "Test Message2"}
    

@app.post("/upload/")
async def upload_file(file: UploadFile):

    with open(file.filename, "wb") as f:
        f.write(await file.read())
    
    if file.filename.endswith(".mp3"):
        mp3_filename = file.filename
        result = pipe(mp3_filename)
        os.remove(mp3_filename)
    else:
        mp4_filename = file.filename
        mp3_filename = file.filename.replace(".mp4", ".mp3")
        convert_to_mp3(mp4_filename, mp3_filename)      
        result = pipe(mp3_filename)    
        os.remove(mp3_filename)
        os.remove(mp4_filename)
      
    client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
    
    config = configparser.ConfigParser()
    config.read('config.ini') 
    
    prompt = config['OpenAI']['OpenAIPrompt'] + " The text of the meeting: " + result["text"]
     
    response_openai = client.chat.completions.create(
        model="gpt-3.5-turbo",  
        messages=[
            {"role": "user", "content": prompt}
        ]
    )

    return response_openai.choices[0].message.content.strip()

@app.post("/upload-full/")
async def upload_file_full(file: UploadFile):
    with open(file.filename, "wb") as f:
        f.write(await file.read())
    result = pipe(file.filename)
    os.remove(file.filename)
    
    client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
    
    config = configparser.ConfigParser()
    config.read('config.ini') 
    
    prompt = config['OpenAI']['OpenAIPrompt'] + " The text of the meeting: " + result["text"]
     
    response_openai = client.chat.completions.create(
        model="gpt-3.5-turbo",  
        messages=[
            {"role": "user", "content": prompt}
        ]
    )

    return {"TranscribedRecord": result["text"], "SummaryOfMeeting": response_openai.choices[0].message.content.strip()}
    
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)