const notFound = (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

const errorHandler = (err, req, res, _next) => {
  if (res.headersSent) {
    return;
  }

  const requestedStatus =
    err.code === "LIMIT_FILE_SIZE" ? 413 : err.status || err.statusCode;

  const statusCode =
    Number.isInteger(requestedStatus) &&
    requestedStatus >= 400 &&
    requestedStatus <= 599
      ? requestedStatus
      : res.statusCode >= 400
        ? res.statusCode
        : 500;

  console.error("API Error:", {
    message: err.message,
    statusCode,
    path: req.originalUrl,
    method: req.method,
    stack: err.stack,
  });

  const isProduction = process.env.NODE_ENV === "production";

  const message =
    isProduction && statusCode >= 500
      ? "Internal Server Error."
      : err.message || "Internal Server Error.";

  return res.status(statusCode).json({
    status: "error",
    message,
  });
};

export { notFound, errorHandler };
