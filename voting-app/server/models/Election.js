const mongoose = require('mongoose');

const electionSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  deadline: { type: Date, required: true },
  candidates: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Candidate' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Election', electionSchema);
