const slotService = require('./slot.service');

const createSlots = async (req, res, next) => {
  try {
    const result = await slotService.createSlots(req.user.userId, req.body);
    res.status(201).json({
      success: true,
      message: 'Availability slots created successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const getSlots = async (req, res, next) => {
  try {
    const slots = await slotService.getSlots(req.query, req.user);
    res.status(200).json({
      success: true,
      data: slots
    });
  } catch (error) {
    next(error);
  }
};

// Kept class wrapper for backward compatibility with route imports
class SlotController {
  createSlots(req, res, next) { return createSlots(req, res, next); }
  getSlots(req, res, next) { return getSlots(req, res, next); }
}

const slotController = new SlotController();

module.exports = {
  createSlots,
  getSlots,
  slotController,
  SlotController
};
