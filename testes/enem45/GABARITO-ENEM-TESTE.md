# Gabarito de teste — formato ENEM (45 questões)

Simulado de teste no formato de uma área do ENEM (45 questões, alternativas A a E). **Não é o gabarito oficial de nenhuma prova do INEP**: as respostas foram sorteadas só para testar o sistema.

Sequência para colar em Provas > Nova prova > "Colar gabarito":

```
A C E E A B E E E D E E D E D B A E A A C A D A D C B D C C C D E A C A E E C C D B E C A
```

| Q | Resp | Q | Resp | Q | Resp |
|---|---|---|---|---|---|
| 1 | **A** | 16 | **B** | 31 | **C** |
| 2 | **C** | 17 | **A** | 32 | **D** |
| 3 | **E** | 18 | **E** | 33 | **E** |
| 4 | **E** | 19 | **A** | 34 | **A** |
| 5 | **A** | 20 | **A** | 35 | **C** |
| 6 | **B** | 21 | **C** | 36 | **A** |
| 7 | **E** | 22 | **A** | 37 | **E** |
| 8 | **E** | 23 | **D** | 38 | **E** |
| 9 | **E** | 24 | **A** | 39 | **C** |
| 10 | **D** | 25 | **D** | 40 | **C** |
| 11 | **E** | 26 | **C** | 41 | **D** |
| 12 | **E** | 27 | **B** | 42 | **B** |
| 13 | **D** | 28 | **D** | 43 | **E** |
| 14 | **E** | 29 | **C** | 44 | **C** |
| 15 | **D** | 30 | **C** | 45 | **A** |

## Como testar
1. Provas > Nova prova: escolha professor e turma, clique em **Colar gabarito**, cole a sequência acima, **Gerar questões** e **Publicar**.
2. Correção: escolha a prova e um aluno da turma e envie:

| Arquivo | O que testa | Resultado esperado |
|---|---|---|
| `folha-enem-teste-preenchida.png` | folha digital limpa | 38 acertos, 7 erros, nota 8,4 |
| `folha-enem-teste-foto.jpg` | foto torta, com sombra e ruído | 38 acertos, 7 erros, nota 8,4 |
| `folha-enem-teste-falhas.png` | questão 12 em branco e 30 com marcação dupla | 36 acertos, 9 erros, nota 8,0 |

Erros propositais da folha preenchida: questões 3, 9, 14, 20, 27, 33 e 41.

Para teste com papel, imprima `folha-enem-modelo.pdf` em A4 (100%).
O ENEM real tem 90 questões por dia; aqui cada folha lê até 45, então um dia inteiro seriam duas provas (questões 1–45 e 46–90).
