from typing import Any
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
import cv2
import numpy as np

app = FastAPI(title="CorrigeAI OMR", version="0.1.0")

@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "servico": "python-omr"}

@app.post("/omr/corrigir")
async def corrigir(
    arquivo: UploadFile = File(...),
    provaId: int | None = Form(default=None),
    alunoId: int | None = Form(default=None),
) -> dict[str, Any]:
    if arquivo.content_type not in {"image/jpeg", "image/png", "image/webp"}:
        raise HTTPException(status_code=400, detail="Formato de imagem não suportado")

    data = await arquivo.read()
    image = cv2.imdecode(np.frombuffer(data, np.uint8), cv2.IMREAD_GRAYSCALE)
    if image is None:
        raise HTTPException(status_code=400, detail="Não foi possível ler a imagem")

    # Base inicial: valida a imagem e devolve informações para o Node.
    # A detecção real das bolhas deve ser calibrada para o layout da folha.
    return {
        "provaId": provaId,
        "alunoId": alunoId,
        "arquivo": arquivo.filename,
        "largura": int(image.shape[1]),
        "altura": int(image.shape[0]),
        "respostas": {},
        "confianca": 0.0,
        "observacao": "Pipeline OMR inicial. Configure regiões/bolhas da sua folha antes de usar em produção."
    }
