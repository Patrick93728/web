export const fetchProjectsFromFruitask = async (signal) => {
  const response = await fetch('/api/projects', { cache: 'no-store', signal });
  if (!response.ok) throw new Error('Projects are unavailable.');
  const result = await response.json();
  if (!Array.isArray(result?.projects)) throw new Error('Projects response is invalid.');
  return result.projects;
};

export const fetchCertificatesFromFruitask = async (signal) => {
  const response = await fetch('/api/certificates', { cache: 'no-store', signal });
  if (!response.ok) throw new Error('Certificates are unavailable.');
  const result = await response.json();
  if (!Array.isArray(result?.certificates)) throw new Error('Certificates response is invalid.');
  return result.certificates;
};
