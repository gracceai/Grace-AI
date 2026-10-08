import QRCode from 'qrcode';

const websiteUrl = "https://graceai.com.na";
const outputFile = "graceai_qr.png";

QRCode.toFile(outputFile, websiteUrl, {
  width: 1024, // High resolution for printing
  margin: 2,
  color: {
    dark: '#000000',  // Black dots
    light: '#ffffff'  // White background
  }
}, function (err) {
  if (err) throw err;
  console.log('QR code successfully generated as ' + outputFile);
});
