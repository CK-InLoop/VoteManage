import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getElections, createElection, addCandidate, updateCandidate, deleteCandidate, getResults, downloadResultsCSV, getActiveElections } from "../services/api";
import ElectionList from "../components/ElectionList";
import CandidateList from "../components/CandidateList";
import CountdownTimer from "../components/CountdownTimer";
import ResultChart from "../components/ResultChart";

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: "", deadline: "" });
  const [candidateName, setCandidateName] = useState("");

  // Fetch elections
  useEffect(() => {
    if (user.role === "admin") {
      getElections().then(res => setElections(res.data)).catch(() => setElections([]));
    } else {
      getActiveElections().then(res => setElections(res.data)).catch(() => setElections([]));
    }
  }, [user.role]);

  // Admin: Create election
  const handleCreateElection = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await createElection(form);
      setForm({ title: "", deadline: "" });
      const res = await getElections();
      setElections(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create election");
    }
  };

  // Admin: Select election to manage candidates/results
  const handleSelectElection = (election) => {
    setSelectedElection(election);
    setCandidates(election.candidates || []);
    setResults(null);
  };

  // Admin: Add candidate
  const handleAddCandidate = async () => {
    if (!candidateName) return;
    try {
      await addCandidate(selectedElection._id, { name: candidateName });
      const res = await getElections();
      setElections(res.data);
      const updated = res.data.find(e => e._id === selectedElection._id);
      setSelectedElection(updated);
      setCandidates(updated.candidates);
      setCandidateName("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add candidate");
    }
  };

  // Admin: Edit candidate
  const handleEditCandidate = async (candidate) => {
    const newName = prompt("Edit candidate name:", candidate.name);
    if (!newName) return;
    try {
      await updateCandidate(selectedElection._id, candidate._id, { name: newName });
      const res = await getElections();
      setElections(res.data);
      const updated = res.data.find(e => e._id === selectedElection._id);
      setSelectedElection(updated);
      setCandidates(updated.candidates);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to edit candidate");
    }
  };

  // Admin: Delete candidate
  const handleDeleteCandidate = async (candidate) => {
    if (!window.confirm("Delete candidate?")) return;
    try {
      await deleteCandidate(selectedElection._id, candidate._id);
      const res = await getElections();
      setElections(res.data);
      const updated = res.data.find(e => e._id === selectedElection._id);
      setSelectedElection(updated);
      setCandidates(updated.candidates);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete candidate");
    }
  };

  // Admin: Get results
  const handleViewResults = async () => {
    try {
      const res = await getResults(selectedElection._id);
      setResults(res.data.results);
    } catch (err) {
      setError("Failed to fetch results");
    }
  };

  // Admin: Download CSV
  const handleDownloadCSV = async () => {
    try {
      const res = await downloadResultsCSV(selectedElection._id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${selectedElection.title}_results.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError("Failed to download CSV");
    }
  };

  // Voter: Select election to vote
  const handleVoterSelectElection = (election) => {
    navigate(`/vote/${election._id}`);
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Dashboard ({user.role})</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {user.role === "admin" ? (
        <>
          <form onSubmit={handleCreateElection} className="mb-6 space-y-2">
            <div className="flex gap-2">
              <input type="text" placeholder="Election Title" required className="border p-2 rounded w-1/2" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              <input type="datetime-local" required className="border p-2 rounded w-1/2" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Create</button>
            </div>
          </form>
          <ElectionList elections={elections} onSelect={handleSelectElection} showStatus />
          {selectedElection && (
            <div className="mt-8 p-4 bg-gray-50 rounded shadow">
              <div className="flex justify-between items-center">
                <div className="font-bold text-lg">{selectedElection.title}</div>
                <CountdownTimer deadline={selectedElection.deadline} />
              </div>
              <h3 className="mt-4 font-semibold">Candidates</h3>
              <CandidateList candidates={candidates} onEdit={handleEditCandidate} onDelete={handleDeleteCandidate} editable />
              <div className="flex gap-2 mt-2">
                <input type="text" placeholder="Add Candidate" className="border p-2 rounded flex-1" value={candidateName} onChange={e => setCandidateName(e.target.value)} />
                <button className="bg-blue-600 text-white px-3 rounded" onClick={handleAddCandidate}>Add</button>
              </div>
              <div className="flex gap-2 mt-4">
                <button className="bg-purple-600 text-white px-3 py-1 rounded" onClick={handleViewResults}>View Results</button>
                <button className="bg-gray-700 text-white px-3 py-1 rounded" onClick={handleDownloadCSV}>Download CSV</button>
              </div>
              {results && <ResultChart results={results} />}
            </div>
          )}
        </>
      ) : (
        <ElectionList elections={elections} onSelect={handleVoterSelectElection} showStatus />
      )}
    </div>
  );
};

export default Dashboard;
