const express = require('express');
const bodyParser = require('body-parser');
const { MessagingResponse } = require('twilio').twiml;
const fetch = require('node-fetch');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/sms', async (req, res) => {
  const twiml = new MessagingResponse();
  const message = req.body.Body?.trim() || '';

  try {
    if (message.toLowerCase().startsWith('/lirik')) {
      const content = message.slice(6).trim(); // hapus '/lirik'
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

    else if (message.toLowerCase().startsWith('/tiktok')) {
      const url = message.slice(7).trim();
      if (!url.includes('tiktok.com')) {
        twiml.message('Link TikTok tidak valid.');
      } else {
        // Ganti API TikTok downloader di bawah jika link mati
        const apiURL = `https://api.tiklydown.me/api/download?url=${encodeURIComponent(url)}`;
        const response = await fetch(apiURL);
        const data = await response.json();
        const videoUrl = data.video?.no_watermark;

        twiml.message(videoUrl ? `Video tanpa watermark:\n${videoUrl}` : 'Gagal mengambil video TikTok.');
      }
    }

    else {
      twiml.message('Perintah tidak dikenali.\nContoh:\n/lirik Coldplay - Yellow\n/tiktok [link]');
    }
  } catch (err) {
    console.error('Error:', err);
    twiml.message('Terjadi kesalahan.');
  }

  res.type('text/xml');
  res.send(twiml.toString());
});

app.listen(3000, () => console.log('Server aktif di http://localhost:3000'));
