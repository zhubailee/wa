const { MessagingResponse } = require('twilio').twiml;
const fetch = require('node-fetch');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const body = req.body.Body || '';
  const twiml = new MessagingResponse();

  try {
    // Validasi input
    if (!body || !body.includes('-')) {
      twiml.message('Format salah! Contoh: Coldplay - Yellow');
      return res.send(twiml.toString());
    }

    if (!/^[a-zA-Z0-9\s\-]+$/.test(body)) {
      twiml.message('Input mengandung karakter tidak valid.');
      return res.send(twiml.toString());
    }

    const [artist, title] = body.split('-').map(s => s.trim());
    const url = `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`;

    const response = await fetch(url);
    const data = await response.json();

    if (response.ok && data.lyrics) {
      const lirik = data.lyrics.length > 1599 ? `${data.lyrics.substring(0, 1599)}...\n[Lirik telah dipotong]` : data.lyrics;
      twiml.message(lirik);
    } else {
      twiml.message('Lirik tidak ditemukan.');
    }
  } catch (error) {
    console.error('Error fetching lyrics:', error);
    twiml.message('Terjadi kesalahan.');
  }

  res.set('Content-Type', 'text/xml');
  res.send(twiml.toString());
};
