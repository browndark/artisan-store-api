# Artisan Store API

API REST para uma loja de produtos artesanais, com usuários, situações, categorias e produtos.

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

## Exemplo de dados
A API já vem com situações, categorias e alguns produtos iniciais para testes.
