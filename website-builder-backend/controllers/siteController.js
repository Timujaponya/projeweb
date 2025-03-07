const path = require('path');
const fs = require('fs').promises;
const ErrorResponse = require('../utils/errorResponse');
const Site = require('../models/Site');
const { generateSite } = require('../utils/siteBuilder');
const config = require('../config/siteConfig');
const mongoose = require('mongoose');

// MongoDB ObjectId formatı kontrolü için yardımcı fonksiyon
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// @desc    Get all sites
// @route   GET /api/sites
// @access  Private
exports.getSites = async (req, res, next) => {
  try {
    // Sadece kullanıcının kendi sitelerini getir ve pagination ekle
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    const query = Site.find({ user: req.user.id })
                      .populate('template', 'name description category isActive')
                      .skip(startIndex)
                      .limit(limit)
                      .sort({ createdAt: -1 });
    
    const sites = await query;
    const total = await Site.countDocuments({ user: req.user.id });
    
    res.status(200).json({
      success: true,
      count: sites.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      },
      data: sites
    });
  } catch (err) {
    next(new ErrorResponse(`Siteler getirilirken hata oluştu: ${err.message}`, 500));
  }
};

// @desc    Get single site
// @route   GET /api/sites/:id
// @access  Private
exports.getSite = async (req, res, next) => {
  try {
    // Parametre doğrulama
    if (!isValidObjectId(req.params.id)) {
      return next(new ErrorResponse(`Geçersiz site ID formatı`, 400));
    }
    
    const site = await Site.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('template');
    
    if (!site) {
      return next(new ErrorResponse(`Site bulunamadı veya erişim yetkiniz yok`, 404));
    }
    
    res.status(200).json({
      success: true,
      data: site
    });
  } catch (err) {
    next(new ErrorResponse(`Site getirilirken hata oluştu: ${err.message}`, 500));
  }
};

// @desc    Create new site
// @route   POST /api/sites
// @access  Private
exports.createSite = async (req, res, next) => {
  try {
    // Giriş doğrulama
    if (!req.body.template || !req.body.name) {
      return next(new ErrorResponse('Lütfen şablon ve site adı belirtin', 400));
    }
    
    // Template ID doğrulama
    if (!isValidObjectId(req.body.template)) {
      return next(new ErrorResponse('Geçersiz şablon ID formatı', 400));
    }
    
    // Site adı uzunluk kontrolü
    if (req.body.name.length > 50) {
      return next(new ErrorResponse('Site adı en fazla 50 karakter olabilir', 400));
    }
    
    // Add user to req.body
    req.body.user = req.user.id;
    
    const site = await Site.create(req.body);
    
    res.status(201).json({
      success: true,
      data: site
    });
  } catch (err) {
    next(new ErrorResponse(`Site oluşturulurken hata oluştu: ${err.message}`, 500));
  }
};

// @desc    Update site
// @route   PUT /api/sites/:id
// @access  Private
exports.updateSite = async (req, res, next) => {
  try {
    // Parametre doğrulama
    if (!isValidObjectId(req.params.id)) {
      return next(new ErrorResponse(`Geçersiz site ID formatı`, 400));
    }
    
    // Site sahipliğini kontrol etmek için önce siteyi bul
    let site = await Site.findOne({ 
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!site) {
      return next(new ErrorResponse(`Site bulunamadı veya erişim yetkiniz yok`, 404));
    }
    
    // Eğer site yayınlanmışsa bazı alanların değiştirilmesine izin verme
    if (site.isPublished && req.body.template) {
      return next(new ErrorResponse(`Yayınlanmış sitenin şablonu değiştirilemez`, 400));
    }
    
    // Güncellenebilir alanları filtrele - güvenlik için
    const allowedUpdates = ['name', 'customizations', 'description'];
    const updateData = {};
    
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updateData[key] = req.body[key];
      }
    });
    
    // XSS koruması için içerik temizleme kontrolü
    // Not: Gerçek implementasyonda bir HTML sanitizer kullanın
    if (updateData.customizations?.content) {
      Object.keys(updateData.customizations.content).forEach(key => {
        // Basit bir örnek - gerçekte daha kapsamlı sanitizer kullanılmalı
        updateData.customizations.content[key] = updateData.customizations.content[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .trim();
      });
    }
    
    site = await Site.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    }).populate('template');
    
    res.status(200).json({
      success: true,
      data: site
    });
  } catch (err) {
    next(new ErrorResponse(`Site güncellenirken hata oluştu: ${err.message}`, 500));
  }
};

// @desc    Delete site
// @route   DELETE /api/sites/:id
// @access  Private
exports.deleteSite = async (req, res, next) => {
  try {
    // Parametre doğrulama
    if (!isValidObjectId(req.params.id)) {
      return next(new ErrorResponse(`Geçersiz site ID formatı`, 400));
    }
    
    const site = await Site.findOne({ 
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!site) {
      return next(new ErrorResponse(`Site bulunamadı veya erişim yetkiniz yok`, 404));
    }
    
    // Yayınlanmış site dosyalarını da temizle
    if (site.isPublished && site.publishUrl) {
      try {
        const siteSlug = site.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const siteId = site._id.toString();
        const siteFolderName = `${siteSlug}-${siteId}`;
        const publicPath = path.join(config.publicDir, siteFolderName);
        
        // Dosya sistemi temizliği güvenli bir şekilde yapılmalı
        if (publicPath.includes(config.publicDir)) { // Güvenlik kontrolü
          await fs.rm(publicPath, { recursive: true, force: true });
        }
      } catch (err) {
        console.error(`Site dosyaları silinirken hata: ${err.message}`);
        // Dosya silme hatası kullanıcıya döndürülmüyor, sadece loglama yapılıyor
      }
    }
    
    // Siteyi veritabanından sil
    await Site.deleteOne({ _id: req.params.id });
    
    res.status(200).json({
      success: true,
      message: 'Site başarıyla silindi',
      data: {}
    });
  } catch (err) {
    next(new ErrorResponse(`Site silinirken hata oluştu: ${err.message}`, 500));
  }
};

// @desc    Publish site
// @route   PUT /api/sites/:id/publish
// @access  Private
exports.publishSite = async (req, res, next) => {
  try {
    // Parametre doğrulama
    if (!isValidObjectId(req.params.id)) {
      return next(new ErrorResponse(`Geçersiz site ID formatı`, 400));
    }
    
    const site = await Site.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('template');
    
    if (!site) {
      return next(new ErrorResponse(`Site bulunamadı veya erişim yetkiniz yok`, 404));
    }
    
    if (!site.template) {
      return next(new ErrorResponse(`Site için şablon bulunmadı`, 400));
    }
    
    // Kullanıcının yayınlama limiti kontrol edilebilir (ödeme planına göre)
    
    // Site generatörünü çağır
    try {
      const siteUrl = await generateSite(site);
      
      // Siteye yayınlama bilgilerini ekle
      site.publishedAt = Date.now();
      site.publishUrl = siteUrl;
      site.isPublished = true;
      await site.save();
      
      res.status(200).json({
        success: true,
        message: 'Site başarıyla yayınlandı',
        data: {
          publishUrl: site.publishUrl,
          publishedAt: site.publishedAt,
          url: siteUrl
        }
      });
    } catch (genError) {
      return next(new ErrorResponse(`Site oluşturulurken hata: ${genError.message}`, 500));
    }
  } catch (err) {
    next(new ErrorResponse(`Site yayınlanırken hata oluştu: ${err.message}`, 500));
  }
};