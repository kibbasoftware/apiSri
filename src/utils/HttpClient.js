const axios = require('axios');
const https = require('https');

class HttpClient {
  constructor(baseURL = '', timeout = 30000) {
    this.client = axios.create({
      baseURL,
      timeout,
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      }),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json, */*'
      }
    });

    this.cookies = [];
    
    // Interceptor para manejar cookies
    this.client.interceptors.request.use((config) => {
      // Agregar cookies a la request
      if (this.cookies.length > 0) {
        config.headers.Cookie = this.cookies.join('; ');
      }
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
      return config;
    });

    this.client.interceptors.response.use((response) => {
      // Guardar cookies de la response
      if (response.headers['set-cookie']) {
        this.cookies = response.headers['set-cookie'];
        console.log('🍪 Cookies guardadas:', this.cookies);
      }
      console.log(`✅ ${response.status} ${response.config.url}`);
      return response;
    }, (error) => {
      console.error(`❌ ${error.message} - ${error.config?.url}`);
      return Promise.reject(error);
    });
  }

  async get(url, headers = {}) {
    try {
      const response = await this.client.get(url, { 
        headers: {
          'Accept': 'application/json',
          ...headers
        }
      });
      return response.data;
    } catch (error) {
      console.error(`❌ GET failed: ${error.message}`);
      throw error;
    }
  }

  async post(url, data = null, headers = {}) {
    try {
      const response = await this.client.post(url, data, { 
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...headers
        }
      });
      return response.data;
    } catch (error) {
      console.error(`❌ POST failed: ${error.message}`);
      throw error;
    }
  }

  // Método para limpiar cookies
  clearCookies() {
    this.cookies = [];
    console.log('🧹 Cookies limpiadas');
  }

  // Método para ver cookies actuales
  getCookies() {
    return this.cookies;
  }

  // En tu HttpClient, modifica el método rawRequest así:
async rawRequest(url, method = 'GET', data = null, headers = {}) {
  try {
    const config = {
      method: method,
      url: url,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36', // Mismo user agent que PHP
        'Accept': 'application/json, */*',
        ...headers
      },
      // IMPORTANTE: No transformar la respuesta automáticamente
      transformResponse: [function (data) {
        return data;
      }],
      // Aceptar todos los status codes para manejar errores
      validateStatus: function (status) {
        return true; // Aceptar todos los códigos de estado
      }
    };

    // CORRECCIÓN CRÍTICA: Manejar POST vacío (string vacío)
    if (data !== null && data !== undefined) {
      if (data === '') {
        // POST vacío - igual que en PHP con CURLOPT_POST=true pero sin CURLOPT_POSTFIELDS
        config.data = '';
      } else {
        config.data = data;
      }
    }

    // Agregar cookies si existen
    if (this.cookies.length > 0) {
      config.headers.Cookie = this.cookies.join('; ');
    }

    console.log(`🚀 ${method} ${url}`);
    console.log('📋 Headers:', Object.keys(config.headers));
    console.log('🔧 Config data:', config.data);

    const response = await this.client.request(config);
    
    // Guardar cookies de la response
    if (response.headers['set-cookie']) {
      this.cookies = response.headers['set-cookie'];
      console.log('🍪 Cookies guardadas:', this.cookies);
    }
    
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    return response.data;

  } catch (error) {
    console.error(`❌ ${method} failed: ${error.message}`);
    if (error.response) {
      console.error(`📊 Status: ${error.response.status}`);
      console.error(`📦 Response: ${error.response.data}`);
      
      // Devolver la respuesta aunque sea un error
      return error.response.data;
    }
    throw error;
  }
}
}

module.exports = HttpClient;