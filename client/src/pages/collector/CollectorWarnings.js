import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Spinner, Alert, Modal, Form } from 'react-bootstrap';
import axios from 'axios';

const importanceVariant = (imp) => {
  switch (imp) {
    case 'low': return 'secondary';
    case 'medium': return 'info';
    case 'high': return 'warning';
    case 'critical': return 'danger';
    default: return 'secondary';
  }
};

const CollectorWarnings = () => {
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showView, setShowView] = useState(false);
  const [selected, setSelected] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);
  const [replyError, setReplyError] = useState('');

  const fetchWarnings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/collector/warnings');
      setWarnings(res.data?.data || []);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load warnings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWarnings(); }, []);

  const openView = (w) => {
    setSelected(w);
    setReplyText('');
    setReplyError('');
    setShowView(true);
  };

  const submitReply = async () => {
    if (!selected) return;
    if (!replyText.trim()) { setReplyError('Reply cannot be empty'); return; }
    setReplying(true);
    setReplyError('');
    try {
      const res = await axios.post(`/api/collector/warnings/${selected._id}/replies`, { message: replyText });
      setSelected(res.data?.data); // updated warning with replies
      setReplyText('');
      // also update list
      setWarnings(prev => prev.map(w => w._id === res.data?.data?._id ? res.data?.data : w));
    } catch (e) {
      setReplyError(e?.response?.data?.message || 'Failed to send reply');
    } finally {
      setReplying(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <h1 className="display-6 fw-bold">Supervisor Warnings</h1>
          <p className="text-muted">View warnings issued by your supervisor and reply if needed.</p>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Body>
              {loading ? (
                <div className="text-center"><Spinner animation="border" /></div>
              ) : error ? (
                <Alert variant="danger">{error}</Alert>
              ) : warnings.length === 0 ? (
                <div className="text-center py-4 text-muted">No warnings at the moment.</div>
              ) : (
                <div className="table-responsive">
                  <Table hover align="middle">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Importance</th>
                        <th>Status</th>
                        <th>Issued</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {warnings.map(w => (
                        <tr key={w._id}>
                          <td>{w.title || '—'}</td>
                          <td><Badge bg={importanceVariant(w.importance)} className="text-uppercase">{w.importance}</Badge></td>
                          <td><Badge bg={w.status === 'closed' ? 'secondary' : w.status === 'acknowledged' ? 'info' : 'primary'} className="text-uppercase">{w.status}</Badge></td>
                          <td>{new Date(w.createdAt).toLocaleString()}</td>
                          <td>
                            <Button size="sm" variant="outline-primary" onClick={()=>openView(w)}>
                              <i className="bi bi-eye me-1"></i>View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* View Warning Modal */}
      <Modal show={showView} onHide={()=>setShowView(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Warning Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {!selected ? null : (
            <>
              <div className="mb-3">
                <h5 className="mb-1">{selected.title || 'Warning'}</h5>
                <div className="d-flex gap-2 align-items-center">
                  <Badge bg={importanceVariant(selected.importance)} className="text-uppercase">{selected.importance}</Badge>
                  <Badge bg={selected.status === 'closed' ? 'secondary' : selected.status === 'acknowledged' ? 'info' : 'primary'} className="text-uppercase">{selected.status}</Badge>
                </div>
                <small className="text-muted">Issued {new Date(selected.createdAt).toLocaleString()} by {selected.supervisorId?.name || 'Supervisor'}</small>
              </div>

              <Card className="mb-3">
                <Card.Header><strong>Message</strong></Card.Header>
                <Card.Body>
                  <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>{selected.message}</p>
                </Card.Body>
              </Card>

              <Card className="mb-3">
                <Card.Header><strong>Replies</strong></Card.Header>
                <Card.Body>
                  {selected.replies?.length ? (
                    <ul className="list-unstyled mb-0">
                      {selected.replies.map((r, idx) => (
                        <li key={idx} className="mb-2">
                          <div className="d-flex justify-content-between">
                            <span><strong>{r.userId?.name || 'You'}</strong></span>
                            <small className="text-muted">{new Date(r.createdAt).toLocaleString()}</small>
                          </div>
                          <div>{r.message}</div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-muted">No replies yet.</div>
                  )}
                </Card.Body>
              </Card>

              <Card>
                <Card.Header><strong>Add a Reply</strong></Card.Header>
                <Card.Body>
                  {replyError && <Alert variant="danger">{replyError}</Alert>}
                  <Form>
                    <Form.Control as="textarea" rows={3} placeholder="Write your reply" value={replyText} onChange={(e)=>setReplyText(e.target.value)} />
                  </Form>
                </Card.Body>
                <Card.Footer className="text-end">
                  <Button variant="primary" onClick={submitReply} disabled={replying}>
                    {replying ? (<><Spinner animation="border" size="sm" className="me-2" />Sending...</>) : 'Send Reply'}
                  </Button>
                </Card.Footer>
              </Card>
            </>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default CollectorWarnings;