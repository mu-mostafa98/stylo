#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = process.argv[2] || 'D:/Projects/stylo';
const INTER = path.join(PROJECT_ROOT, '.understand-anything/intermediate');
const OUTPUT = path.join(INTER, 'assembled-graph.json');

// Read all batch files
const files = fs.readdirSync(INTER).filter(f => /^batch-\d+(?:-part-\d+)?\.json$/.test(f));
console.error(`merge: found ${files.length} batch files`);

const allNodes = [];
const allEdges = [];
let warnings = [];

files.forEach((f, fi) => {
  const data = JSON.parse(fs.readFileSync(path.join(INTER, f), 'utf8'));
  // Handle both {nodes, edges} format and array-of-parts format
  const parts = Array.isArray(data) ? data : [data];
  parts.forEach((part, pi) => {
    const ns = part.nodes || [];
    const es = part.edges || [];
    // Add source file tracking to nodes for dedup
    ns.forEach(n => {
      if (!n._source) n._source = f + (parts.length > 1 ? `[${pi}]` : '');
    });
    allNodes.push(...ns);
    allEdges.push(...es);
  });
});

console.error(`merge: read ${allNodes.length} raw nodes, ${allEdges.length} raw edges`);

// --- Normalize node IDs ---
function normalizeId(id) {
  if (!id || typeof id !== 'string') return id;
  // Strip double prefixes: file:file: -> file:
  let prev;
  do {
    prev = id;
    id = id.replace(/^(file|config|document|service|pipeline|table|schema|resource|endpoint|module|concept|function|class):\1:/, '$1:');
  } while (id !== prev);
  // Strip project-name prefixes (stylo: -> file:)
  id = id.replace(/^stylo:/, 'file:');
  return id;
}

// Normalize complexity values
const COMPLEXITY_MAP = { low: 'simple', medium: 'moderate', high: 'complex' };
function normalizeComplexity(v) {
  if (!v) return 'moderate';
  const lv = String(v).toLowerCase().trim();
  return COMPLEXITY_MAP[lv] || lv;
}

// Track corrections for logging
const corrections = [];

allNodes.forEach((n, i) => {
  if (!n.id) { warnings.push(`Node[${i}] has no id`); return; }
  const origId = n.id;
  n.id = normalizeId(n.id);
  if (origId !== n.id) corrections.push(`normalized id: "${origId}" -> "${n.id}"`);
  if (n.complexity) {
    const orig = n.complexity;
    n.complexity = normalizeComplexity(n.complexity);
    if (orig !== n.complexity) corrections.push(`complexity: "${orig}" -> "${n.complexity}" for ${n.id}`);
  }
  // Ensure required fields
  if (!n.name) n.name = n.id.split(':').pop() || n.id;
  if (!n.type) { n.type = inferType(n.id); corrections.push(`inferred type ${n.type} for ${n.id}`); }
  if (!n.summary) n.summary = `No summary available`;
  if (!n.tags || !n.tags.length) n.tags = ['untagged'];
});

// Helper to infer node type from ID prefix
function inferType(id) {
  if (!id) return 'file';
  const prefix = id.split(':')[0];
  const known = ['file', 'config', 'document', 'service', 'pipeline', 'table', 'schema', 'resource', 'endpoint', 'function', 'class', 'module', 'concept'];
  if (known.includes(prefix)) return prefix;
  return 'file';
}

// Deduplicate nodes by ID (keep last occurrence)
const nodeMap = new Map();
allNodes.forEach(n => {
  if (n.id) nodeMap.set(n.id, n);
});
const dedupedNodes = Array.from(nodeMap.values());
if (dedupedNodes.length < allNodes.length) {
  corrections.push(`deduplicated ${allNodes.length - dedupedNodes.length} duplicate nodes`);
}

// Build node ID set for edge validation
const nodeIds = new Set(dedupedNodes.map(n => n.id));

// Normalize edge references
const validEdges = [];
allEdges.forEach((e, i) => {
  if (!e.source || !e.target) { warnings.push(`Edge[${i}] missing source or target`); return; }
  e.source = normalizeId(e.source);
  e.target = normalizeId(e.target);
  if (!nodeIds.has(e.source)) { warnings.push(`Edge[${i}] source '${e.source}' not found among nodes`); return; }
  if (!nodeIds.has(e.target)) { warnings.push(`Edge[${i}] target '${e.target}' not found among nodes`); return; }
  if (e.source === e.target) { warnings.push(`Edge[${i}] self-reference on ${e.source}`); return; }
  validEdges.push(e);
});

