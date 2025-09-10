import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const CollectorDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/collector/dashboard');
      setDashboardData(response.data.data);
    } catch (error) {
      setError('Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCollectBin = async (binId) => {
    try {
      await axios.post('/api/collector/collect-bin', {
        binId,
        wasteRecords: [] // In real app, this would contain actual waste record IDs
      });
      toast.success(`Bin ${binId} marked as collected`);
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to mark bin as collected');
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

  const { overview, assignedBins, todayCollections, pendingCollections } = dashboardData || {};

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h1 className="display-6 fw-bold text-gradient">
            <i className="bi bi-truck me-2"></i>
            Collector Dashboard
          </h1>
          <p className="text-muted">Manage your assigned bins and collection routes efficiently</p>
        </Col>
      </Row>

      {/* Overview Stats */}
      <Row className="mb-4">
        <Col lg={3} md={6} className="mb-4">
          <Card className="h-100 shadow-medium card-hover">
            <Card.Body className="gradient-bg text-white">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h3 className="mb-1">{overview?.totalAssignedBins || 0}</h3>
                  <p className="mb-0">Assigned Bins</p>
                </div>
                <i className="bi bi-trash fs-1 opacity-75"></i>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={3} md={6} className="mb-4">
          <Card className="h-100 shadow-medium card-hover">
            <Card.Body className="gradient-bg-warning text-white">
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
          <Card className="h-100 shadow-medium card-hover">
            <Card.Body className="gradient-bg-success text-white">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h3 className="mb-1">{overview?.todayCollectionCount || 0}</h3>
                  <p className="mb-0">Today's Collections</p>
                </div>
                <i className="bi bi-check-circle fs-1 opacity-75"></i>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={3} md={6} className="mb-4">
          <Card className="h-100 shadow-medium card-hover">
            <Card.Body className="gradient-bg-info text-white">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h3 className="mb-1">{overview?.pendingCollectionCount || 0}</h3>
                  <p className="mb-0">Pending Collections</p>
                </div>
                <i className="bi bi-clock fs-1 opacity-75"></i>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row className="mb-4">
        <Col>
          <Card className="shadow-medium">
            <Card.Header className="gradient-bg text-white">
              <h5 className="mb-0">
                <i className="bi bi-lightning me-2"></i>
                Quick Actions
              </h5>
            </Card.Header>
            <Card.Body className="p-4">
              <Row className="align-items-center">
                <Col md={8}>
                  <h6 className="mb-2">Collection Management</h6>
                  <p className="text-muted mb-0">View maps, optimize routes, and manage collections efficiently</p>
                </Col>
                <Col md={4} className="text-md-end">
                  <Button as={Link} to="/collector/map" variant="primary" className="me-2 btn-gradient">
                    <i className="bi bi-geo-alt me-2"></i>
                    View Map
                  </Button>
                  <Button as={Link} to="/collector/history" variant="outline-primary">
                    <i className="bi bi-clock-history me-2"></i>
                    View History
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Assigned Bins */}
        <Col lg={6} className="mb-4">
          <Card className="h-100 shadow-medium">
            <Card.Header className="gradient-bg-info text-white">
              <h5 className="mb-0">
                <i className="bi bi-trash me-2"></i>
                Assigned Bins
              </h5>
            </Card.Header>
            <Card.Body>
              {assignedBins && assignedBins.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Bin ID</th>
                        <th>Fill Level</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignedBins.slice(0, 5).map((bin, index) => (
                        <tr key={index}>
                          <td>{bin.binId}</td>
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
                            <span className={`badge ${bin.status === 'active' ? 'bg-success' : 'bg-danger'}`}>
                              {bin.status}
                            </span>
                          </td>
                          <td>
                            <Button
                              size="sm"
                              variant="outline-primary"
                              onClick={() => handleCollectBin(bin.binId)}
                              disabled={bin.fillLevel < 50}
                            >
                              Collect
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-trash display-4 text-muted"></i>
                  <p className="text-muted mt-3">No assigned bins</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Today's Collections */}
        <Col lg={6} className="mb-4">
          <Card className="h-100 shadow-medium">
            <Card.Header className="gradient-bg-success text-white">
              <h5 className="mb-0">
                <i className="bi bi-check-circle me-2"></i>
                Today's Collections
              </h5>
            </Card.Header>
            <Card.Body>
              {todayCollections && todayCollections.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Waste Type</th>
                        <th>Amount</th>
                        <th>Accuracy</th>
                      </tr>
                    </thead>
                    <tbody>
                      {todayCollections.slice(0, 5).map((collection, index) => (
                        <tr key={index}>
                          <td>
                            {new Date(collection.collectionDate).toLocaleTimeString()}
                          </td>
                          <td>
                            <span className={`waste-type-badge waste-type-${collection.wasteType}`}>
                              {collection.wasteType}
                            </span>
                          </td>
                          <td>{collection.amount} {collection.unit}</td>
                          <td>
                            <span className={`badge ${collection.accuracy >= 90 ? 'bg-success' : collection.accuracy >= 70 ? 'bg-warning' : 'bg-danger'}`}>
                              {collection.accuracy.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-check-circle display-4 text-muted"></i>
                  <p className="text-muted mt-3">No collections today</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Pending Collections */}
      <Row>
        <Col>
          <Card className="shadow-medium">
            <Card.Header className="gradient-bg-warning text-white">
              <h5 className="mb-0">
                <i className="bi bi-clock me-2"></i>
                Pending Collections
              </h5>
            </Card.Header>
            <Card.Body>
              {pendingCollections && pendingCollections.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>User</th>
                        <th>Waste Type</th>
                        <th>Amount</th>
                        <th>Location</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingCollections.map((collection, index) => (
                        <tr key={index}>
                          <td>{new Date(collection.timestamp).toLocaleDateString()}</td>
                          <td>{collection.userId?.name || 'Unknown'}</td>
                          <td>
                            <span className={`waste-type-badge waste-type-${collection.wasteType}`}>
                              {collection.wasteType}
                            </span>
                          </td>
                          <td>{collection.amount} {collection.unit}</td>
                          <td>
                            {collection.location?.address || 'Unknown'}
                          </td>
                          <td>
                            <Button
                              size="sm"
                              variant="success"
                              onClick={() => handleCollectBin(collection.binId)}
                            >
                              Mark Collected
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-inbox display-4 text-muted"></i>
                  <p className="text-muted mt-3">No pending collections</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CollectorDashboard;
