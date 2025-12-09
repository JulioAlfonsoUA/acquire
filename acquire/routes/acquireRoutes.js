// routes/acquireRoutes.js
const express = require("express");
const router = express.Router();

const acquireController = require("../controllers/acquireController");

// Contrato del servicio ADQUISICION
router.get("/health", acquireController.health);
router.get("/ready", acquireController.ready);
router.get("/data", acquireController.data);

module.exports = router;
