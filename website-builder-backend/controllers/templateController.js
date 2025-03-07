const Template = require('../models/Template');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all templates
// @route   GET /api/templates
// @access  Public
exports.getTemplates = async (req, res, next) => {
  try {
    let query = Template.find({ isActive: true }); // Sadece aktif şablonları göster
    
    // Filter by category if specified
    if (req.query.category) {
      query = query.where('category').equals(req.query.category);
    }
    
    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('name');
    }
    
    const templates = await query;
    
    res.status(200).json({
      success: true,
      count: templates.length,
      data: templates
    });
  } catch (err) {
    next(new ErrorResponse(`Şablonları getirirken hata oluştu: ${err.message}`, 500));
  }
};

// @desc    Get single template
// @route   GET /api/templates/:id
// @access  Public
exports.getTemplate = async (req, res, next) => {
  try {
    // Parametre doğrulama
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return next(new ErrorResponse(`Geçersiz şablon ID formatı`, 400));
    }
    
    const template = await Template.findOne({
      _id: req.params.id,
      isActive: true // Sadece aktif şablonları göster
    });
    
    if (!template) {
      return next(new ErrorResponse(`Şablon bulunamadı`, 404));
    }
    
    res.status(200).json({
      success: true,
      data: template
    });
  } catch (err) {
    next(new ErrorResponse(`Şablon getirilirken hata oluştu: ${err.message}`, 500));
  }
};

// @desc    Create new template
// @route   POST /api/templates
// @access  Private/Admin
exports.createTemplate = async (req, res, next) => {
  try {
    // Admin kontrolü
    if (!req.user.isAdmin) {
      return next(new ErrorResponse(`Bu işlem için admin yetkisi gereklidir`, 403));
    }
    
    // Gerekli alanların kontrolü
    if (!req.body.name || !req.body.folderName) {
      return next(new ErrorResponse(`Lütfen şablon adı ve klasör adını belirtin`, 400));
    }
    
    const template = await Template.create(req.body);
    
    res.status(201).json({
      success: true,
      data: template
    });
  } catch (err) {
    next(new ErrorResponse(`Şablon oluşturulurken hata oluştu: ${err.message}`, 500));
  }
};

// @desc    Update template
// @route   PUT /api/templates/:id
// @access  Private/Admin
exports.updateTemplate = async (req, res, next) => {
  try {
    // Admin kontrolü
    if (!req.user.isAdmin) {
      return next(new ErrorResponse(`Bu işlem için admin yetkisi gereklidir`, 403));
    }
    
    // Parametre doğrulama
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return next(new ErrorResponse(`Geçersiz şablon ID formatı`, 400));
    }
    
    let template = await Template.findById(req.params.id);
    
    if (!template) {
      return next(new ErrorResponse(`Şablon bulunamadı`, 404));
    }
    
    // Güncellenebilir alanları filtrele
    const allowedUpdates = ['name', 'description', 'category', 'isActive', 'previewUrl', 'structure'];
    const updateData = {};
    
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updateData[key] = req.body[key];
      }
    });
    
    template = await Template.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: template
    });
  } catch (err) {
    next(new ErrorResponse(`Şablon güncellenirken hata oluştu: ${err.message}`, 500));
  }
};

// @desc    Delete template
// @route   DELETE /api/templates/:id
// @access  Private/Admin
exports.deleteTemplate = async (req, res, next) => {
  try {
    // Admin kontrolü
    if (!req.user.isAdmin) {
      return next(new ErrorResponse(`Bu işlem için admin yetkisi gereklidir`, 403));
    }
    
    // Parametre doğrulama
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return next(new ErrorResponse(`Geçersiz şablon ID formatı`, 400));
    }
    
    const template = await Template.findById(req.params.id);
    
    if (!template) {
      return next(new ErrorResponse(`Şablon bulunamadı`, 404));
    }
    
    // Tamamen silmek yerine aktif bayrağını false yap (soft delete)
    template.isActive = false;
    await template.save();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(new ErrorResponse(`Şablon silinirken hata oluştu: ${err.message}`, 500));
  }
};