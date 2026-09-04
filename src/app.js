require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('./models');
const { User, Situation, Category, Product, ProductImage } = require('./models');

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'artisan_store_secret_key';

const toSafeUser = (user) => {
  if (!user) return null;
  const plainUser = user.toJSON ? user.toJSON() : user;
  const { passwordHash, ...safeUser } = plainUser;
  return safeUser;
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ message: 'Token de autenticação obrigatório.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido ou expirado.' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Acesso permitido apenas para administradores.' });
  }

  return next();
};

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

app.get('/api/users', authenticateToken, async (req, res) => {
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

app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['passwordHash'] },
      include: [{ model: Situation, as: 'situation' }],
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    return res.json({ user: toSafeUser(user) });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao buscar perfil', error: error.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nome, email e senha são obrigatórios.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    if (password.length < 6) {
      return res.status(400).json({ message: 'A senha deve ter pelo menos 6 caracteres.' });
    }

    const userExists = await User.findOne({ where: { email: normalizedEmail } });
    if (userExists) {
      return res.status(409).json({ message: 'Já existe um usuário com esse email.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const createdUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: 'customer',
      situationId: 1,
    });

    return res.status(201).json({
      message: 'Usuário criado com sucesso.',
      user: toSafeUser(createdUser),
    });
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

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ where: { email: normalizedEmail } });

    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.json({
      message: 'Login realizado com sucesso.',
      token,
      user: toSafeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao realizar login', error: error.message });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const { categoryId, situationId, search, featured, page = 1, limit = 10 } = req.query;
    const parsedPage = Number(page);
    const parsedLimit = Number(limit);

    if (!Number.isInteger(parsedPage) || parsedPage < 1 || !Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
      return res.status(400).json({ message: 'Página deve ser um inteiro positivo e limite deve estar entre 1 e 100.' });
    }

    const offset = (parsedPage - 1) * parsedLimit;

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
      limit: parsedLimit,
      offset,
      order: [['id', 'ASC']],
    });

    return res.json({
      data: rows,
      total: count,
      page: parsedPage,
      limit: parsedLimit,
      pages: Math.ceil(count / parsedLimit),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao buscar produtos', error: error.message });
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

app.post('/api/products', authenticateToken, requireAdmin, async (req, res) => {
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

app.put('/api/products/:id', authenticateToken, requireAdmin, async (req, res) => {
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

app.delete('/api/products/:id', authenticateToken, requireAdmin, async (req, res) => {
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
