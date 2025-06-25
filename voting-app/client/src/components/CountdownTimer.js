import React, { useEffect, useState } from "react";

const CountdownTimer = ({ deadline }) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = new Date(deadline) - new Date();
      if (diff <= 0) {
        setTimeLeft("Election ended");
        clearInterval(interval);
        return;
      }
      const h = Math.floor(diff / 1000 / 60 / 60);
      const m = Math.floor((diff / 1000 / 60) % 60);
      const s = Math.floor((diff / 1000) % 60);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  return <div className="text-sm text-gray-600">{timeLeft}</div>;
};

export default CountdownTimer;
