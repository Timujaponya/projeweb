let stripe;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
} else {
  console.warn('STRIPE_SECRET_KEY tanımlanmamış. Ödeme özellikleri devre dışı.');
  // Mock stripe object to prevent errors
  stripe = {
    paymentIntents: {
      create: () => Promise.reject(new Error('Stripe yapılandırılmamış')),
      retrieve: () => Promise.reject(new Error('Stripe yapılandırılmamış'))
    }
  };
}

const Order = require('../models/Order');
const Template = require('../models/Template');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Create payment intent
// @route   POST /api/payments/create-payment-intent
// @access  Private
exports.createPaymentIntent = async (req, res, next) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return next(new ErrorResponse('Ödeme sistemi yapılandırılmamış', 501));
    }

    const { templateId } = req.body;

    // Find template
    const template = await Template.findById(templateId);

    if (!template) {
      return next(
        new ErrorResponse(`Template not found with id of ${templateId}`, 404)
      );
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: template.price * 100, // Stripe requires cents
      currency: 'usd',
      metadata: {
        userId: req.user.id,
        templateId: template._id.toString(),
      },
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create order after successful payment
// @route   POST /api/payments/order
// @access  Private
exports.createOrder = async (req, res, next) => {
  try {
    const { paymentIntentId, templateId } = req.body;

    // Verify the payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return next(
        new ErrorResponse('Payment not successful', 400)
      );
    }

    // Create order
    const order = await Order.create({
      template: templateId,
      user: req.user.id,
      paymentIntent: paymentIntentId,
      amount: paymentIntent.amount / 100, // Convert from cents to dollars
    });

    res.status(201).json({
      success: true,
      data: { orderId: order._id },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user orders
// @route   GET /api/payments/orders
// @access  Private
exports.getUserOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('template')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (err) {
    next(err);
  }
};