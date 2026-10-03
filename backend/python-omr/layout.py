"""Layouts da folha de respostas CorrigeAI (A4 a 150 dpi). Usado pelo gerador e pelo leitor."""
W, H = 1240, 1754
MARK = 70                      # lado dos quadrados de referência
MARK_CENTERS = [(95, 95), (W - 95, 95), (W - 95, H - 95), (95, H - 95)]   # TL, TR, BR, BL
OPCOES = "ABCDE"

LAYOUTS = {
    # até 30 questões: 2 colunas
    30: {"qtd": 30, "cols": [(170, 260), (690, 780)], "dx": 70, "raio": 22, "marca": 17, "fn": 30, "fl": 26, "y0": 430, "dy": 76, "linhas": 15},
    # até 45 questões: 3 colunas
    45: {"qtd": 45, "cols": [(150, 215), (480, 545), (810, 875)], "dx": 52, "raio": 17, "marca": 13, "fn": 26, "fl": 22, "y0": 430, "dy": 76, "linhas": 15},
    # até 90 questões: cartão-resposta no formato ENEM (6 colunas x 15 linhas)
    90: {"qtd": 90, "cols": [(75 + 182 * c + 18, 75 + 182 * c + 52) for c in range(6)], "dx": 27, "raio": 11, "marca": 8, "fn": 15, "fl": 14, "y0": 1095, "dy": 34, "linhas": 15},
}


def layout_para(total: int | None):
    total = total or 30
    if total > 90:
        raise ValueError("A leitura suporta até 90 questões por folha.")
    return LAYOUTS[30] if total <= 30 else LAYOUTS[45] if total <= 45 else LAYOUTS[90]


def centro(L, numero: int, opcao: int):
    """Centro (x, y) da bolha da questão `numero` e opção `opcao` (0=A..4=E)."""
    col, linha = divmod(numero - 1, L["linhas"])
    return L["cols"][col][1] + opcao * L["dx"], L["y0"] + linha * L["dy"]
