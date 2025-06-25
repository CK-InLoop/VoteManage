const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  voter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  election: { type: mongoose.Schema.Types.ObjectId, ref: 'Election', required: true },
  candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true }
}, { timestamps: true });

voteSchema.index({ voter: 1, election: 1 }, { unique: true }); // Prevent duplicate votes

module.exports = mongoose.model('Vote', voteSchema);
