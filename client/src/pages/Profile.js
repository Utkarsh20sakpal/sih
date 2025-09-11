import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Profile = () => {
  const { user, updateProfile, changePassword, loading } = useAuth();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [roleLoading, setRoleLoading] = useState(true);
  const [roleData, setRoleData] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || ''
      });
      loadRoleData(user.userType);
    }
  }, [user]);

  const loadRoleData = async (userType) => {
    try {
      setRoleLoading(true);
      if (userType === 'user') {
        const res = await axios.get('/api/user/dashboard');
        setRoleData(res.data.data);
      } else if (userType === 'collector') {
        const res = await axios.get('/api/collector/dashboard');
        setRoleData(res.data.data);
      } else if (userType === 'supervisor') {
        const res = await axios.get('/api/supervisor/dashboard');
        setRoleData(res.data.data);
      } else {
        setRoleData(null);
      }
    } catch (e) {
      // Non-fatal: profile basics still render
      setRoleData(null);
    } finally {
      setRoleLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const result = await updateProfile(formData);
      if (result.success) {
        setMessage('Profile updated successfully!');
      } else {
        setError(result.message || 'Failed to update profile');
      }
    } catch (err) {
      setError('An error occurred while updating profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      setIsLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      const result = await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      if (result.success) {
        setMessage('Password changed successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setError(result.message || 'Failed to change password');
      }
    } catch (err) {
      setError('An error occurred while changing password');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container className="py-5">
        <Alert variant="danger">Please log in to view your profile.</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col lg={8}>
          <Card className={`shadow-sm ${theme === 'dark' ? 'bg-dark text-light' : ''}`}>
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">
                <i className="bi bi-person-circle me-2"></i>
                {user.userType === 'user' && 'User Profile'}
                {user.userType === 'collector' && 'Collector Profile'}
                {user.userType === 'supervisor' && 'Supervisor Profile'}
              </h4>
            </Card.Header>
            <Card.Body>
              {/* Profile Info */}
              <Row className="mb-4">
                <Col md={4} className="text-center">
                  <div className="mb-3">
                    <i className="bi bi-person-circle display-1 text-primary"></i>
                  </div>
                  <h5>{user.name}</h5>
                  <Badge bg="info" className="mb-2">
                    {user.userType?.charAt(0).toUpperCase() + user.userType?.slice(1)}
                  </Badge>
                  <p className="text-muted small">{user.email}</p>
                </Col>
                <Col md={8}>
                  {roleLoading ? (
                    <div className="d-flex align-items-center justify-content-center h-100">
                      <Spinner size="sm" className="me-2" /> Loading role data...
                    </div>
                  ) : (
                    <Row>
                      {user.userType === 'user' && (
                        <>
                          <Col sm={6}>
                            <div className="text-center p-3 border rounded mb-3">
                              <h6 className="text-primary mb-1">Monthly Points</h6>
                              <h4 className="mb-0">{roleData?.userStats?.monthlyPoints ?? user.monthlyPoints ?? 0}</h4>
                            </div>
                          </Col>
                          <Col sm={6}>
                            <div className="text-center p-3 border rounded mb-3">
                              <h6 className="text-success mb-1">Accuracy</h6>
                              <h4 className="mb-0">{(roleData?.userStats?.monthlyAccuracy ?? user.monthlyAccuracy ?? 0).toFixed ? (roleData?.userStats?.monthlyAccuracy ?? user.monthlyAccuracy).toFixed(1) + '%' : `${roleData?.userStats?.monthlyAccuracy ?? user.monthlyAccuracy ?? 0}%`}</h4>
                            </div>
                          </Col>
                          <Col sm={6}>
                            <div className="text-center p-3 border rounded mb-3">
                              <h6 className="text-warning mb-1">Total Quantity</h6>
                              <h4 className="mb-0">{roleData?.userStats?.totalWasteAmount ?? user.totalWasteAmount ?? 0} items</h4>
                            </div>
                          </Col>
                          <Col sm={6}>
                            <div className="text-center p-3 border rounded mb-3">
                              <h6 className="text-info mb-1">Efficiency</h6>
                              <h4 className="mb-0">{(roleData?.userStats?.segregationEfficiency ?? user.segregationEfficiency ?? 0).toFixed ? (roleData?.userStats?.segregationEfficiency ?? user.segregationEfficiency).toFixed(1) + '%' : `${roleData?.userStats?.segregationEfficiency ?? user.segregationEfficiency ?? 0}%`}</h4>
                            </div>
                          </Col>
                        </>
                      )}

                      {user.userType === 'collector' && (
                        <>
                          <Col sm={6}>
                            <div className="text-center p-3 border rounded mb-3">
                              <h6 className="text-primary mb-1">Assigned Bins</h6>
                              <h4 className="mb-0">{roleData?.overview?.totalAssignedBins ?? 0}</h4>
                            </div>
                          </Col>
                          <Col sm={6}>
                            <div className="text-center p-3 border rounded mb-3">
                              <h6 className="text-warning mb-1">Full Bins</h6>
                              <h4 className="mb-0">{roleData?.overview?.fullBins ?? 0}</h4>
                            </div>
                          </Col>
                          <Col sm={6}>
                            <div className="text-center p-3 border rounded mb-3">
                              <h6 className="text-success mb-1">Today's Collections</h6>
                              <h4 className="mb-0">{roleData?.overview?.todayCollectionCount ?? 0}</h4>
                            </div>
                          </Col>
                          <Col sm={6}>
                            <div className="text-center p-3 border rounded mb-3">
                              <h6 className="text-info mb-1">Pending Collections</h6>
                              <h4 className="mb-0">{roleData?.overview?.pendingCollectionCount ?? 0}</h4>
                            </div>
                          </Col>
                        </>
                      )}

                      {user.userType === 'supervisor' && (
                        <>
                          <Col sm={6}>
                            <div className="text-center p-3 border rounded mb-3">
                              <h6 className="text-primary mb-1">Active Collectors</h6>
                              <h4 className="mb-0">{roleData?.overview?.activeCollectors ?? 0}</h4>
                            </div>
                          </Col>
                          <Col sm={6}>
                            <div className="text-center p-3 border rounded mb-3">
                              <h6 className="text-warning mb-1">Full Bins</h6>
                              <h4 className="mb-0">{roleData?.overview?.fullBins ?? 0}</h4>
                            </div>
                          </Col>
                          <Col sm={6}>
                            <div className="text-center p-3 border rounded mb-3">
                              <h6 className="text-success mb-1">Collection Efficiency</h6>
                              <h4 className="mb-0">{roleData?.overview?.collectionEfficiency != null ? `${roleData.overview.collectionEfficiency}%` : '0%'}</h4>
                            </div>
                          </Col>
                          <Col sm={6}>
                            <div className="text-center p-3 border rounded mb-3">
                              <h6 className="text-info mb-1">Total Bins</h6>
                              <h4 className="mb-0">{roleData?.overview?.totalBins ?? 0}</h4>
                            </div>
                          </Col>
                        </>
                      )}
                    </Row>
                  )}
                </Col>
              </Row>

              {/* Tabs */}
              <div className="mb-4">
                <div className="btn-group w-100" role="group">
                  <Button
                    variant={activeTab === 'profile' ? 'primary' : 'outline-primary'}
                    onClick={() => setActiveTab('profile')}
                  >
                    <i className="bi bi-person me-2"></i>
                    Profile Settings
                  </Button>
                  <Button
                    variant={activeTab === 'password' ? 'primary' : 'outline-primary'}
                    onClick={() => setActiveTab('password')}
                  >
                    <i className="bi bi-lock me-2"></i>
                    Change Password
                  </Button>
                </div>
              </div>

              {/* Messages */}
              {message && (
                <Alert variant="success" dismissible onClose={() => setMessage('')}>
                  {message}
                </Alert>
              )}
              {error && (
                <Alert variant="danger" dismissible onClose={() => setError('')}>
                  {error}
                </Alert>
              )}

              {/* Profile Form */}
              {activeTab === 'profile' && (
                <Form onSubmit={handleProfileSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Full Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Email Address</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isLoading}
                    className="w-100"
                  >
                    {isLoading ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Update Profile
                      </>
                    )}
                  </Button>
                </Form>
              )}

              {/* Password Form */}
              {activeTab === 'password' && (
                <Form onSubmit={handlePasswordSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Current Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>New Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                      minLength={6}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Confirm New Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                      minLength={6}
                    />
                  </Form.Group>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isLoading}
                    className="w-100"
                  >
                    {isLoading ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Changing...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-shield-check me-2"></i>
                        Change Password
                      </>
                    )}
                  </Button>
                </Form>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
