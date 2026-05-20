/**
 * Response objects are created in:
 * src/utils/errorCodes.js
 */

/**
 * Send standardized success response
 *
 * @param {object} res - Express response object
 * @param {object} successResponse - Response object created by getSuccessResponse()
 * @returns {object} Express JSON response
 */
const sendSuccessResponse = (res, successResponse) => {
  return res
    .status(successResponse.status)
    .json(successResponse);
};

/**
 * Send standardized error response
 *
 * @param {object} res - Express response object
 * @param {object} errorResponse - Response object created by getErrorResponse()
 * @returns {object} Express JSON response
 */
const sendErrorResponse = (res, errorResponse) => {
  return res
    .status(errorResponse.status)
    .json(errorResponse);
};

module.exports = {
  sendSuccessResponse,
  sendErrorResponse,
};