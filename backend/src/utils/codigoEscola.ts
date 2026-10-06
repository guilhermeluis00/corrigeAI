import { randomInt } from "node:crypto";

export const TAMANHO_CODIGO_ESCOLA = 11;

// Sem caracteres que se confundem ao digitar (I, O, l, 0, 1).
const GRUPOS = ["ABCDEFGHJKLMNPQRSTUVWXYZ", "abcdefghijkmnopqrstuvwxyz", "23456789", "!@#$%&*?"];
const TODOS = GRUPOS.join("");

const sortear = (chars: string) => chars[randomInt(chars.length)];

// Código de 11 caracteres com ao menos uma maiúscula, uma minúscula, um número e um símbolo.
export function gerarCodigoEscola() {
  const codigo = GRUPOS.map(sortear);
  while (codigo.length < TAMANHO_CODIGO_ESCOLA) codigo.push(sortear(TODOS));
  for (let i = codigo.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [codigo[i], codigo[j]] = [codigo[j], codigo[i]];
  }
  return codigo.join("");
}
