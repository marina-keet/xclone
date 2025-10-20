// Script simple pour générer un compte Ethereal
import https from 'https';

const data = JSON.stringify({
  requestor: 'test-app',
  version: '1.0.0'
});

const options = {
  hostname: 'api.nodemailer.com',
  port: 443,
  path: '/user',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  let responseData = '';
  
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    try {
      const account = JSON.parse(responseData);
      console.log('\n=== Compte Ethereal généré ===');
      console.log('Username:', account.user);
      console.log('Password:', account.pass);
      console.log('SMTP Host: smtp.ethereal.email');
      console.log('SMTP Port: 587');
      console.log('Web interface:', account.web);
      console.log('\nAjoutez ces variables à votre .env :');
      console.log(`ETHEREAL_USERNAME=${account.user}`);
      console.log(`ETHEREAL_PASSWORD=${account.pass}`);
    } catch (error) {
      console.error('Erreur lors du parsing de la réponse:', error);
    }
  });
});

req.on('error', (error) => {
  console.error('Erreur:', error);
});

req.write(data);
req.end();