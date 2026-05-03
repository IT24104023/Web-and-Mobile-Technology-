export default (req, res, next) => {
  const errors = [];
  const body = req.body || {};

  const ratingFields = ['appUsabilityRating', 'consultationRating', 'doctorServiceRating'];
  ratingFields.forEach(field => {
    const v = body[field];
    if (v === undefined || v === null) {
      errors.push(`${field} is required`);
      return;
    }
    const n = Number(v);
    if (!Number.isInteger(n) && typeof v !== 'number') {
      errors.push(`${field} must be a number between 1 and 5`);
      return;
    }
    if (n < 1 || n > 5) errors.push(`${field} must be between 1 and 5`);
  });

  const stringFields = ['appUsabilityComment', 'consultationComment', 'doctorServiceComment', 'overallComments', 'appointmentId', 'doctorId'];
  stringFields.forEach(field => {
    const v = body[field];
    if (!v || String(v).trim() === '') errors.push(`${field} is required`);
  });

  if (errors.length) return res.status(400).json({ success: false, message: 'Validation error', data: errors });
  return next();
};
