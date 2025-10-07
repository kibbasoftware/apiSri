const payloadHandler = (req, res, next) => {
  // Verificar el content-type
  const contentType = req.headers['content-type'];
  
  if (contentType && contentType.indexOf('application/json') !== -1) {
    // Para JSON, el límite ya está manejado por express.json()
    next();
  } else if (contentType && contentType.indexOf('application/x-www-form-urlencoded') !== -1) {
    // Para URL encoded
    next();
  } else if (contentType && contentType.indexOf('multipart/form-data') !== -1) {
    // Para form-data (si llegas a usar file uploads)
    next();
  } else {
    // Content-type no soportado
    res.status(415).json({
      success: false,
      message: 'Tipo de contenido no soportado'
    });
  }
};

module.exports = payloadHandler;