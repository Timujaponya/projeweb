const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const config = require('../config/siteConfig');

/**
 * Generate site from template and customizations
 * @param {Object} site - Site document from MongoDB
 * @returns {Promise<string>} - URL of the generated site
 */
exports.generateSite = async (site) => {
  try {
    // Site için benzersiz bir klasör adı oluştur (slug + id)
    const siteSlug = site.name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    
    const siteId = site._id.toString();
    const siteFolderName = `${siteSlug}-${siteId}`;
    
    // Site build ve yayınlama yolları
    const buildPath = path.join(config.buildDir, siteFolderName);
    const publicPath = path.join(config.publicDir, siteFolderName);
    
    // Şablon kontrolü
    if (!site.template || !site.template.folderName) {
      throw new Error('Geçerli bir şablon bulunamadı. Lütfen site ayarlarınızı kontrol edin.');
    }
    
    const templatePath = path.join(config.templatesDir, site.template.folderName);
    
    // Şablonun varlığını kontrol et
    if (!fsSync.existsSync(templatePath)) {
      throw new Error(`"${site.template.folderName}" şablon dizini bulunamadı. Lütfen sistem yöneticisiyle iletişime geçin.`);
    }
    
    console.log(`Site oluşturma işlemi başlatıldı: "${site.name}" (${siteFolderName})`);
    
    // Önceden bir build varsa temizle
    if (fsSync.existsSync(buildPath)) {
      await fs.rm(buildPath, { recursive: true, force: true })
        .catch(err => {
          console.warn(`Uyarı: Eski build temizlenirken bir sorun oluştu: ${err.message}`);
          // Devam et - kritik bir hata değil
        });
    }
    
    // Build dizini oluştur
    await fs.mkdir(buildPath, { recursive: true });
    
    // Şablon dosyalarını kopyala
    await copyTemplateFiles(templatePath, buildPath);
    
    // Özelleştirmeleri uygula
    if (site.customizations) {
      await applyCustomizations(buildPath, site.customizations, site.template.structure);
    }
    
    // Build'i public dizine taşı - önce eski siteyi temizle
    if (fsSync.existsSync(publicPath)) {
      await fs.rm(publicPath, { recursive: true, force: true })
        .catch(err => {
          console.warn(`Uyarı: Eski yayınlanan site temizlenirken bir sorun oluştu: ${err.message}`);
        });
    }
    
    // Public dizininin mevcut olduğundan emin ol
    await fs.mkdir(path.dirname(publicPath), { recursive: true });
    
    // Oluşturulan siteyi public dizinine taşı
    await fs.rename(buildPath, publicPath);
    
    console.log(`Site başarıyla oluşturuldu: ${config.siteBaseUrl}/${siteFolderName}`);
    return `${config.siteBaseUrl}/${siteFolderName}`;
  } catch (error) {
    console.error('Site oluşturma hatası:', error);
    throw new Error(`Site oluşturulamadı: ${error.message}`);
  }
};

/**
 * Belirli uzantıya sahip dosyaları bulur
 * @param {string} directory - Aranacak dizin
 * @param {string} extension - Aranacak dosya uzantısı (.css, .html, vb.)
 * @returns {Promise<string[]>} - Bulunan dosyaların tam yolları
 */
const findFilesByExtension = async (directory, extension) => {
  const results = [];
  
  async function scan(dir) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      await Promise.all(entries.map(async (entry) => {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          await scan(fullPath);
        } else if (entry.isFile() && path.extname(entry.name) === extension) {
          results.push(fullPath);
        }
      }));
    } catch (err) {
      console.error(`Dizin taranırken hata: ${dir}`, err);
    }
  }
  
  await scan(directory);
  return results;
};

/**
 * Copy template files to build directory
 * @param {string} source - Source directory
 * @param {string} destination - Destination directory
 * @returns {Promise<void>}
 */
