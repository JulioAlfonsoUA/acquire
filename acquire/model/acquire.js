'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AcquireSchema = new Schema({
    columns: { type: [String], required: true },
    values: { type: Array, required: true },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Adquisicion', AcquireSchema);