const fs = require('fs');
const importMap = require('D:/Projects/stylo/.understand-anything/tmp/ua-import-map-output.json').importMap;
const extract = require('D:/Projects/stylo/.understand-anything/tmp/ua-file-extract-results-13.json');

const nodes = [];
const edges = [];
const nodeIds = new Set();

function addNode(node) {
  if (nodeIds.has(node.id)) {
    console.error('DUPLICATE NODE:', node.id);
    return;
  }
  nodeIds.add(node.id);
  nodes.push(node);
}

function addEdge(source, target, type, weight) {
  edges.push({ source, target, type, direction: 'forward', weight });
}

// ====== FILE 1: document_state.rs ======
addNode({
  id: 'file:style/invalidation/element/document_state.rs',
  type: 'file',
  name: 'document_state.rs',
  filePath: 'style/invalidation/element/document_state.rs',
  summary: 'Provides an invalidation processor (DocumentStateInvalidationProcessor) that iterates over cascade data to invalidate element styles when document state selectors are affected by state changes.',
  tags: ['invalidation', 'document-state', 'selector-matching', 'style-engine'],
  complexity: 'moderate',
  languageNotes: 'Uses the InvalidationProcessor trait pattern to separate matching logic from traversal, with PhantomData for lifetime parameterization.'
});
addNode({
  id: 'class:style/invalidation/element/document_state.rs:InvalidationMatchingData',
  type: 'class',
  name: 'InvalidationMatchingData',
  filePath: 'style/invalidation/element/document_state.rs',
  lineRange: [25, 28],
  summary: 'Holds the changed document state for invalidation matching context, used to track which document states have changed during selector matching.',
  tags: ['data-struct', 'document-state', 'invalidation'],
  complexity: 'simple'
});
addNode({
  id: 'class:style/invalidation/element/document_state.rs:DocumentStateInvalidationProcessor',
  type: 'class',
  name: 'DocumentStateInvalidationProcessor',
  filePath: 'style/invalidation/element/document_state.rs',
  lineRange: [41, 156],
  summary: 'Invalidation processor that checks document state selectors against changed document states and generates invalidations for matching selectors across all cascade data.',
  tags: ['invalidation-processor', 'document-state', 'selector-matching'],
  complexity: 'moderate'
});
addNode({
  id: 'function:style/invalidation/element/document_state.rs:new',
  type: 'function',
  name: 'new',
  filePath: 'style/invalidation/element/document_state.rs',
  lineRange: [52, 77],
  summary: 'Constructs a DocumentStateInvalidationProcessor with the given rules iterator, document state changes, selector caches, and quirks mode.',
  tags: ['constructor', 'invalidation'],
  complexity: 'simple'
});
addNode({
  id: 'function:style/invalidation/element/document_state.rs:collect_invalidations',
  type: 'function',
  name: 'collect_invalidations',
  filePath: 'style/invalidation/element/document_state.rs',
  lineRange: [94, 124],
  summary: 'Iterates over cascade data to find document state selectors whose state intersects with the changed document states, pushing invalidations for matching dependencies.',
  tags: ['invalidation', 'selector-collection', 'document-state'],
  complexity: 'moderate'
});

const dsFile = 'file:style/invalidation/element/document_state.rs';
const dsClasses = [
  'class:style/invalidation/element/document_state.rs:InvalidationMatchingData',
  'class:style/invalidation/element/document_state.rs:DocumentStateInvalidationProcessor'
];
const dsFns = [
  'function:style/invalidation/element/document_state.rs:new',
  'function:style/invalidation/element/document_state.rs:collect_invalidations'
];
dsClasses.forEach(c => { addEdge(dsFile, c, 'contains', 1.0); addEdge(dsFile, c, 'exports', 0.8); });
addEdge(dsFile, dsFns[0], 'contains', 1.0);
addEdge(dsFile, dsFns[0], 'exports', 0.8);
addEdge(dsFile, dsFns[1], 'contains', 1.0);

