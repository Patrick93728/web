const API_KEY = import.meta.env.VITE_FRUITASK_API_KEY;
const DATABASE_TOKEN = import.meta.env.VITE_FRUITASK_TOKEN;

// The correct base URL according to the Developer API Documentation
const BASE_URL = 'https://integrations.fruitask.com';

export const fetchProjectsFromFruitask = async () => {
  try {
    if (!API_KEY || !DATABASE_TOKEN) {
      console.warn("Fruitask API keys are missing! Make sure your .env variables are loaded.");
      return [];
    }

    // Endpoint: GET /{table_name}/{token}/rows
    const url = `${BASE_URL}/Projects/${DATABASE_TOKEN}/rows`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY, // The documentation specifies X-API-Key
      },
    });

    if (!response.ok) {
      throw new Error(`Fruitask API error: ${response.status} - ${response.statusText}`);
    }

    const json = await response.json();
    
    // The standard /rows endpoint returns { success: true, data: { rows: [...] } }
    const rows = json.data?.rows || [];
    
    return rows.map((row) => {
      const cells = row.cells || {};
      
      // Helper to extract the cell's 'value' safely
      const getVal = (colName) => cells[colName]?.value;
      
      // Extract all image URLs from the attachment array
      const imageVal = getVal('image');
      const images = Array.isArray(imageVal) ? imageVal.map(img => img.url) : [];
      const imageUrl = images.length > 0 ? images[0] : null;
      
      return {
        id: getVal('Project ID') || row.id,
        title: getVal('Title') || 'Untitled Project',
        summary: getVal('Description') || '',
        category: 'Development',
        status: 'Completed',
        role: getVal('Role') || null,
        technologies: getVal('Technologies') 
          ? String(getVal('Technologies')).split(',').map(t => t.trim()) 
          : [],
        images: images,
        image: imageUrl,
        liveUrl: getVal('Live Demo Link') || null,
        repoUrl: getVal('Repository Link') || null,
      };
    }).filter(p => p.title && p.title !== 'Untitled Project'); // Filter out empty blank rows from the Kanban
  } catch (error) {
    console.error('Failed to fetch projects from Fruitask:', error);
    return [];
  }
};
