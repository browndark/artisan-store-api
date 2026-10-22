# Artisan Store API

API REST para uma loja de produtos artesanais, com usuários, situações, categorias e produtos.

## Apresentação e avaliação

Materiais preparados para apresentação e avaliação do projeto:

- [Documentação completa (PDF)](docs/apresentacao/Documentacao.pdf)
- [Coleção de requisições do Postman (21 testes)](docs/apresentacao/Artisan-Store.postman_collection.json) — importe o arquivo no Postman para executar os testes da API.
- [Documentação da API (Markdown)](DOCUMENTACAO_API.md)

Para executar a coleção, inicie a API com `npm start` e mantenha o servidor ativo em `http://localhost:3000`.

## Tecnologias
- Node.js
- Express
- SQLite
- Sequelize

## Como executar

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Inicie a API:
   ```bash
   npm start
   ```
3. Acesse:
   ```bash
   http://localhost:3000/api/health
   ```

## Endpoints principais

- GET /api/health
- GET /api/products
- GET /api/products/:id
- POST /api/products
- PUT /api/products/:id
- DELETE /api/products/:id
- GET /api/categories
- GET /api/situations
- GET /api/users
- POST /api/auth/register
- POST /api/auth/login

## Regras de acesso

- O cadastro público sempre cria usuários com a função `customer`.
- `POST`, `PUT` e `DELETE` de produtos exigem um token JWT de um administrador.
- A listagem de produtos aceita `page` a partir de 1 e `limit` entre 1 e 100.

## Exemplo de dados
A API já vem com situações, categorias e alguns produtos iniciais para testes.
