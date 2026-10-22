// Mock database for automated unit and integration tests
// Implements in-memory PostgreSQL query simulation for tests without requiring a live Postgres instance

class MockDatabaseConnection {
  constructor() {
    this.users = new Map();
    this.profiles = new Map();
    this.doctors = new Map();
    this.slots = new Map();
    this.consultations = new Map();
    this.prescriptions = new Map();
    this.payments = new Map();
    this.auditLogs = new Map();
    this.idempotencyKeys = new Map();
    this.slotLocks = new Set();
  }

  isMock() {
    return true;
  }

  async query(text, params = []) {
    const sql = text.trim().replace(/\s+/g, ' ');

    // 1. Health check probe
    if (sql.startsWith('SELECT 1')) {
      return { rows: [{ alive: 1 }], rowCount: 1 };
    }

    // 2. Idempotency queries
    if (sql.includes('FROM idempotency_keys WHERE key = $1')) {
      const item = this.idempotencyKeys.get(params[0]);
      if (item) {
        return {
          rows: [{
            statusCode: item.statusCode || item.status_code,
            responseBody: item.responseBody || item.response_body,
            expiresAt: item.expiresAt || item.expires_at
          }],
          rowCount: 1
        };
      }
      return { rows: [], rowCount: 0 };
    }

    if (sql.includes('INSERT INTO idempotency_keys')) {
      const [key, actor_id, path, status_code, response_body, expires_at] = params;
      this.idempotencyKeys.set(key, {
        key,
        actor_id,
        path,
        statusCode: status_code,
        status_code,
        responseBody: response_body,
        response_body,
        expiresAt: expires_at,
        expires_at
      });
      return { rows: [], rowCount: 1 };
    }

    // 3. User queries
    if (sql.includes('FROM users WHERE email = $1')) {
      const email = params[0].toLowerCase();
      for (const u of this.users.values()) {
        if (u.email === email) {
          return {
            rows: [{
              id: u.id,
              email: u.email,
              passwordHash: u.password_hash || u.passwordHash,
              role: u.role,
              isMfaEnabled: u.is_mfa_enabled ?? u.isMfaEnabled ?? false,
              mfaSecret: u.mfa_secret ?? u.mfaSecret ?? null
            }],
            rowCount: 1
          };
        }
      }
      return { rows: [], rowCount: 0 };
    }

    if (sql.includes('FROM users WHERE id = $1')) {
      const u = this.users.get(params[0]);
      return { rows: u ? [u] : [], rowCount: u ? 1 : 0 };
    }

    if (sql.includes('SELECT mfa_secret FROM users WHERE id = $1')) {
      const u = this.users.get(params[0]);
      return { rows: u ? [{ mfa_secret: u.mfa_secret || u.mfaSecret }] : [], rowCount: u ? 1 : 0 };
    }

    if (sql.includes('UPDATE users SET mfa_secret = $1 WHERE id = $2')) {
      const u = this.users.get(params[1]);
      if (u) {
        u.mfa_secret = params[0];
        u.mfaSecret = params[0];
      }
      return { rows: [], rowCount: 1 };
    }

    if (sql.includes('UPDATE users SET is_mfa_enabled = true WHERE id = $1')) {
      const u = this.users.get(params[0]);
      if (u) {
        u.is_mfa_enabled = true;
        u.isMfaEnabled = true;
      }
      return { rows: [], rowCount: 1 };
    }

    if (sql.includes('INSERT INTO users')) {
      const [id, email, password_hash, role] = params;
      for (const existing of this.users.values()) {
        if (existing.email === email.toLowerCase()) {
          const err = new Error('duplicate key value violates unique constraint "users_email_key"');
          err.code = '23505';
          throw err;
        }
      }
      const userObj = { id, email: email.toLowerCase(), password_hash, role, is_mfa_enabled: false, is_active: true };
      this.users.set(id, userObj);
      return { rows: [userObj], rowCount: 1 };
    }

    // 4. Profile queries
    if (sql.includes('INSERT INTO profiles')) {
      const [id, user_id, first_name, last_name, phone, date_of_birth, gender] = params;
      const profileObj = { id, user_id, userId: user_id, first_name, firstName: first_name, last_name, lastName: last_name, phone, date_of_birth, gender };
      this.profiles.set(id, profileObj);
      return { rows: [profileObj], rowCount: 1 };
    }

    // 5. Doctor queries
    if (sql.includes('SELECT is_verified FROM doctors WHERE user_id = $1')) {
      for (const d of this.doctors.values()) {
        if (d.user_id === params[0] || d.userId === params[0]) {
          return { rows: [{ is_verified: d.is_verified ?? d.isVerified ?? false }], rowCount: 1 };
        }
      }
      return { rows: [], rowCount: 0 };
    }

    if (sql.includes('INSERT INTO doctors')) {
      const [id, user_id, license_number, specialties, qualifications, experience_years, consultation_fee, bio] = params;
      const doctorObj = {
        id,
        user_id,
        userId: user_id,
        license_number,
        licenseNumber: license_number,
        specialties: Array.isArray(specialties) ? specialties : [specialties],
        qualifications: Array.isArray(qualifications) ? qualifications : [qualifications],
        experience_years: experience_years,
        experienceYears: experience_years,
        consultation_fee: consultation_fee,
        consultationFee: consultation_fee,
        bio,
        rating_average: 0.0,
        ratingAverage: 0.0,
        rating_count: 0,
        ratingCount: 0,
        is_verified: false,
        isVerified: false,
        languages: ['English', 'Hindi']
      };
      this.doctors.set(id, doctorObj);
      return { rows: [doctorObj], rowCount: 1 };
    }

    if (sql.includes('SELECT consultation_fee FROM doctors WHERE id = $1')) {
      const d = this.doctors.get(params[0]);
      return { rows: d ? [{ consultation_fee: d.consultationFee || d.consultation_fee || 500.0 }] : [], rowCount: d ? 1 : 0 };
    }

    if (sql.includes('SELECT id FROM doctors WHERE user_id = $1') || sql.includes('SELECT * FROM doctors WHERE user_id = $1')) {
      for (const d of this.doctors.values()) {
        if (d.user_id === params[0] || d.userId === params[0]) {
          return { rows: [d], rowCount: 1 };
        }
      }
      return { rows: [], rowCount: 0 };
    }

    if (sql.includes('FROM doctors d') && sql.includes('JOIN profiles p ON d.user_id = p.user_id') && sql.includes('WHERE d.id = $1')) {
      const d = this.doctors.get(params[0]);
      if (!d) return { rows: [], rowCount: 0 };
      let p = null;
      for (const profile of this.profiles.values()) {
        if (profile.user_id === d.userId || profile.userId === d.userId) {
          p = profile;
          break;
        }
      }
      const row = {
        id: d.id,
        userId: d.userId || d.user_id,
        licenseNumber: d.licenseNumber || d.license_number,
        specialties: d.specialties,
        qualifications: d.qualifications,
        experienceYears: d.experienceYears || d.experience_years,
        consultationFee: parseFloat(d.consultationFee || d.consultation_fee),
        bio: d.bio,
        ratingAverage: parseFloat(d.ratingAverage ?? d.rating_average ?? 0),
        ratingCount: d.ratingCount || d.rating_count || 0,
        languages: d.languages,
        firstName: p ? (p.firstName || p.first_name) : 'Doctor',
        lastName: p ? (p.lastName || p.last_name) : 'Amrutam'
      };
      return { rows: [row], rowCount: 1 };
    }

    if (sql.includes('SELECT COUNT(*) as total FROM doctors d JOIN profiles p')) {
      const verifiedDocs = Array.from(this.doctors.values()).filter(d => (d.is_verified ?? d.isVerified ?? false) === true);
      return { rows: [{ total: verifiedDocs.length }], rowCount: 1 };
    }

    if (sql.includes('FROM doctors d JOIN profiles p ON d.user_id = p.user_id') && sql.includes('ORDER BY')) {
      const verifiedDocs = Array.from(this.doctors.values()).filter(d => (d.is_verified ?? d.isVerified ?? false) === true);
      const rows = verifiedDocs.map(d => {
        let p = null;
        for (const profile of this.profiles.values()) {
          if (profile.user_id === d.userId || profile.userId === d.userId) {
            p = profile;
            break;
          }
        }
        return {
          id: d.id,
          userId: d.userId || d.user_id,
          licenseNumber: d.licenseNumber || d.license_number,
          specialties: d.specialties,
          qualifications: d.qualifications,
          experienceYears: d.experienceYears || d.experience_years,
          consultationFee: parseFloat(d.consultationFee || d.consultation_fee),
          bio: d.bio,
          ratingAverage: parseFloat(d.ratingAverage ?? d.rating_average ?? 0),
          ratingCount: d.ratingCount || d.rating_count || 0,
          languages: d.languages,
          firstName: p ? (p.firstName || p.first_name) : 'Doctor',
          lastName: p ? (p.lastName || p.last_name) : 'Amrutam'
        };
      });
      return { rows, rowCount: rows.length };
    }

    // Verify doctor by doctor ID (admin verification endpoint)
    if (sql.includes('SELECT id') && sql.includes('is_verified') && sql.includes('FROM doctors WHERE id = $1') && !sql.includes('JOIN')) {
      const d = this.doctors.get(params[0]);
      if (!d) return { rows: [], rowCount: 0 };
      return {
        rows: [{
          id: d.id,
          userId: d.userId || d.user_id,
          isVerified: d.is_verified ?? d.isVerified ?? false
        }],
        rowCount: 1
      };
    }

    if (sql.includes('UPDATE doctors SET is_verified = true') && sql.includes('WHERE id = $1')) {
      const d = this.doctors.get(params[0]);
      if (!d) return { rows: [], rowCount: 0 };
      d.is_verified = true;
      d.isVerified = true;
      return {
        rows: [{
          id: d.id,
          userId: d.userId || d.user_id,
          isVerified: true
        }],
        rowCount: 1
      };
    }

    if (sql.includes('UPDATE doctors SET') && sql.includes('WHERE user_id =')) {
      const userId = params[params.length - 1];
      for (const d of this.doctors.values()) {
        if (d.userId === userId || d.user_id === userId) {
          return { rows: [d], rowCount: 1 };
        }
      }
      return { rows: [], rowCount: 0 };
    }

    // 6. Availability Slots queries
    if (sql.includes('INSERT INTO availability_slots')) {
      const [id, doctor_id, start_time, end_time] = params;
      const slotObj = {
        id,
        doctor_id,
        doctorId: doctor_id,
        start_time: new Date(start_time),
        startTime: new Date(start_time),
        end_time: new Date(end_time),
        endTime: new Date(end_time),
        is_booked: false,
        isBooked: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.slots.set(id, slotObj);
      return { rows: [slotObj], rowCount: 1 };
    }

    if (sql.includes('FROM availability_slots WHERE id = $1')) {
      const s = this.slots.get(params[0]);
      if (s) {
        return {
          rows: [{
            id: s.id,
            doctor_id: s.doctorId || s.doctor_id,
            start_time: s.startTime || s.start_time,
            end_time: s.endTime || s.end_time,
            is_booked: s.isBooked ?? s.is_booked ?? false
          }],
          rowCount: 1
        };
      }
      return { rows: [], rowCount: 0 };
    }

    if (sql.includes('FROM availability_slots') && sql.includes('doctor_id = $1')) {
      const doctorId = params[0];
      const res = [];
      for (const s of this.slots.values()) {
        if ((s.doctorId === doctorId || s.doctor_id === doctorId) && !(s.isBooked || s.is_booked)) {
          res.push({
            id: s.id,
            doctorId: s.doctorId || s.doctor_id,
            startTime: s.startTime || s.start_time,
            endTime: s.endTime || s.end_time,
            isBooked: false
          });
        }
      }
      return { rows: res, rowCount: res.length };
    }

    if (sql.includes('UPDATE availability_slots SET is_booked = true') && sql.includes('WHERE id = $1')) {
      const s = this.slots.get(params[0]);
      if (s) {
        s.isBooked = true;
        s.is_booked = true;
      }
      return { rows: [], rowCount: 1 };
    }

    if (sql.includes('UPDATE availability_slots SET is_booked = false WHERE id = $1')) {
      const s = this.slots.get(params[0]);
      if (s) {
        s.isBooked = false;
        s.is_booked = false;
      }
      return { rows: [], rowCount: 1 };
    }

    // 7. Booking & Consultation queries
    if (sql.includes('INSERT INTO consultations')) {
      const [id, patient_id, doctor_id, slot_id, symptoms, notes, meeting_link] = params;
      const c = {
        id,
        patient_id,
        patientId: patient_id,
        doctor_id,
        doctorId: doctor_id,
        slot_id,
        slotId: slot_id,
        status: 'SCHEDULED',
        symptoms,
        notes,
        meeting_link,
        meetingLink: meeting_link,
        created_at: new Date(),
        updated_at: new Date()
      };
      this.consultations.set(id, c);
      return { rows: [c], rowCount: 1 };
    }

    if (sql.includes('FROM consultations WHERE id = $1')) {
      const c = this.consultations.get(params[0]);
      return { rows: c ? [c] : [], rowCount: c ? 1 : 0 };
    }

    if (sql.includes('FROM consultations c') && sql.includes('JOIN availability_slots s ON c.slot_id = s.id') && sql.includes('WHERE c.id = $1')) {
      const c = this.consultations.get(params[0]);
      if (!c) return { rows: [], rowCount: 0 };
      const s = this.slots.get(c.slotId || c.slot_id) || {};
      let pay = null;
      for (const p of this.payments.values()) {
        if (p.consultationId === c.id || p.consultation_id === c.id) {
          pay = p;
          break;
        }
      }
      const row = {
        ...c,
        startTime: s.startTime || s.start_time,
        endTime: s.endTime || s.end_time,
        paymentAmount: pay ? pay.amount : null,
        paymentStatus: pay ? pay.status : null,
        transactionRef: pay ? (pay.transactionReference || pay.transaction_reference) : null
      };
      return { rows: [row], rowCount: 1 };
    }

    if (sql.includes('UPDATE consultations SET status = $1') && sql.includes('WHERE id =')) {
      const status = params[0];
      const consultId = params[params.length - 1];
      const c = this.consultations.get(consultId);
      if (c) {
        c.status = status;
        c.updated_at = new Date();
        c.updatedAt = new Date();
        if (status === 'IN_PROGRESS') {
          c.started_at = new Date();
          c.startedAt = new Date();
        } else if (status === 'COMPLETED') {
          c.completed_at = new Date();
          c.completedAt = new Date();
        }
        return { rows: [c], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    }

    if (sql.includes('SELECT COUNT(*) as total FROM consultations c JOIN doctors d')) {
      return { rows: [{ total: this.consultations.size }], rowCount: 1 };
    }

    if (sql.includes('FROM consultations c') && sql.includes('JOIN doctors d ON c.doctor_id = d.id') && sql.includes('ORDER BY c.created_at DESC')) {
      const rows = Array.from(this.consultations.values()).map(c => {
        const s = this.slots.get(c.slotId || c.slot_id) || {};
        return {
          id: c.id,
          patientId: c.patientId || c.patient_id,
          doctorId: c.doctorId || c.doctor_id,
          slotId: c.slotId || c.slot_id,
          status: c.status,
          symptoms: c.symptoms,
          notes: c.notes,
          meetingLink: c.meetingLink || c.meeting_link,
          startedAt: c.startedAt || c.started_at,
          completedAt: c.completedAt || c.completed_at,
          createdAt: c.createdAt || c.created_at,
          startTime: s.startTime || s.start_time,
          endTime: s.endTime || s.end_time,
          doctorFirstName: 'Dr.',
          doctorLastName: 'Doctor'
        };
      });
      return { rows, rowCount: rows.length };
    }

    // 8. Payments queries
    if (sql.includes('INSERT INTO payments')) {
      const [id, consultation_id, patient_id, amount, tx_ref, payment_method] = params;
      const p = {
        id,
        consultation_id,
        consultationId: consultation_id,
        patient_id,
        patientId: patient_id,
        amount,
        currency: 'INR',
        status: 'COMPLETED',
        transaction_reference: tx_ref,
        transactionReference: tx_ref,
        payment_method,
        paymentMethod: payment_method,
        created_at: new Date()
      };
      this.payments.set(id, p);
      return { rows: [p], rowCount: 1 };
    }

    if (sql.includes("UPDATE payments SET status = 'REFUNDED' WHERE consultation_id = $1")) {
      for (const p of this.payments.values()) {
        if (p.consultationId === params[0] || p.consultation_id === params[0]) {
          p.status = 'REFUNDED';
        }
      }
      return { rows: [], rowCount: 1 };
    }

    // 9. Prescription queries
    if (sql.includes('SELECT id FROM prescriptions WHERE consultation_id = $1')) {
      for (const rx of this.prescriptions.values()) {
        if (rx.consultationId === params[0] || rx.consultation_id === params[0]) {
          return { rows: [{ id: rx.id }], rowCount: 1 };
        }
      }
      return { rows: [], rowCount: 0 };
    }

    if (sql.includes('INSERT INTO prescriptions')) {
      const [id, consultation_id, doctor_id, patient_id, diagnosis, medications, instructions, follow_up_date, digital_signature, created_at] = params;
      const rx = {
        id,
        consultation_id,
        consultationId: consultation_id,
        doctor_id,
        doctorId: doctor_id,
        patient_id,
        patientId: patient_id,
        diagnosis,
        medications: typeof medications === 'string' ? JSON.parse(medications) : medications,
        instructions,
        follow_up_date,
        followUpDate: follow_up_date,
        digital_signature,
        digitalSignature: digital_signature,
        created_at: created_at || new Date(),
        createdAt: created_at || new Date()
      };
      this.prescriptions.set(id, rx);
      return { rows: [rx], rowCount: 1 };
    }

    if (sql.includes('FROM prescriptions p') && sql.includes('WHERE p.consultation_id = $1')) {
      for (const rx of this.prescriptions.values()) {
        if (rx.consultationId === params[0] || rx.consultation_id === params[0]) {
          return {
            rows: [{
              ...rx,
              doctorFirstName: 'Dr.',
              doctorLastName: 'Ayurveda',
              doctorLicenseNumber: 'LIC-TEST'
            }],
            rowCount: 1
          };
        }
      }
      return { rows: [], rowCount: 0 };
    }

    // 10. Audit queries
    if (sql.includes('INSERT INTO audit_logs')) {
      const [id, actor_id, actor_role, action, resource_type, resource_id, ip_address, user_agent, status, metadata] = params;
      const log = {
        id,
        actorId: actor_id,
        actorRole: actor_role,
        action,
        resourceType: resource_type,
        resourceId: resource_id,
        ipAddress: ip_address,
        userAgent: user_agent,
        status,
        metadata: typeof metadata === 'string' ? JSON.parse(metadata) : metadata,
        createdAt: new Date()
      };
      this.auditLogs.set(id, log);
      return { rows: [], rowCount: 1 };
    }

    if (sql.includes('SELECT COUNT(*) as total FROM audit_logs')) {
      return { rows: [{ total: this.auditLogs.size }], rowCount: 1 };
    }

    if (sql.includes('FROM audit_logs') && sql.includes('ORDER BY created_at DESC')) {
      const rows = Array.from(this.auditLogs.values());
      return { rows, rowCount: rows.length };
    }

    // 11. Analytics queries
    if (sql.includes('SELECT status, COUNT(*) as count FROM consultations GROUP BY status')) {
      const counts = {};
      for (const c of this.consultations.values()) {
        counts[c.status] = (counts[c.status] || 0) + 1;
      }
      const rows = Object.entries(counts).map(([status, count]) => ({ status, count }));
      return { rows, rowCount: rows.length };
    }

    if (sql.includes('FROM payments') && sql.includes("status = 'COMPLETED'")) {
      const completed = Array.from(this.payments.values()).filter(p => p.status === 'COMPLETED');
      const sum = completed.reduce((acc, p) => acc + (parseFloat(p.amount) || 0), 0);
      const avg = completed.length > 0 ? sum / completed.length : 0;
      return {
        rows: [{
          totalRevenue: sum.toFixed(2),
          avgRevenue: avg.toFixed(2)
        }],
        rowCount: 1
      };
    }

    if (sql.includes('FROM availability_slots') && sql.includes('total_slots')) {
      const slots = Array.from(this.slots.values());
      const booked = slots.filter(s => s.isBooked || s.is_booked).length;
      return {
        rows: [{
          total_slots: slots.length,
          booked_slots: booked
        }],
        rowCount: 1
      };
    }

    if (sql.includes('SELECT COUNT(*) as today_count FROM consultations')) {
      return { rows: [{ today_count: this.consultations.size }], rowCount: 1 };
    }

    return { rows: [], rowCount: 0 };
  }

  async withTransaction(fn) {
    return fn(this);
  }

  async ping() {
    return true;
  }

  async close() {
    this.clear();
  }

  clear() {
    this.users.clear();
    this.profiles.clear();
    this.doctors.clear();
    this.slots.clear();
    this.consultations.clear();
    this.prescriptions.clear();
    this.payments.clear();
    this.auditLogs.clear();
    this.idempotencyKeys.clear();
    this.slotLocks.clear();
  }
}

module.exports = { MockDatabaseConnection };
