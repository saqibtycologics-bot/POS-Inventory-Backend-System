/**
 * Wraps async controller functions and forwards errors
 * to Express error-handling middleware automatically.
 */

const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = asyncHandler;