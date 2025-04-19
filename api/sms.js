const express = require('express');
const bodyParser = require('body-parser');
const { MessagingResponse } = require('twilio').twiml;
const fetch = require('node-fetch');
const cheerio = require('cheerio'); // npm install cheerio

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/sms', async (req, res) => {
  const twiml = new MessagingResponse();
  const message = req.body.Body?.trim() || '';

  try {
    if (message.toLowerCase().startsWith('/lirik')) {
      const content = message.slice(6).trim();
      if (!content.includes('-')) {
        twiml.message('Format salah!\nContoh: /lirik Coldplay - Yellow');
      } else {
        const [artist, title] = content.split('-').map(x => x.trim());
        const apiURL = `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`;
        const response = await fetch(apiURL);
        const data = await response.json();
        const lyrics = data.lyrics ? data.lyrics.slice(0, 1599) : null;
        twiml.message(lyrics || 'Lirik tidak ditemukan.');
      }
    }

    else {
      twiml.message('Perintah tidak dikenali.\nContoh:\n/lirik Coldplay - Yellow');
    }
  } catch (err) {
    console.error('Error:', err);
    twiml.message('Terjadi kesalahan.');
  }

  res.type('text/xml');
  res.send(twiml.toString());
});

app.listen(3000, () => console.log('Server aktif di http://localhost:3000'));
