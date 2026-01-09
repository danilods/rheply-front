/**
 * Layout limpo para páginas de processo seletivo.
 * Sem header, footer ou banner de cookies.
 * Candidatos não precisam de login.
 */
export default function ProcessoSeletivoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950">
      {children}
    </div>
  );
}
