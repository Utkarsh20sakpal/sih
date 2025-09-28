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
      // Graceful fallback: synthesize a minimal dashboard using mock-like data
      const fallback = {
        monthlyStats: {
          totalWaste: 3,
          avgAccuracy: 89.5,
          totalPoints: 75,
          recordCount: 2
        },
        userStats: {
          monthlyPoints: 150,
          monthlyAccuracy: 85.5,
          totalWasteAmount: 25.3,
          segregationEfficiency: 87.2
        },
        recentRecords: [
          {
            timestamp: new Date().toISOString(),
            wasteType: 'organic',
            amount: 2,
            unit: 'items',
            accuracy: 92.3,
            points: 20
          },
          {
            timestamp: new Date(Date.now() - 3600 * 1000).toISOString(),
            wasteType: 'plastic',
            amount: 1,
            unit: 'items',
            accuracy: 86.1,
            points: 10
          }
        ]
      };
      setDashboardData(fallback);
      setError(null);
      toast.info('Loaded demo dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleWasteSegregation = async () => {
    // Simulate waste segregation with dummy data
    const wasteTypes = ['organic', 'plastic', 'paper', 'metal', 'glass', 'electronic'];
    const randomType = wasteTypes[Math.floor(Math.random() * wasteTypes.length)];
    const amount = Math.floor(Math.random() * 6) + 1; // 1-6 items
    // Optimistic UI update so the dashboard reflects the action immediately
    const optimisticAccuracy = 80 + Math.random() * 20;
    const optimisticPoints = Math.round(optimisticAccuracy * 0.1 * 1);
    setDashboardData(prev => {
      const previous = prev || { recentRecords: [], monthlyStats: { totalWaste: 0, totalPoints: 0, avgAccuracy: 0, recordCount: 0 }, userStats: {} };
      const newRecord = {
        timestamp: new Date().toISOString(),
        wasteType: randomType,
        amount,
        unit: 'pieces',
        accuracy: optimisticAccuracy,
        points: optimisticPoints
      };
      const recentRecords = [newRecord, ...(previous.recentRecords || [])].slice(0, 5);
      const recordCount = (previous.monthlyStats?.recordCount || 0) + 1;
      const totalWaste = (previous.monthlyStats?.totalWaste || 0) + amount;
      const totalPoints = (previous.monthlyStats?.totalPoints || 0) + optimisticPoints;
      const avgAccuracy = ((previous.monthlyStats?.avgAccuracy || 0) * (recordCount - 1) + optimisticAccuracy) / recordCount;
      const prevUserStats = previous.userStats || {};
      const updatedUserStats = {
        ...prevUserStats,
        monthlyPoints: (prevUserStats.monthlyPoints || 0) + optimisticPoints,
        monthlyAccuracy: avgAccuracy,
        totalWasteAmount: (prevUserStats.totalWasteAmount || 0) + amount,
        segregationEfficiency: avgAccuracy
      };
      return {
        ...previous,
        recentRecords,
        monthlyStats: { totalWaste, totalPoints, avgAccuracy, recordCount },
        userStats: updatedUserStats
      };
    });
    toast.info('Recorded demo segregation');
    try {
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
      // Keep optimistic state; optionally log error
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
  const safeMonthlyAccuracy = Number.isFinite(userStats?.monthlyAccuracy) ? userStats.monthlyAccuracy : 0;
  const safeTotalWasteAmount = Number.isFinite(userStats?.totalWasteAmount) ? userStats.totalWasteAmount : 0;
  const safeSegregationEfficiency = Number.isFinite(userStats?.segregationEfficiency) ? userStats.segregationEfficiency : 0;

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
              <Row className="align-items-center g-3">
                <Col xs={12} md={8}>
                  <h5 className="mb-2">Quick Actions</h5>
                  <p className="text-muted mb-0">Test the waste segregation system with dummy data</p>
                </Col>
                <Col xs={12} md={4}>
                  <div className="d-flex justify-content-md-end justify-content-start align-items-center gap-2">
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleWasteSegregation}
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
                  </div>
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
                  <h3 className="mb-1">{(Number.isFinite(safeMonthlyAccuracy) ? safeMonthlyAccuracy.toFixed(1) : '0.0')}%</h3>
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
                  <h3 className="mb-1">{(Number.isFinite(safeTotalWasteAmount) ? safeTotalWasteAmount.toFixed(0) : '0')} items</h3>
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
                  <h3 className="mb-1">{(Number.isFinite(safeSegregationEfficiency) ? safeSegregationEfficiency.toFixed(1) : '0.0')}%</h3>
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
                <Button as={Link} to="/user/rewards" variant="outline-warning" className="text-start">
                  <i className="bi bi-gift me-2"></i>
                  Rewards
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
