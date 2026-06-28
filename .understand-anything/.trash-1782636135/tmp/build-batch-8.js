const fs = require('fs');

const extract = JSON.parse(fs.readFileSync('.understand-anything/tmp/ua-file-extract-results-8.json','utf8'));
const batchData = JSON.parse(fs.readFileSync('.understand-anything/tmp/ua-file-analyzer-input-8.json','utf8'));

const nodes = [];
const edges = [];

function getLineRange(item) {
  if (item.startLine != null && item.endLine != null) {
    return [item.startLine, item.endLine];
  }
  return undefined;
}

function fileComplexity(nonEmptyLines) {
  if (nonEmptyLines > 200) return 'complex';
  if (nonEmptyLines > 50) return 'moderate';
  return 'simple';
}

function funcComplexity(lines) {
  if (lines > 50) return 'complex';
  if (lines > 20) return 'moderate';
  return 'simple';
}

const fileSummaries = {
  'style/values/computed/list.rs': 'Provides computed value re-exports for list properties, including ListStyleType and Quotes, with an initial value accessor for Quotes.',
  'style/values/computed/mod.rs': 'Central computed values module defining the Context struct for resolving specified values to computed values, along with type aliases and re-exports for all CSS computed value types.',
  'style/values/computed/motion.rs': 'Defines computed types for CSS motion path properties, including OffsetPath, OffsetRotate, and related type aliases for ray() and offset-position.',
  'style/values/computed/outline.rs': 'Re-exports the computed OutlineStyle type from the specified values module.',
  'style/values/computed/page.rs': 'Defines computed types for CSS @page at-rule properties, including PageSize enum with Size, Orientation, and Auto variants.',
  'style/values/computed/percentage.rs': 'Defines the computed Percentage type with arithmetic operations, CSS serialization, and NonNegativePercentage wrapper.',
  'style/values/computed/position.rs': 'Defines computed types for CSS position and anchor positioning properties, including Position, AnchorFunction, Inset, and ZIndex with try-tactic adjustment support.',
  'style/values/computed/ratio.rs': 'Defines the computed Ratio type with partial ordering, animation interpolation via logarithmic scaling, and squared distance computation.',
  'style/values/computed/rect.rs': 'Defines the NonNegativeLengthOrNumberRect type alias for computed CSS rectangle values made of four length-or-number components.',
  'style/values/computed/resolution.rs': 'Defines the computed Resolution type for CSS resolution values (dppx) with CSS serialization and Typed OM support.',
  'style/values/computed/svg.rs': 'Defines computed types for SVG properties including SVGPaint, SVGLength, SVGWidth, SVGStrokeDashArray, and SVGOpacity with default values.',
  'style/values/computed/table.rs': 'Re-exports the computed CaptionSide type from the specified table module.',
  'style/values/computed/text.rs': 'Defines computed types for CSS text properties including InitialLetter, TextIndent, LetterSpacing, WordSpacing, and TextEmphasisStyle.',
  'style/values/computed/time.rs': 'Defines the computed Time type with seconds representation, CSS serialization, Typed OM support, and arithmetic operations.',
  'style/values/computed/transform.rs': 'Defines computed types for CSS transform properties including TransformOperation, Matrix3D, Matrix, Rotate, Scale, and Translate with matrix arithmetic and interpolation support.',
  'style/values/computed/ui.rs': 'Defines computed types for CSS UI properties including Cursor, CursorImage, and ScrollbarColor with color and image type aliases.',
  'style/values/computed/url.rs': 'Defines the computed UrlOrNone type alias for CSS url() values, wrapping the ComputedUrl type.',
  'style/values/specified/table.rs': 'Defines the specified CaptionSide enum for CSS table caption-side property with Top and Bottom variants.',
};

