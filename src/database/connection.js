const { Pool } = require('pg');
const config = require('../../config/config');

class Database {
  constructor() {
    let poolConfig;
    
    if (config.database.connectionString) {
      poolConfig = {
        connectionString: config.database.connectionString,
        // Mantener otras configuraciones
        max: config.database.max,
        idleTimeoutMillis: config.database.idleTimeoutMillis,
        connectionTimeoutMillis: config.database.connectionTimeoutMillis
      };
    } else {
      poolConfig = config.database;
    }
    this.pool = new Pool(config.database);
    
    this.pool.on('connect', () => {
      console.log('✅ Conexión a PostgreSQL establecida');
    });

    this.pool.on('error', (err) => {
      console.error('❌ Error en la conexión a PostgreSQL:', err);
    });
  }

  async query(text, params) {
    const start = Date.now();
    try {
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;
      console.log(`📊 Query ejecutada en ${duration}ms:`, { text, params });
      return result;
    } catch (error) {
      console.error('❌ Error en query:', { text, params, error: error.message });
      throw error;
    }
  }

  async connect() {
    try {
      const client = await this.pool.connect();
      console.log('✅ Cliente de PostgreSQL conectado');
      return client;
    } catch (error) {
      console.error('❌ Error conectando cliente:', error);
      throw error;
    }
  }

  async close() {
    await this.pool.end();
    console.log('🔌 Conexión a PostgreSQL cerrada');
  }
}

module.exports = new Database();