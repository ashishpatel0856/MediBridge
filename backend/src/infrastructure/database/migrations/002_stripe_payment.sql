-- Stripe Payment Integration Migration
-- Run this after 001_initial_schema.sql

-- 1. Add PENDING_PAYMENT to consultation status check constraint
ALTER TABLE consultations 
  DROP CONSTRAINT IF EXISTS consultations_status_check;

ALTER TABLE consultations 
  ADD CONSTRAINT consultations_status_check 
  CHECK (status IN ('PENDING_PAYMENT', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'));

-- 2. Add stripe_payment_intent_id column to payments table
ALTER TABLE payments 
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id VARCHAR(255);

-- 3. Add updated_at column to payments if not exists
ALTER TABLE payments 
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 4. Create index on stripe payment intent ID for fast webhook lookups
CREATE INDEX IF NOT EXISTS idx_payments_stripe_pi ON payments(stripe_payment_intent_id);

-- 5. Update payment status constraint to include PENDING
ALTER TABLE payments 
  DROP CONSTRAINT IF EXISTS payments_status_check;

ALTER TABLE payments 
  ADD CONSTRAINT payments_status_check 
  CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'));

-- 6. Update payment_method to support STRIPE
-- No constraint change needed since payment_method is a VARCHAR without CHECK
