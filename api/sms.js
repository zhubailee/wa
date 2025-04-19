const { MessagingResponse } = require('twilio').twiml;
const fetch = require('node-fetch');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  let parsed = {};

  // Handle body format dari Vercel (raw x-www-form-urlencoded)
  if (typeof req.body === 'string') {
    parsed = Object.fromEntries(new URLSearchParams(req.body));
  } else {
    parsed = req.body;
  }

  const body = parsed.Body || '';
  const twiml = new MessagingResponse();

  try {
    if (!body.includes('-')) {
      twiml.message('Format salah! Contoh: Coldplay - Yellow');
      return res.status(200).send(twiml.toString());
    }

    const [artist, title] = body.split('-').map(s => s.trim());
    const url = `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.lyrics) {
      const lirik = data.lyrics.length > 1599 ? data.lyrics.substring(0, 1599) : data.lyrics;
      twiml.message(lirik);
    } else {
      twiml.message('Lirik tidak ditemukan.');
    }
  } catch (err) {
    console.error('Error:', err.message);
    twiml.message('Terjadi kesalahan.');
  }

  res.setHeader('Content-Type', 'text/xml');
  res.status(200).send(twiml.toString());
};
