import logger from "../utils/logger.js";

export const errorHandler = (err, req, res, next) => {
    const statuscode = err.statusCode || 500;
    const message = statuscode >= 500 ? "Internal Server Error" : err.message || "Request failed"

    logger.error(`Error ${statuscode} - ${message}`)

    res.status(statuscode).json({
        success: false,
        status: statuscode,
        message: message
    })
}