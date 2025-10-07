class Helpers {
  static validateCedula(cedula) {
    if (!cedula || typeof cedula !== 'string') {
      return false;
    }
    
    const cleanedCedula = cedula.trim();
    
    if (cleanedCedula.length !== 10) {
      return false;
    }
    
    if (!/^\d+$/.test(cleanedCedula)) {
      return false;
    }
    
    const provincia = parseInt(cleanedCedula.substring(0, 2));
    if (provincia < 1 || provincia > 24) {
      return false;
    }
    
    return true;
  }

  static validateRuc(ruc) {
    if (!ruc || typeof ruc !== 'string') {
      return false;
    }
    
    const cleanedRuc = ruc.trim();
    
    if (cleanedRuc.length !== 13) {
      return false;
    }
    
    if (!/^\d+$/.test(cleanedRuc)) {
      return false;
    }
    
    const provincia = parseInt(cleanedRuc.substring(0, 2));
    if (provincia < 1 || provincia > 24) {
      return false;
    }
    
    return true;
  }

  static formatResponse(success, data = null, message = '') {
    console.log(`📤 Formateando respuesta: ${success ? 'SUCCESS' : 'ERROR'} - ${message}`);
    return {
      success,
      result: success ? data : null,
      message: success ? (message || 'Consulta exitosa') : (message || 'Error en la consulta')
    };
  }

  static generateUniqueId() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}

module.exports = Helpers;