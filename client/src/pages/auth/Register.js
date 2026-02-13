import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'user'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, googleLogin, isAuthenticated, user, error, clearErrors } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      const target = user?.userType ? `/${user.userType}/dashboard` : '/user/dashboard';
      navigate(target);
    }
  }, [isAuthenticated, navigate, user]);

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
    
    if (formData.password !== formData.confirmPassword) {
      return;
    }

    setIsLoading(true);

    const { confirmPassword, ...userData } = formData;
    const result = await register(userData);
    
    if (result.success) {
      const target = result?.user?.userType ? `/${result.user.userType}/dashboard` : `/${userData.userType}/dashboard`;
      navigate(target);
    }
    
    setIsLoading(false);
  };

  const handleGoogleLogin = () => {
    googleLogin();
  };

  if (isAuthenticated) {
    return <LoadingSpinner text="Redirecting to dashboard..." />;
  }

  const passwordMismatch = formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword;

  return (
    <div className="min-vh-100 d-flex align-items-center auth-page">
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={8} lg={6} xl={5}>
            <Card className="auth-card" padding="lg">
              <div className="text-center mb-4">
                <div className="auth-icon-wrapper">
                  <i className="bi bi-person-plus"></i>
                </div>
                <h2 className="auth-title">Create Account</h2>
                <p className="auth-subtitle">Join our waste management community</p>
              </div>

              {error && (
                <div className="alert alert-danger-modern" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <Input
                  label="Full Name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />

                <Input
                  label="Email Address"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                />

                <div className="form-group-modern">
                  <label htmlFor="userType" className="form-label-modern">
                    User Type
                  </label>
                  <select
                    id="userType"
                    name="userType"
                    value={formData.userType}
                    onChange={handleChange}
                    className="form-control-modern"
                    required
                  >
                    <option value="user">User</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="collector">Collector</option>
                  </select>
                  <div className="form-helper-modern">
                    Choose your role in the waste management system
                  </div>
                </div>

                <Input
                  label="Password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  required
                  minLength={6}
                  showPasswordToggle
                  showPassword={showPassword}
                  onTogglePassword={() => setShowPassword(!showPassword)}
                  helperText="Password must be at least 6 characters long"
                />

                <Input
                  label="Confirm Password"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  required
                  error={passwordMismatch ? 'Passwords do not match' : ''}
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={isLoading}
                  disabled={passwordMismatch}
                  className="mb-3"
                >
                  Create Account
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
                <span className="auth-text-muted">Already have an account? </span>
                <Link to="/login" className="auth-link-primary">
                  Sign in here
                </Link>
              </div>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Register;
