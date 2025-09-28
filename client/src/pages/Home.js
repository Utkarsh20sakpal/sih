import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  const features = [
    {
      icon: 'bi-cpu',
      title: 'Smart Detection',
      description: 'AI-powered waste type detection using advanced sensors and machine learning algorithms.'
    },
    {
      icon: 'bi-graph-up',
      title: 'Real-time Analytics',
      description: 'Monitor waste segregation efficiency and track environmental impact in real-time.'
    },
    {
      icon: 'bi-geo-alt',
      title: 'Route Optimization',
      description: 'Intelligent route planning for waste collection to reduce fuel consumption and time.'
    },
    {
      icon: 'bi-people',
      title: 'Multi-user System',
      description: 'Separate dashboards for users, supervisors, and collectors with role-based access.'
    },
    {
      icon: 'bi-shield-check',
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with encrypted data transmission and secure authentication.'
    },
    {
      icon: 'bi-recycle',
      title: 'Environmental Impact',
      description: 'Track and improve waste segregation rates to contribute to a cleaner environment.'
    }
  ];

  const stats = [
    { number: '95%', label: 'Segregation Accuracy' },
    { number: '50+', label: 'Active Bins' },
    { number: '1000+', label: 'Users' },
    { number: '24/7', label: 'Monitoring' }
  ];

  const getDashboardPath = () => {
    const roleRaw = user?.userType;
    const role = typeof roleRaw === 'string' && roleRaw.trim() ? roleRaw : 'user';
    return `/${role}/dashboard`;
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section bg-primary text-white py-5">
        <Container>
          <Row className="align-items-center min-vh-50">
            <Col lg={6} className="mb-4 mb-lg-0">
              <h1 className="display-4 fw-bold mb-4">
                Smart Waste Management
                <br />
                <span className="text-warning">Made Simple</span>
              </h1>
              <p className="lead mb-4">
                Revolutionize waste segregation with our IoT-powered system. 
                Monitor, manage, and optimize waste collection with cutting-edge technology.
              </p>
              <div className="d-flex flex-wrap gap-3">
                {isAuthenticated ? (
                  <Button
                    as={Link}
                    to={getDashboardPath()}
                    variant="warning"
                    size="lg"
                    className="px-4"
                  >
                    Go to Dashboard
                  </Button>
                ) : (
                  <>
                    <Button
                      as={Link}
                      to="/register"
                      variant="warning"
                      size="lg"
                      className="px-4"
                    >
                      Get Started
                    </Button>
                    <Button
                      as={Link}
                      to="/login"
                      variant="outline-light"
                      size="lg"
                      className="px-4"
                    >
                      Login
                    </Button>
                  </>
                )}
              </div>
            </Col>
            <Col lg={6}>
              <div className="text-center">
                <div className="hero-image bg-white rounded-4 p-4 shadow-lg">
                  <img src="https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=1200&auto=format&fit=crop" alt="Recycling" className="img-fluid rounded-3 mb-3" />
                  <div className="d-flex justify-content-center gap-3">
                    <img src="https://images.unsplash.com/photo-1528323273322-d81458248d40?q=80&w=400&auto=format&fit=crop" alt="Smart Bin" className="rounded-circle" style={{ width: '70px', height: '70px', objectFit: 'cover' }} />
                    <img src="https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?q=80&w=400&auto=format&fit=crop" alt="Sensors" className="rounded-circle" style={{ width: '70px', height: '70px', objectFit: 'cover' }} />
                    <img src="https://images.unsplash.com/photo-1496309732348-3627f3f040ee?q=80&w=400&auto=format&fit=crop" alt="Environment" className="rounded-circle" style={{ width: '70px', height: '70px', objectFit: 'cover' }} />
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Stats Section */}
      <section className="py-5 bg-light">
        <Container>
          <Row className="text-center">
            {stats.map((stat, index) => (
              <Col md={3} key={index} className="mb-4">
                <div className="stats-item">
                  <h2 className="display-6 fw-bold text-primary">{stat.number}</h2>
                  <p className="text-muted mb-0">{stat.label}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-5">
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <h2 className="display-5 fw-bold mb-3">Why Choose PixelBin?</h2>
              <p className="lead text-muted">
                Advanced IoT technology meets environmental responsibility
              </p>
            </Col>
          </Row>
          
          <Row>
            {features.map((feature, index) => (
              <Col lg={4} md={6} key={index} className="mb-4">
                <div className="card h-100 border-0 shadow-sm hover-shadow">
                  <div className="card-body text-center p-4">
                    <div className="feature-icon bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                         style={{ width: '70px', height: '70px' }}>
                      <i className={`bi ${feature.icon} fs-3`}></i>
                    </div>
                    <h5 className="card-title fw-bold">{feature.title}</h5>
                    <p className="card-text text-muted">{feature.description}</p>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* User Types Section */}
      <section className="py-5 bg-light">
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <h2 className="display-5 fw-bold mb-3">For Everyone</h2>
              <p className="lead text-muted">
                Tailored experiences for different user roles
              </p>
            </Col>
          </Row>
          
          <Row>
            <Col lg={4} className="mb-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="user-icon bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                       style={{ width: '60px', height: '60px' }}>
                    <i className="bi bi-person fs-4"></i>
                  </div>
                  <h5 className="card-title fw-bold">Users</h5>
                  <p className="card-text text-muted mb-4">
                    Track your waste segregation, earn points, and contribute to environmental sustainability.
                  </p>
                  <ul className="list-unstyled text-center">
                    <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Monthly accuracy tracking</li>
                    <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Points and leaderboard</li>
                    <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Waste history</li>
                    <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Feedback system</li>
                  </ul>
                </div>
              </div>
            </Col>
            
            <Col lg={4} className="mb-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="user-icon bg-warning text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                       style={{ width: '60px', height: '60px' }}>
                    <i className="bi bi-eye fs-4"></i>
                  </div>
                  <h5 className="card-title fw-bold">Supervisors</h5>
                  <p className="card-text text-muted mb-4">
                    Monitor system performance, manage collectors, and oversee operations.
                  </p>
                  <ul className="list-unstyled text-center">
                    <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Real-time bin monitoring</li>
                    <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Collector management</li>
                    <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Performance analytics</li>
                    <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Issue management</li>
                  </ul>
                </div>
              </div>
            </Col>
            
            <Col lg={4} className="mb-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="user-icon bg-info text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                       style={{ width: '60px', height: '60px' }}>
                    <i className="bi bi-truck fs-4"></i>
                  </div>
                  <h5 className="card-title fw-bold">Collectors</h5>
                  <p className="card-text text-muted mb-4">
                    Optimize collection routes, track bin status, and manage daily operations.
                  </p>
                  <ul className="list-unstyled text-center">
                    <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Interactive maps</li>
                    <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Route optimization</li>
                    <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Bin status tracking</li>
                    <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Collection history</li>
                  </ul>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-5 bg-primary text-white">
        <Container>
          <Row className="text-center">
            <Col>
              <h2 className="display-5 fw-bold mb-3">Ready to Get Started?</h2>
              <p className="lead mb-4">
                Join thousands of users already making a difference with smart waste management.
              </p>
              {!isAuthenticated && (
                <div className="d-flex justify-content-center gap-3">
                  <Button
                    as={Link}
                    to="/register"
                    variant="warning"
                    size="lg"
                    className="px-4"
                  >
                    Create Account
                  </Button>
                  <Button
                    as={Link}
                    to="/login"
                    variant="outline-light"
                    size="lg"
                    className="px-4"
                  >
                    Sign In
                  </Button>
                </div>
              )}
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default Home;
