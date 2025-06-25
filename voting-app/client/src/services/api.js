import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const login = (data) => api.post("/auth/login", data);
export const register = (data) => api.post("/auth/register", data);

// Admin
export const createElection = (data) => api.post("/elections", data);
export const getElections = () => api.get("/elections");
export const addCandidate = (electionId, data) => api.post(`/elections/${electionId}/candidates`, data);
export const updateCandidate = (electionId, candidateId, data) => api.put(`/elections/${electionId}/candidates/${candidateId}`, data);
export const deleteCandidate = (electionId, candidateId) => api.delete(`/elections/${electionId}/candidates/${candidateId}`);
export const getResults = (electionId) => api.get(`/elections/${electionId}/results`);
export const downloadResultsCSV = (electionId) => api.get(`/elections/${electionId}/results/csv`, { responseType: 'blob' });

// Voter
export const getActiveElections = () => api.get("/vote/elections");
export const castVote = (electionId, data) => api.post(`/vote/elections/${electionId}/vote`, data);
export const getElectionResults = (electionId) => api.get(`/vote/elections/${electionId}/results`);

export default api;
