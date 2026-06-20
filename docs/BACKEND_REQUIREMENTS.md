# Requisitos de back-end para a experiência Saldos/Totais/Adicionar/Menu

Este documento descreve o que falta no back-end para que a experiência replicada
no front (telas **Saldos**, **Totais**, **Adicionar**, **Horizonte de saldos** e
**Menu**) deixe de depender de heurísticas client-side e passe a refletir dados
reais e consistentes.

Hoje o front infere tudo a partir de dois campos: `EntryType` (Crédito/Débito) e
um `Category` plano de 7 valores (`None, Restaurant, Grocery, Entertainment,
Utilities, Transportation, Salary`). Isso é insuficiente para o produto-alvo.
Abaixo estão as mudanças necessárias, em ordem de prioridade.

---

## 1. `EntryKind` — taxonomia real de 5 tipos

**Problema atual:** o front deriva um "tipo de lançamento" (`entrada`, `saida`,
`diario`, `economia`, `cartao`) a partir de `EntryType` + `Category`, via
heurística em `src/utils/entryKind.ts`. Isso é uma aproximação: `Economia` e
`Cartão` **nunca são reportados**, porque não existe categoria que os
represente, e a distinção entre `saida` (gasto fixo) e `diario` (gasto
variável) é um chute baseado na categoria, não uma escolha do usuário.

**Necessário:**
- Adicionar um campo `kind` (enum) à entidade `Entry`, com os valores:
  `Entrada | Saida | Diario | Economia | Cartao`.
- Esse campo deve ser definido pelo usuário no momento da criação do
  lançamento (é exatamente o que os 5 atalhos do bottom sheet "Adicionar"
  representam) — não deve ser inferido a partir da categoria.
- Manter `Category` como um campo complementar/opcional (para relatórios mais
  detalhados), mas `kind` passa a ser o campo que dirige as telas Totais e
  Saldos.
- Migração: lançamentos antigos sem `kind` podem ser preenchidos com a mesma
  heurística atual (Credit→Entrada, Debit+Utilities/Transportation→Saida,
  Debit+Restaurant/Grocery/Entertainment→Diario) como valor default, mas isso
  deve ser uma migração única, não uma regra permanente.

---

## 2. Endpoint agregado de lançamentos (todas as carteiras)

**Problema atual:** não existe endpoint que retorne lançamentos de todas as
carteiras do usuário de uma vez. O front (`useAllEntries`) contorna isso
disparando uma chamada `GET /entries?walletId=X` por carteira e concatenando
os resultados no cliente — O(n) chamadas, sem paginação, sem garantia de
consistência entre elas.

**Necessário:**
- `GET /entries?month=&year=` (sem `walletId`) retornando todos os lançamentos
  do usuário autenticado no período, já com `walletId` em cada item.
- Suporte a paginação ou, no mínimo, um limite documentado por período.

---

## 3. Saldo diário (ledger) por carteira/mês

**Problema atual:** a tela **Saldos** precisa do saldo "rodado" dia a dia do
mês. O front reconstrói isso no cliente a partir do saldo atual da carteira
(`GET /wallets`) subtraindo o resultado do mês corrente, e depois somando o
delta de cada dia — ou seja, assume que **nenhuma transação fora do período
filtrado afeta o saldo atual**, o que é frágil (edição/exclusão de lançamentos
passados quebra a conta).

**Necessário:**
- Endpoint que retorne o saldo real ao final de cada dia do mês, calculado no
  servidor a partir do histórico de transações:
  `GET /wallets/{id}/balances?month=&year=` →
  `[{ day: 1, balance: 1280.00 }, { day: 2, balance: 1280.00 }, ...]`.
- Idealmente, uma variante agregada para "todas as carteiras":
  `GET /balances?month=&year=`.
- Isso elimina a necessidade do front em inferir baseline via
  `saldoAtual - resultadoDoMes`.

---

## 4. Projeção / horizonte de saldos (multi-mês)

**Problema atual:** o diálogo **Horizonte de saldos** projeta os próximos 3
meses usando uma média linear simples (`médiaDiária × diasRestantes`),
calculada inteiramente no front a partir do mês atual. Isso ignora qualquer
sazonalidade, lançamentos recorrentes já agendados (salário, contas fixas) ou
tendência histórica.

**Necessário, em ordem de valor:**
- Curto prazo: um endpoint que retorne a média diária de resultado dos
  últimos N meses (ex.: `GET /wallets/{id}/daily-average?months=3`), para que
  a projeção pelo menos use uma base histórica real em vez de só o mês atual.
