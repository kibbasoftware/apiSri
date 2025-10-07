function errorHandler(err, req, res, next) {
  console.error('Error no manejado:', err);

  // Error de payload demasiado grande
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: 'Payload demasiado grande. Límite: 50MB'
    });
  }

  // Error de JSON malformado
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'JSON malformado'
    });
  }

  // Error de validación
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: err.errors
    });
  }

  // Error de timeout
  if (err.code === 'ECONNABORTED') {
    return res.status(408).json({
      success: false,
      message: 'Timeout en la consulta'
    });
  }

  // Error genérico del servidor
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    // Solo mostrar detalles del error en desarrollo
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
}

module.exports = errorHandler;