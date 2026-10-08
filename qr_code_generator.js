import QRCode from "qrcode";

const websiteUrl = "https://graceai.com.na";

QRCode.toDataURL(websiteUrl, function (err, url) {
  if (err) throw err;

  const img = document.getElementById("qr-code");
  if(img) {
      img.src = url;
  }
});
