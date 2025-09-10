import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const SupervisorDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/supervisor/dashboard');
      setDashboardData(response.data.data);
    } catch (error) {
      setError('Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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

  const { overview, collectors, bins, recentRecords } = dashboardData || {};

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <h1 className="display-6 fw-bold">Supervisor Dashboard</h1>
          <p className="text-muted">Monitor and manage the waste segregation system</p>
        </Col>
      </Row>

      {/* Overview Stats */}
      <Row className="mb-4">
        <Col lg={3} md={6} className="mb-4">
          <Card className="stats-card bg-primary text-white h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h3 className="mb-1">{overview?.totalBins || 0}</h3>
                  <p className="mb-0">Total Bins</p>
                </div>
                <i className="bi bi-trash fs-1 opacity-75"></i>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={3} md={6} className="mb-4">
          <Card className="stats-card bg-warning text-white h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h3 className="mb-1">{overview?.fullBins || 0}</h3>
                  <p className="mb-0">Full Bins</p>
                </div>
                <i className="bi bi-exclamation-triangle fs-1 opacity-75"></i>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={3} md={6} className="mb-4">
          <Card className="stats-card bg-info text-white h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h3 className="mb-1">{overview?.activeCollectors || 0}</h3>
                  <p className="mb-0">Active Collectors</p>
                </div>
                <i className="bi bi-people fs-1 opacity-75"></i>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={3} md={6} className="mb-4">
          <Card className="stats-card bg-success text-white h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h3 className="mb-1">{overview?.collectionEfficiency?.toFixed(1) || 0}%</h3>
                  <p className="mb-0">Collection Efficiency</p>
                </div>
                <i className="bi bi-graph-up fs-1 opacity-75"></i>
              </div>
            </Card.Body>
          </Card>
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
                  <p className="text-muted mb-0">Manage collectors, bins, and monitor system performance</p>
                </Col>
                <Col md={4} className="text-md-end">
                  <Button as={Link} to="/supervisor/collectors" variant="primary" className="me-2">
                    <i className="bi bi-people me-2"></i>
                    Manage Collectors
                  </Button>
                  <Button as={Link} to="/supervisor/bins" variant="outline-primary">
                    <i className="bi bi-trash me-2"></i>
                    View Bins
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Collectors Status */}
        <Col lg={6} className="mb-4">
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">Collectors Status</h5>
            </Card.Header>
            <Card.Body>
              {collectors && collectors.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Assigned Bins</th>
                        <th>Last Login</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {collectors.slice(0, 5).map((collector, index) => (
                        <tr key={index}>
                          <td>{collector.name}</td>
                          <td>{collector.assignedBins?.length || 0}</td>
                          <td>
                            {new Date(collector.lastLogin).toLocaleDateString()}
                          </td>
                          <td>
                            <span className={`badge ${new Date() - new Date(collector.lastLogin) < 24 * 60 * 60 * 1000 ? 'bg-success' : 'bg-warning'}`}>
                              {new Date() - new Date(collector.lastLogin) < 24 * 60 * 60 * 1000 ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-people display-4 text-muted"></i>
                  <p className="text-muted mt-3">No collectors found</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Bin Status */}
        <Col lg={6} className="mb-4">
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">Bin Status Overview</h5>
            </Card.Header>
            <Card.Body>
              {bins && bins.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Bin ID</th>
                        <th>Type</th>
                        <th>Fill Level</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bins.slice(0, 5).map((bin, index) => (
                        <tr key={index}>
                          <td>{bin.binId}</td>
                          <td>
                            <span className={`waste-type-badge waste-type-${bin.wasteType}`}>
                              {bin.wasteType}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="progress me-2" style={{ width: '60px', height: '8px' }}>
                                <div 
                                  className={`progress-bar ${bin.fillLevel >= 90 ? 'bg-danger' : bin.fillLevel >= 75 ? 'bg-warning' : 'bg-success'}`}
                                  style={{ width: `${bin.fillLevel}%` }}
                                ></div>
                              </div>
                              <small>{bin.fillLevel.toFixed(1)}%</small>
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${bin.status === 'active' ? 'bg-success' : bin.status === 'offline' ? 'bg-danger' : 'bg-warning'}`}>
                              {bin.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-trash display-4 text-muted"></i>
                  <p className="text-muted mt-3">No bins found</p>
                </div>
              )}
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
              <Button as={Link} to="/supervisor/feedback" variant="outline-primary" size="sm">
                View Feedback
              </Button>
            </Card.Header>
            <Card.Body>
              {recentRecords && recentRecords.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>User</th>
                        <th>Waste Type</th>
                        <th>Amount</th>
                        <th>Accuracy</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentRecords.map((record, index) => (
                        <tr key={index}>
                          <td>{new Date(record.timestamp).toLocaleDateString()}</td>
                          <td>{record.userId?.name || 'Unknown'}</td>
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
                          <td>
                            <span className={`badge ${record.collectionStatus === 'collected' ? 'bg-success' : 'bg-warning'}`}>
                              {record.collectionStatus || 'Pending'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-inbox display-4 text-muted"></i>
                  <p className="text-muted mt-3">No recent records</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SupervisorDashboard;
