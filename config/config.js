module.exports = {
    database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'consultas',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    max: process.env.DB_MAX_CONNECTIONS || 20,
    idleTimeoutMillis: process.env.DB_IDLE_TIMEOUT || 30000,
    connectionTimeoutMillis: process.env.DB_CONNECTION_TIMEOUT || 2000,
    // ESTA LÍNEA ES CRÍTICA - debe estar presente
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: false
    } : false
  },
  cedula: {
    loginUrl: process.env.CEDULA_LOGIN_URL || 'https://solutions.myfenixcloud.com/cif/login',
    searchUrl: process.env.CEDULA_SEARCH_URL || 'https://solutions.myfenixcloud.com/cif/document/search',
    username: process.env.CEDULA_USERNAME || 'maki',
    password: process.env.CEDULA_PASSWORD || 'hh499n2qrBy0RxTN407m4EPI',
    contract: process.env.CEDULA_CONTRACT || '2409051512'
  },
  ruc: {
    baseUrl: 'https://srienlinea.sri.gob.ec',
    endpoints: {
      existeRuc: '/sri-catastro-sujeto-servicio-internet/rest/ConsolidadoContribuyente/existePorNumeroRuc',
      captchaStart: '/sri-captcha-servicio-internet/captcha/start/1',
      validarCaptcha: '/sri-captcha-servicio-internet/rest/ValidacionCaptcha/validarCaptcha',
      contribuyente: '/sri-catastro-sujeto-servicio-internet/rest/ConsolidadoContribuyente/obtenerPorNumerosRuc',
      clasificacion: '/sri-catastro-sujeto-servicio-internet/rest/ClasificacionMipyme/consultarPorNumeroRuc',
      establecimiento: '/sri-catastro-sujeto-servicio-internet/rest/Establecimiento/consultarPorNumeroRuc'
    }
  },
  server: {
    port: process.env.PORT || 3000,
    environment: process.env.NODE_ENV || 'development'
  }
};