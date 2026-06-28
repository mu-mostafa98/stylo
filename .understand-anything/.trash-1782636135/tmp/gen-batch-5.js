const fs = require('fs');

const extractPath = 'D:/Projects/stylo/.understand-anything/tmp/ua-file-extract-results-5.json';
const inputPath = 'D:/Projects/stylo/.understand-anything/tmp/ua-file-analyzer-input-5.json';

const extract = JSON.parse(fs.readFileSync(extractPath, 'utf8'));
const input = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

const batchImportData = input.batchImportData || {};

const nodes = [];
const edges = [];

// Maps to detect duplicates
const nodeIds = new Set();

function addNode(node) {
  if (nodeIds.has(node.id)) return;
  nodeIds.add(node.id);
  nodes.push(node);
}

function addEdge(edge) {
  edges.push(edge);
}

// Process each file result
extract.results.forEach(result => {
  const path = result.path;
  const filename = path.split('/').pop();
  const ext = path.split('.').pop();
  const fileId = 'file:' + path;

  // Skip content.rs if it doesn't exist (listed in dispatch but not in extraction)
  if (!result || !result.path) return;

  const nonEmptyLines = result.nonEmptyLines || result.totalLines || 0;
  const totalLines = result.totalLines || 0;

  // Determine complexity
  let complexity = 'simple';
  if (nonEmptyLines > 200 || (result.functions && result.functions.length > 30)) complexity = 'complex';
  else if (nonEmptyLines > 50 || (result.functions && result.functions.length > 10)) complexity = 'moderate';

  // Determine tags
  const tags = ['css-values', 'specified-values', 'rust'];
  if (ext === 'rs') tags.push('rust');

  // Add specific tags based on content
  const hasClasses = result.classes && result.classes.length > 0;
  const hasManyFuncs = result.functions && result.functions.length > 30;
  if (filename === 'font.rs') tags.push('typography');
  if (filename === 'length.rs') tags.push('length-percentage');
  if (filename === 'align.rs') tags.push('box-alignment');
  if (filename === 'color.rs') tags.push('color-values');
  if (filename === 'animation.rs') tags.push('animation');
  if (filename === 'calc.rs') tags.push('calc-expressions');
  if (filename === 'image.rs') tags.push('image-gradient');
  if (filename === 'border.rs') tags.push('border-styles');
  if (filename === 'angle.rs') tags.push('angle-units');
  if (filename === 'background.rs') tags.push('background');
  if (filename === 'basic_shape.rs') tags.push('shapes');
  if (filename === 'box_') tags.push('box-model');
  if (filename === 'easing.rs') tags.push('easing');
  if (filename === 'effects.rs') tags.push('filters');
  if (filename === 'flex.rs') tags.push('flexbox');
  if (filename === 'grid.rs') tags.push('grid');
  if (filename === 'column.rs') tags.push('multicolumn');
  if (filename === 'counters.rs') tags.push('counters');
  if (filename === 'corner_shape.rs') tags.push('corner-shape');

  // Add type-definition tag if mostly exports/structs
  if (hasClasses && result.functions && result.functions.length <= 10) tags.push('type-definition');

  // Build summary describing the file's purpose
  let summary = '';
  switch(filename) {
    case 'align.rs': summary = 'Defines specified types for CSS Box Alignment properties (align-content, justify-content, align-self, align-items, justify-items), including AlignFlags bitflags, ContentDistribution, SelfAlignment, ItemPlacement, and JustifyItems types.'; break;
    case 'angle.rs': summary = 'Defines specified angle types for CSS, including AngleUnit, NoCalcAngle, and Angle with support for deg, grad, rad, turn units as well as calc() expressions.'; break;
    case 'animation.rs': summary = 'Defines specified types for CSS animation and transition properties, including TransitionProperty, animation duration/composition/etc., scroll()/view() timeline notations, and view-transition properties.'; break;
    case 'background.rs': summary = 'Defines specified types for CSS background properties, including BackgroundRepeatKeyword and BackgroundRepeat types supporting two-value repeat syntax.'; break;
    case 'basic_shape.rs': summary = 'Defines specified types for CSS basic shapes used in clip-path, shape-outside, and offset-path, including inset(), circle(), ellipse(), polygon(), path() and rect()/xywh() functions.'; break;
    case 'border.rs': summary = 'Defines specified types for CSS border properties, including BorderStyle, LineWidth, BorderSideWidth, BorderSideOffset, BorderImageRepeat and related width/slice types.'; break;
    case 'calc.rs': summary = 'Defines the calc() expression system for CSS values, including CalcNumeric, Leaf node types, math function parsing, and anchor()/anchor-size() function support.'; break;
    case 'color.rs': summary = 'Defines specified color types for CSS, including Color, Absolute, SystemColor, ColorScheme and related types with parsing for hex/rgb/hsl/color-mix/hwb/light-dark().'; break;
    case 'column.rs': summary = 'Defines the ColumnCount type for CSS multi-column layout column-count property as a re-export from generics.'; break;
    case 'corner_shape.rs': summary = 'Defines specified types for CSS corner-shape property, including CornerShape and SuperellipseArg types.'; break;
    case 'counters.rs': summary = 'Defines specified types for CSS counter properties, including Content, ContentItem, CounterIncrement, CounterReset and CounterSet types with counter()/counters() function parsing.'; break;
    case 'easing.rs': summary = 'Defines the TimingFunction specified type for CSS easing functions, parsing cubic-bezier(), steps(), linear() and keyword easing values.'; break;
    case 'effects.rs': summary = 'Defines specified types for CSS visual effects, including Filter, BoxShadow and SimpleShadow types with filter function and shadow value parsing.'; break;
    case 'flex.rs': summary = 'Defines the FlexBasis type for CSS flex-basis property, parsing length, percentage, auto and content values.'; break;
    case 'font.rs': summary = 'Defines specified types for CSS font properties, including FontWeight, FontStyle, FontStretch, FontSize, FontFamily, FontPalette and related types for comprehensive font configuration.'; break;
    case 'grid.rs': summary = 'Defines specified types for CSS Grid layout properties, parsing track sizes, line names, repeat() notation, grid-template, and grid-line values.'; break;
    case 'image.rs': summary = 'Defines specified image/gradient types, including Image, Gradient, LineDirection, ImageRendering and the cross-fade() and paint() image notations.'; break;
    case 'intersection_observer.rs': summary = 'Defines the IntersectionObserverMargin type used for IntersectionObserver rootMargin parsing and serialization.'; break;
    case 'length.rs': summary = 'Defines specified length and length-percentage types, including NoCalcLength, Length, LengthPercentage, LengthUnit and all CSS length units (px/em/rem/vw/vh/etc.) with calc() support.'; break;
    default: summary = 'Defines specified CSS value types for the Stylo style engine.'; break;
  }

  // Create file node
  addNode({
    id: fileId,
    type: 'file',
    name: filename,
    filePath: path,
    summary: summary,
    tags: tags,
    complexity: complexity
  });

  // Track exports
  const exportedNames = new Set((result.exports || []).map(e => e.name));

  // Create function nodes for significant functions
  (result.functions || []).forEach(f => {
    const lineCount = f.endLine - f.startLine + 1;
    const isExported = exportedNames.has(f.name);
    // Filter: 10+ lines OR exported
    if (lineCount >= 10 || isExported) {
      const funcId = 'function:' + path + ':' + f.name;

      let funcSummary = '';
      if (f.name === 'parse') funcSummary = 'Parses CSS input into the specified value type.';
      else if (f.name === 'to_css') funcSummary = 'Serializes the specified value to CSS text output.';
      else if (f.name === 'to_computed_value') funcSummary = 'Converts the specified value to a computed value with context.';
      else if (f.name === 'from_computed_value') funcSummary = 'Converts a computed value back to a specified value.';
      else if (f.name === 'parse_with_unitless') funcSummary = 'Parses CSS input allowing unitless zero values.';
      else if (f.name === 'parse_quirky') funcSummary = 'Parses CSS input with quirks mode support.';
      else if (f.name === 'parse_internal') funcSummary = 'Internal parsing method for the value type.';
      else if (f.name === 'parse_block') funcSummary = 'Parses a block-axis variant of the value.';
      else if (f.name === 'parse_inline') funcSummary = 'Parses an inline-axis variant of the value.';
      else if (f.name === 'degrees') funcSummary = 'Returns the value in degrees.';
      else if (f.name === 'resolve') funcSummary = 'Resolves a calc expression to a numeric value.';
      else if (f.name === 'parse_arguments') funcSummary = 'Parses the inner arguments of a CSS function notation.';
      else if (f.name.match(/^parse_/)) funcSummary = 'Parses a CSS value subset.';
      else if (f.name.match(/^to_/)) funcSummary = 'Converts this value to a different representation.';
      else if (f.name.match(/^from_/)) funcSummary = 'Constructs this value from another representation.';
      else if (f.name === 'is_zero') funcSummary = 'Returns true if the value is zero.';
      else if (f.name === 'none') funcSummary = 'Returns the none/initial value.';
      else if (f.name === 'new') funcSummary = 'Creates a new instance of the value type.';
      else if (f.name === 'normal') funcSummary = 'Returns the normal/initial value.';
      else if (f.name === 'auto') funcSummary = 'Returns the auto value.';
      else if (f.name === 'zero') funcSummary = 'Returns the zero value.';
      else if (f.name === 'hundred_percent') funcSummary = 'Returns the 100% value.';
      else if (f.name === 'medium') funcSummary = 'Returns the medium value.';
      else if (f.name === 'flip_position') funcSummary = 'Returns the flipped/opposite alignment position.';
      else if (f.name === 'is_none') funcSummary = 'Returns true if this is the none value.';
      else if (f.name === 'is_default') funcSummary = 'Returns true if this is the default value.';
      else if (f.name === 'is_calc') funcSummary = 'Returns true if this is a calc() expression.';
      else funcSummary = 'Handles ' + f.name.replace(/_/g, ' ') + ' for the type.';

      addNode({
        id: funcId,
        type: 'function',
        name: f.name,
        filePath: path,
        lineRange: [f.startLine, f.endLine],
        summary: funcSummary,
        tags: ['function'],
        complexity: lineCount > 50 ? 'complex' : (lineCount > 20 ? 'moderate' : 'simple')
      });

      // contains edge
      addEdge({
        source: fileId,
        target: funcId,
        type: 'contains',
        direction: 'forward',
        weight: 1.0
      });

      // exports edge if exported
      if (isExported) {
        addEdge({
          source: fileId,
          target: funcId,
          type: 'exports',
          direction: 'forward',
          weight: 0.8
        });
      }
    }
  });

  // Create class nodes for significant classes
  (result.classes || []).forEach(c => {
    const lineCount = c.endLine - c.startLine + 1;
    const methodCount = (c.methods || []).length;
    const isExported = exportedNames.has(c.name);
    // Filter: 2+ methods OR 20+ lines OR exported
    if (methodCount >= 2 || lineCount >= 20 || isExported) {
      const classId = 'class:' + path + ':' + c.name;

      let classSummary = '';
      if (c.name.endsWith('Flags') || c.name.endsWith('Bit')) classSummary = 'Bitflags representing CSS keyword values for the property.';
      else if (c.name.endsWith('Data') || c.name.endsWith('Set') || c.name.endsWith('Map')) classSummary = 'Container type for organizing related CSS rule data.';
      else if (c.name.match(/^[A-Z][a-z]+Direction|Value|Type|Mode$/)) classSummary = 'Enum representing CSS keyword value variants.';
      else if (c.name === 'Angle') classSummary = 'Specified CSS angle value supporting calc() expressions.';
      else if (c.name === 'Color') classSummary = 'Specified CSS color value with various color space representations.';
      else if (c.name === 'Length') classSummary = 'Specified CSS length value.';
      else if (c.name === 'LengthPercentage') classSummary = 'Specified CSS length or percentage value with calc() support.';
      else if (c.name === 'NoCalcLength') classSummary = 'Specified CSS length that is not a calc() expression.';
      else if (c.name === 'FontSize') classSummary = 'Specified CSS font-size value supporting keywords, lengths and percentages.';
      else if (c.name === 'FontFamily') classSummary = 'Specified CSS font-family value with fallback list and generic family handling.';
      else if (c.name === 'FontWeight') classSummary = 'Specified CSS font-weight value supporting numeric and keyword values.';
      else classSummary = 'Specified CSS value type for the relevant property.';

      addNode({
        id: classId,
        type: 'class',
        name: c.name,
        filePath: path,
        lineRange: [c.startLine, c.endLine],
        summary: classSummary,
        tags: ['css-value-type'],
        complexity: lineCount > 100 ? 'complex' : (lineCount > 30 ? 'moderate' : 'simple')
      });

      // contains edge
      addEdge({
        source: fileId,
        target: classId,
        type: 'contains',
        direction: 'forward',
        weight: 1.0
      });

      // exports edge if exported
      if (isExported) {
        addEdge({
          source: fileId,
          target: classId,
          type: 'exports',
          direction: 'forward',
          weight: 0.8
        });
      }
    }
  });

  // Import edges (none for this batch since all importCounts are 0)
  const imports = batchImportData[path] || [];
  imports.forEach(impPath => {
    addEdge({
      source: fileId,
      target: 'file:' + impPath,
      type: 'imports',
      direction: 'forward',
      weight: 0.7
    });
  });
});

const output = {
  nodes: nodes,
  edges: edges
};

console.log('Total nodes:', nodes.length);
console.log('Total edges:', edges.length);
console.log('---');
const edgesByType = {};
edges.forEach(e => { edgesByType[e.type] = (edgesByType[e.type] || 0) + 1; });
console.log('Edges by type:', JSON.stringify(edgesByType));

// Check node count for splitting decision
console.log('---');
const nodeCount = nodes.length;
const edgeCount = edges.length;
console.log('nodeCount:', nodeCount, 'edgeCount:', edgeCount);
if (nodeCount <= 60 && edgeCount <= 120) {
  console.log('SINGLE_PART: fits in one file');
} else {
  const parts = Math.ceil(Math.max(nodeCount / 60, edgeCount / 120));
  console.log('MULTI_PART: needs', parts, 'parts');
}

// Write full output
const outDir = 'D:/Projects/stylo/.understand-anything/tmp';
fs.writeFileSync(outDir + '/ua-graph-batch-5-full.json', JSON.stringify(output, null, 2));
console.log('Full graph written to', outDir + '/ua-graph-batch-5-full.json');
