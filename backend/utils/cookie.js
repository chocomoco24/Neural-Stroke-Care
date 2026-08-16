// httpOnly auth cookie helpers. Keeping the JWT in an httpOnly cookie (not
// localStorage) means client-side JS — and therefore any XSS — cannot read it.

const COOKIE_NAME = "token";

function cookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    // Cross-site (frontend and API on different domains) requires SameSite=None
    // + Secure. In dev everything is on localhost, so Lax over http is fine.
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  };
}

function setAuthCookie(res, token) {
  res.cookie(COOKIE_NAME, token, cookieOptions());
}

function clearAuthCookie(res) {
  const { maxAge, ...opts } = cookieOptions();
  res.clearCookie(COOKIE_NAME, opts);
}

module.exports = { COOKIE_NAME, setAuthCookie, clearAuthCookie };
