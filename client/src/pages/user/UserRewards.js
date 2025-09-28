import React, { useMemo, useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Modal } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

const UserRewards = () => {
  const { user } = useAuth();
  const [selected, setSelected] = useState(null);
  const [claimed, setClaimed] = useState([]);

  // Dummy vouchers dataset
  const vouchers = useMemo(() => ([
    {
      id: 'GV-PLANT-100',
      brand: 'GreenLeaf Nursery',
      title: '₹100 Plant Voucher 🌱',
      desc: 'Get ₹100 off on any indoor plant purchase.',
      img: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=800&auto=format&fit=crop',
      points: 250,
      color: 'success'
    },
    {
      id: 'GV-REUSE-200',
      brand: 'EcoReuse Store',
      title: '₹200 Sustainable Goods ♻️',
      desc: 'Discount on reusable bottles, bags, and more.',
      img: 'https://images.unsplash.com/photo-1563906267088-b029e7101113?q=80&w=800&auto=format&fit=crop',
      points: 450,
      color: 'primary'
    },
    {
      id: 'GV-TRAVEL-300',
      brand: 'MetroGo',
      title: '₹300 Travel Card 🚇',
      desc: 'Top-up for your public transport smart card.',
      img: 'https://images.unsplash.com/photo-1517632298120-5801b58f78f4?q=80&w=800&auto=format&fit=crop',
      points: 650,
      color: 'warning'
    },
    {
      id: 'GV-FOOD-150',
      brand: 'VeggieBowl',
      title: '₹150 Healthy Bowl 🥗',
      desc: 'Redeem on a zero-waste healthy bowl.',
      img: 'https://images.unsplash.com/photo-1542691457-cbe4df041eb2?q=80&w=800&auto=format&fit=crop',
      points: 300,
      color: 'info'
    }
  ]), []);

  const handleClaim = (voucher) => {
    setSelected(voucher);
  };

  const confirmClaim = () => {
    if (!selected) return;
    // Simulate claim success with a dummy code
    const code = `${selected.id}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    setClaimed(prev => [...prev, { ...selected, code, claimedAt: new Date().toISOString() }]);
    setSelected(null);
  };

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <h1 className="display-6 fw-bold d-flex align-items-center">
            <i className="bi bi-gift me-2 text-primary"></i>
            Rewards & Gift Vouchers
          </h1>
          <p className="text-muted mb-0">Redeem your points for eco-friendly rewards.</p>
        </Col>
        <Col md={4} className="text-md-end mt-3 mt-md-0">
          <Card className="border-0 shadow-sm">
            <Card.Body className="py-3">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-muted small">Your Monthly Points</div>
                  <div className="h4 mb-0">{user?.monthlyPoints ?? 0}</div>
                </div>
                <i className="bi bi-trophy-fill text-warning" style={{ fontSize: '2rem' }}></i>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        {vouchers.map(v => (
          <Col key={v.id} lg={3} md={6} className="mb-4">
            <Card className="h-100 card-hover">
              <div className="position-relative">
                <img src={v.img} alt={v.title} className="img-fluid" style={{ height: 160, width: '100%', objectFit: 'cover', borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }} />
                <Badge bg={v.color} className="position-absolute top-0 end-0 m-2">
                  {v.points} pts
                </Badge>
              </div>
              <Card.Body>
                <div className="small text-muted mb-1">{v.brand}</div>
                <h5 className="fw-bold mb-2">{v.title}</h5>
                <p className="text-muted mb-3 text-truncate-3">{v.desc}</p>
                <div className="d-flex align-items-center justify-content-between">
                  <Button
                    variant="primary"
                    className="me-2"
                    onClick={() => handleClaim(v)}
                    disabled={(user?.monthlyPoints ?? 0) < v.points}
                  >
                    <i className="bi bi-gift-fill me-2"></i>
                    Claim
                  </Button>
                  {(user?.monthlyPoints ?? 0) < v.points ? (
                    <span className="small text-muted">Need {v.points - (user?.monthlyPoints ?? 0)} pts</span>
                  ) : (
                    <span className="small text-success"><i className="bi bi-check-circle me-1"></i>Eligible</span>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row className="mt-4">
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0"><i className="bi bi-bag-check me-2"></i>Claimed Rewards</h5>
            </Card.Header>
            <Card.Body>
              {claimed.length === 0 ? (
                <div className="text-center py-4">
                  <i className="bi bi-emoji-smile display-6 text-muted"></i>
                  <p className="text-muted mt-2 mb-0">No rewards claimed yet. Start segregating to earn points!</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-modern">
                    <thead>
                      <tr>
                        <th>Voucher</th>
                        <th>Brand</th>
                        <th>Code</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {claimed.map(c => (
                        <tr key={c.code}>
                          <td>{c.title}</td>
                          <td>{c.brand}</td>
                          <td><code>{c.code}</code></td>
                          <td><small className="text-muted">{new Date(c.claimedAt).toLocaleString()}</small></td>
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

      <Modal show={!!selected} onHide={() => setSelected(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Claim</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selected && (
            <>
              <p className="mb-2">You are about to claim:</p>
              <div className="d-flex align-items-center mb-3">
                <img src={selected.img} alt={selected.title} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8 }} className="me-3" />
                <div>
                  <div className="fw-semibold">{selected.title}</div>
                  <div className="small text-muted">Cost: {selected.points} pts</div>
                </div>
              </div>
              <p className="text-muted mb-0">This is a demo flow using dummy data. No points will be deducted.</p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setSelected(null)}>Cancel</Button>
          <Button variant="primary" onClick={confirmClaim}>
            <i className="bi bi-check2-circle me-2"></i>
            Confirm Claim
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UserRewards;



