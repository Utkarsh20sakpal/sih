import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer mt-auto">
      <Container>
        <Row className="py-4">
          <Col md={4} className="mb-3">
            <h5 className="text-white mb-3">
              <i className="bi bi-recycle me-2"></i>
              IoT Waste Segregator
            </h5>
            <p className="text-light">
              Smart waste management system using IoT technology to improve 
              waste segregation efficiency and environmental sustainability.
            </p>
          </Col>
          
          <Col md={2} className="mb-3">
            <h6 className="text-white mb-3">Quick Links</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/" className="text-light text-decoration-none">
                  Home
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/customer-care" className="text-light text-decoration-none">
                  Customer Care
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/login" className="text-light text-decoration-none">
                  Login
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/register" className="text-light text-decoration-none">
                  Register
                </Link>
              </li>
            </ul>
          </Col>
          
          <Col md={3} className="mb-3">
            <h6 className="text-white mb-3">Features</h6>
            <ul className="list-unstyled">
              <li className="mb-2 text-light">Smart Waste Detection</li>
              <li className="mb-2 text-light">Real-time Monitoring</li>
              <li className="mb-2 text-light">Route Optimization</li>
              <li className="mb-2 text-light">Analytics Dashboard</li>
            </ul>
          </Col>
          
          <Col md={3} className="mb-3">
            <h6 className="text-white mb-3">Contact Info</h6>
            <ul className="list-unstyled text-light">
              <li className="mb-2">
                <i className="bi bi-envelope me-2"></i>
                support@wastesegregator.com
              </li>
              <li className="mb-2">
                <i className="bi bi-telephone me-2"></i>
                +1 (555) 123-4567
              </li>
              <li className="mb-2">
                <i className="bi bi-geo-alt me-2"></i>
                123 Green Street, Eco City
              </li>
            </ul>
          </Col>
        </Row>
        
        <hr className="text-light" />
        
        <Row className="py-3">
          <Col md={6}>
            <p className="text-light mb-0">
              &copy; {currentYear} IoT Waste Segregator. All rights reserved.
            </p>
          </Col>
          <Col md={6} className="text-md-end">
            <p className="text-light mb-0">
              Made with <i className="bi bi-heart-fill text-danger"></i> for a cleaner planet
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
