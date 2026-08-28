const express = require('express');
const cors = require('cors');
const { Op } = require('./models');
const { User, Situation, Category, Product, ProductImage } = require('./models');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Artisan Store API está funcionando.' });
});

app.get('/api/situations', async (req, res) => {
  try {
    const situations = await Situation.findAll({ order: [['id', 'ASC']] });
    res.json(situations);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar situações', error: error.message });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.findAll({ order: [['id', 'ASC']] });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar categorias', error: error.message });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['passwordHash'] },
      include: [{ model: Situation, as: 'situation' }],
      order: [['id', 'ASC']],
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar usuários', error: error.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role = 'customer' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nome, email e senha são obrigatórios.' });
    }

    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(409).json({ message: 'Já existe um usuário com esse email.' });
    }

    const createdUser = await User.create({
      name,
      email,
      passwordHash: password,
      role,
      situationId: 1,
    });

    const { passwordHash, ...safeUser } = createdUser.toJSON();
    return res.status(201).json({ message: 'Usuário criado com sucesso.', user: safeUser });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao registrar usuário', error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
    }

    const user = await User.findOne({ where: { email, passwordHash: password } });

    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const { passwordHash, ...safeUser } = user.toJSON();
    return res.json({
      message: 'Login realizado com sucesso.',
      token: 'demo-token-for-' + safeUser.email,
      user: safeUser,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao realizar login', error: error.message });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const { categoryId, situationId, search, featured, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const where = {};
    if (categoryId) where.categoryId = Number(categoryId);
    if (situationId) where.situationId = Number(situationId);
    if (featured !== undefined) where.featured = featured === 'true';
    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }

    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [
        { model: Category, as: 'category' },
        { model: Situation, as: 'situation' },
        { model: ProductImage, as: 'images' },
      ],
      limit: Number(limit),
      offset,
      order: [['id', 'ASC']],
    });

    res.json({
      data: rows,
      total: count,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(count / Number(limit)),
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar produtos', error: error.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        { model: Category, as: 'category' },
        { model: Situation, as: 'situation' },
        { model: ProductImage, as: 'images' },
      ],
    });

    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado.' });
    }

    return res.json(product);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao buscar produto', error: error.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { name, description, price, stock, featured, categoryId, situationId } = req.body;

    if (!name || !price || !categoryId) {
      return res.status(400).json({ message: 'Nome, preço e categoria são obrigatórios.' });
    }

    const product = await Product.create({
      name,
      description,
      price,
      stock: stock || 0,
      featured: Boolean(featured),
      categoryId,
      situationId: situationId || 1,
    });

    return res.status(201).json({ message: 'Produto cadastrado com sucesso.', product });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao criar produto', error: error.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado.' });
    }

    await product.update(req.body);
    return res.json({ message: 'Produto atualizado com sucesso.', product });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao atualizar produto', error: error.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado.' });
    }

    await product.destroy();
    return res.json({ message: 'Produto removido com sucesso.' });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao remover produto', error: error.message });
  }
});

app.use((req, res) => {
  res.status(404).json({ message: 'Rota não encontrada.' });
});

module.exports = app;
