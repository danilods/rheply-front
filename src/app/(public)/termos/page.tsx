import { Metadata } from 'next';
import { generateWebPageMetadata } from '@/lib/seo';

export const metadata: Metadata = generateWebPageMetadata({
  title: 'Termos de Uso',
  description:
    'Termos de Uso da plataforma Rheply. Leia atentamente antes de utilizar nossos servicos.',
  url: 'https://rheply.com/termos',
  keywords: ['termos de uso', 'termos de servico', 'rheply', 'condicoes'],
});

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Termos de Uso
          </h1>
          <p className="text-muted-foreground mb-8">
            Ultima atualizacao: 16 de Novembro de 2024
          </p>

          <div className="prose prose-lg max-w-none text-foreground">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                1. Aceitacao dos Termos
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Ao acessar e utilizar a plataforma Rheply, voce concorda em
                cumprir e estar vinculado a estes Termos de Uso. Se voce nao
                concordar com qualquer parte destes termos, nao devera utilizar
                nossos servicos.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                2. Descricao do Servico
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                O Rheply e uma plataforma de recrutamento que conecta
                candidatos a oportunidades de emprego. Nossos servicos incluem:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Criacao e gerenciamento de perfis profissionais</li>
                <li>Busca e candidatura a vagas de emprego</li>
                <li>
                  Parsing automatico de curriculos utilizando inteligencia
                  artificial
                </li>
                <li>Acompanhamento do status de candidaturas</li>
                <li>
                  Comunicacao entre candidatos e empresas recrutadoras
                </li>
                <li>
                  Ferramentas de gestao de recrutamento para empresas
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                3. Cadastro e Conta
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Para utilizar determinados recursos da plataforma, voce devera
                criar uma conta fornecendo informacoes precisas e completas.
                Voce e responsavel por:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Manter a confidencialidade de suas credenciais de acesso</li>
                <li>
                  Todas as atividades realizadas em sua conta
                </li>
                <li>
                  Notificar imediatamente sobre qualquer uso nao autorizado
                </li>
                <li>
                  Fornecer informacoes verdadeiras e atualizadas
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                4. Uso Aceitavel
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Ao utilizar nossa plataforma, voce concorda em nao:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>
                  Fornecer informacoes falsas ou enganosas em seu perfil ou
                  candidaturas
                </li>
                <li>
                  Utilizar a plataforma para fins ilegais ou nao autorizados
                </li>
                <li>
                  Tentar acessar contas de outros usuarios sem autorizacao
                </li>
                <li>
                  Enviar spam, mensagens nao solicitadas ou conteudo malicioso
                </li>
                <li>
                  Violar direitos de propriedade intelectual de terceiros
                </li>
                <li>
                  Coletar dados de outros usuarios sem consentimento
                </li>
                <li>
                  Publicar vagas falsas ou fraudulentas (para empresas)
                </li>
                <li>
                  Discriminar candidatos com base em caracteristicas protegidas
                  por lei
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                5. Conteudo do Usuario
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Voce mantem a propriedade de todo conteudo que envia a
                plataforma (curriculos, informacoes de perfil, etc.). Ao
                enviar conteudo, voce nos concede uma licenca nao exclusiva
                para:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>
                  Armazenar, processar e exibir seu conteudo conforme
                  necessario para fornecer os servicos
                </li>
                <li>
                  Utilizar seu conteudo para melhorar nossos algoritmos de IA
                  (de forma anonimizada)
                </li>
                <li>
                  Compartilhar seu perfil com empresas recrutadoras quando voce
                  se candidatar a vagas
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                6. Propriedade Intelectual
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                A plataforma Rheply, incluindo sua interface, codigo,
                algoritmos, marcas e conteudo original, sao propriedade da
                Rheply Tecnologia Ltda. ou de seus licenciadores. Voce nao pode
                copiar, modificar, distribuir ou criar trabalhos derivados sem
                nossa autorizacao expressa.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                7. Limitacao de Responsabilidade
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                O Rheply atua como intermediario entre candidatos e empresas.
                Nao garantimos:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>
                  Que voce encontrara emprego ou candidatos ideais
                </li>
                <li>
                  A veracidade das informacoes fornecidas por outros usuarios
                </li>
                <li>
                  Que a plataforma estara disponivel ininterruptamente
                </li>
                <li>
                  Resultados especificos do uso de nossos servicos
                </li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Nao somos responsaveis por decisoes de contratacao tomadas pelas
                empresas ou por acoes de terceiros na plataforma.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                8. Servicos para Empresas
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Empresas que utilizam nossos servicos de recrutamento concordam
                em:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>
                  Publicar apenas vagas reais e legitimas
                </li>
                <li>
                  Cumprir todas as leis trabalhistas aplicaveis
                </li>
                <li>
                  Nao discriminar candidatos ilegalmente
                </li>
                <li>
                  Manter a confidencialidade dos dados dos candidatos
                </li>
                <li>
                  Utilizar os dados apenas para fins de recrutamento
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                9. Rescisao
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Podemos suspender ou encerrar sua conta a qualquer momento por
                violacao destes termos, atividade fraudulenta ou qualquer motivo
                razoavel. Voce pode encerrar sua conta a qualquer momento atraves
                das configuracoes do perfil ou entrando em contato conosco.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                10. Alteracoes nos Termos
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Reservamo-nos o direito de modificar estes termos a qualquer
                momento. Alteracoes significativas serao comunicadas por email
                ou notificacao na plataforma. O uso continuado apos alteracoes
                constitui aceitacao dos novos termos.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                11. Lei Aplicavel e Jurisdicao
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Estes Termos sao regidos pelas leis da Republica Federativa do
                Brasil. Qualquer disputa sera submetida a jurisdicao exclusiva
                dos tribunais da Comarca de Sao Paulo, SP.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                12. Contato
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Para duvidas sobre estes Termos de Uso, entre em contato:
              </p>
              <div className="mt-4 text-muted-foreground">
                <p>Rheply Tecnologia Ltda.</p>
                <p>Email: juridico@rheply.com</p>
                <p>Telefone: (11) 4002-8922</p>
                <p>Endereco: Av. Paulista, 1234 - Sao Paulo, SP</p>
              </div>
            </section>

            <section className="bg-muted/50 p-6 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Ao criar uma conta ou utilizar nossos servicos, voce confirma
                que leu, entendeu e concorda com estes Termos de Uso em sua
                integralidade.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
