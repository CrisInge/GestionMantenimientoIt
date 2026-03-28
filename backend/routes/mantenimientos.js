



// const express = require('express');
// const router = express.Router();
// const db = require('../config/db');

// // =======================
// // GET
// // =======================
// router.get('/', (req, res) => {
//   db.query(`
//     SELECT m.*, e.service_tag, u.nombre AS tecnico
//     FROM mantenimientos m
//     JOIN equipos e ON m.id_equipo = e.id_equipo
//     LEFT JOIN usuarios u ON m.id_tecnico = u.id
//   `, (err, result) => {
//     if (err) return res.status(500).json(err);
//     res.json(result);
//   });
// });

// // =======================
// // POST (AHORA CON SERVICE TAG 🔥)
// // =======================
// router.post('/', (req, res) => {
//   const { service_tag, tipo, descripcion } = req.body;

//   // 1. Buscar el id_equipo
//   db.query(
//     'SELECT id_equipo FROM equipos WHERE service_tag = ?',
//     [service_tag],
//     (err, result) => {
//       if (err) return res.status(500).json(err);

//       if (result.length === 0) {
//         return res.status(404).json({ message: 'Equipo no encontrado' });
//       }

//       const id_equipo = result[0].id_equipo;

//       // 2. Insertar mantenimiento (SIN fecha_inicio ni estado)
//       db.query(
//         `INSERT INTO mantenimientos 
//         (id_equipo, tipo, descripcion) 
//         VALUES (?, ?, ?)`,
//         [id_equipo, tipo, descripcion],
//         (err2) => {
//           if (err2) return res.status(500).json(err2);

//           res.json({ message: 'Mantenimiento registrado' });
//         }
//       );
//     }
//   );
// });

// // =======================
// // PUT (TERMINAR MANTENIMIENTO 🔥)
// // =======================
// router.put('/:id/terminar', (req, res) => {
//   db.query(
//     `UPDATE mantenimientos 
//      SET estado = 'terminado',
//          fecha_fin = CURRENT_TIMESTAMP
//      WHERE id_mantenimiento = ?`,
//     [req.params.id],
//     (err, result) => {
//       if (err) return res.status(500).json(err);
//       res.json({ message: 'Mantenimiento terminado' });
//     }
//   );
// });

// // =======================
// // DELETE
// // =======================
// router.delete('/:id', (req, res) => {
//   db.query(
//     'DELETE FROM mantenimientos WHERE id_mantenimiento=?',
//     [req.params.id],
//     (err, result) => {
//       if (err) return res.status(500).json(err);
//       res.json({ message: 'Eliminado' });
//     }
//   );
// });

// module.exports = router;




const express = require('express');
const router = express.Router();
const db = require('../config/db');

// =======================
// GET
// =======================
router.get('/', (req, res) => {

  const id_tecnico = req.query.id_tecnico;

  let query = `
    SELECT m.*, e.service_tag
    FROM mantenimientos m
    JOIN equipos e ON m.id_equipo = e.id_equipo
  `;

  if (id_tecnico) {
    query += " WHERE m.id_tecnico = ?";
  }

  db.query(query, id_tecnico ? [id_tecnico] : [], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});
// router.get('/', (req, res) => {
//   db.query(`
//     SELECT m.*, e.service_tag, u.nombre AS tecnico
//     FROM mantenimientos m
//     JOIN equipos e ON m.id_equipo = e.id_equipo
//     LEFT JOIN usuarios u ON m.id_tecnico = u.id
//   `, (err, result) => {
//     if (err) return res.status(500).json(err);
//     res.json(result);
//   });
// });

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
  db.query(
    `UPDATE mantenimientos
     SET estado = 'Finalizado',
         fecha_fin = CURRENT_TIMESTAMP
     WHERE id_mantenimiento = ?`,
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: 'Mantenimiento terminado' });
    }
  );
});

// =======================
// AGREGAR SOLUCIÓN
// =======================
router.put('/:id/solucion', (req, res) => {
  const { solucion } = req.body;

  db.query(
    `UPDATE mantenimientos
     SET solucion = ?, estado = 'Finalizado'
     WHERE id_mantenimiento = ?`,
    [solucion, req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: 'Solución guardada' });
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