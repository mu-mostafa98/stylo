#!/usr/bin/env node
"use strict";

const fs = require("fs");

// ─── Read input ───────────────────────────────────────────────────────────
const inputPath = process.argv[2];
const outputPath = process.argv[3];

if (!inputPath || !outputPath) {
  console.error("Usage: node ua-tour-analyze.js <input.json> <output.json>");
  process.exit(1);
}

let data;
try {
  data = JSON.parse(fs.readFileSync(inputPath, "utf-8"));
} catch (e) {
  console.error("Error reading input:", e.message);
  process.exit(1);
}

const { nodes, edges, layers } = data;

// Build lookup maps
const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]));
const adjOut = {}; // source -> [target]
const adjIn = {};  // target -> [source]

for (const n of nodes) {
  adjOut[n.id] = [];
  adjIn[n.id] = [];
}

for (const e of edges) {
  if (adjOut[e.source]) adjOut[e.source].push(e.target);
  if (adjIn[e.target]) adjIn[e.target].push(e.source);
}

// ─── A. Fan-In Ranking ────────────────────────────────────────────────────
const fanIn = nodes.map((n) => ({
  id: n.id,
  name: n.name,
  fanIn: adjIn[n.id].length,
}));
fanIn.sort((a, b) => b.fanIn - a.fanIn);
const fanInRanking = fanIn.slice(0, 20);

// ─── B. Fan-Out Ranking ───────────────────────────────────────────────────
const fanOut = nodes.map((n) => ({
  id: n.id,
  name: n.name,
  fanOut: adjOut[n.id].length,
}));
fanOut.sort((a, b) => b.fanOut - a.fanOut);
const fanOutRanking = fanOut.slice(0, 20);

// ─── C. Entry Point Candidates ────────────────────────────────────────────
const ENTRY_FILENAMES = new Set([
  "index.ts", "index.js", "main.ts", "main.js", "app.ts", "app.js",
  "server.ts", "server.js", "mod.rs", "main.go", "main.py", "main.rs",
  "manage.py", "app.py", "wsgi.py", "asgi.py", "run.py", "__main__.py",
  "Application.java", "Main.java", "Program.cs", "config.ru", "index.php",
  "App.swift", "Application.kt", "main.cpp", "main.c",
]);

function scoreEntryPoint(node) {
  let score = 0;
  const name = node.name || "";

  if (node.type === "document") {
    if (name === "README.md") return 5;
    if (name.endsWith(".md")) return 2;
    return 0;
  }

  if (node.type === "file" || node.type === "config") {
    // Filename match
    if (ENTRY_FILENAMES.has(name)) score += 3;

    // Check if it's lib.rs or main.rs (common Rust entry point)
    if (name === "lib.rs" || name === "main.rs") score += 3;

    // Project root or one-level deep
    const fp = node.filePath || node.id.replace(/^file:/, "").replace(/^config:/, "");
    const depth = fp.split("/").length - 1;
    if (depth <= 1) score += 1;

    // High fan-out (top 10%)
    const fo = adjOut[node.id] ? adjOut[node.id].length : 0;
    const sortedFanOut = fanOut.map((f) => f.fanOut).sort((a, b) => b - a);
    const top10Threshold = sortedFanOut[Math.max(0, Math.floor(sortedFanOut.length * 0.1) - 1)] || 0;
    if (fo >= top10Threshold && top10Threshold > 0) score += 1;

    // Low fan-in (bottom 25%)
    const fi = adjIn[node.id] ? adjIn[node.id].length : 0;
    const sortedFanIn = fanIn.map((f) => f.fanIn).sort((a, b) => b - a);
    const bottom25Threshold =
      sortedFanIn[Math.floor(sortedFanIn.length * 0.75)] || 0;
    if (fi <= bottom25Threshold) score += 1;
  }

  return score;
}

const entryScores = nodes.map((n) => ({
  id: n.id,
  name: n.name,
  score: scoreEntryPoint(n),
  summary: n.summary || "",
}));
entryScores.sort((a, b) => b.score - a.score);
const entryPointCandidates = entryScores.slice(0, 5);

// ─── D. Dependency Chains (BFS from Entry Points) ─────────────────────────
// Find the top code entry point (skip docs)
const topCodeEntry = entryPointCandidates.find(
  (c) => !c.id.startsWith("document:")
);
const bfsStart = topCodeEntry ? topCodeEntry.id : nodes.find(n => n.type === "file")?.id || nodes[0]?.id;

// BFS following "imports" and "depends_on" edges forward
const bfsEdges = edges.filter(
  (e) => e.type === "imports" || e.type === "depends_on"
);

const bfsAdj = {};
for (const n of nodes) {
  bfsAdj[n.id] = [];
}
for (const e of bfsEdges) {
  if (bfsAdj[e.source]) bfsAdj[e.source].push(e.target);
}

const visited = new Set();
const order = [];
const depthMap = {};
const queue = [];

if (bfsStart) {
  visited.add(bfsStart);
  depthMap[bfsStart] = 0;
  queue.push(bfsStart);
  order.push(bfsStart);
}

