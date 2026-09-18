require('dotenv').config();

const app = require('./app');
const { sequelize, seedDatabase } = require('./models');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {

    await sequelize.authenticate();

    console.log('✅ Banco conectado');

    await sequelize.sync({ alter: true });

    console.log('✅ Banco sincronizado');

    await seedDatabase();

    console.log('✅ Dados iniciais carregados');


    app.listen(PORT, () => {
      console.log(
        `🚀 Artisan Store API rodando em http://localhost:${PORT}`
      );
    });


  } catch (error) {

    console.error('❌ Erro ao iniciar servidor');
    console.error(error);

    process.exit(1);

  }
}


process.on('SIGINT', async () => {
  await sequelize.close();
  console.log('\n🔌 Banco desconectado');
  process.exit(0);
});


startServer();