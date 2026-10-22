const slotRepository = require('../../repositories/slot.repository');
const doctorRepository = require('../../repositories/doctor.repository');
const { BadRequestError, NotFoundError } = require('../../domain/errors/app-errors');

// Doctor creates their availability slots
const createSlots = async (userId, input) => {
  let doctorId = input.doctorId;
  if (!doctorId) {
    const doctor = await doctorRepository.findByUserId(userId);
    if (!doctor) {
      throw new NotFoundError('Doctor profile not found for this user');
    }
    doctorId = doctor.id;
  }

  const now = new Date();

  // Validate all slots before inserting
  for (const slot of input.slots) {
    const start = new Date(slot.startTime);
    const end = new Date(slot.endTime);

    if (start >= end) {
      throw new BadRequestError('Slot start time must be before end time');
    }
    if (start < now) {
      throw new BadRequestError('Cannot create availability slots in the past');
    }
  }

  const createdSlots = await slotRepository.createSlots(doctorId, input.slots);

  return {
    count: createdSlots.length,
    slots: createdSlots
  };
};

// Query doctor availability slots
const getSlots = async (query, user) => {
  let doctorId = query.doctorId;
  if (!doctorId && user && user.role === 'DOCTOR') {
    const doctor = await doctorRepository.findByUserId(user.userId);
    if (doctor) {
      doctorId = doctor.id;
    }
  }

  if (!doctorId) {
    throw new BadRequestError('Doctor ID is required to query availability slots');
  }

  const slots = await slotRepository.findSlots({ ...query, doctorId });
  return slots;
};

class SlotService {
  createSlots(userId, input) { return createSlots(userId, input); }
  getSlots(query) { return getSlots(query); }
}

const slotService = new SlotService();

module.exports = {
  createSlots,
  getSlots,
  slotService,
  SlotService
};
