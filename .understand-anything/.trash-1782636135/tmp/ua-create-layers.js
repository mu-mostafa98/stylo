const fs = require('fs');

// Read input data
const inputData = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const results = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));

const { fileNodes } = inputData;
const { directoryGroups, patternMatches } = results;

// Build a map from fileId to its filePath
const idToPath = {};
fileNodes.forEach(n => { idToPath[n.id] = n.filePath; });

// Build a map from fileId to its node type
const idToType = {};
fileNodes.forEach(n => { idToType[n.id] = n.type || 'file'; });

// Determine which directory group a fileId belongs to
const idToDirGroup = {};
Object.entries(directoryGroups).forEach(([dir, ids]) => {
  ids.forEach(id => { idToDirGroup[id] = dir; });
});

// =========================================================
// Layer assignment rules
// =========================================================

// Layer 1: Core Style Engine
// Files at style/ root level, key subsystems
const coreEngineIds = new Set();

// Layer 2: Stylesheets
const stylesheetsIds = new Set();

// Layer 3: Values
const valuesIds = new Set();

// Layer 4: Properties
const propertiesIds = new Set();

// Layer 5: Selectors
const selectorsIds = new Set();

// Layer 6: Gecko Integration
const geckoIds = new Set();

// Layer 7: Servo Integration
const servoIds = new Set();

// Layer 8: Macros & Derives
const macrosIds = new Set();

// Layer 9: Infrastructure & Configuration
const infrastructureIds = new Set();

// Layer 10: Support Libraries
const librariesIds = new Set();

