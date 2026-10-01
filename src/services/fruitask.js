export const fetchProjectsFromFruitask = async () => {
  try {
    const response = await fetch('/api/projects');
    if (!response.ok) return [];
    const result = await response.json();
    return Array.isArray(result.projects) ? result.projects : [];
  } catch {
    return [];
  }
};
