const mongoose = require('mongoose');

const TemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a template name'],
    trim: true,
    maxlength: [50, 'Name can not be more than 50 characters'],
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description can not be more than 500 characters'],
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: [
      'portfolio',
      'business',
      'ecommerce',
      'blog',
      'restaurant',
      'event',
      'realestate',
      'other',
    ],
  },
  previewImage: {
    type: String,
    required: [true, 'Please add a preview image'],
  },
  structure: {
    type: Object,
    required: [true, 'Please add template structure'],
  },
  customizableOptions: {
    colors: [String],
    fonts: [String],
    layouts: [String],
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
  },
  featured: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Template', TemplateSchema);