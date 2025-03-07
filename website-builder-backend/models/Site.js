const mongoose = require('mongoose');

const SiteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a site name'],
    trim: true,
    maxlength: [50, 'Name can not be more than 50 characters'],
  },
  template: {
    type: mongoose.Schema.ObjectId,
    ref: 'Template',
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  customizations: {
    colors: {
      primary: String,
      secondary: String,
      text: String,
      background: String,
    },
    fonts: {
      heading: String,
      body: String,
    },
    layout: String,
    logo: String,
    content: Object,
  },
  domain: {
    type: String,
    unique: true,
    sparse: true,
  },
  published: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Site', SiteSchema);