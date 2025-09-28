import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();
  return (
    <div className="container">
      <h1>PixelBin</h1>
      <p>Smart waste segregation demo app.</p>
      {isAuthenticated ? (
        <Link to="/dashboard">Go to Dashboard</Link>
      ) : (
        <>
          <Link to="/register" style={{ marginRight: 12 }}>Get Started</Link>
          <Link to="/login">Login</Link>
        </>
      )}
    </div>
  );
};

export default Home;
