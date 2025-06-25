const Election = require('../models/Election');
const Candidate = require('../models/Candidate');
const Vote = require('../models/Vote');
const { Parser } = require('json2csv');

// =========================
// Admin: Create a new election
// =========================
exports.createElection = async (req, res) => {
  try {
    const { title, deadline } = req.body;
    const exists = await Election.findOne({ title });
    if (exists) return res.status(400).json({ message: 'Election with this title already exists' });
    const election = new Election({ title, deadline, createdBy: req.user.id });
    await election.save();
    res.status(201).json(election);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Add a candidate to an election
exports.addCandidate = async (req, res) => {
  try {
    const { name } = req.body;
    const { electionId } = req.params;
    const election = await Election.findById(electionId);
    if (!election) return res.status(404).json({ message: 'Election not found' });
    const duplicate = await Candidate.findOne({ name, election: electionId });
    if (duplicate) return res.status(400).json({ message: 'Candidate already exists in this election' });
    const candidate = new Candidate({ name, election: electionId });
    await candidate.save();
    election.candidates.push(candidate._id);
    await election.save();
    res.status(201).json(candidate);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Update a candidate's name
exports.updateCandidate = async (req, res) => {
  try {
    const { name } = req.body;
    const { candidateId } = req.params;
    const candidate = await Candidate.findByIdAndUpdate(candidateId, { name }, { new: true });
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
    res.json(candidate);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Delete a candidate from an election
exports.deleteCandidate = async (req, res) => {
  try {
    const { candidateId, electionId } = req.params;
    const candidate = await Candidate.findByIdAndDelete(candidateId);
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
    await Election.findByIdAndUpdate(electionId, { $pull: { candidates: candidateId } });
    res.json({ message: 'Candidate deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: List all elections and their status
exports.listElections = async (req, res) => {
  try {
    const elections = await Election.find().populate('candidates');
    res.json(elections);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Get results (JSON)
exports.getResults = async (req, res) => {
  try {
    const { electionId } = req.params;
    const election = await Election.findById(electionId).populate('candidates');
    if (!election) return res.status(404).json({ message: 'Election not found' });
    const votes = await Vote.find({ election: electionId });
    const results = {};
    election.candidates.forEach(candidate => {
      results[candidate.name] = votes.filter(v => v.candidate.equals(candidate._id)).length;
    });
    res.json({ election: election.title, results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Download results as CSV
exports.downloadResultsCSV = async (req, res) => {
  try {
    const { electionId } = req.params;
    const election = await Election.findById(electionId).populate('candidates');
    if (!election) return res.status(404).json({ message: 'Election not found' });
    const votes = await Vote.find({ election: electionId });
    const data = election.candidates.map(candidate => ({
      Candidate: candidate.name,
      Votes: votes.filter(v => v.candidate.equals(candidate._id)).length
    }));
    const parser = new Parser({ fields: ['Candidate', 'Votes'] });
    const csv = parser.parse(data);
    res.header('Content-Type', 'text/csv');
    res.attachment(`${election.title}_results.csv`);
    return res.send(csv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
