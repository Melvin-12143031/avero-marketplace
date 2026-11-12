const validateRequest = (schema, property = "body") => {
  return (req, res, next) => {
    const result = schema.safeParse(req[property]);

    if (!result.success) {
      return res.status(400).json({
        status: "error",
        message: "Invalid request data.",
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    if (property === "query") {
      req.validatedQuery = result.data;
    } else {
      req[property] = result.data;
    }
    next();
  };
};

export default validateRequest;
