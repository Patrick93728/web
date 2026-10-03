export const fallbackCertificates = [
  { id: 'company-proposal', name: 'Company Proposal and System Showcase', issuer: 'PHINMA - St. Jude College', dateIssued: '2024-04-24', image: '/certificates/company-proposal.png' },
  { id: 'ethical-hacking', name: 'Ethical Hacking and Responsible Disclosure', issuer: 'West Visayas State University - College of Information and Communications Technology', dateIssued: '2025-10-10', image: '/certificates/ethical-hacking.png' },
  { id: 'ai-powered-future', name: 'AI-Powered Future: Mastering Prompt Engineering in Generative AI', issuer: 'Department of Information and Communications Technology - Region V', dateIssued: '2025-09-06', image: '/certificates/ai-powered-future.png' },
  { id: 'hour-of-code', name: 'Hour of Code (AI Ready ASEAN)', issuer: 'ASEAN Foundation / AI Ready ASEAN', dateIssued: '2025-10-08', image: '/certificates/hour-of-code.png' },
];

const imageByName = new Map(fallbackCertificates.map(({ name, image }) => [name.toLowerCase(), image]));

export function withLocalCertificateImages(certificates) {
  return certificates.map((certificate) => ({
    ...certificate,
    image: certificate.image || imageByName.get(certificate.name.trim().toLowerCase()) || null,
  }));
}
