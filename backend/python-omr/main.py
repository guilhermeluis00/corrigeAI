from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, UploadFile

app = FastAPI(title="CorrigeAI OMR", version="1.0.0")

@app.get("/")
def root():
    return {
        "nome": "CorrigeAI OMR",
        "status": "online",
        "mensagem": "Serviço de visão computacional disponível."
    }

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/omr/detect")
async def detect(imagem: UploadFile = File(...), provaId: int | None = Form(None)):
    data = await imagem.read()

    if not data:
        raise HTTPException(status_code=400, detail="Imagem vazia.")

    # Esta etapa não retorna respostas fictícias.
    # O algoritmo OMR real será implementado aqui com OpenCV/NumPy.
    raise HTTPException(
        status_code=501,
        detail="Motor OMR ainda não configurado. Implemente a detecção da folha e das marcações antes de habilitar a correção automática."
    )
