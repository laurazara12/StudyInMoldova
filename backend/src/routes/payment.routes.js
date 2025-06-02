const express = require('express');
const router = express.Router();
const { createPaymentIntent, confirmPayment, verifyPayment } = require('../controllers/payment.controller');
const { createCheckoutSession, checkPaymentStatus, withdrawApplication } = require('../controllers/checkout.controller');
const { auth } = require('../middleware/auth');

// Rute pentru procesarea plăților
router.post('/create-intent', auth, createPaymentIntent);
router.post('/confirm', auth, confirmPayment);
router.post('/verify', auth, verifyPayment);
router.post('/create-checkout-session', auth, createCheckoutSession);
router.get('/check-payment-status/:session_id', auth, checkPaymentStatus);
router.post('/withdraw/:application_id', auth, withdrawApplication);

module.exports = router; 