"""Leitura de folha de respostas CorrigeAI com OpenCV: acha os 4 quadrados, corrige a perspectiva e mede o preenchimento."""
import cv2
import numpy as np
from layout import H, MARK_CENTERS, OPCOES, W, centro, layout_para


class FolhaNaoEncontrada(Exception):
    pass


def _ordenar(pts):
    pts = np.array(pts, dtype=np.float32)
    s, d = pts.sum(axis=1), pts[:, 0] - pts[:, 1]
    return np.array([pts[s.argmin()], pts[d.argmax()], pts[s.argmax()], pts[d.argmin()]], dtype=np.float32)  # TL TR BR BL


def _achar_marcas(gray):
    blur = cv2.GaussianBlur(gray, (5, 5), 0)
    _, bw = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY_INV | cv2.THRESH_OTSU)
    bw = cv2.morphologyEx(bw, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    cnts, _ = cv2.findContours(bw, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
    area_img, cands = gray.shape[0] * gray.shape[1], []
    for c in cnts:
        a = cv2.contourArea(c)
        if not (0.0002 * area_img < a < 0.02 * area_img):
            continue
        x, y, w, h = cv2.boundingRect(c)
        if not (0.7 < w / h < 1.4) or a / (w * h) < 0.85:
            continue
        if len(cv2.approxPolyDP(c, 0.05 * cv2.arcLength(c, True), True)) != 4:
            continue
        m = cv2.moments(c)
        cands.append((a, (m["m10"] / m["m00"], m["m01"] / m["m00"])))
    if len(cands) < 4:
        raise FolhaNaoEncontrada()
    amax = max(a for a, _ in cands)
    pts = [p for a, p in cands if a >= 0.4 * amax]
    if len(pts) < 4:
        raise FolhaNaoEncontrada()
    return _ordenar([pts[i] for i in _cantos(pts)])


def _cantos(pts):
    p = np.array(pts)
    s, d = p.sum(axis=1), p[:, 0] - p[:, 1]
    return [int(s.argmin()), int(d.argmax()), int(s.argmax()), int(d.argmin())]


def detectar(dados: bytes, total: int | None = None):
    L = layout_para(total)
    RAIO, QTD = L["raio"], L["qtd"]
    img = cv2.imdecode(np.frombuffer(dados, np.uint8), cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Arquivo de imagem inválido.")
    escala = 2400 / max(img.shape[:2])
    if escala < 1:
        img = cv2.resize(img, None, fx=escala, fy=escala, interpolation=cv2.INTER_AREA)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    origem = _achar_marcas(gray)
    M = cv2.getPerspectiveTransform(origem, np.array(MARK_CENTERS, dtype=np.float32))
    folha = cv2.warpPerspective(gray, M, (W, H), flags=cv2.INTER_CUBIC, borderValue=255)
    folha = cv2.GaussianBlur(folha, (3, 3), 0)
    tinta = cv2.adaptiveThreshold(folha, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 61, 18)

    mascara = np.zeros((RAIO * 2 + 2, RAIO * 2 + 2), np.uint8)
    cv2.circle(mascara, (RAIO + 1, RAIO + 1), int(RAIO * 0.6), 255, -1)
    area = float(mascara.sum() / 255)
    questoes = []
    for n in range(1, QTD + 1):
        fill = []
        for k in range(len(OPCOES)):
            cx, cy = centro(L, n, k)
            y0, x0 = cy - RAIO - 1, cx - RAIO - 1
            fill.append(float(((tinta[y0:y0 + mascara.shape[0], x0:x0 + mascara.shape[1]] > 0) & (mascara > 0)).sum()) / area)
        ordem = sorted(range(5), key=lambda i: -fill[i])
        melhor, segundo = fill[ordem[0]], fill[ordem[1]]
        if melhor < 0.40:
            resp, status, conf = None, "em_branco", 0.95
        elif segundo >= 0.40:
            resp, status, conf = None, "multipla", 0.5
        else:
            resp, status, conf = OPCOES[ordem[0]], "ok", round(min(1.0, 0.6 + (melhor - segundo) * 0.4), 2)
        questoes.append({"numero": n, "resposta": resp, "confianca": conf, "status": status})
    return {"questoes": questoes}
