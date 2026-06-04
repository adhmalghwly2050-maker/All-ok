import https from 'https';

console.log("Checking simple outbound internet connection...");
https.get('https://api.github.com/zen', {
  headers: { 'User-Agent': 'Mozilla/5.0-NodeJS' }
}, (res) => {
  console.log("Status:", res.statusCode);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log("Zen Quote:", data));
}).on('error', err => {
  console.error("Connection Error:", err.message);
});
