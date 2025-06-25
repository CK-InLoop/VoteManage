import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getElectionResults, getResults, downloadResultsCSV } from "../services/api";
import ResultChart from "../components/ResultChart";

const Results = () => {
  const { electionId } = useParams();
  const user = JSON.parse(localStorage.getItem("user"));
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [beforeDeadline, setBeforeDeadline] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setError("");
      try {
        let res;
        if (user.role === "admin") {
          res = await getResults(electionId);
        } else {
          res = await getElectionResults(electionId);
        }
        setResults(res.data.results);
        setTitle(res.data.election);
        setBeforeDeadline(false);
      } catch (err) {
        if (err.response?.status === 403) {
          setBeforeDeadline(true);
        } else {
          setError("Failed to fetch results");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [electionId, user.role]);

  const handleDownloadCSV = async () => {
    try {
      const res = await downloadResultsCSV(electionId);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${title}_results.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError("Failed to download CSV");
    }
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Results: {title}</h2>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {beforeDeadline && <div className="text-yellow-600">Results will be available after the election deadline.</div>}
      {results && (
        <>
          <ResultChart results={results} />
          {user.role === "admin" && (
            <button className="mt-4 bg-gray-700 text-white px-3 py-1 rounded" onClick={handleDownloadCSV}>Download CSV</button>
          )}
        </>
      )}
    </div>
  );
};

export default Results;
