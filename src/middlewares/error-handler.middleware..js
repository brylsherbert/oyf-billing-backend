// Centralized error handler
const errorHandler = (err, req, res, next) =>
{
    res.status(err.status).json({
        status: err.status,
        error: err.message,
    })
}

export default errorHandler;