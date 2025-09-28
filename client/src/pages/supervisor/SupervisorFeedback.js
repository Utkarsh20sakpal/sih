import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert, Modal, Badge } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';

const SupervisorFeedback = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ status: '', priority: '', category: '' });
  const [replying, setReplying] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [replyStatus, setReplyStatus] = useState('');

  useEffect(() => {
    fetchFeedback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchFeedback = async (params = {}) => {
    try {
      setLoading(true);
      const response = await axios.get('/api/supervisor/feedback', { params });
      setFeedback(response.data.data || []);
      setError('');
    } catch (err) {
      console.error('Load feedback error:', err);
      setError('Failed to load feedback');
      toast.error('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const next = { ...filters, [name]: value };
    setFilters(next);
  };

  const applyFilters = () => {
    const params = {};
    if (filters.status) params.status = filters.status;
    if (filters.priority) params.priority = filters.priority;
    if (filters.category) params.category = filters.category;
    fetchFeedback(params);
  };

  const openReply = (item) => {
    setSelectedFeedback(item);
    setReplyMessage('');
    setReplyStatus(item?.status || '');
    setShowReplyModal(true);
  };

  const openView = (item) => {
    setSelectedFeedback(item);
    setShowViewModal(true);
  };

  const sendReply = async () => {
    if (!selectedFeedback || !replyMessage.trim()) {
      toast.warn('Please enter a reply message');
      return;
    }
    try {
      setReplying(true);
      await axios.put(`/api/supervisor/feedback/${selectedFeedback._id}/respond`, {
        message: replyMessage,
        status: replyStatus || undefined
      });
      toast.success('Response sent successfully');
      setShowReplyModal(false);
      setSelectedFeedback(null);
      setReplyMessage('');
      setReplyStatus('');
      applyFilters();
    } catch (err) {
      console.error('Send reply error:', err);
      toast.error('Failed to send response');
    } finally {
      setReplying(false);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: 'secondary',
      in_review: 'warning',
      resolved: 'success'
    };
    const variant = map[status] || 'secondary';
    return <Badge bg={variant} className="text-uppercase">{status || 'pending'}</Badge>;
  };

  const getPriorityBadge = (priority) => {
    const map = {
      low: 'secondary',
      medium: 'info',
      high: 'danger'
    };
    const variant = map[priority] || 'secondary';
    return <Badge bg={variant} className="text-uppercase">{priority || 'medium'}</Badge>;
  };

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <h1 className="display-6 fw-bold">Feedback Management</h1>
          <p className="text-muted">View and respond to user feedback</p>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <div className="d-flex align-items-center justify-content-between">
                <h5 className="mb-0">Filters</h5>
                <div className="d-flex gap-2">
                  <Button variant="outline-secondary" onClick={() => { setFilters({ status: '', priority: '', category: '' }); fetchFeedback(); }}>Reset</Button>
                  <Button variant="primary" onClick={applyFilters}>Apply</Button>
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              <Row>
                <Col md={4} className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select name="status" value={filters.status} onChange={handleFilterChange}>
                    <option value="">All</option>
                    <option value="pending">Pending</option>
                    <option value="in_review">In Review</option>
                    <option value="resolved">Resolved</option>
                  </Form.Select>
                </Col>
                <Col md={4} className="mb-3">
                  <Form.Label>Priority</Form.Label>
                  <Form.Select name="priority" value={filters.priority} onChange={handleFilterChange}>
                    <option value="">All</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </Form.Select>
                </Col>
                <Col md={4} className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Select name="category" value={filters.category} onChange={handleFilterChange}>
                    <option value="">All</option>
                    <option value="website">Website</option>
                    <option value="app">Mobile App</option>
                    <option value="service">Service</option>
                    <option value="hardware">Hardware</option>
                    <option value="other">Other</option>
                  </Form.Select>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Header>
              <div className="d-flex align-items-center justify-content-between">
                <h5 className="mb-0">User Feedback</h5>
                {loading && <Spinner animation="border" size="sm" />}
              </div>
            </Card.Header>
            <Card.Body>
              {!loading && feedback && feedback.length === 0 && (
                <div className="text-center py-4">
                  <i className="bi bi-chat-dots display-4 text-muted"></i>
                  <p className="text-muted mt-3">No feedback found</p>
                </div>
              )}

              {!loading && feedback && feedback.length > 0 && (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>User</th>
                        <th>Category</th>
                        <th>Rating</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {feedback.map((item) => (
                        <tr key={item._id}>
                          <td>
                            <div className="text-truncate" style={{ maxWidth: '180px' }} title={item.subject}>
                              {item.subject}
                            </div>
                          </td>
                          <td>{item.userId?.name || 'Unknown'}</td>
                          <td><Badge bg="secondary">{item.category}</Badge></td>
                          <td>
                            <div className="d-flex">
                              {[1,2,3,4,5].map(star => (
                                <i key={star} className={`bi bi-star${star <= (item.rating || 0) ? '-fill' : ''} text-warning`}></i>
                              ))}
                            </div>
                          </td>
                          <td>{getPriorityBadge(item.priority)}</td>
                          <td>{getStatusBadge(item.status)}</td>
                          <td><small className="text-muted">{new Date(item.createdAt).toLocaleDateString()}</small></td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button variant="outline-secondary" size="sm" onClick={() => openView(item)}>View</Button>
                              <Button variant="primary" size="sm" onClick={() => openReply(item)}>Reply</Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showReplyModal} onHide={() => setShowReplyModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Reply to Feedback</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedFeedback && (
            <div className="mb-3">
              <div className="mb-2"><strong>Subject:</strong> {selectedFeedback.subject}</div>
              <div className="text-muted mb-2"><strong>User:</strong> {selectedFeedback.userId?.name || 'Unknown'}</div>
              <div className="small text-muted">{selectedFeedback.message}</div>
              {Array.isArray(selectedFeedback.responses) && selectedFeedback.responses.length > 0 && (
                <div className="bg-light rounded p-2 mt-3">
                  <div className="fw-semibold mb-1">Previous Replies</div>
                  <div className="small" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                    {selectedFeedback.responses.slice().reverse().map((r, idx) => (
                      <div key={idx} className="mb-2">
                        <div className="text-muted">{new Date(r.respondedAt).toLocaleString()}</div>
                        <div>{r.message}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <Form.Group>
            <Form.Label>Reply Message</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder="Type your response to the user"
              maxLength={1000}
            />
            <Form.Text className="text-muted">{replyMessage.length}/1000</Form.Text>
            <div className="mt-3">
              <Form.Label>Update Status (optional)</Form.Label>
              <Form.Select value={replyStatus} onChange={(e)=>setReplyStatus(e.target.value)}>
                <option value="">No change</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </Form.Select>
            </div>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReplyModal(false)} disabled={replying}>Cancel</Button>
          <Button variant="primary" onClick={sendReply} disabled={replying}>
            {replying ? (<><Spinner size="sm" className="me-2" />Sending...</>) : 'Send Reply'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View Details Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Feedback Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedFeedback && (
            <div>
              <div className="mb-3">
                <div className="mb-1"><strong>Subject:</strong> {selectedFeedback.subject}</div>
                <div className="text-muted mb-1"><strong>User:</strong> {selectedFeedback.userId?.name || 'Unknown'}</div>
                <div className="d-flex gap-2 flex-wrap mb-2">
                  <span className="badge bg-secondary">{selectedFeedback.category}</span>
                  {selectedFeedback.priority && <span className="badge bg-info">{selectedFeedback.priority}</span>}
                  {selectedFeedback.status && <span className="badge bg-primary">{selectedFeedback.status}</span>}
                </div>
                <div className="small text-muted">Created: {selectedFeedback.createdAt ? new Date(selectedFeedback.createdAt).toLocaleString() : '-'}</div>
              </div>
              <div className="mb-3">
                <div className="fw-semibold mb-1">Message</div>
                <div className="p-2 border rounded bg-light" style={{ whiteSpace: 'pre-wrap' }}>{selectedFeedback.message}</div>
              </div>
              {Array.isArray(selectedFeedback.responses) && selectedFeedback.responses.length > 0 && (
                <div className="mb-2">
                  <div className="fw-semibold mb-2">Replies ({selectedFeedback.responses.length})</div>
                  <div className="border rounded p-2 bg-light" style={{ maxHeight: '240px', overflowY: 'auto' }}>
                    {selectedFeedback.responses.slice().reverse().map((r, idx) => (
                      <div key={idx} className="mb-2">
                        <div className="small text-muted">{r.respondedAt ? new Date(r.respondedAt).toLocaleString() : ''}</div>
                        <div>{r.message}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {!selectedFeedback.responses?.length && selectedFeedback.response?.message && (
                <div className="mb-2">
                  <div className="fw-semibold mb-2">Reply</div>
                  <div className="border rounded p-2 bg-light">
                    <div className="small text-muted">{selectedFeedback.response.respondedAt ? new Date(selectedFeedback.response.respondedAt).toLocaleString() : ''}</div>
                    <div>{selectedFeedback.response.message}</div>
                  </div>
                </div>
              )}
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

export default SupervisorFeedback;
