/** A rota carregando: o quadro já mostra sua estrutura, nunca uma tela em branco. */
export default function Carregando() {
  return (
    <div aria-busy="true" aria-label="Abrindo o quadro" style={{ display: "grid", gap: 16 }}>
      <div style={{ height: 96, background: "var(--rs-placa)", borderTop: "2px solid var(--rs-fio-forte)" }} />
      <div style={{ height: 108, background: "var(--rs-placa)", borderTop: "2px solid var(--rs-fio-forte)" }} />
      <div style={{ display: "grid", gridTemplateColumns: "7fr 5fr", gap: 16 }}>
        <div style={{ height: 300, background: "var(--rs-placa)", borderTop: "2px solid var(--rs-fio-forte)" }} />
        <div style={{ height: 300, background: "var(--rs-placa)", borderTop: "2px solid var(--rs-fio-forte)" }} />
      </div>
    </div>
  );
}
