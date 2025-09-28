import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const role = user?.userType || 'user';
  return (
    <nav className="navbar">
      <Link className="navbar-brand" to="/">PixelBin</Link>
      <div className="spacer" />
      {isAuthenticated ? (
        <>
          <Link to="/dashboard">Dashboard</Link>
          <div className="dropdown">
            <button className="dropdown-toggle">{user?.name || 'User'}</button>
            <div className="dropdown-menu">
              <Link to="/profile">Profile</Link>
              {role === 'user' && <Link to="/user/history">History</Link>}
              <button onClick={logout}>Logout</button>
            </div>
          </div>
        </>
      ) : (
        <>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </>
      )}
    </nav>
  );
};

export default Navbar;


