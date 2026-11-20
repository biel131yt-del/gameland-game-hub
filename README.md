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

## Painel da loja

O acesso fica em `/admin`. O dono cadastra funcionários e define senhas temporárias. Cada conta troca a senha ao entrar pela primeira vez.

Aplique `db/admin-schema.sql` após o schema inicial. Em produção, configure `ADMIN_DATABASE_URL` como segredo separado da conexão da vitrine. Use um papel de aplicação dedicado com acesso às tabelas de administração e às funções da migração. O papel da vitrine precisa executar apenas a função de registro de pedidos e consultar o catálogo e as fotos.

Pedidos preparados na vitrine entram como pendentes. Concluir uma venda baixa o estoque. Cancelar ou reabrir uma venda concluída devolve as unidades. O WhatsApp continua sendo o canal para confirmar pagamento e entrega.
