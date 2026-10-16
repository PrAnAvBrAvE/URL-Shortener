import logger from "../utils/logger.js";

export const errorHandler = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    const statuscode = err.statusCode || 500;

    const isMalformedJson = err.type === "entity.parse.failed";

    const message = isMalformedJson 
        ? "Malformed JSON request body" 
        :  statuscode >= 500 
            ? "Internal Server Error" 
            : err.message || "Request failed"

    logger.error(`Error ${statuscode} - ${message}`)

    res.status(statuscode).json({
        success: false,
        status: statuscode,
        message: message
    })
}