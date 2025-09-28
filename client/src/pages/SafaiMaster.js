import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Form, Button } from 'react-bootstrap';
import axios from 'axios';

const SafaiMaster = () => {
  const [faqData, setFaqData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [masterQuestion, setMasterQuestion] = useState('');
  const [masterAnswer, setMasterAnswer] = useState('');
  const [masterError, setMasterError] = useState('');
  const [masterLoading, setMasterLoading] = useState(false);

  useEffect(() => {
    fetchFAQ();
  }, []);

  const fetchFAQ = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/faq');
      setFaqData(response.data.data || []);
    } catch (err) {
      setError('Failed to load FAQ data');
    } finally {
      setLoading(false);
    }
  };

  const getSafaiMasterGuidance = (question) => {
    const q = (question || '').toLowerCase();
    const sections = [];

    if (/(segregat|separat|dry|wet|organic|recycl|hazard)/.test(q)) {
      sections.push(
        '- Segregation basics:\n  • Wet/organic: food scraps, garden waste\n  • Dry/recyclables: paper, plastic, metal, glass (clean & dry)\n  • Hazardous: batteries, chemicals, medical sharps — handle per local rules\n  • Contamination: rinse recyclables, keep dry waste free of food/oil'
      );
    }

    if (/(bin|placement|sensor|install|calibrat|setup)/.test(q)) {
      sections.push(
        '- Bin setup & sensors:\n  • Place bins in ventilated, accessible locations\n  • Label clearly: Wet / Dry / Hazardous\n  • Calibrate sensors per device guide; keep lenses/ultrasonic heads clean\n  • Avoid direct rain; use covers for outdoor units'
      );
    }

    if (/(points|score|reward|leaderboard|earn)/.test(q)) {
      sections.push(
        '- Project points & rewards:\n  • Earn points for correct segregation and timely disposal\n  • Extra points for clean recyclables and bulk sorting drives\n  • Leaderboard ranks active users; redeem rewards via your dashboard'
      );
    }

    if (/(schedule|pickup|collect|timing)/.test(q)) {
      sections.push(
        '- Collection schedule:\n  • Wet waste: daily (avoid odors)\n  • Dry/recyclables: 2–3 times per week\n  • Hazardous/e-waste: planned drop-offs or special drives'
      );
    }

    if (sections.length === 0) {
      sections.push(
        '- General guidance:\n  • Describe your scenario (home/office/society) and items involved\n  • Keep recyclables clean & dry; avoid mixing food with paper/plastic\n  • Follow local municipal rules for hazardous/e-waste disposal'
      );
    }

    const related = [];
    const keywords = ['segregat','wet','dry','recycle','hazard','bin','sensor','calibrate','points','reward','leaderboard','schedule','pickup'];
    faqData.forEach((faq) => {
      const text = `${faq.question} ${faq.answer}`.toLowerCase();
      if (keywords.some(k => text.includes(k)) && related.length < 3) {
        related.push({ q: faq.question, a: faq.answer });
      }
    });

    let relatedText = '';
    if (related.length) {
      relatedText = '\n\nRelated FAQs:\n' + related.map((r, i) => `  ${i+1}. ${r.q}\n     • ${r.a}`).join('\n');
    }

    return sections.join('\n\n') + relatedText;
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading FAQ...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          {error}
          <button className="btn btn-outline-danger btn-sm ms-3" onClick={fetchFAQ}>
            Retry
          </button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <div className="text-center">
            <h1 className="display-5 fw-bold mb-2">Safai Master</h1>
            <p className="text-muted">Guidance on waste management and our project</p>
          </div>
        </Col>
      </Row>

      <Row>
        <Col md={12}>
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              {masterAnswer && (
                <Alert variant="info" className="text-start">
                  <strong>Guidance:</strong>
                  <div className="mt-2" style={{ whiteSpace: 'pre-wrap' }}>{masterAnswer}</div>
                </Alert>
              )}
              {masterError && (
                <Alert variant="danger" className="text-start">{masterError}</Alert>
              )}

              <Form onSubmit={async (e) => {
                e.preventDefault();
                setMasterLoading(true);
                setMasterError('');
                setMasterAnswer('');
                try {
                  const res = await axios.post('/api/support/safai-master', {
                    question: masterQuestion,
                    context: '',
                    faqData,
                  });
                  if (res.data?.success && res.data?.content) {
                    const note = res.data?.offline ? '\n\n(Using local guidance fallback)' : '';
                    setMasterAnswer(res.data.content + note);
                  } else {
                    const guidance = getSafaiMasterGuidance(masterQuestion);
                    setMasterAnswer(guidance);
                  }
                } catch (err) {
                  const guidance = getSafaiMasterGuidance(masterQuestion);
                  setMasterAnswer(guidance);
                  const msg = err.response?.data?.message || 'Failed to get online guidance; used local fallback';
                  setMasterError(msg);
                } finally {
                  setMasterLoading(false);
                }
              }} className="text-start">
                <Form.Group className="mb-3">
                  <Form.Label>Your Question</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={masterQuestion}
                    onChange={(e) => setMasterQuestion(e.target.value)}
                    placeholder="e.g., What goes in dry waste? How do points work?"
                    required
                    minLength={5}
                  />
                </Form.Group>
                <div className="d-flex gap-2">
                  <Button type="submit" variant="info" disabled={masterLoading || !masterQuestion.trim()}>
                    {masterLoading ? (<><Spinner animation="border" size="sm" className="me-2" />Working...</>) : (<><i className="bi bi-lightbulb me-2"></i>Get Guidance</>)}
                  </Button>
                  <Button variant="outline-secondary" onClick={() => { setMasterAnswer(''); setMasterError(''); setMasterQuestion(''); }}>
                    Clear Chat
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SafaiMaster;