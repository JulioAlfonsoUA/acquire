// server.js
// Entry point del servicio ACQUIRE

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const acquireRoutes = require("./routes/acquireRoutes");

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI;

const app = express();
app.use(express.json());

mongoose.connect(MONGO_URI || 'mongodb://mongo:27017/acquire')
.then(() => {
    console.log('Conexión a la base de datos establecida');
}).catch(err => {
    console.error('Error de conexión a la base de datos:', err);
});

// Rutas del servicio ACQUIRE
app.use("/", acquireRoutes);

// Arranque del servidor
app.listen(PORT, async () => {
  const serverUrl = `http://localhost:${PORT}`;
  console.log(`[ACQUIRE] Servicio escuchando en ${serverUrl}`);
});