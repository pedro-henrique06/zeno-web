import { Linking } from 'react-native';
import { Link } from 'expo-router';
import { Button, Card, Screen, Txt, useAccent } from '@/ui';
import { CONTACT_EMAIL, DocSection as Section, Item, Mail, P } from '@/components/DocPage';

/**
 * Public support page: the "Support URL" App Store Connect asks for (…/suporte on the web build).
 * Outside the (auth)/(app) groups so it opens signed in or not. The answers point at real places in
 * the app; update them when a screen moves.
 */
export default function SupportScreen() {
  const accent = useAccent();
  return (
    <Screen title="Ajuda e suporte">
      <Card>
        <Txt variant="title">Fale com a gente</Txt>
        <Txt muted style={{ marginTop: 6, lineHeight: 22 }}>
          Dúvidas, problemas ou sugestões sobre o Zeno: escreva para <Mail subject="Suporte Zeno" />. Se for um erro,
          conte o que você fez antes dele e, se puder, mande um print da tela.
        </Txt>
        <Button
          sf="envelope.fill"
          icon="mail"
          title="Enviar e-mail"
          onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Suporte Zeno')}`)}
          style={{ marginTop: 14 }}
        />
      </Card>

      <Section title="Perguntas frequentes">
        <Txt variant="body" style={{ fontWeight: '600', marginBottom: 4 }}>Esqueci minha senha. E agora?</Txt>
        <P>
          Na tela de login, toque em Esqueci minha senha e digite o e-mail da conta. Você recebe um código de 6 números,
          que vale por 15 minutos, para criar uma nova senha. Se o e-mail não chegar, confira a caixa de spam. Se você
          entrou com o Google ou com a Apple, não há senha do Zeno: é só usar o mesmo botão de novo.
        </P>

        <Txt variant="body" style={{ fontWeight: '600', marginBottom: 4 }}>Como excluo minha conta?</Txt>
        <P>
          No app, abra Menu e toque em Excluir conta. Sua conta e todos os dados ligados a ela são apagados para sempre,
          inclusive as casas que você criou. Se você só quer recomeçar mantendo a conta, use Zerar conta, que apaga
          lançamentos, tags, previsão de diário e meta.
        </P>

        <Txt variant="body" style={{ fontWeight: '600', marginBottom: 4 }}>Não recebo as notificações</Txt>
        <P>
          Em Menu › Configurações, ative o Resumo diário e escolha o horário. Se mesmo assim não chegar nada, confira em
          Ajustes do iPhone › Notificações › Zeno se as notificações estão permitidas.
        </P>

        <Txt variant="body" style={{ fontWeight: '600', marginBottom: 4 }}>Como mudo a moeda ou o idioma?</Txt>
        <P>Em Menu › toque no seu nome (Editar perfil) e escolha a moeda e o idioma.</P>

        <Txt variant="body" style={{ fontWeight: '600', marginBottom: 4 }}>Como registro gastos do Apple Pay sozinho, ou ponho o saldo na tela inicial?</Txt>
        <P>
          Em Menu › Registrar gastos automaticamente há o passo a passo das duas coisas: a automação do app Atalhos, que
          lança cada compra feita com a Carteira, e o widget da tela inicial.
        </P>

        <Txt variant="body" style={{ fontWeight: '600', marginBottom: 4 }}>Como divido as contas da casa?</Txt>
        <P>
          Em Menu › Minhas casas, crie a casa e convide quem mora com você pelo e-mail da conta Zeno da pessoa. Os outros
          membros veem os totais da casa, nunca a sua renda, o seu saldo ou os seus lançamentos.
        </P>
      </Section>

      <Section title="Privacidade">
        <P>Como tratamos seus dados está na nossa política de privacidade.</P>
        <Link href="/privacidade" style={{ color: accent, fontWeight: '600', fontSize: 17 }}>
          Ler a política de privacidade
        </Link>
      </Section>

      <Section title="Sobre o app">
        <Item>Zeno: finanças pessoais, saldos e metas.</Item>
        <Item>Desenvolvido por Pedro Henrique Candido.</Item>
      </Section>
    </Screen>
  );
}
