const path = require('path');

module.exports = {
  // Şablonların tutulduğu dizin
  templatesDir: path.join(__dirname, '..', 'src', 'templates'),
  
  // Derleme işlemlerinin yapılacağı geçici dizin
  buildDir: path.join(__dirname, '..', 'build'),
  
  // Yayınlanan sitelerin tutulacağı dizin
  publicDir: path.join(__dirname, '..', 'public', 'sites'),
  
  // Yayınlanan sitelerin erişileceği temel URL
  siteBaseUrl: process.env.SITE_BASE_URL || 'https://example.com/sites'
};