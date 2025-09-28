import React, { useState } from 'react';

const Dashboard = () => {
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState({ total: 0, points: 0, avg: 0, count: 0 });

  const segregate = () => {
    const types = ['organic', 'plastic', 'paper', 'metal', 'glass', 'electronic'];
    const wasteType = types[Math.floor(Math.random() * types.length)];
    const amount = Math.floor(Math.random() * 6) + 1;
    const accuracy = 80 + Math.random() * 20;
    const points = Math.round(accuracy * 0.1);
    const rec = { ts: Date.now(), wasteType, amount, accuracy, points };
    const next = [rec, ...records].slice(0, 5);
    const nextCount = stats.count + 1;
    const nextTotal = stats.total + amount;
    const nextPoints = stats.points + points;
    const nextAvg = ((stats.avg * stats.count) + accuracy) / nextCount;
    setRecords(next);
    setStats({ total: nextTotal, points: nextPoints, avg: nextAvg, count: nextCount });
  };

  return (
    <div className="container">
      <h1>Dashboard</h1>
      <button onClick={segregate}>Segregate Waste</button>
      <div className="stats">
        <div>Monthly Points: {stats.points}</div>
        <div>Monthly Accuracy: {stats.avg.toFixed(1)}%</div>
        <div>Total Quantity: {stats.total} items</div>
        <div>Records: {stats.count}</div>
      </div>
      <h3>Recent Records</h3>
      <ul>
        {records.map(r => (
          <li key={r.ts}>{new Date(r.ts).toLocaleString()} - {r.wasteType} - {r.amount} - {r.accuracy.toFixed(1)}% - {r.points}</li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;


