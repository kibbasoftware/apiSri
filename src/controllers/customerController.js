const express = require('express');
const CustomerService = require('../services/CustomerService');
const router = express.Router();

// GET /api/customers/search/:dni - Consultar cliente por DNI
router.get('/search/:dni', async (req, res) => {
  try {
    const { dni } = req.params;
    console.log('dni::: ', dni);
    const resultado = await CustomerService.searchByDni(dni);
    console.log('resultado:qq:: ', resultado);
    
    // ✅ SOLO UNA respuesta - eliminar las demás
    return res.json(resultado);
    
  } catch (error) {
    console.log('error::: ', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// POST /api/customers/create - Insertar nuevo cliente
router.post('/create', async (req, res) => {
  try {
    const customerData = req.body; // ❌ QUITAR los ... (spread operator)
    
    if (!customerData.dni) {
      return res.status(400).json({
        success: false,
        message: 'El campo DNI es requerido'
      });
    }

    const resultado = await CustomerService.createCustomer(customerData);
    
    // ✅ SOLO UNA respuesta
    return res.json(resultado);
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// PUT /api/customers/update/:dni - Actualizar cliente
router.put('/update/:dni', async (req, res) => {
  try {
    const { dni } = req.params;
    const customerData = req.body; // ❌ QUITAR los ... (spread operator)
    const resultado = await CustomerService.updateCustomer(dni, customerData);
    
    // ✅ SOLO UNA respuesta
    return res.json(resultado);
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// GET /api/customers/list - Listar clientes
router.get('/list', async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;
    const resultado = await CustomerService.listCustomers(
      parseInt(limit), 
      parseInt(offset)
    );
    
    // ✅ SOLO UNA respuesta
    return res.json(resultado);
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// DELETE /api/customers/delete/:dni - Eliminar cliente
router.delete('/delete/:dni', async (req, res) => {
  try {
    const { dni } = req.params;
    const resultado = await CustomerService.deleteCustomer(dni);
    
    // ✅ SOLO UNA respuesta
    return res.json(resultado);
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

module.exports = router;