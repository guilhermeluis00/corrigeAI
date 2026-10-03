"""Gera as folhas de respostas (PDF/PNG): modelos de 30, 45 e 90 questões (cartão-resposta no formato ENEM)."""
import textwrap
from PIL import Image, ImageDraw, ImageFont
from layout import H, MARK, MARK_CENTERS, OPCOES, W, centro, layout_para

FONTE = "/usr/share/fonts/truetype/dejavu/DejaVuSans{}.ttf"
NAVY, VERDE, CINZA = 25, 120, 150


def fonte(tam, negrito=False):
    try:
        return ImageFont.truetype(FONTE.format("-Bold" if negrito else ""), tam)
    except OSError:
        return ImageFont.load_default()


def _marcas(d):
    for cx, cy in MARK_CENTERS:
        d.rectangle([cx - MARK // 2, cy - MARK // 2, cx + MARK // 2, cy + MARK // 2], fill=0)


def _grade(d, L, marcadas, cabecalho=False):
    R, DX, LIN = L["raio"], L["dx"], L["linhas"]
    for c, (xn, xa) in enumerate(L["cols"]):
        if cabecalho:
            d.rectangle([xn - 20, L["y0"] - 74, xa + 4 * DX + R + 4, L["y0"] - 52], fill=60)
            d.text(((xn - 20 + xa + 4 * DX + R + 4) // 2, L["y0"] - 63), "QUESTÃO / RESPOSTA", font=fonte(13, True), fill=255, anchor="mm")
        for k, letra in enumerate(OPCOES):
            d.text((xa + k * DX, L["y0"] - 36 if cabecalho else L["y0"] - 52), letra, font=fonte(L["fl"], True), fill=0, anchor="mm")
    for n in range(1, L["qtd"] + 1):
        xn, cy = L["cols"][(n - 1) // LIN][0], centro(L, n, 0)[1]
        if cabecalho and (n - 1) % LIN % 2 == 0:
            xa = L["cols"][(n - 1) // LIN][1]
            d.rectangle([xn - 20, cy - L["dy"] // 2 + 1, xa + 4 * DX + R + 4, cy + L["dy"] // 2 - 1], fill=244)
        d.text((xn, cy), f"{n:02d}", font=fonte(L["fn"], True), fill=0, anchor="mm")
        for k, letra in enumerate(OPCOES):
            cx, cy = centro(L, n, k)
            d.ellipse([cx - R, cy - R, cx + R, cy + R], outline=CINZA if cabecalho else 0, width=2 if cabecalho else 3)
            if marcadas and letra in marcadas.get(n, ""):
                m = L["marca"]
                d.ellipse([cx - m, cy - m, cx + m, cy + m], fill=35)


def folha(marcadas=None, total=30, titulo="FOLHA DE RESPOSTAS") -> Image.Image:
    """Modelos simples de 30 e 45 questões."""
    L = layout_para(total)
    img = Image.new("L", (W, H), 255); d = ImageDraw.Draw(img)
    _marcas(d)
    d.text((W // 2, 170), "CorrigeAI", font=fonte(54, True), fill=0, anchor="mm")
    d.text((W // 2, 225), titulo, font=fonte(30), fill=40, anchor="mm")
    for i, rotulo in enumerate(["Aluno:", "Matrícula:", "Prova:"]):
        y = 290 + i * 42
        d.text((170, y), rotulo, font=fonte(24, True), fill=0, anchor="lm")
        d.line([(330 if i != 1 else 360, y + 14), (1070, y + 14)], fill=120, width=2)
    d.text((W // 2, 1590), "Preencha completamente uma bolha por questão, com caneta preta ou azul escura. Não dobre nem amasse a folha.", font=fonte(19), fill=60, anchor="mm")
    _grade(d, L, marcadas)
    return img


def cartao_resposta(marcadas=None, selo="SIMULADO") -> Image.Image:
    """Cartão-resposta de 90 questões, no formato do ENEM, com a identidade CorrigeAI."""
    L = layout_para(90)
    img = Image.new("L", (W, H), 255); d = ImageDraw.Draw(img)
    _marcas(d)
    d.text((170, 100), "CARTÃO-RESPOSTA", font=fonte(58, True), fill=0, anchor="lm")
    d.text((172, 152), "Simulado · CorrigeAI — gestão e correção escolar", font=fonte(22), fill=70, anchor="lm")
    d.ellipse([880, 62, 1075, 150], outline=0, width=4); d.text((977, 106), selo, font=fonte(26, True), fill=0, anchor="mm")
    d.rounded_rectangle([80, 195, 1160, 495], radius=26, outline=70, width=3)
    d.text((105, 222), "Nome completo:", font=fonte(24, True), fill=0, anchor="lm")
    for r in range(2):
        for i in range(28):
            d.rectangle([105 + i * 24, 245 + r * 32, 127 + i * 24, 273 + r * 32], outline=100, width=2)
    d.text((105, 345), "Turma / Unidade:", font=fonte(24, True), fill=0, anchor="lm"); d.line([(335, 360), (780, 360)], fill=110, width=2)
    d.text((105, 405), "Data de nascimento:", font=fonte(20, True), fill=0, anchor="lm")
    for i in range(8):
        d.rectangle([335 + i * 30 + (12 if i >= 2 else 0) + (12 if i >= 4 else 0), 390, 359 + i * 30 + (12 if i >= 2 else 0) + (12 if i >= 4 else 0), 420], outline=100, width=2)
    d.line([(105, 465), (1135, 465)], fill=120, width=2); d.text((620, 482), "Assinatura do participante", font=fonte(18), fill=70, anchor="mm")
    d.text((960, 222), "Identificação da prova", font=fonte(20, True), fill=0, anchor="mm")
    for i, rot in enumerate(["Prova", "Turma", "Matrícula"]):
        x = 800 + i * 118
        d.rectangle([x, 270, x + 108, 420], outline=100, width=2); d.text((x + 54, 285), rot, font=fonte(16), fill=70, anchor="mm")
    d.text((W // 2, 545), "INSTRUÇÕES", font=fonte(30, True), fill=0, anchor="mm")
    col = [["1. Preencha o nome completo, a turma, a data de nascimento e a matrícula com letra de forma.",
            "2. Use caneta esferográfica de tinta preta ou azul-escura. Não use lápis.",
            "3. Preencha o círculo por completo, sem ultrapassar o contorno."],
           ["4. Marque uma única alternativa por questão. Questões em branco ou com marcação dupla não são lidas.",
            "5. Não dobre, não amasse, não rasure e não cubra os 4 quadrados pretos dos cantos da folha."]]
    for c, itens in enumerate(col):
        y = 585
        for item in itens:
            for ln in textwrap.wrap(item, 50):
                d.text((105 + c * 540, y), ln, font=fonte(19), fill=20, anchor="lm"); y += 27
            y += 10
    d.rounded_rectangle([105, 800, 1135, 905], radius=12, fill=238)
    d.text((130, 828), "Exemplo de marcação", font=fonte(20, True), fill=0, anchor="lm")
    for i, (rot, tipo) in enumerate([("Correta", "cheia"), ("Incompleta", "meia"), ("Rasurada", "x")]):
        x = 420 + i * 230
        d.ellipse([x - 13, 866 - 13, x + 13, 866 + 13], outline=CINZA, width=2)
        if tipo == "cheia": d.ellipse([x - 10, 856, x + 10, 876], fill=35)
        if tipo == "meia": d.pieslice([x - 10, 856, x + 10, 876], 90, 270, fill=35)
        if tipo == "x": d.line([(x - 9, 857), (x + 9, 875)], fill=35, width=3); d.line([(x - 9, 875), (x + 9, 857)], fill=35, width=3)
        d.text((x + 24, 866), rot + (" ✔" if tipo == "cheia" else " ✘"), font=fonte(17), fill=20, anchor="lm")
    d.text((130, 880), "Marque assim:", font=fonte(16), fill=70, anchor="lm")
    _grade(d, L, marcadas, cabecalho=True)
    d.text((W // 2, 1625), "CorrigeAI · cartão-resposta de 90 questões", font=fonte(16), fill=90, anchor="mm")
    return img


if __name__ == "__main__":
    import sys
    from pathlib import Path
    saida = Path(sys.argv[1] if len(sys.argv) > 1 else "."); saida.mkdir(parents=True, exist_ok=True)
    folha().save(saida / "folha-respostas-modelo.pdf", resolution=150)
    cartao_resposta().save(saida / "cartao-resposta-90-modelo.pdf", resolution=150)
