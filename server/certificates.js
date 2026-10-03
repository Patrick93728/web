export class CertificatesError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function text(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function imageUrl(value) {
  const candidate = Array.isArray(value) ? value[0]?.url : value?.url ?? value;
  const url = text(candidate);
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol) ? url : null;
  } catch {
    return null;
  }
}

export function mapCertificateRows(rows) {
  if (!Array.isArray(rows)) return [];
  return rows.flatMap((row, index) => {
    const cells = row?.cells;
    if (!cells || typeof cells !== 'object') return [];
    const value = (name) => cells[name]?.value;
    const name = text(value('Certificate Name'));
    if (!name) return [];
    return [{
      id: row.id || `certificate-${index}`,
      name,
      issuer: text(value('Issuer')),
      dateIssued: text(value('Date Issued')),
      image: imageUrl(value('Certificate Image')),
    }];
  });
}

export async function loadCertificates(env = process.env, fetchRequest = fetch) {
  const key = env.FRUITASK_API_KEY;
  const token = env.FRUITASK_CERTIFICATES_WORKSPACE_TOKEN;
  const table = env.FRUITASK_CERTIFICATES_TABLE_NAME || 'Certificates';
  if (!key || !token) throw new CertificatesError(503, 'Certificate data is not configured.');

  let response;
  try {
    response = await fetchRequest(`https://integrations.fruitask.com/${encodeURIComponent(table)}/${encodeURIComponent(token)}/rows?limit=200`, {
      method: 'GET',
      headers: { 'X-API-Key': key },
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw new CertificatesError(502, 'Certificate data is unavailable.');
  }
  if (!response.ok) throw new CertificatesError(502, 'Certificate data is unavailable.');

  let result;
  try {
    result = await response.json();
  } catch {
    throw new CertificatesError(502, 'Certificate data is unavailable.');
  }
  if (!Array.isArray(result?.data?.rows)) throw new CertificatesError(502, 'Certificate data is unavailable.');
  return mapCertificateRows(result.data.rows);
}

export async function handleCertificates(request, response, options = {}) {
  if (request.method !== 'GET') {
    response.writeHead(405, { Allow: 'GET', 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    response.end(JSON.stringify({ error: 'Method not allowed.' }));
    return;
  }
  try {
    const certificates = await loadCertificates(options.env, options.fetchRequest);
    response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    response.end(JSON.stringify({ certificates }));
  } catch (error) {
    response.writeHead(error instanceof CertificatesError ? error.status : 500, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    response.end(JSON.stringify({ error: 'Certificate data is unavailable.' }));
  }
}
