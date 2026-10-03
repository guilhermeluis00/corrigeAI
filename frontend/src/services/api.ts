const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/$/, '');

export function getToken() { return localStorage.getItem('token'); }
export function getUsuario<T = any>(): T | null { try { const raw = localStorage.getItem('usuario'); return raw ? JSON.parse(raw) as T : null; } catch { return null; } }
export function setSession(token: string, usuario: unknown) { localStorage.setItem('token', token); localStorage.setItem('usuario', JSON.stringify(usuario)); }
export function clearSession() { localStorage.removeItem('token'); localStorage.removeItem('usuario'); }

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && options.body && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  let response: Response;
  try { response = await fetch(`${API_URL}${path}`, { ...options, headers }); }
  catch { throw new Error('Não foi possível conectar ao servidor. Verifique se o backend está rodando.'); }
  let body: any = null;
  try { body = await response.json(); } catch { /* no json */ }
  if (response.status === 401 && !path.startsWith('/auth/login')) { clearSession(); window.location.href = '/login'; }
  if (!response.ok) throw new Error(body?.mensagem || body?.message || (typeof body?.detail === 'string' ? body.detail : '') || `Erro ${response.status}`);
  return body as T;
}

export const api = {
  login: (email:string, senha:string) => request<any>('/auth/login',{method:'POST',body:JSON.stringify({email,senha})}),
  cadastro: (data:any) => request<any>('/auth/cadastro',{method:'POST',body:JSON.stringify(data)}),
  me: () => request<any>('/auth/me'),
  turmas: () => request<any>('/turmas'),
  alunos: () => request<any>('/alunos'),
  provas: () => request<any>('/provas'),
  resultados: () => request<any>('/resultados'),
  relatorios: () => request<any>('/relatorios'),
  dashboard: () => request<any>('/dashboard'),
  uploadCorrecao: (file:File, provaId:string, alunoId:string) => {
    const form = new FormData(); form.append('imagem',file); form.append('provaId',provaId); form.append('alunoId',alunoId);
    return request<any>('/correcoes/foto',{method:'POST',body:form});
  },
};
