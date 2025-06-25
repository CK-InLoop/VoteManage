const Vote = require('../models/Vote');
const Election = require('../models/Election');
const Candidate = require('../models/Candidate');

// Voter: Cast vote (one per election, with clear errors and email confirmation stub)
exports.castVote = async (req, res) => {
  try {
    const { electionId } = req.params;
    const { candidateId } = req.body;
    // 1. Check election exists and is active
    const election = await Election.findById(electionId);
    if (!election) return res.status(404).json({ message: 'Election not found' });
    if (new Date() > new Date(election.deadline)) return res.status(400).json({ message: 'Election has ended' });
    // 2. Check candidate is valid for this election
    const candidate = await Candidate.findById(candidateId);
    if (!candidate || !candidate.election.equals(election._id)) return res.status(400).json({ message: 'Invalid candidate' });
    // 3. Prevent double voting (unique index enforces this)
    const vote = new Vote({ voter: req.user.id, election: electionId, candidate: candidateId });
    await vote.save();
    // 4. (Bonus) Email confirmation stub (implement actual email logic here)
    // sendVoteConfirmationEmail(req.user.email, election.title);
    res.status(201).json({ message: 'Vote cast successfully. Confirmation email will be sent.' });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'You have already voted in this election' });
    res.status(500).json({ message: 'Voting failed: ' + err.message });
  }
};

// Voter: List active elections
exports.listActiveElections = async (req, res) => {
  try {
    const now = new Date();
    const elections = await Election.find({ deadline: { $gt: now } }).populate('candidates');
    res.json(elections);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Voter: Get election results (only after deadline)
exports.getElectionResults = async (req, res) => {
  try {
    const { electionId } = req.params;
    const election = await Election.findById(electionId).populate('candidates');
    if (!election) return res.status(404).json({ message: 'Election not found' });
    if (new Date() < new Date(election.deadline)) return res.status(403).json({ message: 'Results not available yet' });
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
