import { Metadata } from 'next';
import { Shield } from 'lucide-react';
import { generateWebPageMetadata } from '@/lib/seo';

export const metadata: Metadata = generateWebPageMetadata({
  title: 'Politica de Privacidade',
  description:
    'Politica de Privacidade do Rheply. Saiba como coletamos, usamos e protegemos seus dados pessoais em conformidade com a LGPD.',
  url: 'https://rheply.com/privacidade',
  keywords: ['privacidade', 'LGPD', 'protecao de dados', 'rheply'],
});

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-4">
            <Shield className="h-8 w-8 text-primary mr-3" />
            <h1 className="text-4xl font-bold text-foreground">
              Politica de Privacidade
            </h1>
          </div>
          <p className="text-muted-foreground mb-8">
            Ultima atualizacao: 16 de Novembro de 2024
          </p>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Compromisso com a LGPD
            </h2>
            <p className="text-muted-foreground">
              O Rheply esta em total conformidade com a Lei Geral de Protecao
              de Dados (Lei n 13.709/2018). Respeitamos seus direitos como
              titular de dados e garantimos transparencia no tratamento de suas
              informacoes pessoais.
            </p>
          </div>

          <div className="prose prose-lg max-w-none text-foreground">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                1. Controlador dos Dados
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Rheply Tecnologia Ltda., inscrita no CNPJ sob n XX.XXX.XXX/0001-XX,
                com sede na Av. Paulista, 1234, Sao Paulo, SP, e a controladora
                dos seus dados pessoais para os fins desta Politica.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                <strong>Encarregado (DPO):</strong> dpo@rheply.com
              </p>
            </section>

            <section className="mb-8" id="lgpd">
              <h2 className="text-2xl font-semibold mb-4">
                2. Dados que Coletamos
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Coletamos os seguintes tipos de dados pessoais:
              </p>

              <h3 className="text-xl font-medium mb-3">
                2.1 Dados fornecidos por voce:
              </h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>
                  <strong>Dados de identificacao:</strong> nome completo, CPF,
                  RG, data de nascimento, genero
                </li>
                <li>
                  <strong>Dados de contato:</strong> email, telefone, endereco
                </li>
                <li>
                  <strong>Dados profissionais:</strong> curriculo, experiencias,
                  formacao academica, habilidades, certificacoes
                </li>
                <li>
                  <strong>Dados de candidatura:</strong> preferencias de vaga,
                  pretensao salarial, disponibilidade
                </li>
                <li>
                  <strong>Credenciais:</strong> email e senha para acesso a conta
                </li>
              </ul>

              <h3 className="text-xl font-medium mb-3">
                2.2 Dados coletados automaticamente:
              </h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>
                  <strong>Dados de navegacao:</strong> endereco IP, tipo de
                  navegador, paginas visitadas, tempo de permanencia
                </li>
                <li>
                  <strong>Dados de dispositivo:</strong> sistema operacional,
                  identificadores unicos
                </li>
                <li>
                  <strong>Cookies e tecnologias similares:</strong> preferencias
                  de sessao, autenticacao
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                3. Finalidades do Tratamento
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Utilizamos seus dados para:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>
                  <strong>Prestacao de servicos:</strong> criar e gerenciar sua
                  conta, processar candidaturas, conectar com empresas
                </li>
                <li>
                  <strong>Parsing de curriculo:</strong> extrair e organizar
                  informacoes do seu CV usando inteligencia artificial
                </li>
                <li>
                  <strong>Comunicacao:</strong> enviar notificacoes sobre vagas,
                  status de candidaturas, novidades da plataforma
                </li>
                <li>
                  <strong>Melhoria dos servicos:</strong> analisar uso da
                  plataforma, otimizar algoritmos, desenvolver novas
                  funcionalidades
                </li>
                <li>
                  <strong>Seguranca:</strong> prevenir fraudes, proteger a
                  plataforma e usuarios
                </li>
                <li>
                  <strong>Cumprimento legal:</strong> atender obrigacoes legais
                  e regulatorias
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                4. Base Legal para Tratamento
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                O tratamento dos seus dados e fundamentado nas seguintes bases
                legais da LGPD (Art. 7):
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>
                  <strong>Consentimento (Art. 7, I):</strong> para envio de
                  comunicacoes de marketing e uso de cookies nao essenciais
                </li>
                <li>
                  <strong>Execucao de contrato (Art. 7, V):</strong> para
                  prestacao dos servicos contratados
                </li>
                <li>
                  <strong>Interesse legitimo (Art. 7, IX):</strong> para
                  melhoria dos servicos e seguranca da plataforma
                </li>
                <li>
                  <strong>Cumprimento de obrigacao legal (Art. 7, II):</strong>{' '}
                  para atender exigencias legais e regulatorias
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                5. Compartilhamento de Dados
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Seus dados podem ser compartilhados com:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>
                  <strong>Empresas recrutadoras:</strong> quando voce se
                  candidata a uma vaga, seu perfil e compartilhado com a empresa
                  anunciante
                </li>
                <li>
                  <strong>Prestadores de servicos:</strong> empresas que nos
                  auxiliam na operacao (hospedagem, processamento de pagamentos,
                  analytics)
                </li>
                <li>
                  <strong>Autoridades:</strong> quando exigido por lei ou ordem
                  judicial
                </li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                <strong>
                  Nao vendemos seus dados pessoais para terceiros.
                </strong>
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                6. Seus Direitos (LGPD Art. 18)
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Como titular dos dados, voce tem direito a:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>
                  <strong>Confirmacao:</strong> saber se tratamos seus dados
                </li>
                <li>
                  <strong>Acesso:</strong> obter copia dos seus dados pessoais
                </li>
                <li>
                  <strong>Correcao:</strong> atualizar dados incompletos ou
                  incorretos
                </li>
                <li>
                  <strong>Anonimizacao ou bloqueio:</strong> de dados
                  desnecessarios
                </li>
                <li>
                  <strong>Portabilidade:</strong> transferir seus dados para
                  outro servico
                </li>
                <li>
                  <strong>Eliminacao:</strong> solicitar exclusao dos dados
                  tratados com base em consentimento
                </li>
                <li>
                  <strong>Revogacao:</strong> retirar o consentimento a qualquer
                  momento
                </li>
                <li>
                  <strong>Informacao:</strong> saber com quem compartilhamos seus
                  dados
                </li>
                <li>
                  <strong>Oposicao:</strong> se opor a tratamento baseado em
                  outras bases legais
                </li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Para exercer seus direitos, entre em contato pelo email{' '}
                <a
                  href="mailto:privacidade@rheply.com"
                  className="text-primary hover:underline"
                >
                  privacidade@rheply.com
                </a>{' '}
                ou pelo DPO em{' '}
                <a
                  href="mailto:dpo@rheply.com"
                  className="text-primary hover:underline"
                >
                  dpo@rheply.com
                </a>
                .
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                7. Retencao de Dados
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Mantemos seus dados pelo tempo necessario para:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>
                  Prestar os servicos contratados (enquanto sua conta estiver
                  ativa)
                </li>
                <li>
                  Cumprir obrigacoes legais (prazos prescricionais e
                  regulatorios)
                </li>
                <li>
                  Exercer direitos em processos judiciais ou administrativos
                </li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Apos o termino da relacao, os dados sao anonimizados ou
                excluidos, salvo obrigacao legal de retencao.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                8. Seguranca dos Dados
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Implementamos medidas tecnicas e organizacionais para proteger
                seus dados:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Criptografia de dados em transito (HTTPS/TLS)</li>
                <li>Criptografia de dados em repouso</li>
                <li>Controle de acesso baseado em funcoes</li>
                <li>Monitoramento continuo de seguranca</li>
                <li>Backups regulares</li>
                <li>Politicas internas de seguranca da informacao</li>
                <li>
                  Treinamento de funcionarios em protecao de dados
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                9. Cookies e Tecnologias de Rastreamento
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Utilizamos cookies para:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>
                  <strong>Cookies essenciais:</strong> necessarios para o
                  funcionamento da plataforma (autenticacao, seguranca)
                </li>
                <li>
                  <strong>Cookies de preferencia:</strong> lembrar suas
                  configuracoes e preferencias
                </li>
                <li>
                  <strong>Cookies analiticos:</strong> entender como voce usa a
                  plataforma para melhorar nossos servicos
                </li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Voce pode gerenciar suas preferencias de cookies atraves do
                banner de consentimento ou das configuracoes do seu navegador.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                10. Inteligencia Artificial e Decisoes Automatizadas
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Utilizamos IA para:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>
                  Parsing automatico de curriculos (extracao de informacoes)
                </li>
                <li>Sugestao de vagas baseada no seu perfil</li>
                <li>
                  Ranqueamento de candidatos (para empresas recrutadoras)
                </li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Conforme Art. 20 da LGPD, voce tem direito a solicitar revisao
                de decisoes tomadas unicamente com base em tratamento
                automatizado. Nossas ferramentas de IA sao utilizadas como apoio,
                e decisoes finais de contratacao sao sempre tomadas por humanos.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                11. Transferencia Internacional de Dados
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Alguns dos nossos prestadores de servicos podem estar localizados
                fora do Brasil. Quando isso ocorre, garantimos que a
                transferencia seja realizada de acordo com o Capitulo V da LGPD,
                utilizando clausulas contratuais padrao ou outros mecanismos
                legais apropriados.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                12. Menores de Idade
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Nossa plataforma e destinada a maiores de 18 anos. Nao coletamos
                intencionalmente dados de menores de idade. Se tomarmos
                conhecimento de que coletamos dados de um menor, tomaremos
                medidas para excluir essas informacoes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                13. Alteracoes na Politica
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Esta Politica pode ser atualizada periodicamente. Notificaremos
                sobre alteracoes significativas por email ou atraves de aviso
                destacado na plataforma. Recomendamos revisar esta pagina
                regularmente.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                14. Contato e Reclamacoes
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Para questoes sobre privacidade e protecao de dados:
              </p>
              <div className="text-muted-foreground space-y-2 mb-4">
                <p>
                  <strong>Email de Privacidade:</strong>{' '}
                  <a
                    href="mailto:privacidade@rheply.com"
                    className="text-primary hover:underline"
                  >
                    privacidade@rheply.com
                  </a>
                </p>
                <p>
                  <strong>Encarregado (DPO):</strong>{' '}
                  <a
                    href="mailto:dpo@rheply.com"
                    className="text-primary hover:underline"
                  >
                    dpo@rheply.com
                  </a>
                </p>
                <p>
                  <strong>Telefone:</strong> (11) 4002-8922
                </p>
                <p>
                  <strong>Endereco:</strong> Av. Paulista, 1234 - Sao Paulo, SP
                </p>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Voce tambem tem o direito de peticionar perante a Autoridade
                Nacional de Protecao de Dados (ANPD) caso entenda que seus
                direitos foram violados.
              </p>
            </section>

            <section className="bg-muted/50 p-6 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Esta Politica de Privacidade foi elaborada em conformidade com a
                Lei Geral de Protecao de Dados (Lei n 13.709/2018) e demais
                legislacoes aplicaveis. Ao utilizar nossa plataforma, voce
                declara estar ciente e de acordo com as praticas aqui descritas.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
