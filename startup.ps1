python -m venv whisper-large-v3
.\whisper-large-v3\Scripts\activate.ps1
python -m pip install --upgrade pip
pip install --upgrade git+https://github.com/huggingface/transformers.git accelerate datasets[audio]
pip install -r requirements.txt