import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login, googleLogin, isAuthenticated, user, error, clearErrors } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || (user?.userType ? `/${user.userType}/dashboard` : '/user/dashboard');

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  useEffect(() => {
    clearErrors();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await login(formData.email, formData.password);
    const target = result?.user?.userType ? `/${result.user.userType}/dashboard` : from;
    if (result.success) {
      navigate(target, { replace: true });
    }
    
    setIsLoading(false);
  };

  const handleGoogleLogin = () => {
    googleLogin();
  };

  if (isAuthenticated) {
    return <LoadingSpinner text="Redirecting to dashboard..." />;
  }

  return (
    <div className="min-vh-100 d-flex align-items-center auth-page">
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={8} lg={6} xl={5}>
            <Card className="auth-card" padding="lg">
              <div className="text-center mb-4">
                <div className="auth-icon-wrapper">
                  <i className="bi bi-box-arrow-in-right"></i>
                </div>
                <h2 className="auth-title">Welcome Back</h2>
                <p className="auth-subtitle">Sign in to your account</p>
              </div>

              {error && (
                <div className="alert alert-danger-modern" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <Input
                  label="Email Address"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                />

                <Input
                  label="Password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  showPasswordToggle
                  showPassword={showPassword}
                  onTogglePassword={() => setShowPassword(!showPassword)}
                />

                <div className="d-flex justify-content-between align-items-center mb-4">
                  <label className="form-check-label-modern">
                    <input type="checkbox" className="form-check-input-modern" />
                    <span className="ms-2">Remember me</span>
                  </label>
                  <Link to="/forgot-password" className="auth-link">
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={isLoading}
                  className="mb-3"
                >
                  Sign In
                </Button>
              </form>

              <div className="auth-divider">
                <span>or</span>
              </div>

              <Button
                variant="outline"
                size="lg"
                fullWidth
                onClick={handleGoogleLogin}
                className="mb-4"
              >
                <i className="bi bi-google me-2"></i>
                Continue with Google
              </Button>

              <div className="text-center">
                <span className="auth-text-muted">Don't have an account? </span>
                <Link to="/register" className="auth-link-primary">
                  Sign up here
                </Link>
              </div>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;
