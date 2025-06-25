import React from "react";

const ElectionList = ({ elections, onSelect, showStatus = false }) => (
  <div className="space-y-4">
    {elections.map((election) => (
      <div key={election._id} className="p-4 rounded shadow bg-white flex items-center justify-between">
        <div>
          <div className="font-bold text-lg">{election.title}</div>
          <div className="text-gray-500">Deadline: {new Date(election.deadline).toLocaleString()}</div>
          {showStatus && (
            <div className={`mt-1 text-xs ${new Date(election.deadline) > new Date() ? 'text-green-600' : 'text-red-600'}`}>{new Date(election.deadline) > new Date() ? 'Active' : 'Closed'}</div>
          )}
        </div>
        <button className="bg-blue-600 text-white px-4 py-1 rounded" onClick={() => onSelect(election)}>
          View
        </button>
      </div>
    ))}
  </div>
);

export default ElectionList;
