const express = require('express');
const {
  createPaymentIntent,
  createOrder,
} = require('../controllers/paymentController');
const router = express.Router();

router.post('/create-payment-intent', createPaymentIntent);
router.post('/order', createOrder);

module.exports = router;