const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');

// =======================
// GET usuarios
// =======================
router.get('/', (req, res) => {
  db.query(
    'SELECT id, nombre, correo, rol, foto_perfil FROM usuarios',
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    }
  );
});

// =======================
// GET usuario por id
// =======================
router.get('/:id', (req, res) => {
  db.query(
    `SELECT id, nombre, correo, rol, direccion, ciudad, estado, codigo_postal, pais, foto_perfil
     FROM usuarios
     WHERE id = ?`,
    [req.params.id],
    (err, result) => {
      if (err) return res.status(500).json(err);

      if (result.length === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      res.json(result[0]);
    }
  );
});

// =======================
// POST crear usuario
// =======================
router.post('/', async (req, res) => {
  const { nombre, correo, password, rol } = req.body;

  try {
    const hash = await bcrypt.hash(password, 10);

    db.query(
      'INSERT INTO usuarios (nombre, correo, password, rol) VALUES (?, ?, ?, ?)',
      [nombre, correo, hash, rol],
      (err) => {
        if (err) return res.status(500).json(err);

        res.json({ message: 'Usuario creado correctamente' });
      }
    );
  } catch (error) {
    res.status(500).json(error);
  }
});

// =======================
// PUT actualizar perfil
// =======================
router.put('/:id', (req, res) => {
  const {
    nombre,
    correo,
    direccion,
    ciudad,
    estado,
    codigo_postal,
    pais,
    foto_perfil
  } = req.body;

  db.query(
    `UPDATE usuarios
     SET nombre = ?, correo = ?, direccion = ?, ciudad = ?, estado = ?, codigo_postal = ?, pais = ?, foto_perfil = ?
     WHERE id = ?`,
    [nombre, correo, direccion, ciudad, estado, codigo_postal, pais, foto_perfil, req.params.id],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error al actualizar perfil', error: err });
      }

      res.json({ message: 'Perfil actualizado correctamente' });
    }
  );
});

// =======================
// PUT cambiar contraseña
// =======================
router.put('/:id/password', (req, res) => {
  const { password_actual, password_nueva } = req.body;

  if (!password_actual || !password_nueva) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  db.query(
    'SELECT password FROM usuarios WHERE id = ?',
    [req.params.id],
    async (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error al buscar usuario', error: err });
      }

      if (result.length === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      try {
        const passwordHash = result[0].password;
        const coincide = await bcrypt.compare(password_actual, passwordHash);

        if (!coincide) {
          return res.status(400).json({ message: 'La contraseña actual es incorrecta' });
        }

        const nuevoHash = await bcrypt.hash(password_nueva, 10);

        db.query(
          'UPDATE usuarios SET password = ? WHERE id = ?',
          [nuevoHash, req.params.id],
          (err2) => {
            if (err2) {
              console.error(err2);
              return res.status(500).json({ message: 'Error al actualizar contraseña', error: err2 });
            }

            res.json({ message: 'Contraseña actualizada correctamente' });
          }
        );
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno al cambiar contraseña', error });
      }
    }
  );
});

module.exports = router;