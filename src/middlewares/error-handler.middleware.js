// Stripe SDK uses statusCode; app errors use status
const errorHandler = (err, req, res, next) =>
{
    const raw = err.status ?? err.statusCode ?? 500;
    let status = Number(raw);
    if (!Number.isInteger(status) || status < 100 || status > 599) {
        status = 500;
    }

    res.status(status).json({
        status,
        error: err.message || "Internal Server Error",
    });
};

export default errorHandler;