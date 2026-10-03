from pathlib import Path

from omr import FolhaNaoEncontrada, detectar
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
async def detect(imagem: UploadFile = File(...), provaId: int | None = Form(None), totalQuestoes: int | None = Form(None)):
    data = await imagem.read()

    if not data:
        raise HTTPException(status_code=400, detail="Imagem vazia.")

    try:
        return detectar(data, totalQuestoes)
    except FolhaNaoEncontrada:
        raise HTTPException(
            status_code=422,
            detail="Não foi possível localizar a folha. Fotografe a folha inteira, bem iluminada, com os 4 quadrados pretos dos cantos visíveis."
        )
    except ValueError as erro:
        raise HTTPException(status_code=400, detail=str(erro))
