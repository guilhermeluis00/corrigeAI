# CorrigeAI OMR — Python

Serviço separado para visão computacional. Recebe uma foto e prepara a etapa de detecção das marcações com OpenCV.

## Executar

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

O Node chama `POST /omr/corrigir`.

## Próxima etapa técnica

O algoritmo deve ser criado em cima de um modelo fixo de folha: detectar contorno, corrigir perspectiva, binarizar, dividir as regiões das alternativas e medir a quantidade de pixels preenchidos por bolha. Depois é possível devolver algo como `{"1":"A","2":"C","3":"B"}` com uma confiança por questão.
