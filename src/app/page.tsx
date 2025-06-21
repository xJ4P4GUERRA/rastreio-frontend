// CÓDIGO DE TESTE TEMPORÁRIO para frontend/src/app/admin/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboardTestPage() {
  const [token, setToken] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<string>('');
  const [error, setError] = useState<string>('');
  const router = useRouter();

  // Ao carregar a página, lê o token do localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('adminToken');
    setToken(storedToken);

    if (!storedToken) {
        setError('ATENÇÃO: Nenhum token encontrado no localStorage ao carregar a página. O login pode não ter funcionado corretamente.');
    }
  }, []);

  // Função para testar a chamada à API
  const handleTestApi = async () => {
    setError('');
    setApiResponse('');

    if (!token) {
      setError('ERRO CRÍTICO: Não há token para enviar. Faça o login novamente.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/clientes', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        // Se a resposta for um erro (401, 403, 500 etc), lança um erro com a mensagem do backend
        throw new Error(`Status: ${response.status} - Mensagem do Backend: ${data.msg || 'Erro desconhecido'}`);
      }

      // Se a resposta for sucesso (200), mostra os dados recebidos
      setApiResponse(JSON.stringify(data, null, 2)); 

    } catch (err: any) {
      setError(`FALHA NA REQUISIÇÃO: ${err.message}`);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace', background: '#fff', color: '#000' }}>
      <h1>Página de Teste de Autenticação</h1>
      <p>O objetivo desta página é verificar se o token de login está funcionando.</p>
      
      <hr style={{ margin: '1rem 0' }} />

      <h2>1. Token Armazenado no Navegador:</h2>
      <div style={{ padding: '1rem', background: '#f0f0f0', border: '1px solid #ccc', wordBreak: 'break-all', minHeight: '50px' }}>
        {token ? token : 'NENHUM TOKEN ENCONTRADO'}
      </div>

      <hr style={{ margin: '1rem 0' }} />

      <h2>2. Teste de API Protegida:</h2>
      <button onClick={handleTestApi} style={{ padding: '0.5rem 1rem', fontSize: '1rem', cursor: 'pointer', border: '1px solid black' }}>
        Testar Acesso à Rota de Clientes
      </button>

      <h3 style={{ marginTop: '1.5rem' }}>Resposta da API:</h3>
      <pre style={{ padding: '1rem', background: '#f0f0f0', border: '1px solid #ccc', minHeight: '100px', whiteSpace: 'pre-wrap' }}>
        {apiResponse}
      </pre>

      {error && (
        <>
          <h3 style={{ marginTop: '1.5rem', color: 'red' }}>ERRO ENCONTRADO:</h3>
          <pre style={{ padding: '1rem', background: '#ffdddd', border: '1px solid red', color: 'red', whiteSpace: 'pre-wrap' }}>
            {error}
          </pre>
        </>
      )}
    </div>
  );
}