# Zeno (Expo / React Native)

O front do Zeno: um único app em React Native com Expo (SDK 57) e Expo Router, que roda no iPhone/Android e também como site (`npx expo export --platform web`, servido pelo `Dockerfile`). O antigo site em React + MUI (PWA) foi aposentado.

## Rodar no iPhone (sem Mac)

1. Instale o Node.js 22+ no PC.
2. No terminal: `npm install && npx expo start`
3. No iPhone, instale o **Expo Go** (App Store) e leia o QR code do terminal. O app abre e atualiza ao vivo.

A URL da API vem de `app.json` (`extra.apiUrl`). Para apontar para outro servidor, crie `.env` com `EXPO_PUBLIC_API_URL=https://.../api`.

## Publicar / instalar com ícone próprio

```
npm i -g eas-cli
eas login
eas build -p ios --profile preview      # build na nuvem, instala no aparelho
eas build -p ios --profile production   # para a App Store
eas submit -p ios
```

Instalar no iPhone ou publicar na App Store exige uma conta Apple Developer (paga). O `bundleIdentifier` está em `app.json`.

## Estrutura

- `app/` rotas (Expo Router): `(auth)` login/cadastro, `(app)/(tabs)` Saldos, Totais, Lançamentos, Tags e Menu, e telas empilhadas (perfil, previsão de diário, configurações).
- `src/api`, `src/hooks`, `src/types`, `src/utils`, `src/i18n`: mesma camada de dados do app web (React Query + axios), com o token guardado no Keychain (`expo-secure-store`).
- `src/ui`: componentes base (texto, botão, campo, cartão, sheet). `src/theme`: tokens de marca, claro/escuro.

## Android

O mesmo código gera o app Android (pacote `app.zeno.mobile`).

```
eas build -p android --profile preview      # gera um APK para instalar direto no aparelho
eas build -p android --profile production   # gera o AAB para a Google Play
eas submit -p android                       # envia para a faixa interna da Google Play (rascunho)
```

- O `preview` baixa um `.apk` pelo link do EAS; no Android, abra o link e instale (permita "fontes desconhecidas" na primeira vez).
- Para publicar na Google Play é preciso uma conta de desenvolvedor Google Play (taxa única de US$ 25) e criar o app no Play Console com o mesmo pacote. O primeiro envio precisa ser feito pelo painel; os seguintes podem ir por `eas submit`. Para o `eas submit` funcionar, cadastre a chave de serviço do Google Play no EAS (`eas credentials`).
- **Notificações no Android** passam pelo FCM: crie um projeto no Firebase, registre o app Android com o mesmo pacote, e envie a credencial FCM V1 (chave de conta de serviço) ao EAS com `eas credentials`. No iPhone nada disso é necessário.
- O botão "Entrar com Apple" não aparece no Android. O login com Google volta pelo esquema `zeno://`, que funciona no app instalado.

## Funcionalidades

Login e cadastro (e-mail ou Google), Saldos, Totais (com horizontes anuais e meta), Lançamentos, Tags, Metas (simulador salvo na conta), Casas (moradores, lançamentos, orçamento 50/30/20 e meta da casa), previsão de diário, notificações push (resumo diário e teste), e a configuração do widget e da captura por Apple Pay (chaves, script do Scriptable e regras por tag).

## Notificações push

O servidor envia pelo serviço de push do Expo, então não precisa de credencial do Firebase. No app: Menu, Configurações, Notificações. Para o token funcionar, vincule o projeto uma vez com `eas init` (grava o `projectId` em `app.json`, em `extra.eas.projectId`). No Expo Go no iPhone dá para testar; no app instalado via EAS o iOS pede a permissão normalmente.

## Login com Google

O app abre o fluxo do servidor no navegador e volta pelo esquema `zeno://`. Esse retorno só funciona no app instalado (build do EAS); no Expo Go o esquema é outro, então teste o Google no build `preview`. Não é preciso mudar nada no Google Cloud (o redirecionamento continua sendo o do servidor).

## CI

`.github/workflows/mobile.yml` roda `tsc` e gera os bundles iOS e web a cada PR.

## Site (web)

O `Dockerfile` gera a versão web do mesmo app e a serve na porta `$PORT`. O login com Google no site volta por `/auth/callback`. `public/sw.js` desinstala o service worker do site antigo, para quem já o tinha instalado não ficar preso na versão velha.
