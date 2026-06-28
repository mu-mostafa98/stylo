const fs = require('fs');

function main() {
  const inputPath = process.argv[2];
  const outputPath = process.argv[3];

  if (!inputPath || !outputPath) {
    console.error('Usage: node ua-arch-analyze.js <input.json> <output.json>');
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  const { fileNodes, importEdges, allEdges } = raw;

  // =========================================================
  // Helper: Extract top-level directory from a file path
  // =========================================================
  function getTopDir(filePath) {
    // Normalize path separators
    const normalized = filePath.replace(/\\/g, '/');
    const parts = normalized.split('/');
    if (parts.length === 1) {
      // File at root, no directory
      return '__root__';
    }
    return parts[0];
  }

  // =========================================================
  // A. Directory Grouping
  // =========================================================
  // First compute common prefix
  const allPaths = fileNodes.map(n => n.filePath.replace(/\\/g, '/'));

  // Find common path prefix
  function commonPathPrefix(paths) {
    if (paths.length === 0) return '';
    const partsList = paths.map(p => p.split('/'));
    const minLen = Math.min(...partsList.map(p => p.length));
    let common = [];
    for (let i = 0; i < minLen; i++) {
      const segment = partsList[0][i];
      if (partsList.every(p => p[i] === segment)) {
        common.push(segment);
      } else {
        break;
      }
    }
    return common.join('/');
  }

  const commonPrefix = commonPathPrefix(allPaths);

  // Compute effective path for directory grouping (relative to common prefix)
  function getGroupKey(filePath) {
    const normalized = filePath.replace(/\\/g, '/');
    let relative = normalized;
    if (commonPrefix && normalized.startsWith(commonPrefix + '/')) {
      relative = normalized.slice(commonPrefix.length + 1);
    } else if (commonPrefix && normalized === commonPrefix) {
      relative = '';
    }

    const parts = relative.split('/');
    if (parts.length === 1 && parts[0] === '') return '__root__';
    if (parts.length === 1) {
      // Could be a file directly under prefix
      const ext = parts[0].split('.').pop();
      return `__root__`;
    }
    return parts[0];
  }

  // But wait - stylo project has many top-level dirs (style, selectors, etc.)
  // and also files in root. Let's use getTopDir directly since there's
  // no single common prefix - we have multiple top-level crates.
  const directoryGroups = {};
  fileNodes.forEach(node => {
    const dir = getTopDir(node.filePath);
    if (!directoryGroups[dir]) directoryGroups[dir] = [];
    directoryGroups[dir].push(node.id);
  });

  // =========================================================
  // B. Node Type Grouping
  // =========================================================
  const nodeTypeGroups = {};
  fileNodes.forEach(node => {
    const type = node.type || 'file';
    if (!nodeTypeGroups[type]) nodeTypeGroups[type] = [];
    nodeTypeGroups[type].push(node.id);
  });

  // =========================================================
  // C. Import Adjacency Matrix
  // =========================================================
  // Build fan-in and fan-out for each file
  const fanOut = {};
  const fanIn = {};

  fileNodes.forEach(n => { fanOut[n.id] = 0; fanIn[n.id] = 0; });

  importEdges.forEach(edge => {
    if (fanOut[edge.source] !== undefined) fanOut[edge.source]++;
    if (fanIn[edge.target] !== undefined) fanIn[edge.target]++;
  });

  // Sort by fan-in (desc) and take top
  const sortedFanIn = Object.entries(fanIn)
    .filter(([id, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);
  const fileFanIn = {};
  sortedFanIn.forEach(([id, count]) => { fileFanIn[id] = count; });

  const sortedFanOut = Object.entries(fanOut)
    .filter(([id, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);
  const fileFanOut = {};
  sortedFanOut.forEach(([id, count]) => { fileFanOut[id] = count; });

  // =========================================================
  // D. Cross-Category Dependency Analysis
  // =========================================================
  // Build a node id -> type map
  const idToType = {};
  fileNodes.forEach(n => { idToType[n.id] = n.type || 'file'; });

  // For import edges (which are all type 'imports'), count between node types
  const crossCategoryEdges = [];

  // Count across all edges by type
  const typeEdgeCounts = {};
  allEdges.forEach(edge => {
    if (edge.type === 'imports') return; // Will be counted via importEdges separately
    const fromType = idToType[edge.source] || 'unknown';
    const toType = idToType[edge.target] || 'unknown';
    const key = `${fromType}->${toType}:${edge.type}`;
    if (!typeEdgeCounts[key]) typeEdgeCounts[key] = { fromType, toType, edgeType: edge.type, count: 0 };
    typeEdgeCounts[key].count++;
  });

  Object.values(typeEdgeCounts).forEach(e => crossCategoryEdges.push(e));

  // Also count import edges by type (file->file for imports)
  const importTypeCounts = {};
  importEdges.forEach(edge => {
    const fromType = idToType[edge.source] || 'file';
    const toType = idToType[edge.target] || 'file';
    const key = `${fromType}->${toType}:imports`;
    if (!importTypeCounts[key]) importTypeCounts[key] = { fromType, toType, edgeType: edge.type || 'imports', count: 0 };
    importTypeCounts[key].count++;
  });
  Object.values(importTypeCounts).forEach(e => crossCategoryEdges.push(e));

  // =========================================================
  // E. Inter-Group Import Frequency
  // =========================================================
  // Build file id -> dir group map
  const idToDir = {};
  fileNodes.forEach(n => {
    idToDir[n.id] = getTopDir(n.filePath);
  });

  const interGroupImports = {};
  importEdges.forEach(edge => {
    const fromDir = idToDir[edge.source];
    const toDir = idToDir[edge.target];
    if (!fromDir || !toDir) return;
    if (fromDir === toDir) return; // intra-group, counted separately
    const key = `${fromDir}->${toDir}`;
    if (!interGroupImports[key]) interGroupImports[key] = { from: fromDir, to: toDir, count: 0 };
    interGroupImports[key].count++;
  });

  const interGroupImportList = Object.values(interGroupImports).sort((a, b) => b.count - a.count);

  // =========================================================
  // F. Intra-Group Import Density
  // =========================================================
  const intraGroupDensity = {};
  const dirs = Object.keys(directoryGroups);

  dirs.forEach(dir => {
    const files = directoryGroups[dir];
    const fileSet = new Set(files);
    let internalEdges = 0;
    let totalEdges = 0;

    importEdges.forEach(edge => {
      const sourceDir = idToDir[edge.source];
      const targetDir = idToDir[edge.target];
      if (sourceDir === dir || targetDir === dir) {
        totalEdges++;
        if (sourceDir === dir && targetDir === dir) {
          internalEdges++;
        }
      }
    });

    intraGroupDensity[dir] = {
      internalEdges,
      totalEdges,
      density: totalEdges === 0 ? 0 : Math.round((internalEdges / totalEdges) * 100) / 100
    };
  });

  // =========================================================
  // G. Directory Pattern Matching
  // =========================================================
  const directoryPatterns = {
    'routes': 'api',
    'api': 'api',
    'controllers': 'api',
    'endpoints': 'api',
    'handlers': 'api',
    'services': 'service',
    'core': 'service',
    'domain': 'service',
    'logic': 'service',
    'models': 'data',
    'db': 'data',
    'data': 'data',
    'persistence': 'data',
    'repository': 'data',
    'entities': 'data',
    'components': 'ui',
    'views': 'ui',
    'pages': 'ui',
    'ui': 'ui',
    'layouts': 'ui',
    'screens': 'ui',
    'middleware': 'middleware',
    'plugins': 'middleware',
    'interceptors': 'middleware',
    'guards': 'middleware',
    'utils': 'utility',
    'helpers': 'utility',
    'common': 'utility',
    'shared': 'utility',
    'tools': 'utility',
    'config': 'config',
    'constants': 'config',
    'env': 'config',
    'settings': 'config',
    '__tests__': 'test',
    'test': 'test',
    'tests': 'test',
    'spec': 'test',
    'specs': 'test',
    'types': 'types',
    'interfaces': 'types',
    'schemas': 'types',
    'contracts': 'types',
    'dtos': 'types',
    'dto': 'types',
    'request': 'types',
    'response': 'types',
    'hooks': 'hooks',
    'store': 'state',
    'state': 'state',
    'reducers': 'state',
    'actions': 'state',
    'slices': 'state',
    'assets': 'assets',
    'static': 'assets',
    'public': 'assets',
    'migrations': 'data',
    'management': 'config',
    'commands': 'config',
    'templatetags': 'utility',
    'signals': 'service',
    'serializers': 'api',
    'cmd': 'entry',
    'internal': 'service',
    'pkg': 'utility',
    'entity': 'data',
    'controller': 'api',
    'routers': 'api',
    'composables': 'service',
    'blueprints': 'api',
    'mailers': 'service',
    'jobs': 'service',
    'channels': 'service',
    'bin': 'entry',
    'docs': 'documentation',
    'documentation': 'documentation',
    'wiki': 'documentation',
    'deploy': 'infrastructure',
    'deployment': 'infrastructure',
    'infra': 'infrastructure',
    'infrastructure': 'infrastructure',
    '.github': 'ci-cd',
    '.gitlab': 'ci-cd',
    '.circleci': 'ci-cd',
    'k8s': 'infrastructure',
    'kubernetes': 'infrastructure',
    'helm': 'infrastructure',
    'charts': 'infrastructure',
    'terraform': 'infrastructure',
    'tf': 'infrastructure',
    'docker': 'infrastructure',
    'sql': 'data',
    'database': 'data',
    'schema': 'data',
    'color': 'color',
    'values': 'values',
    'specified': 'values',
    'computed': 'values',
    'generics': 'values',
    'animated': 'values',
    'resolved': 'values',
    'gecko': 'gecko',
    'gecko_bindings': 'gecko',
    'gecko_string_cache': 'gecko',
    'servo': 'servo',
    'properties': 'properties',
    'properties_and_values': 'properties',
    'stylesheets': 'stylesheets',
    'invalidation': 'invalidation',
    'media_queries': 'media_queries',
    'queries': 'queries',
    'rule_tree': 'rule_tree',
    'sharing': 'sharing',
    'device': 'device',
    'selector_parser': 'selectors',
    'counter_style': 'counter_style',
    'typed_om': 'typed_om',
    'url': 'url',
    'use_counters': 'use_counters',
    'selectors': 'selectors',
    'relative_selector': 'selectors',
    'servo_arc': 'servo_arc',
    'malloc_size_of': 'malloc_size_of',
    'style_derive': 'style_derive',
    'style_traits': 'style_traits',
    'stylo_atoms': 'stylo_atoms',
    'stylo_dom': 'stylo_dom',
    'stylo_static_prefs': 'stylo_static_prefs',
    'to_shmem': 'to_shmem',
    'to_shmem_derive': 'to_shmem_derive',
    'sugar': 'gecko',
    'vendor': 'vendored',
    'vendored_python': 'vendored',
    'element': 'invalidation',
    'syntax': 'properties',
    'workflows': 'ci-cd',
    'doc': 'documentation',
    'malloc_size_of_derive': 'malloc_size_of',
    'style_config': 'config',
    'macros': 'macros',
    'lib': 'library',
    'src': 'source',
  };

  // Also classify individual files by name pattern
  function classifyFile(node) {
    const fileName = node.name || '';
    const filePath = (node.filePath || '').replace(/\\/g, '/');
    const lowerName = fileName.toLowerCase();

    // Test files
    if (lowerName.match(/\.test\.\w+$/) || lowerName.match(/\.spec\.\w+$/) ||
        lowerName.match(/^test_/) || lowerName.match(/_test\.\w+$/) ||
        lowerName.match(/.*test\.\w+$/) || lowerName.match(/.*spec\./) ||
        lowerName.match(/.*spec\.rb$/) || lowerName.match(/.*tests\.cs$/)) {
      return 'test';
    }

    // TypeScript declaration files
    if (lowerName.match(/\.d\.ts$/)) return 'types';

    // Entry points
    if (lowerName === 'lib.rs' || lowerName === 'main.rs') return 'entry';
    if (lowerName === 'mod.rs' && filePath.match(/\/src\//)) return 'entry';
    if (lowerName === 'mod.rs') return 'entry';  // module root
    if (lowerName === 'app.rs' || lowerName === 'application.rs') return 'entry';
    if (lowerName.match(/^__init__\.py$/)) return 'entry';
    if (lowerName.match(/^manage\.py$/)) return 'entry';

    // Config files
    if (lowerName === 'cargo.toml' || lowerName === 'package.json' ||
        lowerName === 'tsconfig.json' || lowerName === '.gitignore' ||
        lowerName === 'rustfmt.toml' || lowerName === 'preferences.toml') {
      return 'config';
    }

    // Infrastructure
    if (lowerName === 'dockerfile' || lowerName.match(/^docker-compose/) ||
        lowerName === 'makefile' || lowerName.match(/\.tf$/) ||
        lowerName.match(/\.tfvars$/)) {
      return 'infrastructure';
    }

    // CI/CD
    if (filePath.match(/\.github\/workflows\//) || lowerName === '.gitlab-ci.yml' ||
        lowerName === 'jenkinsfile') {
      return 'ci-cd';
    }

    // Data
    if (lowerName.match(/\.sql$/)) return 'data';
    if (lowerName.match(/\.graphql$/) || lowerName.match(/\.gql$/) || lowerName.match(/\.proto$/)) return 'types';

    // Documentation
    if (lowerName.match(/\.md$/) || lowerName.match(/\.rst$/)) return 'documentation';
    if (lowerName.match(/^changes$/i) || lowerName.match(/^changelog/i)) return 'documentation';

    // Build scripts
    if (lowerName === 'build.rs') return 'build';
    if (lowerName.match(/\.py$/)) return 'build';
    if (lowerName.match(/\.sh$/)) return 'build';

    // Build outputs, generated files
    if (lowerName.match(/\.whl$/)) return 'vendored';

    // Nix
    if (lowerName.match(/\.nix$/)) return 'infrastructure';

    // Generated property files
    if (lowerName.match(/\.mako\.rs$/) || lowerName.match(/\.mako\./)) return 'generated';

    // TOML data files
    if (lowerName.match(/\.toml$/) && !lowerName.match(/^cargo\./)) return 'data';

    return null;
  }

  const patternMatches = {};
  fileNodes.forEach(node => {
    const dir = getTopDir(node.filePath);
    // Check directory pattern
    const dirPattern = directoryPatterns[dir];
    if (dirPattern) {
      patternMatches[node.id] = dirPattern;
      return;
    }

    // Check sub-directory patterns for nested modules
    const filePath = node.filePath.replace(/\\/g, '/');
    const parts = filePath.split('/');

    // Check each path segment for a known pattern (longest match wins)
    let bestPattern = null;
    let bestDepth = -1;
    for (let i = 0; i < parts.length - 1; i++) {
      const seg = parts[i];
      const pat = directoryPatterns[seg];
      if (pat && i > bestDepth) {
        bestPattern = pat;
        bestDepth = i;
      }
    }

    // Check file-level pattern
    const filePattern = classifyFile(node);
    if (filePattern) {
      patternMatches[node.id] = filePattern;
      return;
    }

    if (bestPattern) {
      patternMatches[node.id] = bestPattern;
      return;
    }

    // Default to unknown
    patternMatches[node.id] = 'unknown';
  });

  // =========================================================
  // H. Deployment Topology Detection
  // =========================================================
  const deploymentTopology = {
    hasDockerfile: false,
    hasCompose: false,
    hasK8s: false,
    hasTerraform: false,
    hasCI: false,
    infraFiles: []
  };

  fileNodes.forEach(node => {
    const fp = node.filePath.replace(/\\/g, '/');
    const name = node.name || '';
    const lower = name.toLowerCase();

    if (lower === 'dockerfile' || lower.match(/^dockerfile\./)) {
      deploymentTopology.hasDockerfile = true;
      deploymentTopology.infraFiles.push(fp);
    }
    if (lower.match(/^docker-compose/)) {
      deploymentTopology.hasCompose = true;
      deploymentTopology.infraFiles.push(fp);
    }
    if (lower.match(/\.yaml$/) && !lower.match(/^docker-compose/) && fp.match(/k8s|kubernetes|helm/)) {
      deploymentTopology.hasK8s = true;
      deploymentTopology.infraFiles.push(fp);
    }
    if (lower.match(/\.tf$/) || lower.match(/\.tfvars$/)) {
      deploymentTopology.hasTerraform = true;
      deploymentTopology.infraFiles.push(fp);
    }
    if (fp.match(/\.github\/workflows\//) || lower === '.gitlab-ci.yml' || lower === 'jenkinsfile') {
      deploymentTopology.hasCI = true;
      deploymentTopology.infraFiles.push(fp);
    }
    if (lower === 'makefile') {
      deploymentTopology.infraFiles.push(fp);
    }
    if (lower.match(/\.nix$/)) {
      deploymentTopology.infraFiles.push(fp);
    }
  });

  // =========================================================
  // I. Data Pipeline Detection
  // =========================================================
  const dataPipeline = {
    schemaFiles: [],
    migrationFiles: [],
    dataModelFiles: [],
    apiHandlerFiles: []
  };

  fileNodes.forEach(node => {
    const fp = node.filePath.replace(/\\/g, '/');
    const name = node.name || '';

    if (name.match(/\.sql$/)) {
      dataPipeline.schemaFiles.push(fp);
    }
    if (name.match(/\.graphql$/) || name.match(/\.gql$/) || name.match(/\.proto$/)) {
      dataPipeline.schemaFiles.push(fp);
    }
    if (fp.match(/\/migrations\//)) {
      dataPipeline.migrationFiles.push(fp);
    }
    if (name === 'preferences.toml' || name === 'static_atoms.txt') {
      dataPipeline.dataModelFiles.push(fp);
    }
    // Property definitions TOML files
    if (name.match(/\.toml$/) && (fp.match(/\/properties\//) || fp.match(/\/gecko\//))) {
      dataPipeline.dataModelFiles.push(fp);
    }
    // Style struct definitions
    if (fp.match(/\/data\.rs$/) || fp.match(/\/dom\.rs$/)) {
      dataPipeline.dataModelFiles.push(fp);
    }
  });

  // =========================================================
  // J. Documentation Coverage
  // =========================================================
  const docCoverage = {
    groupsWithDocs: 0,
    totalGroups: Object.keys(directoryGroups).length,
    coverageRatio: 0,
    undocumentedGroups: []
  };

  // Check which groups have documentation files
  const groupsWithDocFiles = new Set();
  fileNodes.forEach(node => {
    const dir = getTopDir(node.filePath);
    const name = node.name || '';
    if (name.match(/\.md$/) || name.match(/\.rst$/)) {
      groupsWithDocFiles.add(dir);
    }
  });

  docCoverage.groupsWithDocs = groupsWithDocFiles.size;
  docCoverage.coverageRatio = docCoverage.totalGroups > 0 ?
    Math.round((groupsWithDocFiles.size / docCoverage.totalGroups) * 100) / 100 : 0;

  Object.keys(directoryGroups).forEach(dir => {
    if (!groupsWithDocFiles.has(dir)) {
      docCoverage.undocumentedGroups.push(dir);
    }
  });

  // =========================================================
  // K. Dependency Direction
  // =========================================================
  const interGroupCounts = {}; // { "from|to": count }
  importEdges.forEach(edge => {
    const fromDir = idToDir[edge.source];
    const toDir = idToDir[edge.target];
    if (!fromDir || !toDir || fromDir === toDir) return;
    const key = `${fromDir}|${toDir}`;
    if (!interGroupCounts[key]) interGroupCounts[key] = { from: fromDir, to: toDir, count: 0 };
    interGroupCounts[key].count++;
  });

  // Determine dominant direction
  const pairCounts = {};
  Object.values(interGroupCounts).forEach(({ from, to, count }) => {
    const pairKey = [from, to].sort().join('<=>');
    if (!pairCounts[pairKey]) pairCounts[pairKey] = {};
    if (!pairCounts[pairKey][from]) pairCounts[pairKey][from] = 0;
    pairCounts[pairKey][from] += count;
  });

  const dependencyDirection = [];
  Object.values(pairCounts).forEach(counts => {
    const dirs = Object.keys(counts);
    if (dirs.length === 2) {
      const [a, b] = dirs;
      if (counts[a] > counts[b]) {
        dependencyDirection.push({ dependent: a, dependsOn: b });
      } else if (counts[b] > counts[a]) {
        dependencyDirection.push({ dependent: b, dependsOn: a });
      } else {
        dependencyDirection.push({ dependent: a, dependsOn: b });
      }
    } else if (dirs.length === 1) {
      // One-directional
      const d = dirs[0];
      // Need to find the other direction
      const pairKey = Object.keys(counts)[0];
      const sorted = d.split('<=>');
      // Just one direction found, so this is the dependent
      // We need the from/to from the original data
      const allKeys = Object.keys(interGroupCounts);
      for (const k of allKeys) {
        const [from, to] = k.split('|');
        if (from === d || to === d) continue;
        // Actually let's just look at the interGroupCounts
      }
    }
  });

  // Simpler approach - just list all directed edges
  const directionList = [];
  Object.values(interGroupCounts).forEach(({ from, to, count }) => {
    directionList.push({ from, to, count });
  });

  // Aggregate into dependency direction
  const dirMap = {};
  directionList.forEach(({ from, to, count }) => {
    const key = `${from}|${to}`;
    dirMap[key] = count;
  });

  // For each group, determine which groups it depends on (imports from)
  const dependsOn = {};
  directionList.forEach(({ from, to, count }) => {
    if (!dependsOn[from]) dependsOn[from] = [];
    dependsOn[from].push({ dependsOn: to, importCount: count });
  });

  const dependencyDirectionResult = [];
  Object.keys(dependsOn).forEach(dependent => {
    dependsOn[dependent].forEach(({ dependsOn: dep, importCount }) => {
      dependencyDirectionResult.push({ dependent, dependsOn: dep, importCount });
    });
  });

  // =========================================================
  // Stats
  // =========================================================
  const filesPerGroup = {};
  Object.keys(directoryGroups).forEach(dir => {
    filesPerGroup[dir] = directoryGroups[dir].length;
  });

  const nodeTypeCounts = {};
  Object.keys(nodeTypeGroups).forEach(type => {
    nodeTypeCounts[type] = nodeTypeGroups[type].length;
  });

  // =========================================================
  // Build results
  // =========================================================
  const results = {
    scriptCompleted: true,
    directoryGroups,
    nodeTypeGroups,
    interGroupImports: interGroupImportList,
    intraGroupDensity,
    patternMatches,
    crossCategoryEdges,
    deploymentTopology,
    dataPipeline,
    docCoverage,
    dependencyDirection: dependencyDirectionResult,
    fileStats: {
      totalFileNodes: fileNodes.length,
      filesPerGroup,
      nodeTypeCounts
    },
    fileFanIn,
    fileFanOut
  };

  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf8');
  console.log('Analysis complete. Results written to', outputPath);
}

main();
