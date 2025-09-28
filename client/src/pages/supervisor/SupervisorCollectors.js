import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Spinner, Alert, Badge, Modal } from 'react-bootstrap';
import axios from 'axios';

const SupervisorCollectors = () => {
  const [collectors, setCollectors] = useState([]);
  const [bins, setBins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assign, setAssign] = useState({ collectorId: '', binIds: '' });
  const [sending, setSending] = useState(false);
  const [showWarnModal, setShowWarnModal] = useState(false);
  const [selectedCollector, setSelectedCollector] = useState(null);
  const [issuing, setIssuing] = useState(false);
  const [warnError, setWarnError] = useState('');
  const [warn, setWarn] = useState({ title: '', importance: 'medium', message: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cRes, bRes] = await Promise.all([
        axios.get('/api/supervisor/collectors'),
        axios.get('/api/supervisor/bins')
      ]);
      setCollectors(cRes.data.data || []);
      setBins((bRes.data.data || []).slice(0, 200));
    } catch (e) {
      setError('Failed to load collectors/bins');
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{ fetchData(); },[]);

  const assignBins = async () => {
    try {
      setSending(true);
      const binIds = assign.binIds.split(',').map(s=>s.trim()).filter(Boolean);
      await axios.put('/api/supervisor/assign-bins', { collectorId: assign.collectorId, binIds });
      await fetchData();
    } catch (e) {
      setError('Failed to assign bins');
    } finally {
      setSending(false);
    }
  };

  const sendInstruction = async (collectorId) => {
    try {
      await axios.post('/api/supervisor/send-instruction', { collectorId, instruction: 'Please prioritize full bins', priority: 'high' });
    } catch (e) {
      setError('Failed to send instruction');
    }
  };

  const openWarnModal = (collector) => {
    setSelectedCollector(collector);
    setWarn({ title: '', importance: 'medium', message: '' });
    setWarnError('');
    setShowWarnModal(true);
  };

  const issueWarning = async () => {
    if (!selectedCollector) return;
    if (!warn.message.trim()) {
      setWarnError('Message is required');
      return;
    }
    setIssuing(true);
    setWarnError('');
    try {
      await axios.post('/api/supervisor/warnings', {
        collectorId: selectedCollector._id,
        title: warn.title,
        importance: warn.importance,
        message: warn.message
      });
      setShowWarnModal(false);
    } catch (e) {
      setWarnError(e?.response?.data?.message || 'Failed to issue warning');
    } finally {
      setIssuing(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <h1 className="display-6 fw-bold mb-3">Manage Collectors</h1>
          <p className="text-muted">Assign bins, send instructions, and monitor activity.</p>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col>
          <Card className="shadow-sm">
            <Card.Body>
              <Form className="row g-3 align-items-end">
                <Form.Group className="col-md-4">
                  <Form.Label>Collector</Form.Label>
                  <Form.Select value={assign.collectorId} onChange={(e)=>setAssign({...assign,collectorId:e.target.value})}>
                    <option value="">Select collector</option>
                    {collectors.map(c=> <option key={c._id} value={c._id}>{c.name} ({c.email})</option>)}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="col-md-6">
                  <Form.Label>Bin IDs (comma separated)</Form.Label>
                  <Form.Control placeholder="BIN001, BIN002" value={assign.binIds} onChange={(e)=>setAssign({...assign,binIds:e.target.value})} />
                </Form.Group>
                <div className="col-md-2 text-md-end">
                  <Button variant="primary" disabled={!assign.collectorId || !assign.binIds || sending} onClick={assignBins}>
                    <i className="bi bi-link-45deg me-2"></i>Assign
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={6} className="mb-3">
          <Card className="shadow-sm h-100">
            <Card.Header><h5 className="mb-0">Collectors</h5></Card.Header>
            <Card.Body>
              {loading ? <div className="text-center"><Spinner animation="border" /></div> : error ? <Alert variant="danger">{error}</Alert> : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Assigned Bins</th>
                        <th>Last Login</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {collectors.map((c,idx)=> (
                        <tr key={idx}>
                          <td>{c.name}<br/><small className="text-muted">{c.email}</small></td>
                          <td><Badge bg="info">{c.assignedBins?.length || 0}</Badge></td>
                          <td><small className="text-muted">{c.lastLogin ? new Date(c.lastLogin).toLocaleString() : '—'}</small></td>
                          <td>
                            <Button size="sm" variant="outline-primary" onClick={()=>sendInstruction(c._id)}>
                              <i className="bi bi-send me-1"></i>Notify
                            </Button>
                            <Button size="sm" variant="danger" className="ms-2" onClick={()=>openWarnModal(c)}>
                              <i className="bi bi-exclamation-triangle me-1"></i>Warn
                            </Button>
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

        <Col md={6} className="mb-3">
          <Card className="shadow-sm h-100">
            <Card.Header><h5 className="mb-0">Recent Bins</h5></Card.Header>
            <Card.Body>
              {loading ? <div className="text-center"><Spinner animation="border" /></div> : (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Bin</th>
                        <th>Waste</th>
                        <th>Fill</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bins.slice(0,8).map((b,idx)=> (
                        <tr key={idx}>
                          <td>{b.binId}</td>
                          <td>{b.wasteType}</td>
                          <td>{b.currentFillLevel || b.fillLevel}%</td>
                          <td>{b.status}</td>
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

  {/* Issue Warning Modal */}
  <Modal show={showWarnModal} onHide={()=>setShowWarnModal(false)} centered>
    <Modal.Header closeButton>
      <Modal.Title>Issue Warning</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      {warnError && <Alert variant="danger">{warnError}</Alert>}
      <Form>
        <Form.Group className="mb-3">
          <Form.Label>Collector</Form.Label>
          <Form.Control value={`${selectedCollector?.name || ''} (${selectedCollector?.email || ''})`} disabled />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Title (optional)</Form.Label>
          <Form.Control placeholder="Short title" value={warn.title} onChange={(e)=>setWarn({...warn,title:e.target.value})} />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Importance</Form.Label>
          <Form.Select value={warn.importance} onChange={(e)=>setWarn({...warn,importance:e.target.value})}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </Form.Select>
        </Form.Group>
        <Form.Group>
          <Form.Label>Message</Form.Label>
          <Form.Control as="textarea" rows={4} placeholder="Write the warning details" value={warn.message} onChange={(e)=>setWarn({...warn,message:e.target.value})} />
        </Form.Group>
      </Form>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={()=>setShowWarnModal(false)}>Cancel</Button>
      <Button variant="danger" onClick={issueWarning} disabled={issuing}>
        {issuing ? (<><Spinner animation="border" size="sm" className="me-2" />Issuing...</>) : (<><i className="bi bi-exclamation-triangle me-2"></i>Issue Warning</>)}
      </Button>
    </Modal.Footer>
  </Modal>
    </Container>
  );
};

export default SupervisorCollectors;
