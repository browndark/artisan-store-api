const app = require('./app');
const { sequelize, seedDatabase } = require('./models');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`🚀 Artisan Store API rodando em http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

startServer();
