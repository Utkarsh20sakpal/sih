import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Table, Modal } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';

const UserFeedback = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [formData, setFormData] = useState({
    category: 'website',
    subject: '',
    message: '',
    rating: 5
  });

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/user/feedback');
      setFeedback(response.data.data.feedback);
    } catch (error) {
      setError('Failed to load feedback history');
      toast.error('Failed to load feedback history');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'rating' ? parseInt(value, 10) : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await axios.post('/api/user/feedback', formData);
      toast.success('Feedback submitted successfully!');
      setFormData({
        category: 'website',
        subject: '',
        message: '',
        rating: 5
      });
      fetchFeedback();
    } catch (error) {
      toast.error('Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const openView = (item) => {
    setSelectedFeedback(item);
    setShowViewModal(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'warning', text: 'Pending' },
      'in-progress': { variant: 'info', text: 'In Progress' },
      resolved: { variant: 'success', text: 'Resolved' },
      closed: { variant: 'secondary', text: 'Closed' }
    };
    const config = statusConfig[status] || { variant: 'secondary', text: status };
    return <span className={`badge bg-${config.variant}`}>{config.text}</span>;
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      low: { variant: 'success', text: 'Low' },
      medium: { variant: 'warning', text: 'Medium' },
      high: { variant: 'danger', text: 'High' },
      urgent: { variant: 'dark', text: 'Urgent' }
    };
    const config = priorityConfig[priority] || { variant: 'secondary', text: priority };
    return <span className={`badge bg-${config.variant}`}>{config.text}</span>;
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading feedback...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <h1 className="display-6 fw-bold">Feedback</h1>
          <p className="text-muted">Share your thoughts and report issues</p>
        </Col>
      </Row>

      <Row>
        {/* Submit Feedback Form */}
        <Col lg={6} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">Submit Feedback</h5>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="feedbackCategory">
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="website">Website</option>
                    <option value="app">Mobile App</option>
                    <option value="service">Service</option>
                    <option value="hardware">Hardware</option>
                    <option value="other">Other</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3" controlId="feedbackSubject">
                  <Form.Label>Subject</Form.Label>
                  <Form.Control
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Brief description of your feedback"
                    required
                    maxLength={100}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="feedbackMessage">
                  <Form.Label>Message</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Detailed description of your feedback or issue"
                    required
                    maxLength={1000}
                  />
                  <Form.Text className="text-muted">
                    {formData.message.length}/1000 characters
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Rating</Form.Label>
                  <div className="d-flex align-items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Form.Check
                        inline
                        key={star}
                        type="radio"
                        id={`rating-${star}`}
                        name="rating"
                        value={star}
                        checked={formData.rating === star}
                        onChange={handleChange}
                        label={<i className={`bi bi-star${star <= formData.rating ? '-fill' : ''} text-warning fs-4`}></i>}
                      />
                    ))}
                    <span className="ms-2 text-muted">
                      {formData.rating} out of 5 stars
                    </span>
                  </div>
                </Form.Group>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-100"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Feedback'
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Feedback History */}
        <Col lg={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Your Feedback History</h5>
            </Card.Header>
            <Card.Body>
              {feedback && feedback.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>Category</th>
                        <th>Rating</th>
                        <th>Response</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {feedback.map((item, index) => (
                        <tr key={index}>
                          <td>
                            <div className="text-truncate" style={{ maxWidth: '150px' }} title={item.subject}>
                              {item.subject}
                            </div>
                          </td>
                          <td>
                            <span className="badge bg-secondary">
                              {item.category}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <i
                                  key={star}
                                  className={`bi bi-star${star <= item.rating ? '-fill' : ''} text-warning`}
                                  style={{ fontSize: '0.8rem' }}
                                ></i>
                              ))}
                            </div>
                          </td>
                          <td>
                            {Array.isArray(item.responses) && item.responses.length > 0 ? (
                              (() => {
                                const lastReply = item.responses[item.responses.length - 1];
                                return (
                                  <div title={lastReply.message} className="text-truncate" style={{ maxWidth: '180px' }}>
                                    {lastReply.message}
                                    <div className="small text-muted">
                                      {lastReply.respondedAt ? new Date(lastReply.respondedAt).toLocaleDateString() : ''}
                                    </div>
                                    <div className="small text-muted">{item.responses.length} repl{item.responses.length === 1 ? 'y' : 'ies'}</div>
                                  </div>
                                );
                              })()
                            ) : item.response && item.response.message ? (
                              <div title={item.response.message} className="text-truncate" style={{ maxWidth: '180px' }}>
                                {item.response.message}
                                <div className="small text-muted">
                                  {item.response.respondedAt ? new Date(item.response.respondedAt).toLocaleDateString() : ''}
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted">—</span>
                            )}
                          </td>
                          <td>{getStatusBadge(item.status)}</td>
                          <td>
                            <small className="text-muted">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </small>
                          </td>
                          <td>
                            <Button variant="outline-secondary" size="sm" onClick={() => openView(item)}>View</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-chat-dots display-4 text-muted"></i>
                  <p className="text-muted mt-3">No feedback submitted yet</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      {/* View Details Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Feedback Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedFeedback && (
            <div>
              <div className="mb-3">
                <strong>Subject:</strong> {selectedFeedback.subject || '—'}
              </div>
              <div className="mb-2">
                <strong>Category:</strong> {selectedFeedback.category || '—'}
              </div>
              <div className="mb-2">
                <strong>Status:</strong> {selectedFeedback.status || '—'}
              </div>
              <div className="mb-3">
                <strong>Created:</strong> {selectedFeedback.createdAt ? new Date(selectedFeedback.createdAt).toLocaleString() : '—'}
              </div>

              <div className="mb-3">
                <strong>Message</strong>
                <div className="p-2 border rounded bg-light" style={{ whiteSpace: 'pre-wrap' }}>
                  {selectedFeedback.message || '—'}
                </div>
              </div>

              <div>
                <strong>Replies</strong>
                {Array.isArray(selectedFeedback.responses) && selectedFeedback.responses.length > 0 ? (
                  <div className="mt-2" style={{ maxHeight: 300, overflowY: 'auto' }}>
                    {selectedFeedback.responses.map((r, idx) => (
                      <div key={idx} className="mb-3 p-2 border rounded">
                        <div className="d-flex justify-content-between">
                          <small className="text-muted">By: {r.respondedBy?.name || r.respondedBy || 'Supervisor'}</small>
                          <small className="text-muted">{r.respondedAt ? new Date(r.respondedAt).toLocaleString() : ''}</small>
                        </div>
                        <div style={{ whiteSpace: 'pre-wrap' }}>{r.message}</div>
                        {r.status && (
                          <div className="mt-1"><small>Status set to: {r.status}</small></div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : selectedFeedback.response ? (
                  <div className="mt-2 p-2 border rounded" style={{ whiteSpace: 'pre-wrap' }}>
                    {selectedFeedback.response.message}
                    <div className="mt-1">
                      <small className="text-muted">By: {selectedFeedback.response.respondedBy?.name || selectedFeedback.response.respondedBy || 'Supervisor'}</small>
                      {selectedFeedback.response.respondedAt && (
                        <small className="text-muted ms-2">{new Date(selectedFeedback.response.respondedAt).toLocaleString()}</small>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="mt-2"><small>No replies yet.</small></div>
                )}
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UserFeedback;
