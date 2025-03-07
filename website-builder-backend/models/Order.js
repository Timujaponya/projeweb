const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
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
  paymentIntent: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['completed', 'refunded'],
    default: 'completed',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Order', OrderSchema);