// Deduplicate edges by (source, target, type)
const edgeKey = e => `${e.source}|${e.target}|${e.type}`;
const seenEdges = new Set();
const dedupedEdges = [];
validEdges.forEach(e => {
  const key = edgeKey(e);
  if (!seenEdges.has(key)) {
    seenEdges.add(key);
    dedupedEdges.push(e);
  }
});
if (dedupedEdges.length < validEdges.length) {
  corrections.push(`deduplicated ${validEdges.length - dedupedEdges.length} duplicate edges`);
}

console.error(`merge: ${dedupedNodes.length} nodes, ${dedupedEdges.length} edges after normalization`);

// --- tested_by linker (Pass 1: flip inverted edges, drop bad ones) ---
const testExts = new Set(['test.rs', 'spec.rs', '_test.rs', '.test.ts', '.spec.ts', '.test.js', '.spec.js']);
function isTestPath(p) {
  return testExts.has(path.extname(p)) || p.includes('/tests/') || p.includes('/test_data/');
}
function getFilePath(id) {
  const n = nodeMap.get(id);
  return n ? (n.filePath || n.id) : id;
}

const keptEdges = [];
dedupedEdges.forEach(e => {
  if (e.type !== 'tested_by') { keptEdges.push(e); return; }
  const srcPath = getFilePath(e.source);
  const tgtPath = getFilePath(e.target);
  const srcIsTest = isTestPath(srcPath);
  const tgtIsTest = isTestPath(tgtPath);

  if (srcIsTest && tgtIsTest) { corrections.push(`dropped test↔test tested_by: ${e.source} -> ${e.target}`); return; }
  if (!srcIsTest && !tgtIsTest) { corrections.push(`dropped prod↔prod tested_by: ${e.source} -> ${e.target}`); return; }

  // Flip if reversed (test -> production should be production -> test)
  if (srcIsTest && !tgtIsTest) {
    corrections.push(`flipped tested_by: ${e.source} -> ${e.target}`);
    keptEdges.push({ source: e.target, target: e.source, type: 'tested_by', weight: 0.5 });
  } else {
    keptEdges.push(e);
  }
});

// Pass 2: supplement with path-convention pairings
// Find production file nodes with corresponding test files
const fileNodes = dedupedNodes.filter(n => n.type === 'file' && n.filePath);
const prodFiles = fileNodes.filter(n => !isTestPath(n.filePath));
prodFiles.forEach(prod => {
  const dir = path.dirname(prod.filePath);
  const base = path.basename(prod.filePath, '.rs');
  const testPaths = [
    path.join(dir, base + '.test.rs'),
    path.join(dir, 'tests', base + '.rs'),
    path.join(dir, 'test_' + base + '.rs'),
  ];
  for (const tp of testPaths) {
    const testNode = fileNodes.find(n => n.filePath === tp || n.filePath.endsWith('/' + tp));
    if (testNode) {
      const key = `${prod.id}|${testNode.id}|tested_by`;
      if (!seenEdges.has(key)) {
        keptEdges.push({ source: prod.id, target: testNode.id, type: 'tested_by', weight: 0.5 });
        seenEdges.add(key);
        corrections.push(`convention-paired tested_by: ${prod.id} -> ${testNode.id}`);
      }
    }
  }
});

// Tag production nodes that have tested_by edges
const testedProds = new Set();
keptEdges.filter(e => e.type === 'tested_by').forEach(e => {
  const prodNode = nodeMap.get(e.source);
  if (prodNode && !isTestPath(getFilePath(e.source))) testedProds.add(e.source);
});
testedProds.forEach(id => {
  const n = nodeMap.get(id);
  if (n && !n.tags.includes('tested')) n.tags.push('tested');
});

console.error(`merge: ${corrections.length} corrections applied`);
corrections.forEach(c => console.error(`  ${c}`));
warnings.forEach(w => console.error(`  warn: ${w}`));

// --- Write output ---
const graph = {
  nodes: dedupedNodes.map(n => {
    // Remove internal tracking fields
    const { _source, ...clean } = n;
    return clean;
  }),
  edges: keptEdges,
};

fs.writeFileSync(OUTPUT, JSON.stringify(graph, null, 2));
console.error(`merge: wrote ${OUTPUT} (${graph.nodes.length} nodes, ${graph.edges.length} edges)`);
console.log(JSON.stringify({ nodes: graph.nodes.length, edges: graph.edges.length, corrections: corrections.length, warnings: warnings.length }));