- Médio prazo: o back-end já conhecer lançamentos recorrentes futuros (ver
  item 5) permite somar esses valores conhecidos à projeção em vez de tratar
  tudo como média.
- Longo prazo: endpoint dedicado `GET /wallets/{id}/forecast?months=3` que
  devolva a série diária projetada, deixando a lógica de projeção no
  back-end (mais fácil de evoluir o modelo sem precisar mudar o front).

---

## 5. Lançamentos recorrentes/agendados

**Problema atual:** já existe `Salary` (receita recorrente com `dayOfMonth`),
mas não há equivalente para despesas fixas recorrentes (aluguel, assinaturas,
etc.) nem para "Cartão" (fatura recorrente). Isso limita tanto o card
**Custo de vida** (que deveria diferenciar fixo de variável) quanto a precisão
da projeção do item 4.

**Necessário:**
- Generalizar o conceito de `Salary` para um modelo de **lançamento recorrente**
  com `kind`, `value`, `dayOfMonth`, `active`, aplicável a receitas e despesas.
- O job que hoje materializa `Salary` em `Entry` no dia configurado deve
  passar a cobrir despesas recorrentes também.

---

## 6. Rastreio de Economia e Cartão

**Problema atual:** não existe nenhuma representação de "valor guardado" nem
de "fatura de cartão" no modelo de dados. Por isso essas duas categorias
**sempre mostram R$ 0,00** no front hoje — é uma lacuna assumida e comunicada
ao usuário (chip "Em breve" e card vazio), não um bug.

**Necessário:**
- Definir se "Economia" é uma carteira/conta separada (transferência interna)
  ou um `kind` de lançamento dentro da carteira corrente — isso afeta se ela
  deve ou não entrar na soma de `Performance`.
- Para "Cartão": modelar fatura de cartão de crédito como uma entidade própria
  (com data de fechamento/vencimento) ou, no mínimo, como lançamentos com
  `kind = Cartao` que sejam somados num total de "fatura do mês".

---

## 7. Edição de perfil

**Problema atual:** o item "Editar perfil" no Menu está desabilitado porque
não existe endpoint de atualização de dados do usuário (`name`, `email`,
senha) — só existem `POST /auth/login`, `POST /auth/register` e o callback
OAuth.

**Necessário:**
- `PUT /users/me` (nome, email) e um fluxo separado de troca de senha.

---

## 8. Previsão de diário / orçamento

**Problema atual:** o item "Previsão de diário" no Menu está desabilitado.
A ideia é mostrar quanto o usuário pode gastar por dia até o fim do mês sem
comprometer o orçamento — hoje o front só sabe calcular a **média já
realizada** (`Diário médio` no card de Totais), não uma **previsão/orçamento**
configurável.

**Necessário:**
- Permitir que o usuário defina um orçamento mensal para "Diário"
  (`PUT /wallets/{id}/budget` ou similar).
- Endpoint que, dado o orçamento e o gasto já realizado no mês, devolva o
  valor diário recomendado para os dias restantes:
  `GET /wallets/{id}/daily-forecast?month=&year=`.
- Já existe um modelo parecido para casas compartilhadas (`BudgetAlert` em
  `homes`) — vale avaliar se a mesma lógica de alerta de orçamento pode ser
  generalizada para carteiras individuais em vez de criar um sistema paralelo.

---

## Resumo de prioridade sugerida

| # | Item | Bloqueia hoje |
|---|------|----------------|
| 1 | `EntryKind` real | Totais, Saldos, Adicionar — toda a categorização atual é heurística |
| 2 | Endpoint agregado de lançamentos | Performance (N chamadas ao invés de 1) |
| 3 | Saldo diário por dia (ledger) | Saldos — baseline calculado no cliente é frágil |
| 6 | Economia / Cartão | Totais — esses dois cards sempre mostram R$ 0,00 |
| 4 | Projeção multi-mês | Horizonte de saldos — projeção é só média linear do mês atual |
| 5 | Recorrência de despesas | Custo de vida, Horizonte |
| 7 | Editar perfil | Menu — feature desabilitada |
| 8 | Previsão de diário | Menu — feature desabilitada |

Os itens 1, 2 e 3 são os que mais imediatamente destravam a fidelidade da
experiência já implementada no front; os demais habilitam funcionalidades que
hoje estão explicitamente marcadas como "Em breve" na UI.
