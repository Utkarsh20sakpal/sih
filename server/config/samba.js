const https = require('https');

function buildGuidance({ question = '', context = '', faqData = [] }) {
  const q = (question || '').toLowerCase();
  const sections = [];

  if (/(segregat|separat|dry|wet|organic|recycl|hazard)/.test(q)) {
    sections.push(
      '- Segregation basics:\n  • Wet/organic: food scraps, garden waste\n  • Dry/recyclables: paper, plastic, metal, glass (clean & dry)\n  • Hazardous: batteries, chemicals, medical sharps — handle per local rules\n  • Contamination: rinse recyclables; keep dry waste free of food/oil'
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
}

async function callSambaNova({ question, context }) {
  const apiKey = process.env.SAMBANOVA_API_KEY;
  if (!apiKey) {
    return { ok: false, error: 'Missing SAMBANOVA_API_KEY' };
  }

  const body = JSON.stringify({
    model: process.env.SAMBANOVA_MODEL || 'Meta-Llama-3.1-8B-Instruct',
    messages: [
      { role: 'system', content: 'You are Safai Master, a helpful guide on waste management and this project. Answer concisely and practically.' },
      { role: 'user', content: `${question}${context ? `\n\nContext: ${context}` : ''}` },
    ],
    temperature: 0.2,
  });

  const options = {
    hostname: 'api.sambanova.ai',
    path: '/v1/chat/completions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
  };

  return new Promise((resolve) => {
    const req = https.request(options, (resp) => {
      let data = '';
      resp.on('data', (chunk) => (data += chunk));
      resp.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const content = parsed?.choices?.[0]?.message?.content || parsed?.message?.content || parsed?.content;
          if (content) return resolve({ ok: true, content });
          return resolve({ ok: false, error: 'No content from Sambanova' });
        } catch (e) {
          return resolve({ ok: false, error: 'Invalid JSON from Sambanova' });
        }
      });
    });
    req.on('error', (err) => resolve({ ok: false, error: err.message }));
    req.write(body);
    req.end();
  });
}

async function generateSafaiAnswer({ question, context, faqData = [] }) {
  try {
    const result = await callSambaNova({ question, context });
    if (result.ok) {
      return { content: result.content, offline: false };
    }
    const fallback = buildGuidance({ question, context, faqData });
    return { content: fallback, offline: true, note: result.error };
  } catch (err) {
    const fallback = buildGuidance({ question, context, faqData });
    return { content: fallback, offline: true, note: err.message };
  }
}

module.exports = { generateSafaiAnswer };