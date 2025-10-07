const express = require('express');
const cors = require('cors');
require('dotenv').config();

const customerController = require('./src/controllers/customerController'); 
const rucController = require('./src/controllers/rucController');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares con límites aumentados
app.use(cors());
app.use(express.json({ 
  limit: '50mb', // Aumentar límite de JSON a 50MB
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      res.status(400).json({
        success: false,
        message: 'JSON malformado'
      });
    }
  }
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: '50mb', // Aumentar límite de URL encoded a 50MB
  parameterLimit: 100000 // Aumentar número máximo de parámetros
}));

// Rutas
app.use('/api/customers', customerController)
app.use('/api/ruc', rucController);

// Ruta de salud
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'API funcionando correctamente',
    services: ['customers', 'ruc']
  });
});

// Middleware específico para manejar errores de payload grande
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({
      success: false,
      message: 'JSON malformado'
    });
  }
  if (error.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: 'Payload demasiado grande. Límite: 50MB'
    });
  }
  next(error);
});

// Manejo de errores general
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📊 Endpoints disponibles:`);
  console.log(`   GET  /api/ruc/consultar/:ruc`);
  console.log(`   POST /api/ruc/consultar`);
  console.log(`   GET  /api/customers/search/:dni`); // NUEVO
  console.log(`   POST /api/customers/create`); // NUEVO
  console.log(`   PUT  /api/customers/update/:dni`); // NUEVO
  console.log(`   GET  /api/customers/list`); // NUEVO
  console.log(`   DELETE /api/customers/delete/:dni`); // NUEVO
  console.log(`   GET  /health`);
});