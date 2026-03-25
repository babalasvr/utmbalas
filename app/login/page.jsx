'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      const from = searchParams.get('from') || '/';
      router.push(from);
    } else {
      setError('Senha incorreta');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
      <div className="w-full max-w-sm px-6">
        <div className="text-center mb-8">
          <div className="text-2xl font-bold tracking-tight mb-1">
            UTM<span className="text-[#6366f1]">Balas</span>
          </div>
          <p className="text-[#8892a4] text-sm">Entre para acessar o dashboard</p>
        </div>

        <div className="bg-[#1a1d27] border border-[#2a2d3e] rounded-xl p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.6px] text-[#8892a4] mb-2">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoFocus
                className="w-full px-3.5 py-2.5 bg-[#1e2130] border border-[#2a2d3e] rounded-lg text-[#e2e8f0] text-sm outline-none focus:border-[#6366f1] transition-colors placeholder-[#8892a4]"
              />
            </div>

            {error && (
              <p className="text-[#ef4444] text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-2.5 bg-[#6366f1] hover:bg-[#5254cc] disabled:opacity-50 text-white font-semibold text-sm rounded-lg transition-colors"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
