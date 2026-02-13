import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Navbar as BootstrapNavbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import ThemeToggle from '../common/ThemeToggle';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setExpanded(false);
  };

  const handleNavClick = () => {
    setExpanded(false);
  };

  const getDashboardPath = () => {
    if (!user) return '/';
    const role = typeof user.userType === 'string' && user.userType.trim() ? user.userType : 'user';
    return `/${role}/dashboard`;
  };

  const getUserMenuItems = () => {
    const baseItems = [
      { label: 'Profile', path: '/profile' }
    ];

    const role = typeof user?.userType === 'string' && user.userType.trim() ? user.userType : 'user';
    switch (role) {
      case 'user':
        return [
          ...baseItems,
          { label: 'History', path: '/user/history' },
          { label: 'Leaderboard', path: '/user/leaderboard' },
          { label: 'Rewards', path: '/user/rewards' },
          { label: 'Feedback', path: '/user/feedback' }
        ];
      case 'supervisor':
        return [
          ...baseItems,
          { label: 'Collectors', path: '/supervisor/collectors' },
          { label: 'Bins', path: '/supervisor/bins' },
          { label: 'Feedback', path: '/supervisor/feedback' }
        ];
      case 'collector':
        return [
          ...baseItems,
          { label: 'Map', path: '/collector/map' },
          { label: 'History', path: '/collector/history' }
        ];
      default:
        return baseItems;
    }
  };

  const getRoleLabel = () => {
    const raw = user?.userType;
    const role = typeof raw === 'string' ? raw.trim() : '';
    if (!role || role.toLowerCase() === 'undefined' || role.toLowerCase() === 'null' || role.toLowerCase() === 'nan') {
      return 'User';
    }
    const first = role.charAt(0).toUpperCase();
    return `${first}${role.slice(1)}`;
  };

  return (
    <BootstrapNavbar 
      bg={theme === 'dark' ? 'dark' : 'light'} 
      variant={theme === 'dark' ? 'dark' : 'light'}
      expand="lg" 
      className="navbar-glass shadow-soft"
      expanded={expanded}
      onToggle={() => setExpanded(!expanded)}
    >
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/" className="fw-bold text-primary">
          <i className="bi bi-recycle me-2"></i>
          PixelBin
        </BootstrapNavbar.Brand>

        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" onClick={handleNavClick}>
              Home
            </Nav.Link>
            <Nav.Link as={Link} to="/customer-care" onClick={handleNavClick}>
              Customer Care
            </Nav.Link>
            <Nav.Link as={Link} to="/safai-master" onClick={handleNavClick}>
              Safai Master
            </Nav.Link>
          </Nav>

          <Nav className="ms-auto d-flex align-items-center">
            {/* Theme Toggle */}
            <div className="me-2">
              <ThemeToggle size="sm" />
            </div>

            {isAuthenticated ? (
              <>
                {/* Dashboard Link */}
                <Nav.Link as={Link} to={getDashboardPath()} onClick={handleNavClick}>
                  Dashboard
                </Nav.Link>

                {/* User Menu */}
                <NavDropdown
                  title={
                    <span>
                      <i className="bi bi-person-circle me-1"></i>
                      {user?.name || 'User'}
                    </span>
                  }
                  id="user-dropdown"
                  align="end"
                  menuVariant={theme === 'dark' ? 'dark' : 'light'}
                  renderMenuOnMount
                  show={expanded ? undefined : undefined}
                >
                  <NavDropdown.Header>
                    <small className="text-muted">{getRoleLabel()}</small>
                  </NavDropdown.Header>
                  <NavDropdown.Divider />
                  
                  {getUserMenuItems().map((item, index) => (
                    <NavDropdown.Item
                      key={index}
                      as={Link}
                      to={item.path}
                      onClick={handleNavClick}
                    >
                      {item.label}
                    </NavDropdown.Item>
                  ))}
                  
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Logout
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" onClick={handleNavClick}>
                  Login
                </Nav.Link>
                <Nav.Link as={Link} to="/register" onClick={handleNavClick}>
                  Register
                </Nav.Link>
              </>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;
