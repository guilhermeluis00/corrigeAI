# Testes da correção por foto

Suba o serviço Python (leitor da folha), o backend e o frontend:
```powershell
cd backend\python-omr
python -m venv .venv ; .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --port 8000
```

A folha usada é escolhida pelo número de questões da prova:
| Questões da prova | Folha | Pasta de testes |
|---|---|---|
| até 30 | `folha-respostas-modelo.pdf` (2 colunas) | esta pasta (gabarito C A D B E A C B D E; resultado esperado 8 acertos, nota 8,0) |
| 31 a 45 | `enem45/folha-enem-modelo.pdf` (3 colunas) | `enem45/` |
| 46 a 90 | `enem90/cartao-resposta-90-modelo.pdf` (cartão no formato ENEM) | `enem90/` |

Cada pasta tem o gabarito de teste, a folha para imprimir e imagens preenchidas (limpa, foto simulada e com falhas). Siga o `.md` de cada pasta.

Mensagens possíveis: "Não foi possível localizar a folha..." (os 4 quadrados dos cantos não apareceram: foto cortada, escura ou muito inclinada); "Em branco" / "Marcação dupla" (questão não lida; revisão manual ainda não existe).
