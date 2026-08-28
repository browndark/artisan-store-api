# Documentação da API Artisan Store

## 1. Visão geral

A Artisan Store API é uma API REST desenvolvida para gerenciar uma loja de produtos artesanais. O sistema permite cadastrar usuários, autenticar acessos, controlar categorias, situações e produtos, além de manter a gestão de estoque com filtros e paginação.

O objetivo principal da API é simular uma loja online com funcionalidade de gerenciamento de catálogo e acesso administrativo.

## 2. Tecnologias utilizadas

- Node.js
- Express.js
- Sequelize
- SQLite
- JWT (JSON Web Token)
- bcryptjs
- dotenv

## 3. Estrutura do projeto

```text
artisan-store-api/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── models/
│   │   └── index.js
│   ├── app.js
│   └── server.js
├── tests/
│   └── app.test.js
├── .env.example
├── .gitignore
├── package.json
├── README.md
├── DOCUMENTACAO_API.md
└── database/
    └── artisan_store.db
```

## 4. Principais entidades

### 4.1 Usuários
Representam os clientes e administradores do sistema.

Campos:
- id
- name
- email
- passwordHash
- role
- situationId
- createdAt
- updatedAt

### 4.2 Categorias
Representam os tipos de produtos vendidos na loja.

Exemplos:
- Casa
- Beleza
- Jardim
- Presentes

### 4.3 Situações
Definem o estado do produto ou usuário.

Exemplos:
- Ativo
- Em destaque
- Sem estoque
- Inativo

### 4.4 Produtos
São os itens comercializados.

Campos:
- id
- name
- description
- price
- stock
- featured
- categoryId
- situationId
- createdAt
- updatedAt

### 4.5 Imagens de produtos
Relaciona cada produto com uma ou mais imagens.

## 5. Autenticação

A API utiliza autenticação por JWT.

### Registro
Endpoint:
```http
POST /api/auth/register
```

Body esperado:
```json
{
  "name": "Maria Silva",
  "email": "maria@email.com",
  "password": "Senha@123",
  "role": "customer"
}
```

Resposta:
```json
{
  "message": "Usuário criado com sucesso.",
  "user": {
    "id": 1,
    "name": "Maria Silva",
    "email": "maria@email.com",
    "role": "customer",
    "situationId": 1,
    "createdAt": "2026-08-28T00:00:00.000Z",
    "updatedAt": "2026-08-28T00:00:00.000Z"
  }
}
```

### Login
Endpoint:
```http
POST /api/auth/login
```

Body esperado:
```json
{
  "email": "maria@email.com",
  "password": "Senha@123"
}
```

Resposta:
```json
{
  "message": "Login realizado com sucesso.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Maria Silva",
    "email": "maria@email.com",
    "role": "customer"
  }
}
```

### Uso do token
Para rotas protegidas, o cliente deve enviar o cabeçalho:

```http
Authorization: Bearer <token>
```

## 6. Endpoints disponíveis

### 6.1 Health check
```http
GET /api/health
```

Resposta:
```json
{
  "status": "ok",
  "message": "Artisan Store API está funcionando."
}
```

### 6.2 Listar categorias
```http
GET /api/categories
```

### 6.3 Listar situações
```http
GET /api/situations
```

### 6.4 Listar usuários
```http
GET /api/users
```
Requer autenticação.

### 6.5 Ver perfil do usuário autenticado
```http
GET /api/profile
```
Requer autenticação.

### 6.6 Listar produtos
```http
GET /api/products
```

Query params opcionais:
- categoryId
- situationId
- search
- featured
- page
- limit

Exemplo:
```http
GET /api/products?categoryId=1&featured=true&page=1&limit=10
```

Resposta:
```json
{
  "data": [
    {
      "id": 1,
      "name": "Vaso de Cerâmica Artesanal",
      "description": "Vaso de cerâmica em tons naturais, feito à mão.",
      "price": 89.9,
      "stock": 18,
      "featured": true,
      "categoryId": 1,
      "situationId": 1
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "pages": 1
}
```

### 6.7 Buscar produto por ID
```http
GET /api/products/:id
```

### 6.8 Criar produto
```http
POST /api/products
```
Requer autenticação.

Body:
```json
{
  "name": "Cesto de Palha",
  "description": "Cesto artesanal para decoração.",
  "price": 69.9,
  "stock": 12,
  "featured": true,
  "categoryId": 1,
  "situationId": 1
}
```

### 6.9 Atualizar produto
```http
PUT /api/products/:id
```
Requer autenticação.

### 6.10 Deletar produto
```http
DELETE /api/products/:id
```
Requer autenticação.

## 7. Regras de negócio implementadas

- Usuário deve fornecer nome, email e senha para cadastro;
- Email deve ser único;
- Senha é armazenada em hash, nunca em texto puro;
- Login verifica senha criptografada;
- Token JWT é gerado para autenticação;
- Apenas usuários autenticados podem criar, editar e excluir produtos;
- Produtos podem ser filtrados por categoria, situação, nome e destaque;
- A API retorna paginação para facilitar navegação.

## 8. Dados iniciais do sistema

A API já vem com dados iniciais de exemplo, como:
- situações: Ativo, Em destaque, Sem estoque, Inativo
- categorias: Casa, Beleza, Jardim, Presentes
- alguns produtos iniciais para testes
- usuário administrador padrão:
  - email: admin@artisanstore.com
  - senha: admin123

## 9. Como executar localmente

1. Instale as dependências:
```bash
npm install
```

2. Crie um arquivo .env a partir do exemplo:
```bash
cp .env.example .env
```

3. Inicie a API:
```bash
npm start
```

4. Acesse o endpoint de teste:
```bash
http://localhost:3000/api/health
```

## 10. Como testar a API

A API possui testes automatizados em:
```text
/tests/app.test.js
```

Para rodar:
```bash
npm test
```

## 11. Conclusão

A API Artisan Store foi desenvolvida para servir como uma base sólida para gestão de loja de produtos artesanais, com foco em organização, autenticação e CRUD funcional. Ela atende ao objetivo de demonstrar um backend REST completo, com boas práticas de segurança e estrutura de dados.
