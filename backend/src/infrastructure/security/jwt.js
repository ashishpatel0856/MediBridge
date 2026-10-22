const jwt = require('jsonwebtoken');
const { config } = require('../../config/env');
const { UnauthorizedError } = require('../../domain/errors/app-errors');

function generateAccessToken(payload) {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
    issuer: 'amrutam-telemedicine',
    audience: 'amrutam-users'
  });
}

function generateRefreshToken(payload) {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
    issuer: 'amrutam-telemedicine',
    audience: 'amrutam-users'
  });
}

function verifyAccessToken(token) {
  try {
    return jwt.verify(token, config.jwt.secret, {
      issuer: 'amrutam-telemedicine',
      audience: 'amrutam-users'
    });
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired authentication token', error.message);
  }
}

function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, config.jwt.refreshSecret, {
      issuer: 'amrutam-telemedicine',
      audience: 'amrutam-users'
    });
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired refresh token', error.message);
  }
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
};
