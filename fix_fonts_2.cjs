const fs = require('fs');
const files = [
  'src/components/About.jsx',
  'src/components/Services.jsx',
  'src/components/Projects.jsx',
  'src/components/TechStack.jsx',
  'src/components/Contact.jsx',
  'src/components/Hero.jsx'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // Specific tiny text replacements
  content = content.replace(/text-\[10px\]/g, 'text-xs md:text-sm');
  
  // Make standard paragraphs slightly larger
  content = content.replace(/text-sm text-slate-500/g, 'text-base text-slate-500');

  fs.writeFileSync(file, content);
  console.log('Updated ' + file);
});
