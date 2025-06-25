const express = require('express');
const router = express.Router();
const { auth, authorizeRoles } = require('../middleware/auth');
const {
  castVote,
  listActiveElections,
  getElectionResults
} = require('../controllers/voteController');

// Voter routes
router.get('/elections', auth, authorizeRoles('voter'), listActiveElections);
router.post('/elections/:electionId/vote', auth, authorizeRoles('voter'), castVote);
router.get('/elections/:electionId/results', auth, authorizeRoles('voter'), getElectionResults);

module.exports = router;
