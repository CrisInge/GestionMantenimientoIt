const express = require('express');
const router = express.Router();
const db = require('../config/db');

// =====================
// GET (obtener equipos)
// =====================
router.get('/', (req, res) => {

  const tecnico = req.query.tecnico;

  let query = 'SELECT * FROM equipos';

  if (tecnico) {
    query += ' WHERE usuario_asignado = ?';
  }

  db.query(query, tecnico ? [tecnico] : [], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// =====================
// POST (crear equipo)
// =====================
router.post('/', (req, res) => {
  const { dueno_equipo, marca, modelo, service_tag, area, usuario_asignado } = req.body;

  if (!dueno_equipo) {
    return res.status(400).json({ error: 'El nombre es obligatorio' });
  }

  db.query(
    `INSERT INTO equipos 
    (dueno_equipo, marca, modelo, service_tag, area, usuario_asignado) 
    VALUES (?, ?, ?, ?, ?, ?)`,
    [dueno_equipo, marca, modelo, service_tag, area, usuario_asignado],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error al registrar equipo' });
      }
      res.json({ message: 'Equipo registrado correctamente' });
    }
  );
});

// =====================
// PUT (editar equipo)
// =====================
router.put('/:id', (req, res) => {
  const { dueno_equipo, marca, modelo, service_tag, area, usuario_asignado } = req.body;

  db.query(
    `UPDATE equipos 
     SET dueno_equipo=?, marca=?, modelo=?, service_tag=?, area=?, usuario_asignado=? 
     WHERE id_equipo=?`,
    [dueno_equipo, marca, modelo, service_tag, area, usuario_asignado, req.params.id],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error al actualizar equipo' });
      }
      res.json({ message: 'Equipo actualizado correctamente' });
    }
  );
});

// =======================
// UPDATE EQUIPO
// =======================
// router.put('/:id', (req, res) => {
//   const { dueno_equipo, marca, modelo, service_tag, area, usuario_asignado } = req.body;

//   db.query(
//     `UPDATE equipos 
//      SET dueno_equipo=?, marca=?, modelo=?, service_tag=?, area=?, usuario_asignado=?
//      WHERE id_equipo=?`,
//     [dueno_equipo, marca, modelo, service_tag, area, usuario_asignado, req.params.id],
//     (err) => {
//       if (err) return res.status(500).json(err);
//       res.json({ message: "Equipo actualizado" });
//     }
//   );
// });

// =====================
// DELETE (eliminar)
// =====================
router.delete('/:id', (req, res) => {
  const id_equipo = req.params.id;

  // 1. buscar mantenimientos del equipo
  db.query(
    'SELECT id_mantenimiento FROM mantenimientos WHERE id_equipo = ?',
    [id_equipo],
    (err, mantenimientos) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error al buscar mantenimientos del equipo' });
      }

      const idsMantenimientos = mantenimientos.map(m => m.id_mantenimiento);

      // 2. si hay mantenimientos, borrar historial primero
      const borrarEquipo = () => {
        db.query(
          'DELETE FROM equipos WHERE id_equipo = ?',
          [id_equipo],
          (err3) => {
            if (err3) {
              console.error(err3);
              return res.status(500).json({ error: 'Error al eliminar equipo' });
            }

            res.json({ message: 'Equipo eliminado correctamente' });
          }
        );
      };

      const borrarMantenimientos = () => {
        db.query(
          'DELETE FROM mantenimientos WHERE id_equipo = ?',
          [id_equipo],
          (err2) => {
            if (err2) {
              console.error(err2);
              return res.status(500).json({ error: 'Error al eliminar mantenimientos del equipo' });
            }

            borrarEquipo();
          }
        );
      };

      if (idsMantenimientos.length === 0) {
        // no hay mantenimientos, borrar equipo directo
        return borrarEquipo();
      }

      db.query(
        'DELETE FROM historial_mantenimiento WHERE mantenimiento_id IN (?)',
        [idsMantenimientos],
        (errHistorial) => {
          if (errHistorial) {
            console.error(errHistorial);
            return res.status(500).json({ error: 'Error al eliminar historial del equipo' });
          }

          borrarMantenimientos();
        }
      );
    }
  );
});

module.exports = router;