# CorrigeAI OMR

Serviço separado de visão computacional para analisar as fotos das folhas de respostas.

## Objetivo

O serviço receberá uma imagem e deverá:

1. localizar a folha;
2. corrigir perspectiva;
3. localizar as regiões de marcação;
4. identificar as alternativas marcadas;
5. calcular uma confiança por questão;
6. devolver JSON ao backend Node/TypeScript.

## Saída esperada

```json
{
  "questoes": [
    { "numero": 1, "resposta": "B", "confianca": 0.98 },
    { "numero": 2, "resposta": "D", "confianca": 0.96 }
  ]
}
```

A versão inicial devolve 501 propositalmente para não produzir respostas falsas. O motor OpenCV deverá ser implementado antes da ativação da correção automática.
