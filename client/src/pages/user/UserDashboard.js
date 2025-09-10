import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const UserDashboard = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchDashboardData();
    }
  }, [authLoading, isAuthenticated]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/user/dashboard');
      setDashboardData(response.data.data);
    } catch (error) {
      const message = error.response?.status === 401
        ? 'Session expired or unauthorized. Please log in again.'
        : 'Failed to load dashboard data';
      setError(message);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleWasteSegregation = async () => {
    try {
      // Simulate waste segregation with dummy data
      const wasteTypes = ['organic', 'plastic', 'paper', 'metal', 'glass', 'electronic'];
      const randomType = wasteTypes[Math.floor(Math.random() * wasteTypes.length)];
      const amount = Math.floor(Math.random() * 6) + 1; // 1-6 items

      const response = await axios.post('/api/user/segregate', {
        binId: `BIN_${Date.now()}`,
        wasteType: randomType,
        amount: amount,
        unit: 'pieces'
      });

      if (response.data.success) {
        toast.success(`Waste segregated successfully! Accuracy: ${response.data.data.accuracy.toFixed(1)}%`);
        fetchDashboardData(); // Refresh dashboard data
      }
    } catch (error) {
      toast.error('Failed to record waste segregation');
    }
  };

  const resetMonthlyStats = async () => {
    try {
      await axios.post('/api/user/reset-stats');
      toast.success('Monthly stats reset successfully');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to reset monthly stats');
    }
  };

  if (loading || authLoading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading dashboard...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          {error}
          <Button variant="outline-danger" size="sm" className="ms-3" onClick={fetchDashboardData}>
            Retry
          </Button>
        </Alert>
      </Container>
    );
  }

  const { monthlyStats, userStats, recentRecords } = dashboardData || {};

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <h1 className="display-6 fw-bold">Welcome back, {user?.name}!</h1>
          <p className="text-muted">Track your waste segregation progress and environmental impact.</p>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <Row className="align-items-center">
                <Col md={8}>
                  <h5 className="mb-2">Quick Actions</h5>
                  <p className="text-muted mb-0">Test the waste segregation system with dummy data</p>
                </Col>
                <Col md={4} className="text-md-end">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleWasteSegregation}
                    className="me-2"
                  >
                    <i className="bi bi-recycle me-2"></i>
                    Segregate Waste
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="lg"
                    onClick={resetMonthlyStats}
                    title="Reset monthly statistics (for testing)"
                  >
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Reset Stats
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col lg={3} md={6} className="mb-4">
          <Card className="stats-card bg-primary text-white h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h3 className="mb-1">{userStats?.monthlyPoints || 0}</h3>
                  <p className="mb-0">Monthly Points</p>
                </div>
                <i className="bi bi-trophy fs-1 opacity-75"></i>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={3} md={6} className="mb-4">
          <Card className="stats-card bg-success text-white h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h3 className="mb-1">{userStats?.monthlyAccuracy?.toFixed(1) || 0}%</h3>
                  <p className="mb-0">Monthly Accuracy</p>
                </div>
                <i className="bi bi-bullseye fs-1 opacity-75"></i>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={3} md={6} className="mb-4">
          <Card className="stats-card bg-warning text-white h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h3 className="mb-1">{userStats?.totalWasteAmount?.toFixed(0) || 0} items</h3>
                  <p className="mb-0">Total Quantity</p>
                </div>
                <i className="bi bi-trash fs-1 opacity-75"></i>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={3} md={6} className="mb-4">
          <Card className="stats-card bg-info text-white h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h3 className="mb-1">{userStats?.segregationEfficiency?.toFixed(1) || 0}%</h3>
                  <p className="mb-0">Efficiency</p>
                </div>
                <i className="bi bi-graph-up fs-1 opacity-75"></i>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Monthly Overview */}
      <Row className="mb-4">
        <Col lg={8}>
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">Monthly Overview</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span>Quantity Segregated</span>
                      <span className="fw-bold">{monthlyStats?.totalWaste || 0} items</span>
                    </div>
                    <div className="progress">
                      <div 
                        className="progress-bar bg-primary" 
                        style={{ width: `${Math.min((monthlyStats?.totalWaste || 0) * 10, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span>Average Accuracy</span>
                      <span className="fw-bold">{monthlyStats?.avgAccuracy?.toFixed(1) || 0}%</span>
                    </div>
                    <div className="progress">
                      <div 
                        className="progress-bar bg-success" 
                        style={{ width: `${monthlyStats?.avgAccuracy || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </Col>
                
                <Col md={6}>
                  <div className="text-center">
                    <h4 className="text-primary mb-3">{monthlyStats?.recordCount || 0}</h4>
                    <p className="text-muted mb-0">Total Records This Month</p>
                    <hr />
                    <h4 className="text-success mb-3">{monthlyStats?.totalPoints || 0}</h4>
                    <p className="text-muted mb-0">Points Earned This Month</p>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4}>
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">Quick Links</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button as={Link} to="/user/history" variant="outline-primary" className="text-start">
                  <i className="bi bi-clock-history me-2"></i>
                  View History
                </Button>
                <Button as={Link} to="/user/leaderboard" variant="outline-success" className="text-start">
                  <i className="bi bi-trophy me-2"></i>
                  Leaderboard
                </Button>
                <Button as={Link} to="/user/feedback" variant="outline-warning" className="text-start">
                  <i className="bi bi-chat-dots me-2"></i>
                  Send Feedback
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Records */}
      <Row>
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Waste Records</h5>
              <Button as={Link} to="/user/history" variant="outline-primary" size="sm">
                View All
              </Button>
            </Card.Header>
            <Card.Body>
              {recentRecords && recentRecords.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Waste Type</th>
                        <th>Amount</th>
                        <th>Accuracy</th>
                        <th>Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentRecords.map((record, index) => (
                        <tr key={index}>
                          <td>{new Date(record.timestamp).toLocaleDateString()}</td>
                          <td>
                            <span className={`waste-type-badge waste-type-${record.wasteType}`}>
                              {record.wasteType}
                            </span>
                          </td>
                          <td>{record.amount} {record.unit}</td>
                          <td>
                            <span className={`badge ${record.accuracy >= 90 ? 'bg-success' : record.accuracy >= 70 ? 'bg-warning' : 'bg-danger'}`}>
                              {record.accuracy.toFixed(1)}%
                            </span>
                          </td>
                          <td>{record.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-inbox display-4 text-muted"></i>
                  <p className="text-muted mt-3">No waste records yet. Start segregating waste to see your progress!</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default UserDashboard;
