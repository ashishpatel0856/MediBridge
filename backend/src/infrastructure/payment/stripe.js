const Stripe = require('stripe');
const { config } = require('../../config/env');
const logger = require('../logger');

let stripeInstance = null;

/**
 * Get or create the Stripe client singleton
 */
const getStripe = () => {
  if (!stripeInstance) {
    if (!config.stripe.secretKey) {
      logger.warn('Stripe secret key is not configured. Payment features will not work.');
    }
    stripeInstance = new Stripe(config.stripe.secretKey, {
      apiVersion: '2024-12-18.acacia',
    });
  }
  return stripeInstance;
};

module.exports = { getStripe };
