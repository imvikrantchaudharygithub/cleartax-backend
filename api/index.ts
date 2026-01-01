// Vercel serverless function - handles all routes
// Import the Express app from the built dist folder
// Using require since dist/index.js uses module.exports
// @ts-ignore - dist is built JavaScript, not TypeScript
const app = require('../dist/index');

// Export as default handler for Vercel
module.exports = app;

