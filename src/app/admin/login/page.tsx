// frontend/src/app/admin/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!username || !password) {
      setError('Por favor, preencha o usuário e a senha.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.user));
        router.push('/admin/dashboard');
      } else {
        setError(data.msg || 'Credenciais inválidas.');
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor. Verifique se o backend está no ar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // A classe "dark" foi adicionada aqui para forçar o modo escuro nesta página
    <div className="dark flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950 p-4 bg-gradient-to-br from-gray-200 via-gray-100 to-white dark:from-gray-950 dark:via-gray-900 dark:to-black">
      <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/20 dark:border-gray-800/50 w-full max-w-md animate-fade-in">
        <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 mb-6">
          Login Administrativo
        </h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="username" className="label">
              Usuário
            </label>
            <div className="relative">
              <input
                type="text"
                id="username"
                className="input-field !pl-10"
                placeholder="Seu nome de usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <User className="absolute top-1/2 left-3 -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-gray-400" />
            </div>
          </div>
          <div>
            <label htmlFor="password" className="label">
              Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                className="input-field !pl-10 !pr-10"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Lock className="absolute top-1/2 left-3 -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-gray-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="btn-primary w-full flex justify-center items-center gap-2 !py-2.5 !text-base"
            disabled={loading}
          >
            {loading ? 'Entrando...' : <>Entrar <ArrowRight size={18} /></>}
          </button>
        </form>
        {error && (
          <div className="message-error mt-4">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}