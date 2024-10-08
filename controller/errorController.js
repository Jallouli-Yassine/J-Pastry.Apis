module.exports = ((err, req, res, next) => {
    res.status(err.statusCode || 500).json({
        status: 'error',
        message: err.message || 'Internal Server Error',
        stack: err.stack, // Include stack trace for debugging
    });
});
