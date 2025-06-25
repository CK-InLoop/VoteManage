import React from "react";

const CandidateList = ({ candidates, onEdit, onDelete, editable }) => (
  <div className="space-y-2">
    {candidates.map((c) => (
      <div key={c._id} className="flex items-center justify-between p-2 border rounded">
        <span>{c.name}</span>
        {editable && (
          <div className="space-x-2">
            <button className="bg-yellow-500 text-white px-2 py-1 rounded" onClick={() => onEdit(c)}>
              Edit
            </button>
            <button className="bg-red-600 text-white px-2 py-1 rounded" onClick={() => onDelete(c)}>
              Delete
            </button>
          </div>
        )}
      </div>
    ))}
  </div>
);

export default CandidateList;
