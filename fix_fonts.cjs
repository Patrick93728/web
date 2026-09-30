const fs = require('fs');
const files = [
  'src/components/About.jsx',
  'src/components/Services.jsx',
  'src/components/Projects.jsx',
  'src/components/TechStack.jsx',
  'src/components/Contact.jsx',
  'src/components/Hero.jsx',
  'src/index.css'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // CSS pill
  content = content.replace('font-size: 0.75rem;', 'font-size: 0.875rem;');
  
  // Make body text normal weight instead of light for better readability
  content = content.replace(/font-light/g, 'font-normal');
  
  // Increase smallest texts
  content = content.replace(/text-xs/g, 'text-sm md:text-base');
  
  // Fix double replacements
  content = content.replace(/text-sm md:text-base md:text-sm/g, 'text-sm md:text-base');
  content = content.replace(/text-sm md:text-base md:text-base/g, 'text-sm md:text-base');

  fs.writeFileSync(file, content);
  console.log('Updated ' + file);
});
