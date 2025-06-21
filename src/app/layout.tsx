import '../app/globals.css';

export const metadata = {
  title: 'Dashboard Administrativo',
  description: 'Painel de administração',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}