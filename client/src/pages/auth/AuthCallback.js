import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loadUser } = useAuth();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');
      const userType = searchParams.get('userType');

      if (error) {
        setStatus('error');
        setMessage('Authentication failed. Please try again.');
        return;
      }

      if (token) {
        try {
          // Store token in localStorage
          localStorage.setItem('token', token);
          // Ensure axios has the Authorization header set for immediate next request
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Load user data
          await loadUser();
          
          setStatus('success');
          setMessage('Authentication successful! Redirecting...');
          
          // Redirect to appropriate dashboard
          setTimeout(() => {
            navigate(`/${userType || 'user'}/dashboard`);
          }, 2000);
        } catch (error) {
          setStatus('error');
          setMessage('Failed to load user data. Please try again.');
        }
      } else {
        setStatus('error');
        setMessage('No authentication token received.');
      }
    };

    handleCallback();
  }, [searchParams, navigate, loadUser]);

  if (status === 'loading') {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <Container>
          <Row className="justify-content-center">
            <Col md={6} lg={4}>
              <Card className="text-center">
                <Card.Body className="p-5">
                  <LoadingSpinner text="Processing authentication..." />
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center">
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={4}>
            <Card className="text-center">
              <Card.Body className="p-5">
                {status === 'success' ? (
                  <>
                    <div className="text-success mb-3">
                      <i className="bi bi-check-circle-fill display-4"></i>
                    </div>
                    <h4 className="text-success mb-3">Success!</h4>
                    <p className="text-muted">{message}</p>
                  </>
                ) : (
                  <>
                    <div className="text-danger mb-3">
                      <i className="bi bi-x-circle-fill display-4"></i>
                    </div>
                    <h4 className="text-danger mb-3">Error</h4>
                    <Alert variant="danger" className="mb-3">
                      {message}
                    </Alert>
                    <button
                      className="btn btn-primary"
                      onClick={() => navigate('/login')}
                    >
                      Try Again
                    </button>
                  </>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AuthCallback;