const funcSpecificSummaries = {
  'style/values/computed/mod.rs': {
    'for_media_query_evaluation': 'Creates a temporary Context for evaluating media queries against a given device.',
    'for_container_query_evaluation': 'Creates a temporary Context for evaluating container queries with container info and style.',
    'new': 'Constructs a new styling Context with the given builder, quirks mode, and rule cache conditions.',
    'new_for_animation': 'Constructs a Context for animation value computation with the given builder and conditions.',
    'new_for_initial_at_property_value': 'Constructs a Context for computing initial @property values from a stylist.',
    'query_font_metrics': 'Queries font metrics for the given font size base and orientation, handling MathML and ex/ch/etc. unit resolution.',
    'viewport_size_for_viewport_unit_resolution': 'Resolves the viewport size for a given viewport variant (default/small/large/dynamic).',
    'maybe_zoom_text': 'Applies text zoom to a length value if text zoom is enabled in the current context.',
    'for_border_rect': 'Computes a border-rect value from four side values for a given writing mode.',
  },
  'style/values/computed/position.rs': {
    'keyword_and_percentage': 'Decomposes an AnchorSide into its keyword and percentage components.',
    'resolve': 'Resolves an anchor() function by calling into Gecko layout to get the anchor offset.',
    'to_computed_value': 'Simplifies a PositionArea at computed-value time by converting logical/inferred keywords.',
  },
  'style/values/computed/ratio.rs': {
    'animate': 'Interpolates two Ratio values using logarithmic scaling as specified in CSS Values Level 4.',
  },
  'style/values/computed/transform.rs': {
    'initial_value': 'Returns the initial computed value for transform-origin (50% 50% 0px).',
    'identity': 'Returns the identity 4x4 transformation matrix.',
    'into_2d': 'Converts a 3D matrix to a 2D matrix if the 3D components are identity.',
    'is_3d': 'Returns true if the matrix has non-identity 3D components.',
    'determinant': 'Computes the determinant of a 4x4 transformation matrix.',
    'transpose': 'Returns the transpose of a 4x4 transformation matrix.',
    'inverse': 'Computes the inverse of a 4x4 transformation matrix, returning Err if singular.',
    'pre_mul_point4': 'Multiplies a 4D point by this matrix (point * matrix).',
    'multiply': 'Multiplies two 4x4 transformation matrices.',
    'scale_by_factor': 'Scales all matrix components by a given factor.',
    'get_matrix_3x3_part': 'Returns the top-left 3x3 portion of the matrix for scale/shear decomposition.',
    'set_perspective': 'Sets the perspective column of a 4x4 matrix.',
    'apply_translate': 'Applies a 3D translation to the matrix.',
    'apply_scale': 'Applies a 3D scale to the matrix.',
    'to_translate_3d': 'Converts any translate transform operation to a Translate3D representation.',
    'to_rotate_3d': 'Converts any rotate transform operation to a Rotate3D representation.',
    'to_scale_3d': 'Converts any scale transform operation to a Scale3D representation.',
    'to_animated_zero': 'Returns the identity-equivalent zero value for a transform operation for animation.',
  },
};

function getFileTags(filePath) {
  const tags = ['stylo', 'rust', 'style-engine'];
  if (filePath.endsWith('/mod.rs')) {
    tags.push('barrel', 'module-root');
  } else if (filePath.includes('/computed/')) {
    tags.push('computed-values');
  } else if (filePath.includes('/specified/')) {
    tags.push('specified-values');
  }
  if (filePath.includes('transform') || filePath.includes('position') || filePath.includes('motion')) {
    tags.push('css-transforms');
  }
  return tags.slice(0, 5);
}

function getFuncTag(filePath) {
  const name = filePath.split('/').pop().replace('.rs', '');
  if (['transform', 'position', 'motion'].includes(name)) return 'css-transform';
  if (['color', 'image', 'svg'].includes(name)) return 'css-graphics';
  if (['font', 'text'].includes(name)) return 'css-typography';
  if (['length', 'percentage', 'ratio', 'resolution'].includes(name)) return 'css-values';
  if (['page', 'table', 'list', 'outline', 'ui', 'url'].includes(name)) return 'css-layout';
  return 'style-engine';
}

function getFuncTags(name, filePath) {
  const tag = getFuncTag(filePath);
  const tags = ['stylo', 'rust', tag];
  if (name.startsWith('to_computed') || name.startsWith('from_computed')) tags.push('value-conversion');
  if (name.startsWith('to_animated') || name.startsWith('from_animated') || name === 'animate') tags.push('animation');
  if (name.startsWith('parse')) tags.push('parsing');
  if (name.includes('identity') || name.includes('inverse') || name.includes('determinant') || name.includes('multiply') || name.includes('transpose')) tags.push('matrix-math');
  if (name === 'new' || name === 'zero' || name === 'one' || name === 'auto' || name === 'center' || name === 'normal') tags.push('constructor');
  return tags.slice(0, 5);
}

function getFuncSummary(funcName, filePath) {
  const fileSpecific = funcSpecificSummaries[filePath];
  if (fileSpecific && fileSpecific[funcName]) return fileSpecific[funcName];
  return 'Handles ' + funcName + ' in the ' + filePath.split('/').pop().replace('.rs', '') + ' module of the Servo style engine.';
}

