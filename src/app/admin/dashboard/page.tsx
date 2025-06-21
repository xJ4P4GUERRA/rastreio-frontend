// frontend/src/app/admin/dashboard/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// UserPlus foi adicionado à lista de importação
import { 
  Pencil, Trash2, Plus, Save, AlertTriangle, User, Box, Truck, 
  Menu, Sun, Moon, LogOut, X, CheckCircle, AlertCircle, UserPlus
} from 'lucide-react';

// --- INTERFACES ---
interface Cliente {
  _id: string;
  cpf: string;
  nomeCompleto: string;
  telefone: string;
  dataCadastro: string;
}

interface HistoricoItem {
  status: string;
  dataHora: string;
  local?: string;
  descricao?: string;
}

interface Rastreio {
  _id: string;
  codigoRastreio: string;
  cliente: Cliente;
  statusAtual: string;
  historico: HistoricoItem[];
  previsaoEntrega?: string;
}
// --- FIM DAS INTERFACES ---

export default function AdminDashboardPage() {
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [rastreios, setRastreios] = useState<Rastreio[]>([]);

  const API_BASE_URL_FORCED = 'http://localhost:5000/api';

  // --- ESTADOS DE FORMULÁRIOS E MODAIS ---
  const [newClienteCpf, setNewClienteCpf] = useState<string>('');
  const [newClienteNome, setNewClienteNome] = useState<string>('');
  const [newClienteTelefone, setNewClienteTelefone] = useState<string>('');
  const [clienteFormLoading, setClienteFormLoading] = useState<boolean>(false);
  const [clienteFormSuccess, setClienteFormSuccess] = useState<string | null>(null);
  const [clienteFormError, setClienteFormError] = useState<string | null>(null);

  const [selectedClienteCpf, setSelectedClienteCpf] = useState<string>('');
  const [newRastreioPrevisao, setNewRastreioPrevisao] = useState<string>('');
  const [newRastreioStatusInicial, setNewRastreioStatusInicial] = useState<string>('Pedido Coletado');
  const [newRastreioLocalInicial, setNewRastreioLocalInicial] = useState<string>('');
  const [newRastreioDescricaoInicial, setNewRastreioDescricaoInicial] = useState<string>('');
  const [rastreioFormLoading, setRastreioFormLoading] = useState<boolean>(false);
  const [rastreioFormSuccess, setRastreioFormSuccess] = useState<string | null>(null);
  const [rastreioFormError, setRastreioFormError] = useState<string | null>(null);

  const [selectedRastreioCodigo, setSelectedRastreioCodigo] = useState<string>('');
  const [newStatus, setNewStatus] = useState<string>('Em Trânsito');
  const [newStatusLocal, setNewStatusLocal] = useState<string>('');
  const [newStatusDescricao, setNewStatusDescricao] = useState<string>('');
  const [statusUpdateLoading, setStatusUpdateLoading] = useState<boolean>(false);
  const [statusUpdateSuccess, setStatusUpdateSuccess] = useState<string | null>(null);
  const [statusUpdateError, setStatusUpdateError] = useState<string | null>(null);

  // --- ESTADOS PARA CADASTRO DE NOVO ADMIN ---
  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);

  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [editClienteCpf, setEditClienteCpf] = useState<string>('');
  const [editClienteNome, setEditClienteNome] = useState<string>('');
  const [editClienteTelefone, setEditClienteTelefone] = useState<string>('');
  const [editClienteLoading, setEditClienteLoading] = useState<boolean>(false);
  const [editClienteSuccess, setEditClienteSuccess] = useState<string | null>(null);
  const [editClienteError, setEditClienteError] = useState<string | null>(null);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  // --- FIM ESTADOS ---

  const router = useRouter();
  
  // --- HOOKS ---
  const toggleDarkMode = useCallback(() => {
    setDarkMode(prevMode => {
      const newMode = !prevMode;
      if (newMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return newMode;
    });
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark') {
        setDarkMode(true);
        document.documentElement.classList.add('dark');
      } else {
        setDarkMode(false);
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  const fetchData = useCallback(async (token: string) => {
    if (!token) { handleLogout(); return; }
    try {
      const [clientesRes, rastreiosRes] = await Promise.all([
        fetch(`${API_BASE_URL_FORCED}/clientes`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL_FORCED}/rastreios`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (clientesRes.status === 401 || rastreiosRes.status === 401) { handleLogout(); return; }

      const clientesData = await clientesRes.json();
      if (clientesRes.ok) {
        setClientes(clientesData);
        if (clientesData.length > 0 && !selectedClienteCpf) setSelectedClienteCpf(clientesData[0].cpf);
        else if (clientesData.length === 0) setSelectedClienteCpf('');
      } else { setError(clientesData.msg || 'Erro ao carregar clientes.'); }

      const rastreiosData = await rastreiosRes.json();
      if (rastreiosRes.ok) {
        setRastreios(rastreiosData);
        if (rastreiosData.length > 0 && !selectedRastreioCodigo) setSelectedRastreioCodigo(rastreiosData[0].codigoRastreio)
      }
      else { setError(rastreiosData.msg || 'Erro ao carregar rastreios.'); }

    } catch (err) { setError('Erro de conexão ao carregar dados.'); }
  }, [selectedClienteCpf, selectedRastreioCodigo]);

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    const adminUser = localStorage.getItem('adminUser');
    if (!adminToken || !adminUser) {
      router.push('/admin/login');
      return;
    }
    try {
      setUser(JSON.parse(adminUser));
      fetchData(adminToken);
    } catch (e) {
      handleLogout();
    } finally {
      setLoading(false);
    }
  }, [router, fetchData]);
  // --- FIM HOOKS ---

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    router.push('/admin/login');
  };

  const resetMessages = (setter1: Function, setter2: Function) => {
    setTimeout(() => {
      setter1(null);
      setter2(null);
    }, 4000);
  };

  // --- FUNÇÕES DE MANIPULAÇÃO DE DADOS ---
  const handleAddCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    setClienteFormLoading(true); setClienteFormSuccess(null); setClienteFormError(null);
    if (!newClienteCpf.trim() || !newClienteNome.trim() || !newClienteTelefone.trim()) {
      setClienteFormError('Preencha todos os campos.'); setClienteFormLoading(false); return;
    }
    const adminToken = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`${API_BASE_URL_FORCED}/clientes`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
        body: JSON.stringify({ cpf: newClienteCpf, nomeCompleto: newClienteNome, telefone: newClienteTelefone }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.msg || 'Erro ao cadastrar.');
      setClienteFormSuccess('Cliente cadastrado!');
      setNewClienteCpf(''); setNewClienteNome(''); setNewClienteTelefone('');
      await fetchData(adminToken!);
    } catch (err: any) { setClienteFormError(err.message); } 
    finally { setClienteFormLoading(false); resetMessages(setClienteFormSuccess, setClienteFormError); }
  };

  const handleAddRastreio = async (e: React.FormEvent) => {
    e.preventDefault();
    setRastreioFormLoading(true); setRastreioFormSuccess(null); setRastreioFormError(null);
    if (!selectedClienteCpf || !newRastreioPrevisao || !newRastreioStatusInicial || !newRastreioLocalInicial) {
        setRastreioFormError('Preencha os campos obrigatórios.'); setRastreioFormLoading(false); return;
    }
    const adminToken = localStorage.getItem('adminToken');
    try {
        const response = await fetch(`${API_BASE_URL_FORCED}/rastreios`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
            body: JSON.stringify({
                clienteCpf: selectedClienteCpf,
                previsaoEntrega: newRastreioPrevisao,
                statusInicial: newRastreioStatusInicial,
                localInicial: newRastreioLocalInicial,
                descricaoInicial: newRastreioDescricaoInicial,
            }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.msg || 'Erro ao cadastrar rastreio.');
        setRastreioFormSuccess(`Rastreio ${data.rastreio.codigoRastreio} criado!`);
        setNewRastreioPrevisao(''); setNewRastreioLocalInicial(''); setNewRastreioDescricaoInicial('');
        await fetchData(adminToken!);
    } catch (err: any) { setRastreioFormError(err.message); }
    finally { setRastreioFormLoading(false); resetMessages(setRastreioFormSuccess, setRastreioFormError); }
  };

  const handleUpdateRastreioStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusUpdateLoading(true); setStatusUpdateSuccess(null); setStatusUpdateError(null);
    if (!selectedRastreioCodigo || !newStatus || !newStatusLocal) {
        setStatusUpdateError('Preencha os campos obrigatórios.'); setStatusUpdateLoading(false); return;
    }
    const adminToken = localStorage.getItem('adminToken');
    const rastreioToUpdate = rastreios.find(r => r.codigoRastreio === selectedRastreioCodigo);
    if (!rastreioToUpdate) {
        setStatusUpdateError('Rastreio não encontrado.'); setStatusUpdateLoading(false); return;
    }
    try {
        const response = await fetch(`${API_BASE_URL_FORCED}/rastreios/${rastreioToUpdate._id}/status`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
            body: JSON.stringify({ status: newStatus, local: newStatusLocal, descricao: newStatusDescricao }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.msg || 'Erro ao atualizar status.');
        setStatusUpdateSuccess('Status atualizado!');
        setNewStatusLocal(''); setNewStatusDescricao('');
        await fetchData(adminToken!);
    } catch (err: any) { setStatusUpdateError(err.message); }
    finally { setStatusUpdateLoading(false); resetMessages(setStatusUpdateSuccess, setStatusUpdateError); }
  };
  
  const handleDeleteCliente = async (clienteId: string, clienteNome: string) => {
    if (!window.confirm(`Excluir o cliente ${clienteNome}? Esta ação removerá também os rastreios associados.`)) return;
    const adminToken = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`${API_BASE_URL_FORCED}/clientes/${clienteId}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${adminToken}` },
      });
      if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.msg); }
      await fetchData(adminToken!);
    } catch (err: any) { alert(`Erro: ${err.message}`); }
  };

  const handleDeleteRastreio = async (rastreioId: string, codigoRastreio: string) => {
    if (!window.confirm(`Excluir o rastreio ${codigoRastreio}?`)) return;
    const adminToken = localStorage.getItem('adminToken');
    try {
        const response = await fetch(`${API_BASE_URL_FORCED}/rastreios/${rastreioId}`, {
            method: 'DELETE', headers: { 'Authorization': `Bearer ${adminToken}` },
        });
        if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.msg); }
        await fetchData(adminToken!);
    } catch (err: any) { alert(`Erro: ${err.message}`); }
  };

  const handleEditClienteClick = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setEditClienteCpf(cliente.cpf);
    setEditClienteNome(cliente.nomeCompleto);
    setEditClienteTelefone(cliente.telefone);
  };

  const handleUpdateCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCliente) return;
    setEditClienteLoading(true); setEditClienteSuccess(null); setEditClienteError(null);
    const adminToken = localStorage.getItem('adminToken');
    try {
        const response = await fetch(`${API_BASE_URL_FORCED}/clientes/${editingCliente._id}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
            body: JSON.stringify({ cpf: editClienteCpf, nomeCompleto: editClienteNome, telefone: editClienteTelefone }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.msg);
        setEditClienteSuccess('Cliente atualizado!');
        await fetchData(adminToken!);
        setTimeout(() => { setEditingCliente(null); }, 1500);
    } catch (err: any) { setEditClienteError(err.message); }
    finally { setEditClienteLoading(false); resetMessages(setEditClienteSuccess, setEditClienteError); }
  };
  
  const handleRegisterAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterLoading(true);
    setRegisterSuccess(null);
    setRegisterError(null);
    
    if (!newAdminUsername.trim() || !newAdminPassword.trim()) {
        setRegisterError("Usuário e senha não podem estar em branco.");
        setRegisterLoading(false);
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL_FORCED}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: newAdminUsername, password: newAdminPassword })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.msg || 'Não foi possível cadastrar o admin.');
        }
        
        setRegisterSuccess(data.msg || "Administrador registrado com sucesso!");
        setNewAdminUsername('');
        setNewAdminPassword('');

    } catch (err: any) {
        setRegisterError(err.message);
    } finally {
        setRegisterLoading(false);
        resetMessages(setRegisterSuccess, setRegisterError);
    }
  };

  // --- RENDERIZAÇÃO ---
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950">
        <div className="flex items-center text-gray-800 dark:text-gray-200 text-lg animate-pulse">
          <Truck className="mr-3 h-8 w-8 text-blue-600 dark:text-blue-400" />
          Carregando painel...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950">
        <div className="p-8 bg-white dark:bg-gray-900 rounded-lg shadow-xl text-center flex flex-col items-center">
          <AlertTriangle className="text-red-500 h-16 w-16 mb-4" />
          <p className="font-bold text-red-600 dark:text-red-400 text-xl mb-2">Ocorreu um Erro</p>
          <p className="text-gray-700 dark:text-gray-300 mb-6">{error}</p>
          <button onClick={handleLogout} className="btn-primary bg-blue-600 hover:bg-blue-700">
            Voltar para o Login
          </button>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 text-gray-800 dark:text-gray-200">
      <header className="bg-white dark:bg-gray-900/80 backdrop-blur-sm p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center sticky top-0 z-30">
        <div className="flex items-center gap-2">
            <button onClick={() => setIsMobileMenuOpen(true)} className="btn-icon lg:hidden" aria-label="Abrir menu">
                <Menu size={22} />
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white flex items-center">
                <Truck className="mr-3 text-blue-600 h-7 w-7" />
                Painel Admin
            </h1>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={toggleDarkMode} className="btn-icon" aria-label="Alternar modo escuro">
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={handleLogout} className="btn-icon hidden sm:flex" aria-label="Sair">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* INÍCIO DO MENU MÓVEL */}
      <div
        className={`fixed inset-0 bg-black/60 z-40 lg:hidden transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      ></div>
      <nav
        className={`fixed top-0 left-0 w-64 h-full bg-white dark:bg-gray-900 shadow-xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                 <h2 className="font-bold text-lg text-blue-600 dark:text-blue-400">Navegação</h2>
                 <button onClick={() => setIsMobileMenuOpen(false)} className="btn-icon"><X size={22} /></button>
            </div>
          <ul className="space-y-2">
            <li><a href="#clientes-section" onClick={() => setIsMobileMenuOpen(false)} className="nav-link-mobile"><User className="mr-3" size={20}/>Clientes</a></li>
            <li><a href="#rastreios-section" onClick={() => setIsMobileMenuOpen(false)} className="nav-link-mobile"><Box className="mr-3" size={20}/>Rastreios</a></li>
            <div className="my-3 border-t border-gray-200 dark:border-gray-800"></div>
            <li><a href="#cadastro-cliente-section" onClick={() => setIsMobileMenuOpen(false)} className="nav-link-mobile"><Plus className="mr-3" size={20}/>Cadastrar Cliente</a></li>
            <li><a href="#cadastro-rastreio-section" onClick={() => setIsMobileMenuOpen(false)} className="nav-link-mobile"><Plus className="mr-3" size={20}/>Cadastrar Rastreio</a></li>
            <li><a href="#atualizar-status-section" onClick={() => setIsMobileMenuOpen(false)} className="nav-link-mobile"><Save className="mr-3" size={20}/>Atualizar Status</a></li>
            <li><a href="#cadastro-admin-section" onClick={() => setIsMobileMenuOpen(false)} className="nav-link-mobile"><UserPlus className="mr-3" size={20}/>Cadastrar Admin</a></li>
            <div className="my-3 border-t border-gray-200 dark:border-gray-800"></div>
            <li><button onClick={handleLogout} className="nav-link-mobile w-full text-red-500 dark:text-red-500"><LogOut className="mr-3" size={20}/>Sair</button></li>
          </ul>
        </div>
      </nav>
      {/* FIM DO MENU MÓVEL */}

      <main className="p-4 md:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-start">
        
        <div className="lg:col-span-2 flex flex-col gap-6 md:gap-8">
          <section id="clientes-section" className="card">
            <h2 className="card-title"><User className="mr-3" /> Clientes ({clientes.length})</h2>
            <div className="max-h-[250px] overflow-y-auto custom-scrollbar pr-2">
              {clientes.length > 0 ? (
                <ul className="space-y-2">
                  {clientes.map((cliente) => (
                    <li key={cliente._id} className="list-item">
                      <div className="flex-grow min-w-0">
                        <p className="font-semibold truncate">{cliente.nomeCompleto}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">CPF: {cliente.cpf}</p>
                      </div>
                      <div className="flex items-center flex-shrink-0">
                        <button onClick={() => handleEditClienteClick(cliente)} className="btn-icon btn-icon-edit" aria-label="Editar"><Pencil size={16} /></button>
                        <button onClick={() => handleDeleteCliente(cliente._id, cliente.nomeCompleto)} className="btn-icon btn-icon-delete" aria-label="Excluir"><Trash2 size={16} /></button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-center text-gray-500 py-8">Nenhum cliente cadastrado.</p>}
            </div>
          </section>

          <section id="rastreios-section" className="card">
            <h2 className="card-title"><Box className="mr-3" /> Rastreios ({rastreios.length})</h2>
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
              {rastreios.length > 0 ? (
                  <ul className="space-y-2">
                  {rastreios.map((rastreio) => (
                      <li key={rastreio._id} className="list-item">
                          <div className="flex-grow min-w-0">
                              <p className="font-bold text-blue-600 dark:text-blue-400">{rastreio.codigoRastreio}</p>
                              <p className="font-semibold text-sm">{rastreio.statusAtual}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Cliente: {rastreio.cliente.nomeCompleto}</p>
                          </div>
                          <div className="flex items-center flex-shrink-0">
                              <button onClick={() => handleDeleteRastreio(rastreio._id, rastreio.codigoRastreio)} className="btn-icon btn-icon-delete" aria-label="Excluir"><Trash2 size={16} /></button>
                          </div>
                      </li>
                  ))}
                  </ul>
              ) : <p className="text-center text-gray-500 py-8">Nenhum rastreio cadastrado.</p>}
            </div>
          </section>
        </div>

        <div className="lg:col-span-1 flex flex-col gap-6 md:gap-8 lg:sticky top-24">
          <section id="cadastro-cliente-section" className="card">
            <h2 className="card-title"><Plus className="mr-2" /> Cadastrar Cliente</h2>
            <form onSubmit={handleAddCliente} className="space-y-3">
              <div>
                <label htmlFor="newClienteNome" className="label">Nome Completo</label>
                <input type="text" id="newClienteNome" className="input-field" value={newClienteNome} onChange={(e) => setNewClienteNome(e.target.value)} required />
              </div>
              <div>
                <label htmlFor="newClienteCpf" className="label">CPF</label>
                <input type="text" id="newClienteCpf" className="input-field" value={newClienteCpf} onChange={(e) => setNewClienteCpf(e.target.value)} required />
              </div>
              <div>
                <label htmlFor="newClienteTelefone" className="label">Telefone</label>
                <input type="text" id="newClienteTelefone" className="input-field" value={newClienteTelefone} onChange={(e) => setNewClienteTelefone(e.target.value)} required />
              </div>
              <div className="pt-2 flex justify-end">
                <button type="submit" className="btn-primary" disabled={clienteFormLoading}>{clienteFormLoading ? 'Salvando...' : 'Salvar Cliente'}</button>
              </div>
            </form>
            {clienteFormSuccess && <div className="message-success animate-fade-in"><CheckCircle size={16} className="mr-2"/>{clienteFormSuccess}</div>}
            {clienteFormError && <div className="message-error animate-fade-in"><AlertCircle size={16} className="mr-2"/>{clienteFormError}</div>}
          </section>

          <section id="cadastro-rastreio-section" className="card">
                <h2 className="card-title"><Plus className="mr-2" /> Cadastrar Rastreio</h2>
                <form onSubmit={handleAddRastreio} className="space-y-3">
                    <div>
                        <label htmlFor="selectedClienteCpf" className="label">Cliente</label>
                        <select id="selectedClienteCpf" className="input-field" value={selectedClienteCpf} onChange={(e) => setSelectedClienteCpf(e.target.value)} required>
                            <option value="">Selecione...</option>
                            {clientes.map((cliente) => (<option key={cliente._id} value={cliente.cpf}>{cliente.nomeCompleto}</option>))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="newRastreioPrevisao" className="label">Previsão de Entrega</label>
                        <input type="date" id="newRastreioPrevisao" className="input-field" value={newRastreioPrevisao} onChange={(e) => setNewRastreioPrevisao(e.target.value)} required />
                    </div>
                    <div>
                        <label htmlFor="newRastreioLocalInicial" className="label">Local Inicial</label>
                        <input type="text" id="newRastreioLocalInicial" className="input-field" value={newRastreioLocalInicial} onChange={(e) => setNewRastreioLocalInicial(e.target.value)} required />
                    </div>
                    <div className="pt-2 flex justify-end">
                        <button type="submit" className="btn-primary bg-green-600 hover:bg-green-700" disabled={rastreioFormLoading}>
                            {rastreioFormLoading ? 'Cadastrando...' : 'Cadastrar Rastreio'}
                        </button>
                    </div>
                </form>
                {rastreioFormSuccess && <div className="message-success animate-fade-in"><CheckCircle size={16} className="mr-2"/>{rastreioFormSuccess}</div>}
                {rastreioFormError && <div className="message-error animate-fade-in"><AlertCircle size={16} className="mr-2"/>{rastreioFormError}</div>}
          </section>
          
          <section id="atualizar-status-section" className="card">
            <h2 className="card-title"><Save className="mr-2" /> Atualizar Status</h2>
            <form onSubmit={handleUpdateRastreioStatus} className="space-y-3">
                <div>
                    <label htmlFor="selectedRastreioCodigo" className="label">Rastreio</label>
                    <select id="selectedRastreioCodigo" className="input-field" value={selectedRastreioCodigo} onChange={(e) => setSelectedRastreioCodigo(e.target.value)} required>
                        <option value="">Selecione...</option>
                        {rastreios.map((r) => (<option key={r._id} value={r.codigoRastreio}>{r.codigoRastreio} ({r.cliente.nomeCompleto.split(' ')[0]})</option>))}
                    </select>
                </div>
                 <div>
                    <label htmlFor="newStatus" className="label">Novo Status</label>
                    <select id="newStatus" className="input-field" value={newStatus} onChange={(e) => setNewStatus(e.target.value)} required>
                        {["Pedido Coletado", "Em Trânsito", "Saiu para Entrega", "Entregue", "Falha na Entrega"].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="newStatusLocal" className="label">Local da Atualização</label>
                    <input type="text" id="newStatusLocal" className="input-field" value={newStatusLocal} onChange={(e) => setNewStatusLocal(e.target.value)} required />
                </div>
                <div className="pt-2 flex justify-end">
                    <button type="submit" className="btn-primary bg-purple-600 hover:bg-purple-700" disabled={statusUpdateLoading}>
                        {statusUpdateLoading ? 'Atualizando...' : 'Atualizar Status'}
                    </button>
                </div>
            </form>
            {statusUpdateSuccess && <div className="message-success animate-fade-in"><CheckCircle size={16} className="mr-2"/>{statusUpdateSuccess}</div>}
            {statusUpdateError && <div className="message-error animate-fade-in"><AlertCircle size={16} className="mr-2"/>{statusUpdateError}</div>}
          </section>
          
          {/* SEÇÃO PARA CADASTRAR NOVO ADMIN */}
          <section id="cadastro-admin-section" className="card">
            <h2 className="card-title"><UserPlus className="mr-2" /> Cadastrar Novo Admin</h2>
            <form onSubmit={handleRegisterAdmin} className="space-y-3">
              <div>
                <label htmlFor="newAdminUsername" className="label">Novo Usuário</label>
                <input 
                    type="text" 
                    id="newAdminUsername" 
                    className="input-field" 
                    value={newAdminUsername} 
                    onChange={(e) => setNewAdminUsername(e.target.value)} 
                    required 
                />
              </div>
              <div>
                <label htmlFor="newAdminPassword" className="label">Senha Provisória</label>
                <input 
                    type="password" 
                    id="newAdminPassword" 
                    className="input-field" 
                    value={newAdminPassword} 
                    onChange={(e) => setNewAdminPassword(e.target.value)} 
                    required 
                />
              </div>
              <div className="pt-2 flex justify-end">
                <button type="submit" className="btn-primary bg-orange-500 hover:bg-orange-600" disabled={registerLoading}>
                    {registerLoading ? 'Cadastrando...' : 'Cadastrar Admin'}
                </button>
              </div>
            </form>
            {registerSuccess && <div className="message-success animate-fade-in"><CheckCircle size={16} className="mr-2"/>{registerSuccess}</div>}
            {registerError && <div className="message-error animate-fade-in"><AlertCircle size={16} className="mr-2"/>{registerError}</div>}
          </section>

        </div>
      </main>

      {/* MODAL DE EDIÇÃO DE CLIENTE */}
      {editingCliente && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
              <div className="modal-content transform scale-95 animate-zoom-in">
                  <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200 dark:border-gray-800">
                    <h2 className="text-lg font-semibold flex items-center"><Pencil className="mr-2"/>Editar Cliente</h2>
                    <button onClick={() => setEditingCliente(null)} className="btn-icon"><X size={20}/></button>
                  </div>
                  <form onSubmit={handleUpdateCliente} className="space-y-4">
                      <div>
                          <label htmlFor="editClienteNome" className="label">Nome Completo</label>
                          <input type="text" id="editClienteNome" className="input-field" value={editClienteNome} onChange={(e) => setEditClienteNome(e.target.value)} required/>
                      </div>
                       <div>
                          <label htmlFor="editClienteCpf" className="label">CPF</label>
                          <input type="text" id="editClienteCpf" className="input-field" value={editClienteCpf} onChange={(e) => setEditClienteCpf(e.target.value)} required/>
                      </div>
                       <div>
                          <label htmlFor="editClienteTelefone" className="label">Telefone</label>
                          <input type="text" id="editClienteTelefone" className="input-field" value={editClienteTelefone} onChange={(e) => setEditClienteTelefone(e.target.value)} required/>
                      </div>
                      <div className="pt-2 flex justify-end">
                          <button type="submit" className="btn-primary" disabled={editClienteLoading}>
                              {editClienteLoading ? 'Salvando...' : 'Salvar Alterações'}
                          </button>
                      </div>
                  </form>
                  {editClienteSuccess && <div className="message-success animate-fade-in"><CheckCircle size={16} className="mr-2"/>{editClienteSuccess}</div>}
                  {editClienteError && <div className="message-error animate-fade-in"><AlertCircle size={16} className="mr-2"/>{editClienteError}</div>}
              </div>
          </div>
      )}
    </div>
  );
}