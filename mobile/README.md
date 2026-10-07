# Zeno Mobile (Expo / React Native)

App nativo do Zeno, escrito em React Native com Expo (SDK 57) e Expo Router. Usa a mesma API do app web.

## Rodar no iPhone (sem Mac)

1. Instale o Node.js 20+ no PC.
2. No terminal: `cd mobile && npm install && npx expo start`
3. No iPhone, instale o **Expo Go** (App Store) e leia o QR code do terminal. O app abre e atualiza ao vivo.

A URL da API vem de `app.json` (`extra.apiUrl`). Para apontar para outro servidor, crie `mobile/.env` com `EXPO_PUBLIC_API_URL=https://.../api`.

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

## Ainda não portado do app web

Metas (simulador), Casas (orçamento 50/30/20), horizontes anuais dos Totais, widget e captura por Apple Pay (a captura continua pelo Atalhos do iOS, não depende do app), notificações push e login com Google.
