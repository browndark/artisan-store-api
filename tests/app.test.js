const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const app = require('../src/app');
const { User } = require('../src/models');

const uniqueEmail = () => `user.${Date.now()}@artisanstore.com`;

test('GET /api/health deve responder com status 200', async () => {
  const response = await request(app).get('/api/health');
  assert.equal(response.status, 200);
  assert.equal(response.body.status, 'ok');
});

test('POST /api/auth/register deve criar usuário com senha hash e sem expor senha', async () => {
  const email = uniqueEmail();
  const response = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Maria Teste',
      email,
      password: 'Senha@123',
      role: 'admin',
    });

  const userInDb = await User.findOne({ where: { email } });

  assert.equal(response.status, 201);
  assert.equal(response.body.user.email, email);
  assert.equal(response.body.user.passwordHash, undefined);
  assert.ok(userInDb);
  assert.notEqual(userInDb.passwordHash, 'Senha@123');
  assert.notEqual(userInDb.passwordHash, undefined);
});

test('POST /api/auth/login deve retornar token JWT válido', async () => {
  const email = uniqueEmail();
  await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Joao Teste',
      email,
      password: 'Senha@123',
      role: 'customer',
    });

  const response = await request(app)
    .post('/api/auth/login')
    .send({
      email,
      password: 'Senha@123',
    });

  assert.equal(response.status, 200);
  assert.ok(response.body.token);
  assert.ok(response.body.token.startsWith('eyJ'));
  assert.equal(response.body.user.email, email);
});

test('POST /api/auth/register deve ignorar tentativa de criar usuário admin', async () => {
  const email = uniqueEmail();
  const response = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Cliente Seguro', email, password: 'Senha@123', role: 'admin' });

  assert.equal(response.status, 201);
  assert.equal(response.body.user.role, 'customer');
});

test('POST /api/products deve bloquear clientes', async () => {
  const email = uniqueEmail();
  await request(app)
    .post('/api/auth/register')
    .send({ name: 'Cliente', email, password: 'Senha@123' });

  const login = await request(app)
    .post('/api/auth/login')
    .send({ email, password: 'Senha@123' });

  const response = await request(app)
    .post('/api/products')
    .set('Authorization', `Bearer ${login.body.token}`)
    .send({ name: 'Produto não autorizado', price: 10, categoryId: 1 });

  assert.equal(response.status, 403);
});

test('GET /api/products deve rejeitar paginação inválida', async () => {
  const response = await request(app).get('/api/products?page=0&limit=101');

  assert.equal(response.status, 400);
});

