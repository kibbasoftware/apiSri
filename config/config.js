module.exports = {
  database: {
    // Usar DATABASE_URL si existe, sino usar variables individuales
    connectionString: process.env.DATABASE_URL || `postgres://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || ''}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'consultas'}`,
    // Configuración adicional
    max: process.env.DB_MAX_CONNECTIONS || 20,
    idleTimeoutMillis: process.env.DB_IDLE_TIMEOUT || 30000,
    connectionTimeoutMillis: process.env.DB_CONNECTION_TIMEOUT || 2000,
    // SSL ya está incluido en DATABASE_URL con sslmode=require
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