// ====== FILE 2: element_wrapper.rs ======
addNode({
  id: 'file:style/invalidation/element/element_wrapper.rs',
  type: 'file',
  name: 'element_wrapper.rs',
  filePath: 'style/invalidation/element/element_wrapper.rs',
  summary: 'Implements ElementSnapshot trait and ElementWrapper struct for selector-matching against a past state of an element, enabling restyle hint computation by comparing old and new element states and attributes.',
  tags: ['invalidation', 'element-wrapper', 'snapshot', 'selector-matching', 'style-engine'],
  complexity: 'complex',
  languageNotes: 'Implements the selectors::Element trait on a wrapper with snapshot-aware state for pseudo-class matching including :link, :visited, :lang(), :paused/:playing, and CustomState.'
});
addNode({
  id: 'class:style/invalidation/element/element_wrapper.rs:ElementSnapshot',
  type: 'class',
  name: 'ElementSnapshot',
  filePath: 'style/invalidation/element/element_wrapper.rs',
  lineRange: [41, 89],
  summary: 'Trait defining the interface for element snapshots, providing access to past state, attributes, classes, IDs, custom states, and language attributes for invalidation matching.',
  tags: ['trait', 'snapshot', 'invalidation'],
  complexity: 'moderate'
});
addNode({
  id: 'class:style/invalidation/element/element_wrapper.rs:ElementWrapper',
  type: 'class',
  name: 'ElementWrapper',
  filePath: 'style/invalidation/element/element_wrapper.rs',
  lineRange: [94, 432],
  summary: 'Wraps an element with a snapshot to enable selector-matching against its past state, implementing the selectors::Element trait with snapshot-aware pseudo-class matching, attribute lookup, and tree traversal.',
  tags: ['wrapper', 'selector-matching', 'snapshot'],
  complexity: 'complex'
});
addNode({
  id: 'function:style/invalidation/element/element_wrapper.rs:new',
  type: 'function',
  name: 'new',
  filePath: 'style/invalidation/element/element_wrapper.rs',
  lineRange: [108, 114],
  summary: 'Constructs an ElementWrapper from an element and a snapshot map for delayed snapshot lookup.',
  tags: ['constructor', 'wrapper'],
  complexity: 'simple'
});
addNode({
  id: 'function:style/invalidation/element/element_wrapper.rs:snapshot',
  type: 'function',
  name: 'snapshot',
  filePath: 'style/invalidation/element/element_wrapper.rs',
  lineRange: [117, 132],
  summary: 'Retrieves the snapshot for the wrapped element, caching it for subsequent lookups.',
  tags: ['snapshot', 'caching', 'lookup'],
  complexity: 'simple'
});
addNode({
  id: 'function:style/invalidation/element/element_wrapper.rs:state_changes',
  type: 'function',
  name: 'state_changes',
  filePath: 'style/invalidation/element/element_wrapper.rs',
  lineRange: [135, 145],
  summary: 'Computes the element state changes since the snapshot was taken by XORing current and snapshot states.',
  tags: ['state-change', 'invalidation'],
  complexity: 'simple'
});
addNode({
  id: 'function:style/invalidation/element/element_wrapper.rs:match_non_ts_pseudo_class',
  type: 'function',
  name: 'match_non_ts_pseudo_class',
  filePath: 'style/invalidation/element/element_wrapper.rs',
  lineRange: [181, 268],
  summary: 'Implements snapshot-aware non-tree-structural pseudo-class matching, with special handling for :link, :visited, :lang(), :paused/:playing, CustomState, and Gecko-specific pseudo-classes.',
  tags: ['pseudo-class', 'selector-matching', 'snapshot'],
  complexity: 'moderate'
});

