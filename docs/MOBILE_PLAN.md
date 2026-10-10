# Plano de execução: app nativo (Expo) e backend

Regra combinada: tudo é desenvolvido na branch `claude/frontend-backend-mongo-sync-olside` dos dois repositórios, em PRs de rascunho, e **o merge só acontece no final do plano**, com o CI verde, na ordem: backend (Zeno #41), depois o app (zeno-web #81).

## Fases

| # | Fase | Repo | Entrega | Verificação |
|---|------|------|---------|-------------|
| 0 | Base do app + e-mail criptografado | zeno-web, Zeno | Login, Saldos, Totais, Lançamentos, Tags, Menu; `User.Email` com índice cego | `tsc`, `expo export`, CI do backend (feito) |
| 1 | Push com Expo | Zeno | `ExpoPushNotificationSender` (sem Firebase), envio roteado pelo tipo do token; testes | CI do backend |
| 2 | Push no app | zeno-web | Pedir permissão, registrar o token em `/api/notifications/devices`, preferências (ligar/desligar, horário), botão "enviar teste" | `tsc`, `expo export` |
| 3 | Metas | zeno-web | Meta salva na conta (`/api/goals/me`), simulador, progresso nos Totais | `tsc`, `expo export` |
| 4 | Casas | zeno-web | Lista, lançamentos, moradores, orçamento 50/30/20, meta da casa | `tsc`, `expo export` |
| 5 | Totais completos | zeno-web | Horizontes anuais (saldos, desempenho, economizado, custo de vida, média diária) | `tsc`, `expo export` |
| 6 | Captura e widget | zeno-web | Chave de captura, regras por tag, chave e script do widget (Scriptable), com cópia para a área de transferência | `tsc`, `expo export` |
| 7 | Login com Google | Zeno, zeno-web | Redirecionamento do OAuth para o esquema `zeno://`, botão no app | CI do backend, `tsc` |
| 8 | Qualidade e entrega | zeno-web | CI do app (typecheck + export), README, revisão final do diff | CI verde |
| 9 | Merge | ambos | Merge do backend e depois do app, depois conferir o deploy | CI verde nos dois |

## Ordem e dependências
- 1 antes de 2 (o app precisa do remetente de push no servidor).
- 3 a 6 são independentes entre si; seguem a ordem de valor para o uso diário.
- 7 mexe no fluxo de login do servidor, por isso fica por último entre as funcionalidades.
- O app só passa a "valer" em produção depois do merge do backend (e-mail e push).

## Riscos e como tratamos
- **Sem iPhone/Mac nesta sessão**: cada fase é validada por tipos e pelo bundle; o teste em aparelho é feito por você com o Expo Go (passos no README).
- **Push no iOS** exige build com EAS e conta Apple Developer; no Expo Go funciona para teste.
- **Migração de criptografia** é ação sua em produção (backup, `dry-run`, `run`); está descrita no PR do backend.
- **Login com Google** exige configurar o esquema de retorno no Google Cloud; o código fica pronto e a configuração é sua.


## Fase 10: aposentadoria do site antigo
O site em React + MUI (`src/` antigo, Vite, PWA) foi removido. O app Expo passou para a raiz do repositório e o `Dockerfile` serve a versão web dele, para o endereço do site continuar funcionando.
