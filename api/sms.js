const express = require('express');
const bodyParser = require('body-parser');
const { MessagingResponse } = require('twilio').twiml;
const fetch = require('node-fetch');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/sms', async (req, res) => {
const twiml = new MessagingResponse();
const message = req.body.Body || '';

try {
if (!message.includes('-')) {
twiml.message('Format salah! Contoh: Coldplay - Yellow');
res.type('text/xml');
return res.send(twiml.toString());
}

const [artist, title] = message.split('-').map(x => x.trim());  
const apiURL = `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`;  
const response = await fetch(apiURL);  
const data = await response.json();  

if (data.lyrics) {  
  const lyrics = data.lyrics.length > 1599 ? data.lyrics.substring(0, 1599) : data.lyrics;  
  twiml.message(lyrics);  
} else {  
  twiml.message('Lirik tidak ditemukan.');  
}

} catch (err) {
console.error('Error:', err);
twiml.message('Terjadi kesalahan saat mengambil lirik.');
}

res.type('text/xml');
res.send(twiml.toString());
});

app.listen(3000, () => console.log('Server berjalan di http://localhost:3000'));