const ewFile = 'file:style/invalidation/element/element_wrapper.rs';
const ewClasses = [
  'class:style/invalidation/element/element_wrapper.rs:ElementSnapshot',
  'class:style/invalidation/element/element_wrapper.rs:ElementWrapper'
];
const ewFns = [
  'function:style/invalidation/element/element_wrapper.rs:new',
  'function:style/invalidation/element/element_wrapper.rs:snapshot',
  'function:style/invalidation/element/element_wrapper.rs:state_changes',
  'function:style/invalidation/element/element_wrapper.rs:match_non_ts_pseudo_class'
];
ewClasses.forEach(c => { addEdge(ewFile, c, 'contains', 1.0); addEdge(ewFile, c, 'exports', 0.8); });
addEdge(ewFile, ewFns[0], 'contains', 1.0); addEdge(ewFile, ewFns[0], 'exports', 0.8);
addEdge(ewFile, ewFns[1], 'contains', 1.0); addEdge(ewFile, ewFns[1], 'exports', 0.8);
addEdge(ewFile, ewFns[2], 'contains', 1.0); addEdge(ewFile, ewFns[2], 'exports', 0.8);
addEdge(ewFile, ewFns[3], 'contains', 1.0);

// ====== FILE 3: invalidation_map.rs ======
addNode({
  id: 'file:style/invalidation/element/invalidation_map.rs',
  type: 'file',
  name: 'invalidation_map.rs',
  filePath: 'style/invalidation/element/invalidation_map.rs',
  summary: 'Defines the core invalidation dependency data structures including InvalidationMap, Dependency, and collector types that map CSS selectors to their state, attribute, ID, class, and custom state dependencies for efficient style invalidation.',
  tags: ['invalidation', 'dependency-map', 'selector-analysis', 'style-engine'],
  complexity: 'complex',
  languageNotes: 'Heavily uses ThinArc for reference-counted dependency chains, SmallVec for stack-allocated collections, and bitflags for tree-structural pseudo-class states. Implements the Collector trait pattern with compile-time dispatch.'
});
addNode({
  id: 'class:style/invalidation/element/invalidation_map.rs:Dependency',
  type: 'class',
  name: 'Dependency',
  filePath: 'style/invalidation/element/invalidation_map.rs',
  lineRange: [46, 77],
  summary: 'Core struct representing a selector dependency with offset tracking, next-dependency chaining for compound selectors, and invalidation kind classification.',
  tags: ['dependency', 'selector', 'invalidation'],
  complexity: 'moderate'
});
addNode({
  id: 'class:style/invalidation/element/invalidation_map.rs:InvalidationMap',
  type: 'class',
  name: 'InvalidationMap',
  filePath: 'style/invalidation/element/invalidation_map.rs',
  lineRange: [318, 333],
  summary: 'Central map storing all invalidation dependencies organized by class, ID, state, document state, attribute, and custom state for efficient selector lookup during style invalidation.',
  tags: ['map', 'dependencies', 'selector-lookup'],
  complexity: 'moderate'
});
addNode({
  id: 'class:style/invalidation/element/invalidation_map.rs:StateDependency',
  type: 'class',
  name: 'StateDependency',
  filePath: 'style/invalidation/element/invalidation_map.rs',
  lineRange: [272, 277],
  summary: 'Pairs a Dependency with the ElementState it tracks, enabling state-specific invalidation matching.',
  tags: ['dependency', 'state'],
  complexity: 'simple'
});
addNode({
  id: 'class:style/invalidation/element/invalidation_map.rs:DocumentStateDependency',
  type: 'class',
  name: 'DocumentStateDependency',
  filePath: 'style/invalidation/element/invalidation_map.rs',
  lineRange: [287, 298],
  summary: 'Pairs a Dependency with the DocumentState it tracks, used for document-level state change invalidation.',
  tags: ['dependency', 'document-state'],
  complexity: 'simple'
});
addNode({
  id: 'class:style/invalidation/element/invalidation_map.rs:AdditionalRelativeSelectorInvalidationMap',
  type: 'class',
  name: 'AdditionalRelativeSelectorInvalidationMap',
  filePath: 'style/invalidation/element/invalidation_map.rs',
  lineRange: [391, 402],
  summary: 'Stores invalidation dependencies specific to relative selectors, tracking tree-structural pseudo-class, type, and universal selector dependencies for upward DOM traversal.',
  tags: ['relative-selector', 'invalidation', 'has-pseudo'],
  complexity: 'moderate'
});
addNode({
  id: 'function:style/invalidation/element/invalidation_map.rs:for_full_selector_invalidation',
  type: 'function',
  name: 'for_full_selector_invalidation',
  filePath: 'style/invalidation/element/invalidation_map.rs',
  lineRange: [207, 214],
  summary: 'Creates a dummy Dependency that invalidates the entire selector, used for document-state invalidation across all elements.',
  tags: ['dependency', 'full-invalidation'],
  complexity: 'simple'
});
addNode({
  id: 'function:style/invalidation/element/invalidation_map.rs:note_selector_for_invalidation',
  type: 'function',
  name: 'note_selector_for_invalidation',
  filePath: 'style/invalidation/element/invalidation_map.rs',
  lineRange: [486, 537],
  summary: 'Analyzes a CSS selector and populates the InvalidationMap with all relevant dependencies by traversing the selector tree and collecting state, attribute, ID, and class dependencies.',
  tags: ['selector-analysis', 'dependency-collection', 'invalidation'],
  complexity: 'complex'
});

