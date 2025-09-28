import React, { useEffect, useMemo, useState } from 'react';
import { Container, Row, Col, Form, Card, Spinner, Alert, Badge, InputGroup, Button } from 'react-bootstrap';
import axios from 'axios';

const KnowledgeBase = () => {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [lang, setLang] = useState('en');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [q, category, lang]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/knowledge/categories');
      setCategories(res.data.data || []);
    } catch (err) {
      // Non-fatal
    }
  };

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (q) params.q = q;
      if (category) params.category = category;
      if (lang) params.language = lang;
      const res = await axios.get('/api/knowledge', { params });
      setArticles(res.data.data || []);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load knowledge base';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => articles, [articles]);

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <div className="text-center">
            <h1 className="display-5 fw-bold">Knowledge Base</h1>
            <p className="text-muted">Search guides, tips, and articles</p>
          </div>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={6} className="mb-3">
          <InputGroup>
            <Form.Control
              placeholder="Search articles..."
              value={q}
              onChange={e => setQ(e.target.value)}
            />
            <Button variant="primary" onClick={fetchArticles}>
              Search
            </Button>
          </InputGroup>
        </Col>
        <Col md={3} className="mb-3">
          <Form.Select value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </Form.Select>
        </Col>
        <Col md={3} className="mb-3">
          <Form.Select value={lang} onChange={e => setLang(e.target.value)}>
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
          </Form.Select>
        </Col>
      </Row>

      {loading && (
        <div className="text-center my-5">
          <Spinner animation="border" />
          <p className="mt-3">Loading articles...</p>
        </div>
      )}
      {error && (
        <Alert variant="danger" className="my-4">{error}</Alert>
      )}

      {!loading && !error && filtered.length === 0 && (
        <Alert variant="info">No articles found.</Alert>
      )}

      <Row>
        {filtered.map(article => (
          <Col key={article._id} md={6} lg={4} className="mb-4">
            <Card className="h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <Badge bg="secondary">{article.category}</Badge>
                  <Badge bg="light" text="dark">{article.language === 'hi' ? 'हिंदी' : 'English'}</Badge>
                </div>
                <Card.Title className="fw-bold">{article.title}</Card.Title>
                <Card.Text className="text-muted" style={{ whiteSpace: 'pre-wrap' }}>
                  {article.content.length > 180 ? `${article.content.slice(0, 180)}...` : article.content}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default KnowledgeBase;