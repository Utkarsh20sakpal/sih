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

  // Safely format a bin's location for display
  const getLocationLabel = (bin) => {
    if (!bin) return '';
    const { location, coordinates } = bin;
    if (typeof location === 'string' && location.trim()) return location;
    if (location && typeof location === 'object') {
      if (location.name && String(location.name).trim()) return location.name;
      if (location.address && String(location.address).trim()) return location.address;
    }
    if (coordinates && typeof coordinates === 'object' && coordinates.lat != null && coordinates.lng != null) {
      try {
        const lat = Number(coordinates.lat);
        const lng = Number(coordinates.lng);
        if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
          return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        }
      } catch {}
    }
    return '';
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
  
  // Simple route optimization based on bin fill levels
  const optimizedRoute = (assignedBins || [])
    .slice()
    .sort((a, b) => (b.fillLevel || 0) - (a.fillLevel || 0));

  const highPriority = (assignedBins || []).filter(b => (b.fillLevel || 0) >= 80);
  const mediumPriority = (assignedBins || []).filter(b => (b.fillLevel || 0) >= 60 && (b.fillLevel || 0) < 80);
  const lowPriority = (assignedBins || []).filter(b => (b.fillLevel || 0) < 60);

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

      {/* Route Optimization & Fill Levels */}
      <Row className="mb-4">
        <Col lg={6} className="mb-4">
          <Card className="h-100 shadow-medium">
            <Card.Header className="gradient-bg-primary text-white">
              <h5 className="mb-0">
                <i className="bi bi-route me-2"></i>
                Optimized Collection Route
              </h5>
            </Card.Header>
            <Card.Body>
              {optimizedRoute.length > 0 ? (
                <div>
                  <p className="text-muted">Suggested order based on bin fill level</p>
                  <ol className="list-group list-group-numbered">
                    {optimizedRoute.slice(0, 8).map((bin, idx) => (
                      <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                        <span>
                          <span className="fw-semibold">Bin #{bin.binId}</span>
                          {getLocationLabel(bin) && (
                            <small className="text-muted ms-2">— {getLocationLabel(bin)}</small>
                          )}
                          <span className="text-muted ms-2">({bin.status || 'unknown'})</span>
                        </span>
                        <span className="d-flex align-items-center">
                          <div className="progress me-2" style={{ width: '100px', height: '8px' }}>
                            <div 
                              className={`progress-bar ${bin.fillLevel >= 90 ? 'bg-danger' : bin.fillLevel >= 75 ? 'bg-warning' : 'bg-success'}`}
                              style={{ width: `${bin.fillLevel}%` }}
                            ></div>
                          </div>
                          <small className="text-muted">{bin.fillLevel?.toFixed(1)}%</small>
                        </span>
                      </li>
                    ))}
                  </ol>
                  <div className="text-end mt-3">
                    <Button as={Link} to="/collector/map" variant="primary" className="btn-gradient">
                      <i className="bi bi-geo-alt me-2"></i>
                      View on Map
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-route display-4 text-muted"></i>
                  <p className="text-muted mt-3">No bins assigned to optimize</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={6} className="mb-4">
          <Card className="h-100 shadow-medium">
            <Card.Header className="gradient-bg-info text-white">
              <h5 className="mb-0">
                <i className="bi bi-bar-chart-line me-2"></i>
                Bin Fill Levels
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <small className="text-muted">High Priority (≥80%)</small>
                <div className="progress mb-2" style={{ height: '8px' }}>
                  <div 
                    className="progress-bar bg-danger" 
                    style={{ width: `${((highPriority.length)/(assignedBins?.length || 1)) * 100}%` }}
                  ></div>
                </div>
                <span className="badge bg-danger">{highPriority.length} bins</span>
              </div>

              <div className="mb-3">
                <small className="text-muted">Medium Priority (60–79%)</small>
                <div className="progress mb-2" style={{ height: '8px' }}>
                  <div 
                    className="progress-bar bg-warning" 
                    style={{ width: `${((mediumPriority.length)/(assignedBins?.length || 1)) * 100}%` }}
                  ></div>
                </div>
                <span className="badge bg-warning">{mediumPriority.length} bins</span>
              </div>

              <div>
                <small className="text-muted">Low Priority (&lt;60%)</small>
                <div className="progress mb-2" style={{ height: '8px' }}>
                  <div 
                    className="progress-bar bg-success" 
                    style={{ width: `${((lowPriority.length)/(assignedBins?.length || 1)) * 100}%` }}
                  ></div>
                </div>
                <span className="badge bg-success">{lowPriority.length} bins</span>
              </div>
            </Card.Body>
          </Card>
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
              <Row className="align-items-center gy-2 gy-md-0">
                <Col md={6}>
                  <h6 className="mb-2">Collection Management</h6>
                  <p className="text-muted mb-0">View maps, optimize routes, and manage collections efficiently</p>
                </Col>
                <Col md={6} className="text-md-end">
                  <div className="d-flex justify-content-md-end align-items-center flex-wrap gap-3">
                    <Button as={Link} to="/collector/map" variant="primary" className="btn-gradient btn-lg rounded-pill" style={{ minWidth: '180px' }}>
                      <i className="bi bi-geo-alt me-2"></i>
                      View Map
                    </Button>
                    <Button as={Link} to="/collector/history" variant="outline-primary" className="btn-lg rounded-pill" style={{ minWidth: '180px' }}>
                      <i className="bi bi-clock-history me-2"></i>
                      View History
                    </Button>
                    <Button as={Link} to="/collector/warnings" variant="outline-danger" className="btn-lg rounded-pill" style={{ minWidth: '180px' }}>
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      View Warnings
                    </Button>
                  </div>
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
                          <td>
                            <span className="fw-semibold">{bin.binId}</span>
                            {getLocationLabel(bin) && (
                              <small className="text-muted ms-2">— {getLocationLabel(bin)}</small>
                            )}
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