const copyTemplateFiles = async (source, destination) => {
  try {
    // Kaynak dizin kontrolü
    const sourceStat = await fs.stat(source).catch(() => {
      throw new Error(`Kaynak dizin bulunamadı: ${source}`);
    });
    
    if (!sourceStat.isDirectory()) {
      throw new Error(`"${source}" bir dizin değil`);
    }
    
    // Dizindeki tüm dosya ve klasörleri oku
    const files = await fs.readdir(source, { withFileTypes: true });
    
    // Kopyalama işlemleri için Promise dizisi
    const copyPromises = files.map(async (file) => {
      const srcPath = path.join(source, file.name);
      const destPath = path.join(destination, file.name);
      
      try {
        if (file.isDirectory()) {
          // Alt dizin oluştur
          await fs.mkdir(destPath, { recursive: true });
          
          // Alt dizin içeriğini kopyala (recursive)
          return copyTemplateFiles(srcPath, destPath);
        } else {
          // Dosyaları stream ile kopyala - büyük dosyalar için daha verimli
          return fs.copyFile(srcPath, destPath);
        }
      } catch (err) {
        throw new Error(`"${srcPath}" dosyası kopyalanırken hata: ${err.message}`);
      }
    });
    
    await Promise.all(copyPromises);
  } catch (error) {
    console.error(`Şablon kopyalama hatası:`, error);
    throw new Error(`Şablon dosyaları kopyalanırken hata oluştu: ${error.message}`);
  }
};

/**
 * Apply customizations to the template
 * @param {string} buildPath - Path to the build directory
 * @param {Object} customizations - Customizations object
 * @param {Object} structure - Template structure
 * @returns {Promise<void>}
 */
const applyCustomizations = async (buildPath, customizations, structure) => {
  try {
    // CSS özelleştirmeleri (renkler ve yazı tipleri)
    if (customizations.colors || customizations.fonts) {
      await applyCssCustomizations(buildPath, customizations);
    }
    
    // HTML içerik özelleştirmeleri
    if (customizations.content) {
      await applyHtmlCustomizations(buildPath, customizations.content);
    }
    
    // Logo değişikliği
    if (customizations.logo) {
      await applyLogoCustomization(buildPath, customizations.logo);
    }
    
    // Diğer özelleştirmeler buraya eklenebilir
  } catch (error) {
    console.error('Özelleştirme hatası:', error);
    throw new Error(`Özelleştirmeler uygulanırken hata oluştu: ${error.message}`);
  }
};

/**
 * CSS özelleştirmelerini uygular (renkler ve yazı tipleri)
 * @param {string} buildPath - Site build dizini
 * @param {Object} customizations - Özelleştirme nesnesi
 * @returns {Promise<void>}
 */