const imFile = 'file:style/invalidation/element/invalidation_map.rs';
const imClasses = [
  'class:style/invalidation/element/invalidation_map.rs:Dependency',
  'class:style/invalidation/element/invalidation_map.rs:InvalidationMap',
  'class:style/invalidation/element/invalidation_map.rs:StateDependency',
  'class:style/invalidation/element/invalidation_map.rs:DocumentStateDependency',
  'class:style/invalidation/element/invalidation_map.rs:AdditionalRelativeSelectorInvalidationMap'
];
imClasses.forEach(c => { addEdge(imFile, c, 'contains', 1.0); addEdge(imFile, c, 'exports', 0.8); });
addEdge(imFile, 'function:style/invalidation/element/invalidation_map.rs:for_full_selector_invalidation', 'contains', 1.0);
addEdge(imFile, 'function:style/invalidation/element/invalidation_map.rs:for_full_selector_invalidation', 'exports', 0.8);
addEdge(imFile, 'function:style/invalidation/element/invalidation_map.rs:note_selector_for_invalidation', 'contains', 1.0);
addEdge(imFile, 'function:style/invalidation/element/invalidation_map.rs:note_selector_for_invalidation', 'exports', 0.8);

// ====== FILE 4: element/mod.rs ======
addNode({
  id: 'file:style/invalidation/element/mod.rs',
  type: 'file',
  name: 'mod.rs',
  filePath: 'style/invalidation/element/mod.rs',
  summary: 'Module barrel file declaring and re-exporting element-level invalidation submodules including document_state, element_wrapper, invalidation_map, invalidator, relative_selector, restyle_hints, and state_and_attributes.',
  tags: ['barrel', 'module', 'invalidation'],
  complexity: 'simple'
});

// ====== FILE 5: invalidation/mod.rs ======
addNode({
  id: 'file:style/invalidation/mod.rs',
  type: 'file',
  name: 'mod.rs',
  filePath: 'style/invalidation/mod.rs',
  summary: 'Top-level module barrel for the style invalidation system, re-exporting submodules for element-level invalidation, media queries, stylesheet, and viewport unit invalidation.',
  tags: ['barrel', 'module', 'invalidation'],
  complexity: 'simple'
});

// ====== FILE 6: stylesheets.rs ======
addNode({
  id: 'file:style/invalidation/stylesheets.rs',
  type: 'file',
  name: 'stylesheets.rs',
  filePath: 'style/invalidation/stylesheets.rs',
  summary: 'Implements StylesheetInvalidationSet which collects selector-based invalidations from CSS rules and processes them to trigger targeted restyles, supporting rule change tracking via RuleChangeKind.',
  tags: ['invalidation', 'stylesheet', 'css-rules', 'selector-matching', 'style-engine'],
  complexity: 'complex',
  languageNotes: 'Implements incremental invalidation collection through a bucket-based approach with InvalidationKind tracking (None/Element/Scope), supporting efficient subtree and element-level targeted restyles.'
});
addNode({
  id: 'class:style/invalidation/stylesheets.rs:StylesheetInvalidationSet',
  type: 'class',
  name: 'StylesheetInvalidationSet',
  filePath: 'style/invalidation/stylesheets.rs',
  lineRange: [111, 696],
  summary: 'Core struct that collects and processes stylesheet-driven invalidations using bucketed ID, class, and local name maps, with support for full invalidation, per-element invalidation, and subtree invalidation.',
  tags: ['invalidation-set', 'stylesheet', 'css-rules'],
  complexity: 'complex'
});
addNode({
  id: 'function:style/invalidation/stylesheets.rs:invalidate_position_try',
  type: 'function',
  name: 'invalidate_position_try',
  filePath: 'style/invalidation/stylesheets.rs',
  lineRange: [699, 745],
  summary: 'Invalidates absolutely positioned elements that reference changed @position-try fallback names, traversing the element subtree recursively.',
  tags: ['invalidation', 'position-try', 'css-positioning'],
  complexity: 'moderate'
});

