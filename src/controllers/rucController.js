const express = require('express');
const Ruc = require('../models/Ruc');
const RucService = require('../services/RucService');

const router = express.Router();

// GET /api/ruc/consultar/:ruc
router.get('/consultar/:ruc', async (req, res) => {
  try {
    const { ruc } = req.params;
    console.log('ruc::: ', ruc);
    const { json } = req.query;
    console.log('json::: ', json);
    
    const inJSON = json === 'true';
    console.log('inJSON::: ', inJSON);
    const response = await Ruc.findByDni(ruc);
    console.log('responsefind::: ', response);
    
    if(response) {
      // SOLO UNA respuesta
      return res.json(response);
    } else {
      const resultado = await RucService.search(ruc, inJSON);
      console.log('resultado::: ', resultado);
      
      if(resultado.result && resultado.success === true) {
        const customerData = {
          ruc: resultado.result.ruc,
          nombre: resultado.result.nombre_comercial || resultado.result.nombre,
          domicilio: resultado.result.domicilio,
          condicion: resultado.result.departamento,
          estado: 1,
        };
        console.log('newBody::: ', customerData);
        const response = await Ruc.create(customerData);
        console.log('responseqq::: ', response);
      }
      
      // SOLO UNA respuesta
      return res.json(resultado);
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// POST /api/ruc/consultar
router.post('/consultar', async (req, res) => {
  try {
    const { ruc, json } = req.body;
    
    if (!ruc) {
      return res.status(400).json({
        success: false,
        message: 'El parámetro RUC es requerido'
      });
    }
    
    const inJSON = json === true;
    const resultado = await RucService.search(ruc, inJSON);
    
    // SOLO UNA respuesta - res.json() ya establece el Content-Type automáticamente
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