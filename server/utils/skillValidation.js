const { z } = require('zod');

const skillValidationSchema = z
  .object({
    title: z
      .string({ required_error: 'Title is required' })
      .trim()
      .min(3, 'Title must be at least 3 characters')
      .max(80, 'Title cannot exceed 80 characters'),
    description: z
      .string()
      .trim()
      .max(500, 'Description cannot exceed 500 characters')
      .optional()
      .default(''),
    kind: z.enum(['offer', 'want'], {
      required_error: 'Skill kind must be either "offer" or "want"',
    }),
    category: z.enum(
      ['programming', 'design', 'academics', 'music', 'languages', 'career', 'other'],
      { required_error: 'Category is required' }
    ),
    creditsPerHour: z.coerce
      .number({ required_error: 'Credits per hour is required' })
      .int('Credits per hour must be an integer')
      .min(1, 'Credits per hour must be at least 1')
      .max(20, 'Credits per hour cannot exceed 20'),
    mode: z.enum(['in-person', 'online', 'both'], {
      required_error: 'Mode must be "in-person", "online", or "both"',
    }),
    safeZone: z.string().optional().nullable(),
    status: z.enum(['open', 'closed']).optional().default('open'),
  })
  .refine(
    (data) => {
      // Safe zone is required when mode is in-person or both
      if (data.mode === 'in-person' || data.mode === 'both') {
        return Boolean(data.safeZone && typeof data.safeZone === 'string' && data.safeZone.trim().length > 0);
      }
      return true;
    },
    {
      message: 'A campus Safe Zone is required for in-person or hybrid exchanges',
      path: ['safeZone'],
    }
  );

module.exports = {
  skillValidationSchema,
};
