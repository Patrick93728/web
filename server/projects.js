export class ProjectsError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function mapProjectRows(rows) {
  if (!Array.isArray(rows)) return [];
  return rows.filter((row) => row && typeof row === 'object').map((row) => {
    const cells = row.cells && typeof row.cells === 'object' ? row.cells : {};
    const getVal = (name) => cells[name]?.value;
    const imageVal = getVal('image');
    const images = Array.isArray(imageVal) ? imageVal.map((image) => image?.url).filter(Boolean) : [];
    const repository = getVal('Repository Link');
    return {
      id: getVal('Project ID') || row.id,
      title: getVal('Title') || 'Untitled Project',
      summary: getVal('Description') || '',
      category: 'Development',
      status: 'Completed',
      role: getVal('Role') || null,
      technologies: getVal('Technologies') ? String(getVal('Technologies')).split(',').map((tech) => tech.trim()) : [],
      images,
      image: images[0] || null,
      liveUrl: getVal('Live Demo Link') || null,
      repoUrl: typeof repository === 'string' ? repository.trim() || null : null,
    };
  }).filter((project) => project.title !== 'Untitled Project');
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
  const result = await response.json();
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
