# GameLandia

Vitrine de consoles, jogos, controles e itens retrô com carrinho e finalização pelo WhatsApp.

## Desenvolvimento

Use Node.js 24 e execute `npm ci`, `npm run dev` e `npm test`.
Sem `DATABASE_URL`, o servidor de desenvolvimento mostra um catálogo de exemplo.

## Publicação

Aplique `db/neon-schema.sql` em um banco Neon novo para criar as tabelas e carregar o catálogo inicial.
Configure `DATABASE_URL` no ambiente do servidor. A vitrine precisa apenas de acesso de leitura aos produtos.
Use o preset TanStack Start na Vercel e `npm run build` para compilar.
Para Sites, compile com `npm run build:sites` e configure a mesma variável como segredo de runtime.

Edite os contatos da loja em `src/lib/store-config.ts`. Pedidos são encaminhados pelo WhatsApp.
