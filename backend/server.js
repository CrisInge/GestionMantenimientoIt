require("dotenv").config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');

const app = express();
// const passwordHash = await bcrypt.hash(password, 10);

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
// app.use(express.json());

// SERVIR FRONTEND
app.use(express.static(path.join(__dirname, '../frontend')));

// Rutas
app.use('/usuarios', require('./routes/usuarios'));
app.use('/equipos', require('./routes/equipos'));
app.use('/mantenimientos', require('./routes/mantenimientos'));
app.use('/auth', require('./routes/auth'));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
