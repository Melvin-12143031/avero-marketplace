const notFound = (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, _next) => {
  const statusCode =
    err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);

  console.error("API Error:", err);
  console.error("Error stack:", err.stack);

  return res.status(statusCode).json({
    status: "error",
    message: err.message || "Internal Server Error",
  });
};

export { notFound, errorHandler };
