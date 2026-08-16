// Central helper for unexpected 500s: always log the real error server-side,
// but never leak internal details (SQL errors, stack traces) to the client
// in production.

function serverError(res, err) {
  console.error(err);
  const message =
    process.env.NODE_ENV === "production" ? "Internal Server Error" : err.message;
  res.status(500).json({ message });
}

module.exports = { serverError };
