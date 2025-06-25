const express = require('express');
const router = express.Router();
const { auth, authorizeRoles } = require('../middleware/auth');
const {
  createElection,
  addCandidate,
  updateCandidate,
  deleteCandidate,
  listElections,
  getResults,
  downloadResultsCSV
} = require('../controllers/electionController');

// Admin routes
router.post('/', auth, authorizeRoles('admin'), createElection);
router.post('/:electionId/candidates', auth, authorizeRoles('admin'), addCandidate);
router.put('/:electionId/candidates/:candidateId', auth, authorizeRoles('admin'), updateCandidate);
router.delete('/:electionId/candidates/:candidateId', auth, authorizeRoles('admin'), deleteCandidate);
router.get('/', auth, authorizeRoles('admin'), listElections);
router.get('/:electionId/results', auth, authorizeRoles('admin'), getResults);
router.get('/:electionId/results/csv', auth, authorizeRoles('admin'), downloadResultsCSV);

module.exports = router;
