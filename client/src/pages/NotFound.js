import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <Container fluid className="py-5">
      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={6} xl={5}>
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
            <Card className="text-center w-100 shadow-medium">
              <Card.Body className="p-5">
                <div className="mb-4">
                  <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: '4rem', color: '#198754' }}></i>
                </div>
                <h2 className="mb-3">404 – Page Not Found</h2>
                <p className="text-muted mb-4">
                  The page you're looking for doesn't exist or has been moved.
                </p>
                <div className="d-grid gap-2">
                  <Button as={Link} to="/" variant="primary" size="lg">
                    <i className="bi bi-house me-2"></i>
                    Go Home
                  </Button>
                  <Button as={Link} to="/login" variant="outline-primary">
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    Login
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFound;