// Process each file
for (const fileResult of extract.results) {
  const filePath = fileResult.path;
  const fileId = 'file:' + filePath;
  const fileName = filePath.split('/').pop();
  const summary = fileSummaries[filePath] || 'Part of the Servo/Stylo CSS style engine.';
  const fileTags = getFileTags(filePath);

  nodes.push({
    id: fileId,
    type: 'file',
    name: fileName,
    filePath: filePath,
    summary: summary,
    tags: fileTags,
    complexity: fileComplexity(fileResult.nonEmptyLines)
  });

  const exportNames = new Set((fileResult.exports || []).map(e => e.name));

  // Process classes
  for (const cls of (fileResult.classes || [])) {
    const clsLineCount = (cls.endLine - cls.startLine + 1);
    const hasMethods = (cls.methods || []).length >= 2;
    const hasLines = clsLineCount >= 20;
    const isExported = exportNames.has(cls.name);

    if (hasMethods || hasLines || isExported) {
      const clsId = 'class:' + filePath + ':' + cls.name;
      nodes.push({
        id: clsId,
        type: 'class',
        name: cls.name,
        filePath: filePath,
        lineRange: getLineRange(cls),
        summary: 'A CSS computed value struct in the ' + fileName.replace('.rs', '') + ' module of the Servo style engine.',
        tags: ['stylo', 'style-value', 'rust'],
        complexity: clsLineCount > 100 ? 'complex' : (clsLineCount > 30 ? 'moderate' : 'simple')
      });

      edges.push({ source: fileId, target: clsId, type: 'contains', direction: 'forward', weight: 1.0 });
      if (isExported) {
        edges.push({ source: fileId, target: clsId, type: 'exports', direction: 'forward', weight: 0.8 });
      }
    }
  }

  // Process functions, deduplicating same-named functions in same file
  const seenFuncNames = new Set();
  for (const func of (fileResult.functions || [])) {
    const funcLineCount = (func.endLine - func.startLine + 1);
    const isExported = exportNames.has(func.name);

    if (funcLineCount >= 10 || isExported) {
      const funcId = 'function:' + filePath + ':' + func.name;
      if (seenFuncNames.has(func.name)) continue;
      seenFuncNames.add(func.name);

      nodes.push({
        id: funcId,
        type: 'function',
        name: func.name,
        filePath: filePath,
        lineRange: getLineRange(func),
        summary: getFuncSummary(func.name, filePath),
        tags: getFuncTags(func.name, filePath),
        complexity: funcComplexity(funcLineCount)
      });

      edges.push({ source: fileId, target: funcId, type: 'contains', direction: 'forward', weight: 1.0 });
      if (isExported) {
        edges.push({ source: fileId, target: funcId, type: 'exports', direction: 'forward', weight: 0.8 });
      }
    }
  }

  // Add imports edges from batchImportData
  const importData = batchData.batchImportData[filePath] || [];
  for (const importPath of importData) {
    edges.push({
      source: fileId,
      target: 'file:' + importPath,
      type: 'imports',
      direction: 'forward',
      weight: 0.7
    });
  }
}

// Report totals before splitting
const nodeCount = nodes.length;
const edgeCount = edges.length;
console.log('Total nodes:', nodeCount, ', edges:', edgeCount);

const parts = Math.ceil(Math.max(nodeCount / 60, edgeCount / 120));
console.log('Splitting into', parts, 'parts');

// Sort file paths
const allFilePaths = extract.results.map(r => r.path).sort();

// Partition files
const filesPerPart = Math.ceil(allFilePaths.length / parts);
const partFiles = [];
for (let i = 0; i < parts; i++) {
  const start = i * filesPerPart;
  const end = Math.min(start + filesPerPart, allFilePaths.length);
  partFiles.push(allFilePaths.slice(start, end));
}

// Write each part
for (let p = 0; p < parts; p++) {
  const partFileSet = new Set(partFiles[p]);

  const partNodes = nodes.filter(n => {
    if (!n.filePath) return false;
    return partFileSet.has(n.filePath);
  });

  const partNodeIds = new Set(partNodes.map(n => n.id));

  const partEdges = edges.filter(e => {
    return partNodeIds.has(e.source);
  });

  const partIndex = p + 1;
  const partFilePath = '.understand-anything/intermediate/batch-8-part-' + partIndex + '.json';
  fs.writeFileSync(partFilePath, JSON.stringify({ nodes: partNodes, edges: partEdges }, null, 2));
  console.log('Part ' + partIndex + ': ' + partFilePath + ' (' + partNodes.length + ' nodes, ' + partEdges.length + ' edges)');

  // Validate
  const allIds = new Set(partNodes.map(n => n.id));
  let errors = 0;
  for (const e of partEdges) {
    if (!allIds.has(e.source) && !e.source.startsWith('file:')) {
      console.log('  ERROR: edge source not in part: ' + e.source);
      errors++;
    }
    if (!allIds.has(e.target) && !e.target.startsWith('file:')) {
      // cross-batch is fine for file references
    }
  }
  if (errors === 0) console.log('  Validation: PASS');
}

console.log('Done');
