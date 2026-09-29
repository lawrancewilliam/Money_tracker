export function json(res, status, data) {
  return res.status(status).json(data);
}

export function ok(res, data) {
  return json(res, 200, data);
}

export function created(res, data) {
  return json(res, 201, data);
}

export function badRequest(res, message) {
  return json(res, 400, { error: message });
}

export function notFound(res, message = 'Not found') {
  return json(res, 404, { error: message });
}

export function internalError(res, e) {
  console.error(e);
  const raw = (e && e.message) || 'Internal server error';
  const sanitized = String(raw)
    .replace(/-----BEGIN [A-Z ]*-----[\s\S]*?-----END [A-Z ]*-----/g, '[REDACTED KEY]')
    .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, '[REDACTED EMAIL]')
    .replace(/[A-Za-z]:\\(?:[^\\'"\s)]*\\?)*/g, '[PATH]')
    .replace(/\b[\w-]+\.js:\d+:\d+\b/g, '[FRAME]')
    .slice(0, 300);
  return json(res, 500, { error: sanitized });
}

export function getBody(req) {
  return typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
}

export function uuid() {
  return crypto.randomUUID();
}

export function now() {
  return new Date().toISOString();
}