const applyCssCustomizations = async (buildPath, customizations) => {
  // CSS dosyalarını bul
  const cssFiles = await findFilesByExtension(buildPath, '.css');
  
  if (cssFiles.length === 0) {
    console.warn('CSS özelleştirmesi için hiçbir CSS dosyası bulunamadı');
    return;
  }
  
  // Ana CSS dosyasını seç (ileride: özellikle main.css, styles.css vb. aranabilir)
  const mainCssFile = cssFiles[0];
  
  // CSS dosyasını oku
  let cssContent = await fs.readFile(mainCssFile, 'utf8');
  let contentChanged = false;
  
  // Renk değişikliklerini uygula
  if (customizations.colors) {
    const colorMappings = {
      primary: '--primary-color',
      secondary: '--secondary-color',
      background: '--bg-color',
      text: '--text-color'
    };
    
    for (const [colorType, colorValue] of Object.entries(customizations.colors)) {
      if (colorValue && colorMappings[colorType]) {
        const cssVarName = colorMappings[colorType];
        const colorRegex = new RegExp(`${cssVarName}:.*?;`, 'g');
        
        if (colorRegex.test(cssContent)) {
          cssContent = cssContent.replace(colorRegex, `${cssVarName}: ${colorValue};`);
          contentChanged = true;
        } else {
          // CSS değişkeni bulunamazsa, :root veya body seçicisine ekle
          const rootRegex = /:root\s*\{/;
          if (rootRegex.test(cssContent)) {
            cssContent = cssContent.replace(rootRegex, `:root {\n  ${cssVarName}: ${colorValue};`);
            contentChanged = true;
          }
        }
      }
    }
  }
  
  // Font değişikliklerini uygula
  if (customizations.fonts) {
    const fontMappings = {
      heading: '--heading-font',
      body: '--body-font'
    };
    
    for (const [fontType, fontValue] of Object.entries(customizations.fonts)) {
      if (fontValue && fontMappings[fontType]) {
        const cssVarName = fontMappings[fontType];
        const fontRegex = new RegExp(`${cssVarName}:.*?;`, 'g');
        
        if (fontRegex.test(cssContent)) {
          cssContent = cssContent.replace(fontRegex, `${cssVarName}: ${fontValue}, sans-serif;`);
          contentChanged = true;
        }
      }
    }
  }
  
  // Değişiklik yapıldıysa CSS dosyasını kaydet
  if (contentChanged) {
    await fs.writeFile(mainCssFile, cssContent, 'utf8');
    console.log('CSS özelleştirmeleri başarıyla uygulandı');
  }
};

/**
 * HTML içerik özelleştirmelerini uygula
 * @param {string} buildPath - Site build dizini
 * @param {Object} contentCustomizations - İçerik özelleştirmeleri
 * @returns {Promise<void>}
 */
const applyHtmlCustomizations = async (buildPath, contentCustomizations) => {
  // HTML dosyalarını bul
  const htmlFiles = await findFilesByExtension(buildPath, '.html');
  
  if (htmlFiles.length === 0) {
    console.warn('HTML özelleştirmesi için hiçbir HTML dosyası bulunamadı');
    return;
  }
  
  // Ana HTML dosyasını seç (index.html varsa onu kullan, yoksa ilkini al)
  const indexHtml = htmlFiles.find(file => path.basename(file) === 'index.html') || htmlFiles[0];
  
  // HTML dosyasını oku
  let htmlContent = await fs.readFile(indexHtml, 'utf8');
  let contentChanged = false;
  
  // İçerik değişikliklerini uygula
  for (const [elementId, contentValue] of Object.entries(contentCustomizations)) {
    // XSS koruması için içerik temizleme
    const sanitizedContent = sanitizeHtml(contentValue);
    
    // data-content-id ile eşleşen içeriği değiştir
    const regex = new RegExp(`data-content-id="${elementId}"[^>]*>(.*?)<`, 'gs');
    if (regex.test(htmlContent)) {
      htmlContent = htmlContent.replace(regex, `data-content-id="${elementId}">${sanitizedContent}<`);
      contentChanged = true;
    }
  }
  
  // Değişiklik yapıldıysa HTML dosyasını kaydet
  if (contentChanged) {
    await fs.writeFile(indexHtml, htmlContent, 'utf8');
    console.log('HTML içerik özelleştirmeleri başarıyla uygulandı');
  }
};

/**
 * Logo özelleştirmesini uygula
 * @param {string} buildPath - Site build dizini
 * @param {string} logoUrl - Yeni logo URL'si
 * @returns {Promise<void>}
 */
const applyLogoCustomization = async (buildPath, logoUrl) => {
  // Logo özelleştirmesi için HTML dosyalarını bul
  const htmlFiles = await findFilesByExtension(buildPath, '.html');
  
  if (htmlFiles.length > 0) {
    const indexHtml = htmlFiles.find(file => path.basename(file) === 'index.html') || htmlFiles[0];
    let htmlContent = await fs.readFile(indexHtml, 'utf8');
    
    // Logo img etiketini bul ve değiştir
    const logoRegex = /<img[^>]*data-logo[^>]*src="[^"]*"[^>]*>/g;
    if (logoRegex.test(htmlContent)) {
      htmlContent = htmlContent.replace(logoRegex, (match) => {
        return match.replace(/src="[^"]*"/, `src="${logoUrl}"`);
      });
      
      await fs.writeFile(indexHtml, htmlContent, 'utf8');
      console.log('Logo özelleştirmesi başarıyla uygulandı');
    }
  }
};

/**
 * HTML içeriğinden XSS saldırılarını temizler (basit implementasyon)
 * Not: Gerçek projede daha gelişmiş bir HTML sanitizer kullanılmalı
 * @param {string} html - Ham HTML içeriği
 * @returns {string} - Temizlenmiş HTML
 */
const sanitizeHtml = (html) => {
  if (!html || typeof html !== 'string') return '';
  
  // Script etiketleri ve olay yöneticilerini (onClick vb.) temizle
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/on\w+=\S+/gi, '')
    .trim();
};