const ssFile = 'file:style/invalidation/stylesheets.rs';
addEdge(ssFile, 'class:style/invalidation/stylesheets.rs:StylesheetInvalidationSet', 'contains', 1.0);
addEdge(ssFile, 'class:style/invalidation/stylesheets.rs:StylesheetInvalidationSet', 'exports', 0.8);
addEdge(ssFile, 'function:style/invalidation/stylesheets.rs:invalidate_position_try', 'contains', 1.0);
addEdge(ssFile, 'function:style/invalidation/stylesheets.rs:invalidate_position_try', 'exports', 0.8);

// ====== IMPORT EDGES from element/mod.rs ======
addEdge('file:style/invalidation/element/mod.rs', 'file:style/invalidation/element/document_state.rs', 'imports', 0.7);
addEdge('file:style/invalidation/element/mod.rs', 'file:style/invalidation/element/element_wrapper.rs', 'imports', 0.7);
addEdge('file:style/invalidation/element/mod.rs', 'file:style/invalidation/element/invalidation_map.rs', 'imports', 0.7);
addEdge('file:style/invalidation/element/mod.rs', 'file:style/invalidation/element/invalidator.rs', 'imports', 0.7);
addEdge('file:style/invalidation/element/mod.rs', 'file:style/invalidation/element/relative_selector.rs', 'imports', 0.7);
addEdge('file:style/invalidation/element/mod.rs', 'file:style/invalidation/element/restyle_hints.rs', 'imports', 0.7);
addEdge('file:style/invalidation/element/mod.rs', 'file:style/invalidation/element/state_and_attributes.rs', 'imports', 0.7);

// ====== IMPORT EDGES from invalidation/mod.rs ======
addEdge('file:style/invalidation/mod.rs', 'file:style/invalidation/element/mod.rs', 'imports', 0.7);
addEdge('file:style/invalidation/mod.rs', 'file:style/invalidation/media_queries.rs', 'imports', 0.7);
addEdge('file:style/invalidation/mod.rs', 'file:style/invalidation/stylesheets.rs', 'imports', 0.7);
addEdge('file:style/invalidation/mod.rs', 'file:style/invalidation/viewport_units.rs', 'imports', 0.7);

// ====== WRITE OUTPUT ======
const output = { nodes, edges };

// Check total nodes/edges
console.log('Node count:', nodes.length);
console.log('Edge count:', edges.length);

// Validate
const allNodeIds = new Set(nodes.map(n => n.id));
let invalidEdges = 0;
for (const e of edges) {
  if (!allNodeIds.has(e.source) && !e.source.match(/^file:style/)) {
    console.log('WARNING: source ' + e.source + ' not in this batch (likely cross-batch, OK)');
  }
  if (!allNodeIds.has(e.target) && !e.target.match(/^file:style/)) {
    console.log('WARNING: target ' + e.target + ' not in this batch (likely cross-batch, OK)');
  }
}

// Write single file (under 60 nodes and 120 edges)
fs.writeFileSync('D:/Projects/stylo/.understand-anything/intermediate/batch-13.json', JSON.stringify(output, null, 2));
console.log('Written to D:/Projects/stylo/.understand-anything/intermediate/batch-13.json');
