const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');

// =======================
// GET usuarios
// =======================
router.get('/', (req, res) => {
  db.query('SELECT id, nombre, correo, rol FROM usuarios', (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// =======================
// POST crear usuario (🔥 con hash)
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

module.exports = router;