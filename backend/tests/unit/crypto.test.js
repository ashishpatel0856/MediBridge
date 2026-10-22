const {
  hashPassword,
  comparePassword,
  encryptPHI,
  decryptPHI,
  generatePrescriptionSignature,
  verifyPrescriptionSignature
} = require('../../src/infrastructure/security/crypto');

describe('Cryptographic Security Utilities', () => {
  describe('Password Hashing', () => {
    it('should hash a password and correctly verify it', async () => {
      const password = 'StrongPassword@2026';
      const hash = await hashPassword(password);

      expect(hash).not.toBe(password);
      expect(hash.startsWith('$2')).toBe(true);

      const isMatch = await comparePassword(password, hash);
      expect(isMatch).toBe(true);

      const isWrongMatch = await comparePassword('WrongPassword', hash);
      expect(isWrongMatch).toBe(false);
    });
  });

  describe('PHI AES-256-GCM Encryption / Decryption', () => {
    it('should encrypt sensitive patient medical records and decrypt accurately', () => {
      const sensitiveData = 'Patient has chronic hypertension and history of Pitta aggravation';
      const encrypted = encryptPHI(sensitiveData);

      expect(encrypted).not.toBe(sensitiveData);
      expect(encrypted.split(':').length).toBe(3); // iv:tag:ciphertext

      const decrypted = decryptPHI(encrypted);
      expect(decrypted).toBe(sensitiveData);
    });

    it('should return empty string if input is empty', () => {
      expect(encryptPHI('')).toBe('');
      expect(decryptPHI('')).toBe('');
    });
  });

  describe('Prescription Digital Signature (HMAC-SHA256)', () => {
    it('should sign prescription payload and verify its authenticity', () => {
      const payload = {
        consultationId: '11111111-2222-3333-4444-555555555555',
        doctorId: '66666666-7777-8888-9999-000000000000',
        patientId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
        diagnosis: 'Amavata (Rheumatoid arthritis)',
        medications: [{ medicineName: 'Amrutam Rasayan', dosage: '1 tsp', frequency: 'daily', duration: '30 days' }],
        timestamp: new Date().toISOString()
      };

      const signature = generatePrescriptionSignature(payload);
      expect(signature).toHaveLength(64);

      const isValid = verifyPrescriptionSignature(payload, signature);
      expect(isValid).toBe(true);

      const tamperedPayload = { ...payload, diagnosis: 'Completely different diagnosis' };
      const isTamperedValid = verifyPrescriptionSignature(tamperedPayload, signature);
      expect(isTamperedValid).toBe(false);
    });
  });
});
