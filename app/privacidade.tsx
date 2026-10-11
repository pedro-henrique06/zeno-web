import { Card, Screen, Txt } from '@/ui';
import { DocSection as Section, Item, Mail, P } from '@/components/DocPage';

/**
 * Public privacy policy. Lives outside the (auth)/(app) groups so it opens signed in or not, and on
 * the web build it is the URL given to the App Store (…/privacidade). Written in Portuguese, the
 * app's primary market language; keep it in sync with what the API actually stores.
 */
const UPDATED = '11 de outubro de 2026';

export default function PrivacyPolicyScreen() {
  return (
    <Screen title="Política de privacidade">
      <Txt muted>Última atualização: {UPDATED}</Txt>

      <Card style={{ marginTop: 16 }}>
        <Txt style={{ lineHeight: 24 }}>
          Resumo: o Zeno guarda os dados que você coloca nele para organizar suas finanças. Não vendemos seus dados, não
          mostramos anúncios e não usamos ferramentas de rastreamento ou análise de comportamento. Você pode excluir sua
          conta e todos os seus dados pelo próprio app, a qualquer momento.
        </Txt>
      </Card>

      <Section title="1. Quem é o responsável">
        <P>
          O Zeno é um aplicativo de finanças pessoais desenvolvido e mantido por Pedro Henrique Candido, responsável
          (controlador) pelo tratamento dos dados pessoais descritos aqui, nos termos da Lei Geral de Proteção de Dados
          (LGPD, Lei nº 13.709/2018). Contato: <Mail />.
        </P>
      </Section>

      <Section title="2. Dados que coletamos">
        <Item>Cadastro: nome, e-mail e senha. Opcionalmente, telefone, CPF ou CNPJ e data de nascimento, se você informar no perfil.</Item>
        <Item>Login com Google ou com a Apple: o identificador da sua conta nesses serviços, seu e-mail (na Apple, pode ser o e-mail oculto que ela cria) e seu nome.</Item>
        <Item>Dados financeiros que você registra: lançamentos (título, valor, tipo, data, descrição, recorrência), tags, previsão de gasto diário, metas e preferências como moeda e idioma.</Item>
        <Item>Casas compartilhadas: nome e descrição da casa, meta da casa e nome e e-mail dos membros que você convidar.</Item>
        <Item>Notificações: o identificador do seu aparelho para envio de notificações, o horário escolhido e o fuso horário, se você ativar o resumo diário.</Item>
        <Item>Integrações opcionais: chaves do widget e da captura automática de gastos (guardadas apenas como hash, sem como recuperar a chave original) e as regras de categoria que você criar. Na captura automática, recebemos o nome do estabelecimento e o valor de cada compra enviada pelo app Atalhos do seu iPhone e, se você configurar, o cartão e a categoria da compra.</Item>
        <Item>Dados técnicos: endereço IP e registros técnicos (logs) do servidor, usados para segurança, para limitar abusos e para corrigir erros.</Item>
      </Section>

      <Section title="3. Para que usamos">
        <Item>Criar e manter sua conta e permitir o login.</Item>
        <Item>Calcular saldos, totais, previsões e metas e mostrar seus lançamentos.</Item>
        <Item>Permitir o orçamento compartilhado nas casas que você criar ou participar.</Item>
        <Item>Enviar as notificações que você ativar.</Item>
        <Item>Manter o serviço seguro, prevenir abusos e corrigir falhas.</Item>
        <P>Não usamos seus dados para publicidade, não traçamos perfil de comportamento e não vendemos nem alugamos dados a terceiros.</P>
      </Section>

      <Section title="4. Bases legais">
        <P>
          Tratamos seus dados para executar o serviço que você contratou ao criar a conta (art. 7º, V, da LGPD), com o seu
          consentimento para notificações e integrações opcionais (art. 7º, I) e por legítimo interesse para segurança e
          prevenção de fraudes (art. 7º, IX). Você pode revogar o consentimento desativando o recurso no app.
        </P>
      </Section>

      <Section title="5. Com quem compartilhamos">
        <P>Só com os serviços necessários para o app funcionar, que tratam os dados em nosso nome:</P>
        <Item>Railway: hospedagem do servidor e do banco de dados.</Item>
        <Item>Expo, Apple (APNs) e Google (Firebase Cloud Messaging): entrega de notificações.</Item>
        <Item>Google e Apple: apenas se você escolher entrar com uma dessas contas.</Item>
        <P>
          Para converter moedas, consultamos cotações públicas no serviço Frankfurter, sem enviar nenhum dado pessoal. Nas
          casas compartilhadas, os outros membros veem seu nome e e-mail e os totais da casa, mas não veem sua renda, seu
          saldo nem seus lançamentos. Também podemos fornecer dados quando exigido por lei ou por ordem de autoridade
          competente.
        </P>
      </Section>

      <Section title="6. Onde e como guardamos">
        <P>
          Os dados ficam em servidores de nuvem que podem estar localizados fora do Brasil, com as salvaguardas previstas
          na LGPD para transferência internacional. A comunicação com o app é sempre criptografada (HTTPS). No banco de
          dados, seus dados pessoais e financeiros (como nome, e-mail, telefone, CPF, data de nascimento e os valores e
          títulos dos lançamentos) ficam criptografados, e a senha é guardada apenas como hash, sem possibilidade de ser lida.
        </P>
      </Section>

      <Section title="7. Por quanto tempo">
        <P>
          Guardamos seus dados enquanto sua conta existir. Pelo Menu do app você pode usar &quot;Zerar conta&quot;, que
          apaga seus dados financeiros e mantém a conta, ou &quot;Excluir conta&quot;, que apaga a conta e todos os dados
          ligados a ela, inclusive as casas que você criou. A exclusão é definitiva e não pode ser desfeita. Registros
          técnicos de segurança podem ser mantidos pelo prazo exigido em lei.
        </P>
      </Section>

      <Section title="8. Seus direitos">
        <P>
          Pela LGPD, você pode pedir a confirmação e o acesso aos seus dados, a correção, a anonimização ou eliminação, a
          portabilidade, informações sobre compartilhamento e a revogação do consentimento. Boa parte disso você faz
          direto no app (editar perfil, excluir conta). Para o resto, escreva para <Mail />. Você também pode reclamar à
          Autoridade Nacional de Proteção de Dados (ANPD).
        </P>
      </Section>

      <Section title="9. Menores de idade">
        <P>O Zeno não é direcionado a menores de 18 anos e não coleta dados de crianças de forma consciente.</P>
      </Section>

      <Section title="10. Mudanças nesta política">
        <P>
          Se esta política mudar, a data no topo será atualizada e, em mudanças relevantes, avisaremos pelo app.
        </P>
      </Section>

      <Section title="11. Contato">
        <P>
          Dúvidas ou pedidos sobre seus dados: <Mail />.
        </P>
      </Section>
    </Screen>
  );
}
