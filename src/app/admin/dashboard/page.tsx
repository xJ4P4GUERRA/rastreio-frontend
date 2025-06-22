// Copie este código completo
// frontend/src/app/admin/dashboard/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

import { 
  Pencil, Trash2, Plus, Save, AlertTriangle, User, Box, Truck, 
  Menu, Sun, Moon, LogOut, X, CheckCircle, AlertCircle, UserPlus
} from 'lucide-react';

// --- INTERFACES ---
interface Cliente { _id: string; cpf: string; nomeCompleto: string; telefone: string; }
interface Rastreio { _id: string; codigoRastreio: string; cliente: Cliente; statusAtual: string; }

export default function AdminDashboardPage() {
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [rastreios, setRastreios] = useState<Rastreio[]>([]);
  
  // Demais estados para formulários...
  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const router = useRouter();

  const handleLogout = useCallback(() => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    router.push('/admin/login');
  }, [router]);

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    const adminUserString = localStorage.getItem('adminUser');

    if (!adminToken || !adminUserString) {
      handleLogout();
      return;
    }
    try {
      setUser(JSON.parse(adminUserString));
    } catch {
      handleLogout();
      return;
    }

    const fetchData = async () => {
      try {
        const [clientesRes, rastreiosRes] = await Promise.all([
          fetch(`${API_BASE_URL}/clientes`, { headers: { 'Authorization': `Bearer ${adminToken}` } }),
          fetch(`${API_BASE_URL}/rastreios`, { headers: { 'Authorization': `Bearer ${adminToken}` } })
        ]);

        if (clientesRes.status === 401 || rastreiosRes.status === 401) {
          handleLogout();
          return;
        }

        if (clientesRes.ok) setClientes(await clientesRes.json());
        if (rastreiosRes.ok) setRastreios(await rastreiosRes.json());

      } catch (err) {
        setError('Erro de conexão ao carregar os dados.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router, handleLogout, API_BASE_URL]);

  const resetMessages = (setter1: Function, setter2: Function) => {
      setTimeout(() => { setter1(null); setter2(null); }, 4000);
  };
  
  const handleRegisterAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterLoading(true);
    setRegisterSuccess(null);
    setRegisterError(null);
    const adminToken = localStorage.getItem('adminToken');

    if (!adminToken) {
        setRegisterError('Sessão expirada. Por favor, faça login novamente.');
        setRegisterLoading(false);
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}`},
            body: JSON.stringify({ username: newAdminUsername, password: newAdminPassword, role: 'admin' })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.msg);
        setRegisterSuccess(data.msg);
        setNewAdminUsername('');
        setNewAdminPassword('');
    } catch (err: any) {
        setRegisterError(err.message);
    } finally {
        setRegisterLoading(false);
        resetMessages(setRegisterSuccess, setRegisterError);
    }
  };

  if (loading) return <main className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950">Carregando...</main>;
  if (error) return <main className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950">{error}</main>;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 text-gray-800 dark:text-gray-200">
      <header className="bg-white dark:bg-gray-900/80 backdrop-blur-sm p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center sticky top-0 z-30">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white flex items-center"><Truck className="mr-3 text-blue-600 h-7 w-7" />Painel Admin</h1>
        <button onClick={handleLogout} className="btn-icon"><LogOut size={20} /></button>
      </header>

      <main className="p-4 md:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-start">
        <div className="lg:col-span-2 flex flex-col gap-6 md:gap-8">
            <section id="clientes-section" className="card">
                <h2 className="card-title"><User className="mr-3" /> Clientes ({clientes.length})</h2>
                {clientes.length > 0 ? (
                    <ul className="space-y-2 max-h-[250px] overflow-y-auto custom-scrollbar pr-2">
                        {clientes.map((cliente) => <li key={cliente._id} className="list-item">{cliente.nomeCompleto}</li>)}
                    </ul>
                ) : <p className="text-center text-gray-500 py-8">Nenhum cliente cadastrado.</p>}
            </section>
            <section id="rastreios-section" className="card">
                <h2 className="card-title"><Box className="mr-3" /> Rastreios ({rastreios.length})</h2>
                 {rastreios.length > 0 ? (
                     <ul className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                        {rastreios.map((rastreio) => <li key={rastreio._id} className="list-item">{rastreio.codigoRastreio}</li>)}
                    </ul>
                ) : <p className="text-center text-gray-500 py-8">Nenhum rastreio cadastrado.</p>}
            </section>
        </div>

        <div className="lg:col-span-1 flex flex-col gap-6 md:gap-8 lg:sticky top-24">
            {user && user.role === 'superadmin' && (
              <section id="cadastro-admin-section" className="card">
                <h2 className="card-title"><UserPlus className="mr-2" /> Cadastrar Novo Admin</h2>
                <form onSubmit={handleRegisterAdmin} className="space-y-3">
                  <div>
                    <label htmlFor="newAdminUsername" className="label">Novo Usuário</label>
                    <input type="text" id="newAdminUsername" className="input-field" value={newAdminUsername} onChange={(e) => setNewAdminUsername(e.target.value)} required />
                  </div>
                  <div>
                    <label htmlFor="newAdminPassword" className="label">Senha Provisória</label>
                    <input type="password" id="newAdminPassword" className="input-field" value={newAdminPassword} onChange={(e) => setNewAdminPassword(e.target.value)} required />
                  </div>
                  <div className="pt-2 flex justify-end">
                    <button type="submit" className="btn-primary bg-orange-500 hover:bg-orange-600" disabled={registerLoading}>
                        {registerLoading ? 'Cadastrando...' : 'Cadastrar Admin'}
                    </button>
                  </div>
                </form>
                {registerSuccess && <div className="message-success"><CheckCircle size={16} className="mr-2"/>{registerSuccess}</div>}
                {registerError && <div className="message-error"><AlertCircle size={16} className="mr-2"/>{registerError}</div>}
              </section>
            )}
        </div>
      </main>
    </div>
  );
}