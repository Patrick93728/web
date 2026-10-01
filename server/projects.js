export class ProjectsError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function textValue(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function webUrl(value) {
  const url = textValue(value);
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? url : null;
  } catch {
    return null;
  }
}

export function mapProjectRows(rows) {
  if (!Array.isArray(rows)) return [];
  return rows.filter((row) => row && typeof row === 'object').map((row, index) => {
    const cells = row.cells && typeof row.cells === 'object' ? row.cells : {};
    const getVal = (name) => cells[name]?.value;
    const imageVal = getVal('image');
    const images = Array.isArray(imageVal) ? imageVal.map((image) => webUrl(image?.url)).filter(Boolean) : [];
    const title = textValue(getVal('Title'));
    return {
      id: textValue(getVal('Project ID')) || row.id || `project-${index}`,
      title,
      summary: textValue(getVal('Description')),
      category: 'Development',
      status: 'Completed',
      role: textValue(getVal('Role')) || null,
      technologies: textValue(getVal('Technologies')).split(',').map((tech) => tech.trim()).filter(Boolean),
      images,
      image: images[0] || null,
      liveUrl: webUrl(getVal('Live Demo Link')),
    };
  }).filter((project) => project.title);
}

export async function loadProjects(env = process.env, fetchRequest = fetch) {
  const apiKey = env.FRUITASK_API_KEY;
  const token = env.FRUITASK_PROJECTS_WORKSPACE_TOKEN;
  if (!apiKey || !token) throw new ProjectsError(503, 'Project data is not configured.');

  let response;
  try {
    response = await fetchRequest(`https://integrations.fruitask.com/Projects/${encodeURIComponent(token)}/rows`, {
      method: 'GET',
      headers: { 'X-API-Key': apiKey },
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw new ProjectsError(502, 'Project data is unavailable.');
  }
  if (!response.ok) throw new ProjectsError(502, 'Project data is unavailable.');
  let result;
  try {
    result = await response.json();
  } catch {
    throw new ProjectsError(502, 'Project data is unavailable.');
  }
  if (!Array.isArray(result?.data?.rows)) throw new ProjectsError(502, 'Project data is unavailable.');
  return mapProjectRows(result.data?.rows);
}

export async function handleProjects(request, response, options = {}) {
  if (request.method !== 'GET') {
    response.writeHead(405, { Allow: 'GET', 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    response.end(JSON.stringify({ error: 'Method not allowed.' }));
    return;
  }
  try {
    const projects = await loadProjects(options.env, options.fetchRequest);
    response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    response.end(JSON.stringify({ projects }));
  } catch (error) {
    response.writeHead(error instanceof ProjectsError ? error.status : 500, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    response.end(JSON.stringify({ error: 'Project data is unavailable.' }));
  }
}
