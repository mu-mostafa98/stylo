const fs = require('fs');

const graphPath = 'D:/Projects/stylo/.understand-anything/tmp/ua-graph-batch-5-full.json';
const inputPath = 'D:/Projects/stylo/.understand-anything/tmp/ua-file-analyzer-input-5.json';
const outDir = 'D:/Projects/stylo/.understand-anything/intermediate';

const graph = JSON.parse(fs.readFileSync(graphPath, 'utf8'));
const input = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

const batchFiles = input.batchFiles.map(f => f.path).sort();

// Group files into parts: ceil(19/8) = 3 files per group max
const parts = Math.ceil(Math.max(398 / 60, 881 / 120)); // = 8
const groupSize = Math.ceil(batchFiles.length / parts); // = 3
const fileGroups = [];
for (let i = 0; i < parts; i++) {
  const start = i * groupSize;
  const end = Math.min(start + groupSize, batchFiles.length);
  if (start < end) {
    fileGroups.push(batchFiles.slice(start, end));
  }
}

// For each part, collect nodes whose filePath is in the group's files
// and edges whose source is in the part's nodes
fileGroups.forEach((files, idx) => {
  const partNum = idx + 1;
  const fileSet = new Set(files);

  // Find all node IDs belonging to these files
  const partNodes = graph.nodes.filter(n => {
    if (n.filePath && fileSet.has(n.filePath)) return true;
    return false;
  });

  const partNodeIds = new Set(partNodes.map(n => n.id));

  // Find all edges whose source is in partNodeIds
  const partEdges = graph.edges.filter(e => partNodeIds.has(e.source));

  const outFile = `${outDir}/batch-5-part-${partNum}.json`;
  const outData = { nodes: partNodes, edges: partEdges };

  // Cross-batch targets are allowed (will be resolved during merge)

  fs.writeFileSync(outFile, JSON.stringify(outData, null, 2));
  console.log(`Part ${partNum}: ${partNodes.length} nodes, ${partEdges.length} edges, files: ${files.join(', ')}`);
});
