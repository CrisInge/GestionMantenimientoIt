

const express = require('express');
const router = express.Router();
const db = require('../config/db');

// =======================
// GET
// =======================
// router.get('/', (req, res) => {

router.get('/', (req, res) => {

  const id_tecnico = req.query.id_tecnico;
  const id_equipo = req.query.id_equipo;
  const estado = req.query.estado;

  let query = `
    SELECT m.*, e.service_tag, u.nombre AS tecnico
    FROM mantenimientos m
    JOIN equipos e ON m.id_equipo = e.id_equipo
    LEFT JOIN usuarios u ON m.id_tecnico = u.id
  `;

  let conditions = [];
  let params = [];

  // filtros dinámicos
  if (estado) {
    conditions.push("m.estado = ?");
    params.push(estado);
  }

  if (id_tecnico) {
    conditions.push("m.id_tecnico = ?");
    params.push(id_tecnico);
  }

  if (id_equipo) {
    conditions.push("m.id_equipo = ?");
    params.push(id_equipo);
  }

  // aplicar WHERE solo si hay condiciones
  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  // ORDEN
  query += `
    ORDER BY 
      CASE 
        WHEN m.estado = 'Activo' THEN 0
        ELSE 1
      END,
      m.fecha_inicio DESC
  `;

  // USAR PARAMS CORRECTAMENTE
  db.query(query, params, (err, result) => {
    if (err) {
      console.log("SQL ERROR:", err);
      return res.status(500).json(err);
    }
    res.json(result);
  });

});

// =======================
//  HISTORIAL POR EQUIPO
// =======================
router.get('/historial/:id_equipo', (req, res) => {

  db.query(`
    SELECT h.*, h.comentario, m.tipo, m.estado, m.fecha_inicio, m.fecha_fin, e.service_tag, u.nombre AS tecnico
    FROM historial_mantenimiento h
    JOIN mantenimientos m ON h.mantenimiento_id = m.id_mantenimiento
    JOIN equipos e ON m.id_equipo = e.id_equipo
    LEFT JOIN usuarios u ON m.id_tecnico = u.id
    WHERE m.id_equipo = ?
    ORDER BY h.fecha DESC
  `, [req.params.id_equipo], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });

});

// =======================
// POST (con service_tag)
// =======================
router.post('/', (req, res) => {
  const { service_tag, tipo, descripcion, id_tecnico } = req.body;

  // Buscar equipo
  db.query(
    'SELECT id_equipo FROM equipos WHERE service_tag = ?',
    [service_tag],
    (err, result) => {
      if (err) return res.status(500).json(err);

      if (result.length === 0) {
        return res.status(404).json({ message: 'Equipo no encontrado' });
      }

      const id_equipo = result[0].id_equipo;

      // Insertar mantenimiento
      db.query(
        `INSERT INTO mantenimientos (id_equipo, tipo, descripcion, id_tecnico)
         VALUES (?, ?, ?, ?)`,
        [id_equipo, tipo, descripcion, id_tecnico],
        (err2) => {
          if (err2) return res.status(500).json(err2);

          res.json({ message: 'Mantenimiento registrado' });
        }
      );
    }
  );
});

// =======================
// TERMINAR MANTENIMIENTO
// =======================
router.put('/:id/terminar', (req, res) => {
  const id = req.params.id;

  // 1. actualizar mantenimiento
  db.query(
    `UPDATE mantenimientos
     SET estado = 'Finalizado',
         fecha_fin = CURRENT_TIMESTAMP
     WHERE id_mantenimiento = ?`,
    [id],
    (err) => {
      if (err) return res.status(500).json(err);

      // 2. insertar en historial
      db.query(
        `INSERT INTO historial_mantenimiento (mantenimiento_id, comentario, fecha)
         VALUES (?, ?, NOW())`,
        [id, 'Mantenimiento finalizado'],
        (err2) => {
          if (err2) return res.status(500).json(err2);

          res.json({ message: 'Mantenimiento terminado y guardado en historial' });
        }
      );
    }
  );
});

// =======================
// AGREGAR SOLUCIÓN
// =======================
router.put('/:id/solucion', (req, res) => {
  const { solucion } = req.body;
  const id = req.params.id;

  db.query(
    `UPDATE mantenimientos
     SET solucion = ?, estado = 'Finalizado', fecha_fin = CURRENT_TIMESTAMP
     WHERE id_mantenimiento = ?`,
    [solucion, id],
    (err) => {
      if (err) return res.status(500).json(err);

      // guardar en historial
      db.query(
        `INSERT INTO historial_mantenimiento (mantenimiento_id, comentario, fecha)
         VALUES (?, ?, NOW())`,
        [id, solucion],
        (err2) => {
          if (err2) return res.status(500).json(err2);

          res.json({ message: 'Solución guardada en historial' });
        }
      );
    }
  );
});


// =======================
// DELETE
// =======================
router.delete('/:id', (req, res) => {
  db.query(
    'DELETE FROM mantenimientos WHERE id_mantenimiento=?',
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: 'Eliminado' });
    }
  );
});

module.exports = router;