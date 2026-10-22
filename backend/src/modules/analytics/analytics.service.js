const { getDb } = require('../../infrastructure/database/connection');
const { jobQueue } = require('../../infrastructure/queue/job-queue');

// Aggregate platform KPIs and utilization analytics using real PostgreSQL queries
const getOverviewAnalytics = async () => {
  const db = getDb();

  // 1. Consultation counts by status
  const statusRes = await db.query(
    `SELECT status, COUNT(*) as count FROM consultations GROUP BY status`
  );

  const statusMap = {
    PENDING_PAYMENT: 0,
    SCHEDULED: 0,
    IN_PROGRESS: 0,
    COMPLETED: 0,
    CANCELLED: 0,
    NO_SHOW: 0
  };
  let totalConsultations = 0;
  for (const row of statusRes.rows) {
    statusMap[row.status] = parseInt(row.count, 10);
    totalConsultations += parseInt(row.count, 10);
  }

  // 2. Revenue calculation
  const revRes = await db.query(
    `SELECT 
      COALESCE(SUM(amount), 0) as "totalRevenue",
      COALESCE(AVG(amount), 0) as "avgRevenue"
     FROM payments 
     WHERE status = 'COMPLETED'`
  );
  const totalRevenue = parseFloat(revRes.rows[0]?.totalRevenue || 0);
  const averageFee = parseFloat(revRes.rows[0]?.avgRevenue || 0);

  // 3. Slot capacity and utilization
  const slotRes = await db.query(
    `SELECT 
      COUNT(*) as total_slots,
      COUNT(*) FILTER (WHERE is_booked = true) as booked_slots
     FROM availability_slots`
  );
  const totalSlots = parseInt(slotRes.rows[0]?.total_slots || 0, 10);
  const bookedSlots = parseInt(slotRes.rows[0]?.booked_slots || 0, 10);
  const doctorUtilizationRate = totalSlots > 0 ? (bookedSlots / totalSlots) * 100 : 0;

  // 4. Today's consultations
  const todayRes = await db.query(
    `SELECT COUNT(*) as today_count FROM consultations WHERE created_at >= CURRENT_DATE`
  );
  const todayCount = parseInt(todayRes.rows[0]?.today_count || 0, 10);

  // 5. Total Patients count
  const patientCountRes = await db.query(
    `SELECT COUNT(*) as count FROM users WHERE role = 'PATIENT'`
  );
  const totalPatients = parseInt(patientCountRes.rows[0]?.count || 0, 10);

  // 6. Total Doctors and verification stats
  const doctorCountRes = await db.query(
    `SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE is_verified = true) as verified,
      COUNT(*) FILTER (WHERE is_verified = false) as pending
     FROM doctors`
  );
  const totalDoctors = parseInt(doctorCountRes.rows[0]?.total || 0, 10);
  const verifiedDoctors = parseInt(doctorCountRes.rows[0]?.verified || 0, 10);
  const pendingDoctors = parseInt(doctorCountRes.rows[0]?.pending || 0, 10);

  // 7. Recent booking activity (actual live database records)
  const recentBookingsRes = await db.query(
    `SELECT 
      c.id, 
      c.status, 
      c.symptoms,
      c.created_at as "createdAt",
      COALESCE(NULLIF(TRIM(p_pat.first_name || ' ' || p_pat.last_name), ''), u_pat.email, 'Patient') as "patientName",
      u_pat.email as "patientEmail",
      COALESCE(NULLIF(TRIM('Dr. ' || p_doc.first_name || ' ' || p_doc.last_name), ''), 'Doctor') as "doctorName",
      d.specialties as "doctorSpecialties",
      s.start_time as "startTime", 
      s.end_time as "endTime",
      pay.amount as "paymentAmount", 
      pay.status as "paymentStatus",
      pay.payment_method as "paymentMethod"
    FROM consultations c
    LEFT JOIN users u_pat ON c.patient_id = u_pat.id
    LEFT JOIN profiles p_pat ON u_pat.id = p_pat.user_id
    LEFT JOIN doctors d ON c.doctor_id = d.id
    LEFT JOIN profiles p_doc ON d.user_id = p_doc.user_id
    LEFT JOIN availability_slots s ON c.slot_id = s.id
    LEFT JOIN payments pay ON c.id = pay.consultation_id
    ORDER BY c.created_at DESC
    LIMIT 10`
  );

  return {
    overview: {
      totalPatients,
      totalDoctors,
      verifiedDoctors,
      pendingDoctors,
      totalAppointments: totalConsultations,
      activeToday: todayCount,
      totalRevenue
    },
    consultations: {
      total: totalConsultations,
      today: todayCount,
      byStatus: statusMap
    },
    recentBookings: recentBookingsRes.rows,
    revenue: {
      totalGross: totalRevenue,
      currency: 'INR',
      averageConsultationFee: Math.round(averageFee * 100) / 100
    },
    capacityAndUtilization: {
      totalSlots,
      bookedSlots,
      utilizationPercentage: Math.round(doctorUtilizationRate * 10) / 10,
      scaleTargetDailyConsultations: 100000
    },
    systemQueue: jobQueue.getStats(),
    generatedAt: new Date().toISOString()
  };
};

module.exports = {
  getOverviewAnalytics,
  analyticsService: {
    getOverviewAnalytics
  }
};
