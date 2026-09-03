import type { Metadata } from "next";

/**
 * O link é para quem recebeu o link, e para mais ninguém.
 *
 * `noindex, nofollow` não é segurança — quem tem a URL entra do mesmo jeito —,
 * mas evita o modo mais bobo de vazamento: um buscador indexar a página porque
 * alguém colou o endereço num lugar rastreável.
 */
export const metadata: Metadata = {
  title: "Atração e Seleção · Rheply",
  robots: { index: false, follow: false, nocache: true },
};

export default function LayoutPainelPublico({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
