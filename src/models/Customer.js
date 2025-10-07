const db = require('../database/connection');

class Customer {
  // Crear tabla si no existe
  // Consultar cliente por DNI
  async findByDni(dni) {
    const query = `
      SELECT 
        id, dni, nombres, domicilio, estado, fecha_creacion
      FROM customers 
      WHERE dni = $1
    `;

    try {
      const result = await db.query(query, [dni]);
      console.log('result::: ', result);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0];
    } catch (error) {
      console.error('❌ Error buscando cliente por DNI:', error);
      throw error;
    }
  }

  // Insertar nuevo cliente
  async create(customerData) {
  const {
    dni,
    nombres,
    domicilio,
    estado
  } = customerData;
  console.log('custwwwwwomerData::: ', customerData);

  try {
    // Primero verificar si el DNI ya existe
    const existingCustomer = await this.findByDni(dni);
    console.log('existingCustomer::: ', existingCustomer);
    
    if (existingCustomer) {
      return { 
        inserted: false, 
        message: 'El DNI ya existe',
        customer: existingCustomer
      };
    }

    // Si no existe, insertar
    const query = `
      INSERT INTO customers (dni, nombres, domicilio, estado) 
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const result = await db.query(query, [
      dni, nombres, domicilio, estado
    ]);

    return { 
      inserted: true, 
      customer: result.rows[0],
      message: 'Cliente insertado correctamente'
    };
    
  } catch (error) {
    console.error('❌ Error insertando cliente:', error);
    throw error;
  }
}

  // Actualizar cliente
  async update(dni, customerData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    // Construir dinámicamente la query
    Object.keys(customerData).forEach(key => {
      if (customerData[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(customerData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    // Agregar updated_at
    fields.push(`updated_at = $${paramCount}`);
    values.push(new Date());
    
    // Agregar DNI al final para el WHERE
    values.push(dni);

    const query = `
      UPDATE customers 
      SET ${fields.join(', ')}
      WHERE dni = $${paramCount + 1}
      RETURNING *
    `;

    try {
      const result = await db.query(query, values);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0];
    } catch (error) {
      console.error('❌ Error actualizando cliente:', error);
      throw error;
    }
  }

  // Listar todos los clientes (con paginación opcional)
  async findAll(limit = 100, offset = 0) {
    const query = `
      SELECT 
         id, dni, nombres, domicilio, estado, fecha_creacion
      FROM customers 
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;

    try {
      const result = await db.query(query, [limit, offset]);
      return result.rows;
    } catch (error) {
      console.error('❌ Error listando clientes:', error);
      throw error;
    }
  }

  // Eliminar cliente por DNI
  async deleteByDni(dni) {
    const query = 'DELETE FROM customers WHERE dni = $1 RETURNING *';

    try {
      const result = await db.query(query, [dni]);
      
      if (result.rows.length === 0) {
        return { deleted: false, message: 'Cliente no encontrado' };
      }
      
      return { 
        deleted: true, 
        customer: result.rows[0],
        message: 'Cliente eliminado correctamente'
      };
    } catch (error) {
      console.error('❌ Error eliminando cliente:', error);
      throw error;
    }
  }

  // Contar total de clientes
  async count() {
    const query = 'SELECT COUNT(*) as total FROM customers';

    try {
      const result = await db.query(query);
      return parseInt(result.rows[0].total);
    } catch (error) {
      console.error('❌ Error contando clientes:', error);
      throw error;
    }
  }
}

module.exports = new Customer();