// Classify each file
fileNodes.forEach(node => {
  const id = node.id;
  const path = idToPath[id] || '';
  const normalized = path.replace(/\\/g, '/');
  const type = idToType[id];
  const pattern = patternMatches[id] || 'unknown';
  const dirGroup = idToDirGroup[id] || '__unknown__';

  // Helper: check if file is directly in style/X/ (one level deep)
  const styleSubdirMatch = normalized.match(/^style\/([^/]+)\//);
  const styleSubdir = styleSubdirMatch ? styleSubdirMatch[1] : null;

  // =======================================================
  // Document files (*.md, LICENSE, etc.)
  // =======================================================
  const name = normalized.split('/').pop();

  // README.md, SYNCING.md at root
  if (type === 'document' && (name === 'README.md' || name === 'SYNCING.md')) {
    if (normalized.startsWith('style/')) {
      coreEngineIds.add(id);
    } else if (normalized.startsWith('selectors/')) {
      selectorsIds.add(id);
    } else if (normalized === 'README.md' || normalized === 'SYNCING.md') {
      infrastructureIds.add(id);
    } else {
      librariesIds.add(id);
    }
    return;
  }

  // CHANGES.md in selectors
  if (type === 'document' && name === 'CHANGES.md' && normalized.startsWith('selectors/')) {
    selectorsIds.add(id);
    return;
  }

  // LICENSE files
  if (name === 'LICENSE-APACHE' || name === 'LICENSE-MIT' || name === 'LICENSE.txt') {
    if (normalized.startsWith('malloc_size_of/') || normalized.startsWith('servo_arc/')) {
      librariesIds.add(id);
    } else if (normalized.includes('vendored_python')) {
      infrastructureIds.add(id);
    } else {
      librariesIds.add(id);
    }
    return;
  }

  // static_atoms.txt (data file for atoms)
  if (name === 'static_atoms.txt') {
    librariesIds.add(id);
    return;
  }

  // =======================================================
  // Config files (Cargo.toml)
  // =======================================================
  if (type === 'config' && name === 'Cargo.toml') {
    if (dirGroup === '__root__' || normalized === 'Cargo.toml') {
      infrastructureIds.add(id);
    } else if (dirGroup === 'style') {
      coreEngineIds.add(id); // style crate's Cargo.toml
    } else if (dirGroup === 'selectors') {
      selectorsIds.add(id);
    } else {
      librariesIds.add(id);
    }
    return;
  }

  // preferences.toml
  if (type === 'config' && name === 'preferences.toml') {
    librariesIds.add(id);
    return;
  }

  // .understand-anything tool artifacts
  if (normalized.startsWith('.understand-anything/')) {
    infrastructureIds.add(id);
    return;
  }

  // =======================================================
  // Pipeline files (CI/CD)
  // =======================================================
  if (type === 'pipeline') {
    infrastructureIds.add(id);
    return;
  }

  // =======================================================
  // Selectors crate
  // =======================================================
  if (dirGroup === 'selectors') {
    selectorsIds.add(id);
    return;
  }

  // =======================================================
  // Support crates (dirGroup-based)
  // =======================================================
  if (dirGroup === 'malloc_size_of') {
    librariesIds.add(id);
    return;
  }
  if (dirGroup === 'servo_arc') {
    librariesIds.add(id);
    return;
  }
  if (dirGroup === 'stylo_atoms') {
    librariesIds.add(id);
    return;
  }
  if (dirGroup === 'stylo_dom') {
    librariesIds.add(id);
    return;
  }
  if (dirGroup === 'stylo_static_prefs') {
    librariesIds.add(id);
    return;
  }
  if (dirGroup === 'to_shmem') {
    librariesIds.add(id);
    return;
  }
  if (dirGroup === 'style_traits') {
    librariesIds.add(id);
    return;
  }

  // =======================================================
  // Macros & Derives
  // =======================================================
  if (dirGroup === 'style_derive') {
    macrosIds.add(id);
    return;
  }
  if (dirGroup === 'to_shmem_derive') {
    macrosIds.add(id);
    return;
  }

  // =======================================================
  // Root-level files
  // =======================================================
  if (dirGroup === '__root__') {
    // Shell scripts, README, configs
    infrastructureIds.add(id);
    return;
  }

  // =======================================================
  // style/ subdirectory classification
  // =======================================================
  if (dirGroup === 'style') {
    // Subdirectory-based classification
    if (styleSubdir === 'stylesheets') {
      stylesheetsIds.add(id);
      return;
    }
    if (styleSubdir === 'values') {
      valuesIds.add(id);
      return;
    }
    if (styleSubdir === 'color') {
      valuesIds.add(id);  // Color is part of the values system
      return;
    }
    if (styleSubdir === 'properties') {
      propertiesIds.add(id);
      return;
    }
    if (styleSubdir === 'properties_and_values') {
      propertiesIds.add(id);
      return;
    }
    if (styleSubdir === 'gecko') {
      geckoIds.add(id);
      return;
    }
    if (styleSubdir === 'gecko_bindings') {
      geckoIds.add(id);
      return;
    }
    if (styleSubdir === 'gecko_string_cache') {
      geckoIds.add(id);
      return;
    }
    if (styleSubdir === 'servo') {
      servoIds.add(id);
      return;
    }
    if (styleSubdir === 'invalidation') {
      coreEngineIds.add(id);
      return;
    }
    if (styleSubdir === 'rule_tree') {
      coreEngineIds.add(id);
      return;
    }
    if (styleSubdir === 'sharing') {
      coreEngineIds.add(id);
      return;
    }
    if (styleSubdir === 'media_queries') {
      coreEngineIds.add(id);
      return;
    }
    if (styleSubdir === 'queries') {
      coreEngineIds.add(id);
      return;
    }
    if (styleSubdir === 'device') {
      coreEngineIds.add(id);
      return;
    }
    if (styleSubdir === 'url') {
      coreEngineIds.add(id);
      return;
    }
    if (styleSubdir === 'use_counters') {
      coreEngineIds.add(id);
      return;
    }
    if (styleSubdir === 'counter_style') {
      coreEngineIds.add(id);
      return;
    }
    if (styleSubdir === 'l10n') {
      coreEngineIds.add(id);
      return;
    }
    if (styleSubdir === 'typed_om') {
      coreEngineIds.add(id);
      return;
    }

    // Files directly in style/ root → core engine
    coreEngineIds.add(id);
    return;
  }

  // Fallback: put in core
  coreEngineIds.add(id);
});

// =========================================================
// Build layers array
// =========================================================

const layers = [
  {
    id: 'layer:core',
    name: 'Core Style Engine',
    description: 'Core style resolution pipeline, DOM abstractions, rule tree, selector matching, style invalidation, and traversal infrastructure',
    nodeIds: [...coreEngineIds]
  },
  {
    id: 'layer:stylesheets',
    name: 'Stylesheets Subsystem',
    description: 'CSS at-rule implementations including @import, @media, @container, @keyframes, @font-face, @page, and stylesheet parsing and management',
    nodeIds: [...stylesheetsIds]
  },
  {
    id: 'layer:values',
    name: 'CSS Values System',
    description: 'CSS value type definitions for specified, computed, animated, generic, and resolved values, plus the CSS color module',
    nodeIds: [...valuesIds]
  },
  {
    id: 'layer:properties',
    name: 'CSS Properties System',
    description: 'CSS property definitions, cascading logic, declaration blocks, computed value flags, Houdini properties-and-values, and property build scripts',
    nodeIds: [...propertiesIds]
  },
  {
    id: 'layer:selectors',
    name: 'CSS Selector Engine',
    description: 'CSS selector parsing, matching, bloom filter, and relative selector support for the selectors crate',
    nodeIds: [...selectorsIds]
  },
  {
    id: 'layer:gecko',
    name: 'Gecko FFI Integration',
    description: 'Firefox/Gecko browser integration layer including FFI bindings, wrapper types, snapshot handling, and Gecko-specific selector parsers',
    nodeIds: [...geckoIds]
  },
  {
    id: 'layer:servo',
    name: 'Servo Engine Support',
    description: 'Servo browser engine integration including animation driver, attribute handling, encoding support, and Servo-specific style features',
    nodeIds: [...servoIds]
  },
  {
    id: 'layer:macros',
    name: 'Procedural Macros',
    description: 'Derive macros for style types including parsing, CSS serialization, animation, and shared memory serialization',
    nodeIds: [...macrosIds]
  },
  {
    id: 'layer:libraries',
    name: 'Support Libraries',
    description: 'Shared utility crates including servo_arc, style_traits, malloc_size_of, to_shmem, stylo_atoms, stylo_dom, and stylo_static_prefs',
    nodeIds: [...librariesIds]
  },
  {
    id: 'layer:infrastructure',
    name: 'Infrastructure & Configuration',
    description: 'CI/CD pipelines, workspace configuration, build scripts, Nix shell, shell sync scripts, project documentation, and development tooling',
    nodeIds: [...infrastructureIds]
  }
];

// Verify: every fileNode.id appears exactly once
const allAssigned = new Set();
layers.forEach(l => {
  l.nodeIds.forEach(id => {
    if (allAssigned.has(id)) {
      console.error(`ERROR: Duplicate assignment for ${id}`);
    }
    allAssigned.add(id);
  });
});

const totalInput = fileNodes.length;
const totalAssigned = allAssigned.size;

if (totalAssigned !== totalInput) {
  console.error(`ERROR: Assigned ${totalAssigned} nodes, but input has ${totalInput} nodes`);
  // Find unassigned
  const inputIds = new Set(fileNodes.map(n => n.id));
  const unassigned = [...inputIds].filter(id => !allAssigned.has(id));
  console.error('Unassigned nodes:', unassigned);

  // Also check for extra assigned IDs
  const extra = [...allAssigned].filter(id => !inputIds.has(id));
  if (extra.length > 0) {
    console.error('Extra (non-input) IDs assigned:', extra);
  }

  process.exit(1);
}

// Verify no empty layers
layers.forEach(l => {
  if (l.nodeIds.length === 0) {
    console.error(`ERROR: Layer ${l.id} has no nodes`);
    process.exit(1);
  }
});

// Check layer count
if (layers.length < 3 || layers.length > 10) {
  console.error(`ERROR: ${layers.length} layers created, must be 3-10`);
  process.exit(1);
}

// Write output
const outputPath = process.argv[4];
fs.writeFileSync(outputPath, JSON.stringify(layers, null, 2), 'utf8');

console.log(`Layers created: ${layers.length}`);
console.log(`Total nodes assigned: ${totalAssigned}`);
layers.forEach(l => console.log(`  ${l.id}: ${l.nodeIds.length} nodes`));
