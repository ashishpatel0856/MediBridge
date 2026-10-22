const { z } = require('zod');

const CreateSlotsDto = z.object({
  doctorId: z.string().uuid().optional(),
  slots: z.array(
    z.object({
      startTime: z.string().datetime(),
      endTime: z.string().datetime()
    })
  ).min(1, 'At least one slot is required')
});

const QuerySlotsDto = z.object({
  doctorId: z.string().uuid().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  availableOnly: z.preprocess((val) => val === 'true' || val === true ? true : val === 'false' || val === false ? false : undefined, z.boolean().default(true))
});

module.exports = {
  CreateSlotsDto,
  QuerySlotsDto
};
