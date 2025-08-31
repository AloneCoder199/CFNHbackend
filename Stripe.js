const Stripe = require("stripe");
require("dotenv").config();

/**
 * Stripe Instance
 * 
 * ⚡ Notes:
 * - API version auto-pick hota hai Stripe account se.
 * - Test Mode: sk_test_********* (development)
 * - Live Mode: sk_live_********* (production)
 */

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  // apiVersion ko hardcode karne ki zarurat nahi,
  // Stripe khud aapke account ka latest supported version use karega
  timeout: 20000, // 20s request timeout (production best practice)
});

module.exports = stripe;
