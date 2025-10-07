const Customer = require('../models/Customer');
const Helpers = require('../utils/helpers');

class CustomerService {
  constructor() {
    // Inicializar la tabla al crear el servicio
  }

  // Consultar cliente por DNI
  async searchByDni(dni, inJSON = false) {
    try {
      dni = dni.trim();
      
      // Validar DNI
      if (!Helpers.validateCedula(dni)) {
        const response = Helpers.formatResponse(false, null, 'Número de cédula no válido.');
        return inJSON ? JSON.stringify(response, null, 2) : response;
      }

      console.log(`🔍 Buscando cliente con DNI: ${dni}`);
      
      const customer = await Customer.findByDni(dni);
      
      if (customer) {
        console.log('✅ Cliente encontrado:', customer);
        const response = Helpers.formatResponse(true, customer, 'Cliente encontrado');
        console.log('responseqq::: ', response);
        return response; // ✅ SIEMPRE devolver objeto, no string
      } else {
        console.log('❌ Cliente no encontrado');
        const response = Helpers.formatResponse(false, null, 'No se encontró cliente con el DNI proporcionado.');
        return response; // ✅ SIEMPRE devolver objeto, no string
      }

    } catch (error) {
      console.error('Error en CustomerService.searchByDni:', error);
      const response = Helpers.formatResponse(false, null, error.message);
      return response; // ✅ SIEMPRE devolver objeto, no string
    }
  }

  // Insertar nuevo cliente
  async createCustomer(customerData, inJSON = false) {
    console.log('customerDataWWW::: ', customerData);
    try {
      const { dni } = customerData;
      console.log('dni::: ', dni);
      
      // Validar DNI
      if (!Helpers.validateCedula(dni)) {
        const response = Helpers.formatResponse(false, null, 'Número de cédula no válido.');
        return response; // ✅ SIEMPRE devolver objeto, no string
      }

      console.log(`📝 Insertando cliente con DNI: ${dni}`);
      console.log('📦 Datos del cliente:', customerData);

      const result = await Customer.create(customerData);
      
      if (result.inserted) {
        console.log('✅ Cliente insertado correctamente:', result.customer);
        const response = Helpers.formatResponse(true, result.customer, result.message);
        return response; // ✅ SIEMPRE devolver objeto, no string
      } else {
        console.log('⚠️ Cliente no insertado (ya existe):', result.message);
        const response = Helpers.formatResponse(false, null, result.message);
        return response; // ✅ SIEMPRE devolver objeto, no string
      }

    } catch (error) {
      console.error('Error en CustomerService.createCustomer:', error);
      const response = Helpers.formatResponse(false, null, error.message);
      return response; // ✅ SIEMPRE devolver objeto, no string
    }
  }

  // Actualizar cliente
  async updateCustomer(dni, customerData, inJSON = false) {
    try {
      // Validar DNI
      if (!Helpers.validateCedula(dni)) {
        const response = Helpers.formatResponse(false, null, 'Número de cédula no válido.');
        return response; // ✅ SIEMPRE devolver objeto, no string
      }

      console.log(`✏️ Actualizando cliente con DNI: ${dni}`);
      console.log('📦 Datos a actualizar:', customerData);

      const updatedCustomer = await Customer.update(dni, customerData);
      
      if (updatedCustomer) {
        console.log('✅ Cliente actualizado correctamente:', updatedCustomer);
        const response = Helpers.formatResponse(true, updatedCustomer, 'Cliente actualizado correctamente');
        return response; // ✅ SIEMPRE devolver objeto, no string
      } else {
        console.log('❌ Cliente no encontrado para actualizar');
        const response = Helpers.formatResponse(false, null, 'Cliente no encontrado');
        return response; // ✅ SIEMPRE devolver objeto, no string
      }

    } catch (error) {
      console.error('Error en CustomerService.updateCustomer:', error);
      const response = Helpers.formatResponse(false, null, error.message);
      return response; // ✅ SIEMPRE devolver objeto, no string
    }
  }

  // Listar todos los clientes
  async listCustomers(limit = 100, offset = 0, inJSON = false) {
    try {
      console.log(`📋 Listando clientes (límite: ${limit}, offset: ${offset})`);

      const customers = await Customer.findAll(limit, offset);
      const total = await Customer.count();

      const result = {
        customers,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + customers.length < total
        }
      };

      console.log(`✅ Encontrados ${customers.length} clientes de ${total} total`);
      
      const response = Helpers.formatResponse(true, result, 'Clientes listados correctamente');
      return response; // ✅ SIEMPRE devolver objeto, no string

    } catch (error) {
      console.error('Error en CustomerService.listCustomers:', error);
      const response = Helpers.formatResponse(false, null, error.message);
      return response; // ✅ SIEMPRE devolver objeto, no string
    }
  }

  // Eliminar cliente
  async deleteCustomer(dni, inJSON = false) {
    try {
      // Validar DNI
      if (!Helpers.validateCedula(dni)) {
        const response = Helpers.formatResponse(false, null, 'Número de cédula no válido.');
        return response; // ✅ SIEMPRE devolver objeto, no string
      }

      console.log(`🗑️ Eliminando cliente con DNI: ${dni}`);

      const result = await Customer.deleteByDni(dni);
      
      if (result.deleted) {
        console.log('✅ Cliente eliminado correctamente:', result.customer);
        const response = Helpers.formatResponse(true, result.customer, result.message);
        return response; // ✅ SIEMPRE devolver objeto, no string
      } else {
        console.log('❌ Cliente no encontrado para eliminar');
        const response = Helpers.formatResponse(false, null, result.message);
        return response; // ✅ SIEMPRE devolver objeto, no string
      }

    } catch (error) {
      console.error('Error en CustomerService.deleteCustomer:', error);
      const response = Helpers.formatResponse(false, null, error.message);
      return response; // ✅ SIEMPRE devolver objeto, no string
    }
  }
}

module.exports = new CustomerService();