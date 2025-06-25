import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getActiveElections, castVote } from "../services/api";
import CountdownTimer from "../components/CountdownTimer";

const Vote = () => {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [selected, setSelected] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getActiveElections()
      .then(res => {
        const found = res.data.find(e => e._id === electionId);
        setElection(found);
      })
      .catch(() => setElection(null));
  }, [electionId]);

  const handleVote = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await castVote(electionId, { candidateId: selected });
      setSuccess("Vote cast successfully!");
      setTimeout(() => navigate(`/results/${electionId}`), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to vote");
    } finally {
      setLoading(false);
    }
  };

  if (!election) {
    return <div className="p-8">Election not found or not active.</div>;
  }

  const isClosed = new Date(election.deadline) < new Date();

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Vote: {election.title}</h2>
      <CountdownTimer deadline={election.deadline} />
      {isClosed && <div className="text-red-600 mt-2">Voting is closed for this election.</div>}
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">{success}</div>}
      <form onSubmit={handleVote} className="space-y-4 mt-4">
        {election.candidates.length === 0 ? (
          <div>No candidates available.</div>
        ) : (
          election.candidates.map((c) => (
            <label key={c._id} className="flex items-center gap-2">
              <input
                type="radio"
                name="candidate"
                value={c._id}
                checked={selected === c._id}
                onChange={() => setSelected(c._id)}
                disabled={isClosed || loading}
                required
              />
              {c.name}
            </label>
          ))
        )}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded mt-4"
          disabled={isClosed || loading || !selected}
        >
          {loading ? "Submitting..." : "Cast Vote"}
        </button>
      </form>
    </div>
  );
};

export default Vote;
