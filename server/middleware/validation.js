function requireFields(fields) {
  return (req, res, next) => {
    const missing = fields.filter((field) => !req.body[field]);
    if (missing.length) {
      const error = new Error(`Missing required field${missing.length > 1 ? 's' : ''}: ${missing.join(', ')}`);
      error.status = 422;
      next(error);
      return;
    }
    next();
  };
}

function validateRating(req, res, next) {
  const rating = Number(req.body.rating);
  if (!rating || rating < 1 || rating > 5) {
    const error = new Error('Rating must be between 1 and 5.');
    error.status = 422;
    next(error);
    return;
  }
  next();
}

module.exports = { requireFields, validateRating };
