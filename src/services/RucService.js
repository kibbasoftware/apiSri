const HttpClient = require('../utils/HttpClient');
const Helpers = require('../utils/helpers');
const config = require('../../config/config');

class RucService {
  constructor() {
    this.httpClient = new HttpClient(config.ruc.baseUrl);
    this.config = config.ruc;
    this.errorLog = [];
    this.currentAuth = '';
    this.resultJson = '';
    this.state = false;
  }

  async search(ruc, inJSON = false) {
    try {
      ruc = ruc.trim();
      
      if (!Helpers.validateRuc(ruc)) {
        const response = Helpers.formatResponse(false, null, 'Número de RUC no válido.');
        return response; // ✅ SIEMPRE devolver objeto, no string
      }

      const consultaExitosa = await this.consultarRuc(ruc);
      
      if (consultaExitosa) {
        const result = this.formatWsData(JSON.parse(this.resultJson));
        const response = Helpers.formatResponse(true, result, 'Consulta exitosa');
        return response; // ✅ SIEMPRE devolver objeto, no string
      } else {
        const error = this.getErrorLog();
        const response = Helpers.formatResponse(false, null, error[0] || 'Error en la consulta');
        return response; // ✅ SIEMPRE devolver objeto, no string
      }

    } catch (error) {
      console.error('Error en RucService.search:', error);
      const response = Helpers.formatResponse(false, null, error.message);
      return response; // ✅ SIEMPRE devolver objeto, no string
    }
  }

  async rucExist(numRuc) {
    try {
      const url = `${this.config.endpoints.existeRuc}?numeroRuc=${numRuc}`;
      console.log('🔍 Verificando existencia RUC:', url);
      
      const response = await this.httpClient.get(url);
      console.log('✅ Respuesta existencia RUC:', response);
      
      return response === true;
    } catch (error) {
      console.error('❌ Error en rucExist:', error.message);
      return false;
    }
  }

  async getCaptcha(uq) {
    try {
      const url = `${this.config.endpoints.captchaStart}?r=${uq}`;
      console.log('🖼️ Obteniendo captcha:', url);
      
      // IMPORTANTE: Limpiar cookies al inicio de una nueva sesión
      this.httpClient.clearCookies();
      console.log('🧹 Cookies limpiadas para nueva sesión');
      
      const jsonCaptcha = await this.httpClient.get(url);
      console.log('📦 Respuesta captcha:', jsonCaptcha);
      console.log('🍪 Cookies después de captcha:', this.httpClient.getCookies());
      
      const arrCaptcha = jsonCaptcha;
      console.log('🔍 Datos captcha procesados:', arrCaptcha);
      
      if (arrCaptcha && Array.isArray(arrCaptcha.values) && arrCaptcha.values.length > 0) {
        const captchaValue = arrCaptcha.values[0];
        console.log('✅ Valor captcha obtenido:', captchaValue);
        return captchaValue;
      } else {
        this.errorLog.push("No se puede obtener captcha - estructura inválida");
        console.error('❌ Estructura captcha inválida:', arrCaptcha);
        return "";
      }
    } catch (error) {
      console.error('❌ Error al obtener captcha:', error.message);
      this.errorLog.push("Error al obtener captcha: " + error.message);
      return "";
    }
  }

  async captchaDecode() {
    try {
      const alfanumerico = Helpers.generateUniqueId();
      console.log('🔑 Generando ID único para captcha:', alfanumerico);
      
      const captchaValue = await this.getCaptcha(alfanumerico);
      console.log('🔓 Captcha obtenido:', captchaValue);
      return captchaValue;
    } catch (error) {
      console.error('❌ Error en captchaDecode:', error.message);
      return "";
    }
  }

  async unlockSecurity() {
    try {
      const lsCaptchaRes = await this.captchaDecode();
      console.log('🔓 Captcha decodificado:', lsCaptchaRes);
      
      if (lsCaptchaRes !== "") {
        const url = `${this.config.endpoints.validarCaptcha}/${lsCaptchaRes}?emitirToken=true`;
        console.log('🔐 Validando captcha con GET:', url);
        console.log('🍪 Cookies actuales para validación:', this.httpClient.getCookies());
        
        const jsonAutenticacion = await this.httpClient.get(url, {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        });
        console.log('📦 Respuesta validación captcha:', jsonAutenticacion);
        
        const arrAutenticacion = jsonAutenticacion;
        const autenticacion = arrAutenticacion.mensaje;
        
        console.log('🔑 Token de autenticación:', autenticacion);
        
        if (autenticacion) {
          this.currentAuth = autenticacion;
          console.log('✅ Autenticación exitosa');
          return true;
        } else {
          this.errorLog.push("Problemas obteniendo token - respuesta vacía");
          console.error('❌ Token vacío en respuesta:', arrAutenticacion);
          return false;
        }
      } else {
        this.errorLog.push("No se pudo decifrar el captcha");
        console.error('❌ Captcha vacío');
        return false;
      }
    } catch (error) {
      console.error('❌ Error en unlockSecurity:', error.message);
      this.errorLog.push("Error en unlockSecurity: " + error.message);
      return false;
    }
  }

