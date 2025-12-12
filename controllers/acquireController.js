const mongoose = require("mongoose");

// controllers/acquireController.js
const { guardarDatos } = require("../services/acquireService");

function health(req, res) {
  res.json({
    status: "ok",
    service: "acquire"
  });
}

function ready(req, res) {
  const state = mongoose.connection.readyState;

  if (state !== 1) {
    return res.status(503).json({
      ready: false,
      dbState: state,
      service: "acquire",
      message: "MongoDB no está listo"
    });
  }

  res.json({
    ready: true,
    dbState: state,
    service: "acquire",
    message: "MongoDB conexion OK"
  });
}

async function fetchKunna(timeStart, timeEnd) {
  const url = process.env.KUNNA_URL;

  const headers = {
    "Content-Type": "application/json"
  };

  const body = {
    time_start: timeStart.toISOString(),
    time_end: timeEnd.toISOString(),
    filters: [
      { filter: "name", values: ["1d"] },
      { filter: "alias", values: [process.env.ALIAS] }
    ],
    limit: 100,
    count: false,
    order: "DESC"
  };

  const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`KUNNA_BAD_STATUS:${response.status}`);
  }
  
  const json = await response.json();
  const result = json.result;

  if (!result || !Array.isArray(result.columns) || !Array.isArray(result.values)) {
    throw new Error("KUNNA_INVALID_RESULT");
  }
  return result;
}

async function data(req, res) {
  try {
    
    let timeEnd = new Date();

    if (timeEnd.getHours() < 23){
      timeEnd = new Date(timeEnd.getTime() - 86400 * 1000);
    }

    const timeStart = new Date(timeEnd.getTime() - 3 * 86400 * 1000);

    const result = await fetchKunna(timeStart, timeEnd);
    
    if (!result.values.length) {
      return res.status(404).json({
        error: "KUNNA did not find any information for the given interval"
      });
    }

    const values = result.values;

    let features = values.map(row => row[2]);

    features = [...features, timeEnd.getHours(), timeEnd.getDay(), timeEnd.getMonth(), timeEnd.getDate()];

    const saved = await guardarDatos({
      result,
      features,
      timestamp: new Date()
    });

    res.status(200).json({
      dataId: saved._id,
      features: features,
      featureCount: features.length,
      scalerVersion: "v1",
      createdAt: saved.timestamp
    });

  } 
  catch (err) {
    console.error("Error en data:", err);
    res.status(500).json({
      error: "Internal error in acquire",
      message: err.message
    });
  }
}

module.exports = {
  health,
  ready,
  data
};
