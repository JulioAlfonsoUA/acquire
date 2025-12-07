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

  console.log(headers);
  console.log(body);

  const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(body)
  });

  console.log(response);

  if (!response.ok) {
    throw new Error(`KUNNA_BAD_STATUS:${response.status}`);
  }
  
  const json = await response.json();
  const result = json.result;

  console.log(json);
  console.log(result);

  if (!result || !Array.isArray(result.columns) || !Array.isArray(result.values)) {
    throw new Error("KUNNA_INVALID_RESULT");
  }
  return result;
}

async function getKUNNA(req, res) {
  try {
    
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    if (req.query.start) {
      timeStart = new Date(req.query.start);
    } else {
      timeStart = fiveMinutesAgo;
    }

    if (req.query.end){
      timeEnd = new Date(req.query.end);
    } else{
      timeEnd = now
    }

    
    const result = await fetchKunna(timeStart, timeEnd);
    
    if (!result.values.length) {
      return res.status(404).json({
        error: "KUNNA did not find any information for the given interval"
      });
    }

    console.log(result);

    const saved = await guardarDatos(result);

    const lastRow = result.values[0];

    if (!Array.isArray(lastRow)) {
      throw new Error("KUNNA_INVALID_ROW");
    }

    res.status(200).json({
      acquireId: saved._id,
      timestamp: saved.timestamp,
      features: lastRow,
      featureCount: lastRow.length,
      columns: result.columns
    });

  } 
  catch (err) {
    console.error("Error en getKUNNA:", err);
    res.status(500).json({
      error: "KUNNA_ERROR",
      message: err.message
    });
  }
}



module.exports = {
  health,
  ready,
  getKUNNA
};
