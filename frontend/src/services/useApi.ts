import { useEffect, useState } from 'react';

export function useApi<T = any>(loader: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  useEffect(() => {
    let vivo = true;
    setLoading(true); setErro('');
    loader().then((d) => vivo && setData(d)).catch((e) => vivo && setErro(e instanceof Error ? e.message : 'Erro ao carregar dados.')).finally(() => vivo && setLoading(false));
    return () => { vivo = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return { data, loading, erro };
}