while (queue.length > 0) {
  const current = queue.shift();
  const currentDepth = depthMap[current];
  for (const neighbor of bfsAdj[current] || []) {
    if (!visited.has(neighbor)) {
      visited.add(neighbor);
      depthMap[neighbor] = currentDepth + 1;
      order.push(neighbor);
      queue.push(neighbor);
    }
  }
}

// Group by depth
const byDepth = {};
for (const [nodeId, depth] of Object.entries(depthMap)) {
  if (!byDepth[depth]) byDepth[depth] = [];
  byDepth[depth].push(nodeId);
}

const bfsTraversal = {
  startNode: bfsStart,
  order,
  depthMap,
  byDepth,
};

// ─── E. Non-Code File Inventory ─────────────────────────────────────────
const nonCodeFiles = {
  documentation: [],
  infrastructure: [],
  data: [],
  config: [],
};

for (const n of nodes) {
  if (n.type === "document") {
    nonCodeFiles.documentation.push({
      id: n.id,
      name: n.name,
      summary: n.summary || "",
    });
  } else if (["service", "pipeline", "resource"].includes(n.type)) {
    nonCodeFiles.infrastructure.push({
      id: n.id,
      name: n.name,
      summary: n.summary || "",
    });
  } else if (["table", "schema", "endpoint"].includes(n.type)) {
    nonCodeFiles.data.push({
      id: n.id,
      name: n.name,
      summary: n.summary || "",
    });
  } else if (n.type === "config") {
    nonCodeFiles.config.push({
      id: n.id,
      name: n.name,
      summary: n.summary || "",
    });
  }
}

// ─── F. Tightly Coupled Clusters ─────────────────────────────────────────
// Build adjacency for ALL edges (bidirectional check)
const allAdj = {};
for (const n of nodes) {
  allAdj[n.id] = new Set();
}
for (const e of edges) {
  allAdj[e.source].add(e.target);
}

// Find bidirectional pairs (A -> B and B -> A)
const pairs = [];
for (let i = 0; i < nodes.length; i++) {
  for (let j = i + 1; j < nodes.length; j++) {
    const a = nodes[i].id;
    const b = nodes[j].id;
    if (allAdj[a].has(b) && allAdj[b].has(a)) {
      pairs.push([a, b]);
    }
  }
}

// Expand clusters: start from pairs, then add nodes connected to 2+ members
const clusters = [];
const usedInCluster = new Set();

for (const [a, b] of pairs) {
  // Check if either already in a cluster
  const existing = clusters.find(
    (c) => c.nodes.includes(a) || c.nodes.includes(b)
  );
  if (existing) {
    if (!existing.nodes.includes(a)) existing.nodes.push(a);
    if (!existing.nodes.includes(b)) existing.nodes.push(b);
  } else {
    clusters.push({ nodes: [a, b], edgeCount: 0 });
  }
}

// Expand clusters
for (const cluster of clusters) {
  let changed = true;
  while (changed) {
    changed = false;
    for (const n of nodes) {
      if (cluster.nodes.includes(n.id)) continue;
      // Count connections to cluster members
      let connections = 0;
      for (const member of cluster.nodes) {
        if (allAdj[n.id].has(member)) connections++;
        // Also check if member has edge to n (already covered by above if bidirectional is explicit)
        if (allAdj[member].has(n.id) && !allAdj[n.id].has(member)) connections++;
      }
      if (connections >= 2) {
        cluster.nodes.push(n.id);
        changed = true;
      }
    }
  }
}

// Count edges within each cluster
for (const cluster of clusters) {
  const nodeSet = new Set(cluster.nodes);
  let count = 0;
  for (const e of edges) {
    if (nodeSet.has(e.source) && nodeSet.has(e.target)) count++;
  }
  cluster.edgeCount = count;
}

// Sort by edge count descending, take top 10, but only clusters > 2 nodes
clusters.sort((a, b) => b.edgeCount - a.edgeCount);
const topClusters = clusters
  .filter((c) => c.nodes.length >= 2)
  .slice(0, 10);

// ─── G. Layer List ───────────────────────────────────────────────────────
const layersOutput = {
  count: layers ? layers.length : 0,
  list: layers
    ? layers.map((l) => ({
        id: l.id,
        name: l.name,
        description: l.description,
      }))
    : [],
};

// ─── H. Node Summary Index ────────────────────────────────────────────────
const nodeSummaryIndex = {};
for (const n of nodes) {
  nodeSummaryIndex[n.id] = {
    name: n.name,
    type: n.type,
    summary: n.summary || "",
  };
}

// ─── Write Output ─────────────────────────────────────────────────────────
const result = {
  scriptCompleted: true,
  entryPointCandidates,
  fanInRanking,
  fanOutRanking,
  bfsTraversal,
  nonCodeFiles,
  clusters: topClusters,
  layers: layersOutput,
  nodeSummaryIndex,
  totalNodes: nodes.length,
  totalEdges: edges.length,
};

try {
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), "utf-8");
  console.error(`Analysis complete: written to ${outputPath}`);
  process.exit(0);
} catch (e) {
  console.error("Error writing output:", e.message);
  process.exit(1);
}
