import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Settings = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false
  });
  const [privacy, setPrivacy] = useState({
    profilePublic: false,
    showStats: true,
    allowMessages: true
  });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleNotificationChange = (type) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handlePrivacyChange = (type) => {
    setPrivacy(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setMessage('Settings saved successfully!');
      setIsLoading(false);
    }, 1000);
  };

  if (!user) {
    return (
      <Container className="py-5">
        <Alert variant="danger">Please log in to access settings.</Alert>
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
                <i className="bi bi-gear me-2"></i>
                Settings
              </h4>
            </Card.Header>
            <Card.Body>
              {message && (
                <Alert variant="success" dismissible onClose={() => setMessage('')}>
                  {message}
                </Alert>
              )}

              <Form onSubmit={handleSaveSettings}>
                {/* Theme Settings */}
                <Card className="mb-4">
                  <Card.Header>
                    <h6 className="mb-0">
                      <i className="bi bi-palette me-2"></i>
                      Appearance
                    </h6>
                  </Card.Header>
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6>Theme</h6>
                        <p className="text-muted small mb-0">Choose your preferred theme</p>
                      </div>
                      <Button
                        variant="outline-secondary"
                        onClick={toggleTheme}
                        className="d-flex align-items-center"
                      >
                        <i className={`bi bi-${theme === 'light' ? 'moon' : 'sun'} me-2`}></i>
                        {theme === 'light' ? 'Dark' : 'Light'} Mode
                      </Button>
                    </div>
                  </Card.Body>
                </Card>

                {/* Notification Settings */}
                <Card className="mb-4">
                  <Card.Header>
                    <h6 className="mb-0">
                      <i className="bi bi-bell me-2"></i>
                      Notifications
                    </h6>
                  </Card.Header>
                  <Card.Body>
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="switch"
                        id="email-notifications"
                        label="Email Notifications"
                        checked={notifications.email}
                        onChange={() => handleNotificationChange('email')}
                      />
                      <Form.Text className="text-muted">
                        Receive updates via email
                      </Form.Text>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="switch"
                        id="push-notifications"
                        label="Push Notifications"
                        checked={notifications.push}
                        onChange={() => handleNotificationChange('push')}
                      />
                      <Form.Text className="text-muted">
                        Receive browser notifications
                      </Form.Text>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="switch"
                        id="sms-notifications"
                        label="SMS Notifications"
                        checked={notifications.sms}
                        onChange={() => handleNotificationChange('sms')}
                      />
                      <Form.Text className="text-muted">
                        Receive text message updates
                      </Form.Text>
                    </Form.Group>
                  </Card.Body>
                </Card>

                {/* Privacy Settings */}
                <Card className="mb-4">
                  <Card.Header>
                    <h6 className="mb-0">
                      <i className="bi bi-shield-check me-2"></i>
                      Privacy
                    </h6>
                  </Card.Header>
                  <Card.Body>
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="switch"
                        id="profile-public"
                        label="Public Profile"
                        checked={privacy.profilePublic}
                        onChange={() => handlePrivacyChange('profilePublic')}
                      />
                      <Form.Text className="text-muted">
                        Make your profile visible to other users
                      </Form.Text>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="switch"
                        id="show-stats"
                        label="Show Statistics"
                        checked={privacy.showStats}
                        onChange={() => handlePrivacyChange('showStats')}
                      />
                      <Form.Text className="text-muted">
                        Display your waste segregation statistics
                      </Form.Text>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="switch"
                        id="allow-messages"
                        label="Allow Messages"
                        checked={privacy.allowMessages}
                        onChange={() => handlePrivacyChange('allowMessages')}
                      />
                      <Form.Text className="text-muted">
                        Allow other users to send you messages
                      </Form.Text>
                    </Form.Group>
                  </Card.Body>
                </Card>

                {/* Account Actions */}
                <Card className="mb-4">
                  <Card.Header>
                    <h6 className="mb-0">
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      Account Actions
                    </h6>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={6}>
                        <Button variant="outline-warning" className="w-100 mb-2">
                          <i className="bi bi-download me-2"></i>
                          Export Data
                        </Button>
                      </Col>
                      <Col md={6}>
                        <Button variant="outline-danger" className="w-100 mb-2">
                          <i className="bi bi-trash me-2"></i>
                          Delete Account
                        </Button>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={isLoading}
                  className="w-100"
                >
                  {isLoading ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      Save Settings
                    </>
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Settings;
