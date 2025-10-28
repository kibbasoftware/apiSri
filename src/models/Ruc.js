const db = require('../database/connection');

class Ruc {
  // Crear tabla si no existe
  // Consultar cliente por DNI
  async findByDni(dni) {
    const query = `
      SELECT 
        id, ruc, nombre, domicilio, condicion, estado, fecha_creacion
      FROM rucs 
      WHERE ruc = $1
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
      ruc, nombre, domicilio, condicion, estado
    } = customerData;
    console.log('customerData::: ', customerData);

    const query = `
      INSERT INTO rucs (
          ruc, nombre, domicilio, condicion, estado
      ) 
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    try {
      const result = await db.query(query, [
        ruc, nombre, domicilio, condicion, estado
      ]);
      console.log('result::: ', result);

      return { 
        inserted: true, 
        customer: result.rows[0],
        message: 'Cliente insertado correctamente'
      };
    } catch (error) {
      // Si es error de duplicado, manejarlo
      if (error.code === '23505') {
        return { inserted: false, message: 'El RUC ya existe' };
      }
      
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
      UPDATE rucs 
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
          id, ruc, nombre, domicilio, condicion, estado, fecha_creacion
      FROM rucs
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
    const query = 'DELETE FROM rucs WHERE dni = $1 RETURNING *';

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
    const query = 'SELECT COUNT(*) as total FROM rucs';

    try {
      const result = await db.query(query);
      return parseInt(result.rows[0].total);
    } catch (error) {
      console.error('❌ Error contando clientes:', error);
      throw error;
    }
  }
}

module.exports = new Ruc();