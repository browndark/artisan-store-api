const bcrypt = require('bcryptjs');
const { DataTypes, Op } = require('sequelize');
const sequelize = require('../config/database');

const Situation = sequelize.define('Situation', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(80), allowNull: false, unique: true },
  description: { type: DataTypes.STRING(255), allowNull: true },
});

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(120), allowNull: false },
  email: { type: DataTypes.STRING(120), allowNull: false, unique: true },
  passwordHash: { type: DataTypes.STRING(255), allowNull: false },
  role: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'customer' },
  situationId: { type: DataTypes.INTEGER, allowNull: true },
});

const Category = sequelize.define('Category', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(120), allowNull: false, unique: true },
  description: { type: DataTypes.STRING(255), allowNull: true },
});

const Product = sequelize.define('Product', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(150), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  featured: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  categoryId: { type: DataTypes.INTEGER, allowNull: false },
  situationId: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
});

const ProductImage = sequelize.define('ProductImage', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  url: { type: DataTypes.STRING(255), allowNull: false },
  productId: { type: DataTypes.INTEGER, allowNull: false },
});

User.belongsTo(Situation, { foreignKey: 'situationId', as: 'situation' });
Situation.hasMany(User, { foreignKey: 'situationId', as: 'users' });

Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

Situation.hasMany(Product, { foreignKey: 'situationId', as: 'products' });
Product.belongsTo(Situation, { foreignKey: 'situationId', as: 'situation' });

Product.hasMany(ProductImage, { foreignKey: 'productId', as: 'images' });
ProductImage.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

async function seedDatabase() {
  const situations = await Situation.findAll();
  if (situations.length === 0) {
    await Situation.bulkCreate([
      { name: 'Ativo', description: 'Produto disponível para venda' },
      { name: 'Em destaque', description: 'Produto visível na home' },
      { name: 'Sem estoque', description: 'Produto indisponível no momento' },
      { name: 'Inativo', description: 'Produto temporariamente indisponível' },
    ]);
  }

  const categories = await Category.findAll();
  if (categories.length === 0) {
    await Category.bulkCreate([
      { name: 'Casa', description: 'Itens de decoração e utilidade doméstica' },
      { name: 'Beleza', description: 'Produtos cosméticos e de autocuidado' },
      { name: 'Jardim', description: 'Produtos para ambiente externo' },
      { name: 'Presentes', description: 'Itens especiais para ocasiões' },
    ]);
  }

  const existingProducts = await Product.findAll();
  if (existingProducts.length === 0) {
    const defaultSituations = await Situation.findAll({ order: [['id', 'ASC']] });
    const defaultCategories = await Category.findAll({ order: [['id', 'ASC']] });

    const createdProducts = await Product.bulkCreate([
      {
        name: 'Vaso de Cerâmica Artesanal',
        description: 'Vaso de cerâmica em tons naturais, feito à mão.',
        price: 89.9,
        stock: 18,
        featured: true,
        categoryId: defaultCategories[0].id,
        situationId: defaultSituations[0].id,
      },
      {
        name: 'Sabonete de Alecrim',
        description: 'Sabonete natural com óleos vegetais e aroma suave.',
        price: 24.5,
        stock: 42,
        featured: false,
        categoryId: defaultCategories[1].id,
        situationId: defaultSituations[1].id,
      },
      {
        name: 'Kit de Plantas em Miniatura',
        description: 'Conjunto de plantas para decoração de mesa.',
        price: 56.0,
        stock: 11,
        featured: true,
        categoryId: defaultCategories[2].id,
        situationId: defaultSituations[0].id,
      },
    ]);

    await ProductImage.bulkCreate([
      { productId: createdProducts[0].id, url: 'https://images.unsplash.com/photo-...' },
      { productId: createdProducts[1].id, url: 'https://images.unsplash.com/photo-...' },
      { productId: createdProducts[2].id, url: 'https://images.unsplash.com/photo-...' },
    ]);
  }

  const users = await User.findAll();
  if (users.length === 0) {
    const activeSituation = await Situation.findOne({ where: { name: 'Ativo' } });
    const adminPasswordHash = await bcrypt.hash('admin123', 10);

    await User.create({
      name: 'Admin da Loja',
      email: 'admin@artisanstore.com',
      passwordHash: adminPasswordHash,
      role: 'admin',
      situationId: activeSituation?.id || 1,
    });
  }
}

module.exports = {
  sequelize,
  Op,
  Situation,
  User,
  Category,
  Product,
  ProductImage,
  seedDatabase,
};
