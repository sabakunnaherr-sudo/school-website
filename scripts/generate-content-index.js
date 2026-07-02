const fs = require('fs');
const path = require('path');

/**
 * Automated build-time index generator for Decap CMS content collections.
 * Scans individual content JSON files and generates index.json manifests
 * so static frontends can enumerate content without manual index maintenance.
 */

function generateIndexForFolder(folderRelativePath) {
  const folderPath = path.join(process.cwd(), folderRelativePath);
  const indexPath = path.join(folderPath, 'index.json');
  let jsonFiles = [];

  try {
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const files = fs.readdirSync(folderPath);
    jsonFiles = files
      .filter(file => file.endsWith('.json') && file !== 'index.json')
      .sort()
      .map(file => path.posix.join(folderRelativePath, file));
  } catch (error) {
    console.warn(`[CMS Indexer] Warning: Could not read ${folderRelativePath} (${error.message}). Generating empty index.json.`);
  }

  try {
    fs.writeFileSync(indexPath, JSON.stringify(jsonFiles, null, 2), 'utf8');
    console.log(`[CMS Indexer] Generated ${indexPath} containing ${jsonFiles.length} items.`);
  } catch (error) {
    console.error(`[CMS Indexer] Error writing ${indexPath}:`, error.message);
  }
}

console.log('[CMS Indexer] Starting build-time content indexing...');
generateIndexForFolder('content/notices');
generateIndexForFolder('content/gallery');
console.log('[CMS Indexer] Build-time indexing completed successfully.');