  async consultarRuc(numRuc) {
    this.errorLog = [];
    this.state = false;

    console.log('🚀 Iniciando consulta RUC:', numRuc);

    try {
      if (await this.rucExist(numRuc)) {
        console.log('✅ RUC existe, procediendo con autenticación...');
        
        if (await this.unlockSecurity()) {
          console.log('🔑 Autenticación exitosa, obteniendo datos...');

          try {
            // Datos del Contribuyente
            const urlContrib = `${this.config.endpoints.contribuyente}?&ruc=${numRuc}`;
            console.log('📊 Consultando contribuyente:', urlContrib);
            
            const jsonContrib = await this.httpClient.get(urlContrib, {
              'Authorization': this.currentAuth,
              'Content-Type': 'application/json'
            });
            const jsonContribSafe = jsonContrib || '""';
            console.log('✅ Datos contribuyente:', jsonContribSafe);

            // Clasificación Empresa
            const urlClasificacion = `${this.config.endpoints.clasificacion}?numeroRuc=${numRuc}`;
            console.log('🏢 Consultando clasificación:', urlClasificacion);
            
            const jsonClasificacion = await this.httpClient.get(urlClasificacion, {
              'Authorization': this.currentAuth,
              'Content-Type': 'application/json'
            });
            const jsonClasificacionSafe = jsonClasificacion || '""';
            console.log('✅ Datos clasificación:', jsonClasificacionSafe);

            // Información Establecimiento
            const urlEstab = `${this.config.endpoints.establecimiento}?numeroRuc=${numRuc}`;
            console.log('🏭 Consultando establecimiento:', urlEstab);
            
            const jsonEstab = await this.httpClient.get(urlEstab, {
              'Authorization': this.currentAuth,
              'Content-Type': 'application/json'
            });
            const jsonEstabSafe = jsonEstab || '""';
            console.log('✅ Datos establecimiento:', jsonEstabSafe);

            this.resultJson = `{"contribuyente":${typeof jsonContribSafe === 'string' ? jsonContribSafe : JSON.stringify(jsonContribSafe)},"calsificacion":${typeof jsonClasificacionSafe === 'string' ? jsonClasificacionSafe : JSON.stringify(jsonClasificacionSafe)},"establecimientos":${typeof jsonEstabSafe === 'string' ? jsonEstabSafe : JSON.stringify(jsonEstabSafe)}}`;
            
            this.state = true;
            console.log('🎉 Consulta RUC completada exitosamente');

          } catch (error) {
            console.error('❌ Error en consulta de datos:', error.message);
            this.errorLog.push("Error en consulta de datos: " + error.message);
          }
        } else {
          console.error('❌ Falló la autenticación');
          this.errorLog.push("No se decifró el captcha");
        }
      } else {
        console.error('❌ RUC no existe');
        this.errorLog.push("El RUC no existe");
      }
    } catch (error) {
      console.error('❌ Error general en consultarRuc:', error.message);
      this.errorLog.push("Error general: " + error.message);
    }

    return this.state;
  }

  formatWsData(data) {
    console.log('🔧 Formateando datos RUC...');
    
    if (data && data.contribuyente && data.contribuyente.length > 0) {
      const contrib = data.contribuyente[0];
      const establecimientos = data.establecimientos || [];
      const establecimiento = establecimientos.length > 0 ? establecimientos[0] : {};

      console.log('📋 Datos contribuyente crudos:', contrib);
      console.log('🏢 Datos establecimiento crudos:', establecimiento);

      const contribuyente = {
        ruc: contrib.numeroRuc || '',
        dni: contrib.representantesLegales || '',
        nombre: contrib.razonSocial || '',
        provincia: establecimiento.estado || '',
        ubigeo: '',
        nombre_comercial: contrib.razonSocial || '',
        estatus: contrib.tipoContribuyente || '',
        tipo_contribuyente: contrib.tipoContribuyente || '',
        domicilio: establecimiento.direccionCompleta || '',
        departamento: establecimiento.estado || '',
        condicion: establecimiento.numeroEstablecimiento || '',
        distrito: (establecimiento.numeroEstablecimiento || '') + ', ' + (establecimiento.direccionCompleta || ''),
        fecha_inscripcion: contrib.informacionFechasContribuyente?.fechaInicioActividades || '',
        emisor_electronico: contrib.informacionFechasContribuyente?.fechaActualizacion || '',
        sistema_contabilidad: contrib.obligadoLlevarContabilidad || '',
        ActividadExterior: ""
      };

      if (contribuyente.fecha_inscripcion) {
        try {
          const date = new Date(contribuyente.fecha_inscripcion.replace(/\//g, '-'));
          contribuyente.fecha_inscripcion = date.toISOString().split('T')[0];
        } catch (e) {
          console.warn('⚠️ No se pudo formatear la fecha:', e.message);
        }
      }

      console.log('✅ Datos formateados:', contribuyente);
      return contribuyente;
    }
    
    console.warn('⚠️ No se encontraron datos del contribuyente');
    return null;
  }

  getJsonResult() {
    return this.resultJson;
  }

  getErrorLog() {
    return this.errorLog;
  }
}

module.exports = new RucService();