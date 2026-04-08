const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SECRET = "secreto123";

// =======================
// LOGIN
// =======================
router.post('/login', (req, res) => {
  const { correo, password } = req.body;

  db.query(
    'SELECT * FROM usuarios WHERE correo = ?',
    [correo],
    async (err, result) => {
      if (err) return res.status(500).json(err);

      if (result.length === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      const user = result[0];

      const valid = await bcrypt.compare(password, user.password);

      if (!valid) {
        return res.status(401).json({ message: 'Contraseña incorrecta' });
      }

      // generar token
      const token = jwt.sign(
        { id: user.id, rol: user.rol },
        SECRET,
        { expiresIn: '1h' }
      );

      res.json({
        message: 'Login correcto',
        token,
        rol: user.rol,
        id: user.id,
        nombre: user.nombre,
        correo: user.correo
      });
    }
  );
});

module.exports = router;