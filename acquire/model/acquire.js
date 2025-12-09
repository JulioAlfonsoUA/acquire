'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AcquireSchema = new Schema({
    result: { type: Object, required: true },
    features: { type: [Number], required: true },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Adquisicion', AcquireSchema);