import { contactSubjects } from '../shared/contactOptions.js';

const SUBJECTS = new Set(contactSubjects);
const MAX_BODY_BYTES = 16_384;
const RECEIVED_DATE_FORMAT = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Manila',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function formatReceivedDate(date) {
  const parts = Object.fromEntries(RECEIVED_DATE_FORMAT.formatToParts(date).map(({ type, value }) => [type, value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function validateText(value, label, maximum) {
  if (typeof value !== 'string' || !value.trim()) throw new ContactError(400, `${label} is required.`);
  const cleaned = value.trim();
  if (cleaned.length > maximum) throw new ContactError(400, `${label} is too long.`);
  return cleaned;
}

export class ContactError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function validateContact(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new ContactError(400, 'Enter your project details and try again.');
  const name = validateText(body.name, 'Name', 120);
  const email = validateText(body.email, 'Email', 254);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ContactError(400, 'Enter a valid email address.');
  const subject = validateText(body.subject, 'Subject', 100);
  if (!SUBJECTS.has(subject)) throw new ContactError(400, 'Choose a valid subject.');
  const message = validateText(body.message, 'Message', 5000);
  return { name, email, subject, message };
}

export async function saveContact(values, env = process.env, fetchRequest = fetch) {
  const { FRUITASK_API_KEY: apiKey, FRUITASK_WORKSPACE_TOKEN: token, FRUITASK_TABLE_NAME: table } = env;
  if (!apiKey || !token || !table) throw new ContactError(503, 'The contact form is not configured yet. Please use the email link instead.');

  const cells = {
    Name: values.name,
    Email: values.email,
    Subject: values.subject,
    Message: values.message,
    'Date Received': formatReceivedDate(new Date()),
  };
  const url = `https://integrations.fruitask.com/${encodeURIComponent(table)}/${encodeURIComponent(token)}/rows`;
  let response;
  try {
    response = await fetchRequest(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': apiKey },
      body: JSON.stringify({ cells }),
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw new ContactError(502, 'The contact service is unavailable. Please try again or use the email link.');
  }
  if (!response.ok) throw new ContactError(502, 'The contact service could not save your inquiry. Please try again or use the email link.');
}

function sendJson(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  response.end(JSON.stringify(body));
}

export async function handleContact(request, response, options = {}) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    sendJson(response, 405, { error: 'Method not allowed.' });
    return;
  }
  if (!request.headers['content-type']?.startsWith('application/json')) {
    sendJson(response, 415, { error: 'Send the inquiry as JSON.' });
    return;
  }

  try {
    const chunks = [];
    let size = 0;
    for await (const chunk of request) {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) throw new ContactError(413, 'The inquiry is too large.');
      chunks.push(chunk);
    }
    let body;
    try {
      body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    } catch {
      throw new ContactError(400, 'Enter your project details and try again.');
    }
    const values = validateContact(body);
    await saveContact(values, options.env, options.fetchRequest);
    sendJson(response, 201, { success: true });
  } catch (error) {
    const status = error instanceof ContactError ? error.status : 500;
    const message = error instanceof ContactError ? error.message : 'The inquiry could not be sent. Please try again.';
    sendJson(response, status, { error: message });
  }
}
