export function ok(res, data) {
  return res.status(200).json(data);
}

export function created(res, data) {
  return res.status(201).json(data);
}

export function badRequest(res, message) {
  return res.status(400).json({ error: message });
}

export function notFound(res, message = 'Not found') {
  return res.status(404).json({ error: message });
}

export function mapError(res, status, message) {
  return res.status(status).json({ error: message });
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
  return res.status(500).json({ error: sanitized });
}
