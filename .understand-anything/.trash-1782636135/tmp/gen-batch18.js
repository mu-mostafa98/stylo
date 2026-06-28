const path = require('path');
const fs = require('fs');

const d = require('D:/Projects/stylo/.understand-anything/tmp/ua-file-extract-results-18.json');
const ex = fs.readFileSync('D:/Projects/stylo/.understand-anything/tmp/ua-file-analyzer-input-18.json', 'utf8');
const input = JSON.parse(ex);
const bid = input.batchImportData;

// Build exports set per file
const exportsByFile = {};
for (const r of d.results) {
  exportsByFile[r.path] = new Set((r.exports || []).map(e => e.name));
}

function isExport(filePath, name) {
  return exportsByFile[filePath] && exportsByFile[filePath].has(name);
}

function shouldIncludeFn(fn, filePath) {
  const lineCount = fn.endLine - fn.startLine + 1;
  return lineCount >= 10 || isExport(filePath, fn.name);
}

function shouldIncludeClass(cls, filePath) {
  const lineCount = cls.endLine - cls.startLine + 1;
  const methodCount = (cls.methods || []).length;
  return methodCount >= 2 || lineCount >= 20 || isExport(filePath, cls.name);
}

const allFileNodes = {};
const allClassNodes = {};
const allFuncNodes = {};

// Track used names per file for disambiguation
const usedNames = {};

function makeFuncId(filePath, funcName, startLine, params) {
  const key = filePath + '|' + funcName;
  if (!usedNames[key]) {
    usedNames[key] = [];
  }
  usedNames[key].push({ startLine, params });
  // If this is a duplicate, qualify with type context
  const count = usedNames[key].length;
  if (count > 1) {
    // Find disambiguating context: use params or line
    const prev = usedNames[key][count - 2];
    if (params && params.length > 0 && prev.params && prev.params.length > 0) {
      const typeHint = params[0];
      return 'function:' + filePath + ':' + funcName + '::' + typeHint;
    }
    return 'function:' + filePath + ':' + funcName + '_l' + startLine;
  }
  return 'function:' + filePath + ':' + funcName;
}

for (const r of d.results) {
  const fileNode = {
    id: 'file:' + r.path,
    type: 'file',
    name: path.basename(r.path),
    filePath: r.path,
  };

  if (r.path === 'style/properties_and_values/mod.rs') {
    fileNode.summary = 'Module root for the CSS Properties and Values API (Houdini), re-exporting submodules for property registration, @property rule handling, syntax parsing, and value types.';
    fileNode.tags = ['entry-point', 'module-barrel', 'css-houdini'];
    fileNode.complexity = 'simple';
  } else if (r.path === 'style/properties_and_values/registry.rs') {
    fileNode.summary = 'Defines PropertyRegistration and ScriptRegistry types for managing registered custom CSS properties per the CSS Properties and Values API specification.';
    fileNode.tags = ['registry', 'custom-properties', 'css-houdini'];
    fileNode.complexity = 'moderate';
  } else if (r.path === 'style/properties_and_values/rule.rs') {
    fileNode.summary = 'Implements parsing of the @property CSS at-rule block, including syntax and inherits descriptor validation, initial value handling, and serialization of property registrations.';
    fileNode.tags = ['css-houdini', 'at-property-rule', 'parsing', 'validation'];
    fileNode.complexity = 'complex';
    fileNode.languageNotes = 'Uses cssparser for rule body parsing and implements multiple style_traits traits (ToCss, ToShmem) for serialization.';
  } else if (r.path === 'style/properties_and_values/syntax/ascii.rs') {
    fileNode.summary = 'Provides a utility function for trimming ASCII whitespace from string slices, used internally by the syntax descriptor parser.';
    fileNode.tags = ['utility', 'string-manipulation', 'ascii'];
    fileNode.complexity = 'simple';
  } else if (r.path === 'style/properties_and_values/syntax/data_type.rs') {
    fileNode.summary = 'Defines the DataType enum representing all supported CSS data types in @property syntax descriptors, with parsing, serialization, and dependency tracking.';
    fileNode.tags = ['data-type', 'css-values', 'syntax-parsing'];
    fileNode.complexity = 'moderate';
    fileNode.languageNotes = 'Uses bitflags for DependentDataTypes to track which dependent properties (length, color) a syntax descriptor may reference.';
  } else if (r.path === 'style/properties_and_values/syntax/mod.rs') {
    fileNode.summary = 'Parses and serializes @property syntax descriptor strings per the CSS Properties and Values API grammar, with support for data type names, custom idents, and space/comma multipliers.';
    fileNode.tags = ['syntax-parser', 'css-houdini', 'descriptor', 'parsing'];
    fileNode.complexity = 'complex';
    fileNode.languageNotes = 'Contains a custom character-level recursive parser for syntax descriptor grammar, implementing the full spec algorithm from CSS Properties and Values API.';
  } else if (r.path === 'style/properties_and_values/value.rs') {
    fileNode.summary = 'Defines generic value types for registered custom property values, including parsing, computation, animation, and serialization for both specified and computed value domains.';
    fileNode.tags = ['value-types', 'custom-properties', 'parsing', 'computation', 'animation'];
    fileNode.complexity = 'complex';
    fileNode.languageNotes = 'Heavily generic with 12 type parameters on GenericValueComponent, supporting all CSS data types (length, color, transform, string, etc.) via type-level abstraction.';
  }

  allFileNodes[r.path] = fileNode;

  // Create function nodes
  for (const fn of (r.functions || [])) {
    if (!shouldIncludeFn(fn, r.path)) continue;
    const lines = fn.endLine - fn.startLine + 1;
    const exported = isExport(r.path, fn.name);

    let funcId = makeFuncId(r.path, fn.name, fn.startLine, fn.params);
    // Extract just the node name from the ID
    let nodeName = funcId.split(':').slice(2).join(':');

    if (allFuncNodes[funcId]) {
      // Still conflict, use line number
      funcId = 'function:' + r.path + ':' + fn.name + '_l' + fn.startLine;
      nodeName = fn.name + '_l' + fn.startLine;
    }

    const funcNode = {
      id: funcId,
      type: 'function',
      name: nodeName,
      filePath: r.path,
      lineRange: [fn.startLine, fn.endLine],
      tags: [],
      complexity: lines < 20 ? 'simple' : lines < 50 ? 'moderate' : 'complex'
    };

    // Assign summaries based on context
    if (r.path.includes('registry.rs')) {
      if (fn.name === 'get') {
        funcNode.summary = 'Retrieves a property registration by name from the script registry.';
        funcNode.tags = ['getter', 'registry', 'accessor'];
      } else if (fn.name === 'properties') {
        funcNode.summary = 'Returns a reference to the internal properties hash map.';
        funcNode.tags = ['getter', 'registry', 'accessor'];
      } else if (fn.name === 'register') {
        funcNode.summary = 'Inserts a new property registration, asserting no duplicate registration exists.';
        funcNode.tags = ['registry', 'registration', 'mutation'];
      } else if (fn.name === 'get_all') {
        funcNode.summary = 'Returns the full properties hash map reference.';
        funcNode.tags = ['getter', 'registry'];
      }
    } else if (r.path.includes('rule.rs')) {
      if (fn.name === 'parse_property_block') {
        funcNode.summary = 'Parses the descriptor block of an @property rule, validating syntax, inherits, and initial value descriptors.';
        funcNode.tags = ['parsing', 'validation', 'css-rule'];
      } else if (fn.name === 'size_of') {
        funcNode.summary = 'Measures heap allocation size of a PropertyRegistration for memory tracking.';
        funcNode.tags = ['memory', 'measurement'];
      } else if (fn.name === 'compute_initial_value') {
        funcNode.summary = 'Computes the initial value of a property registration, handling universal and typed syntax.';
        funcNode.tags = ['computation', 'initial-value'];
      } else if (fn.name === 'validate_initial_value') {
        funcNode.summary = 'Validates an initial value against the syntax descriptor, checking computational independence.';
        funcNode.tags = ['validation', 'initial-value'];
      } else if (fn.name === 'parse' && fn.startLine === 275) {
        funcNode.summary = 'Parses the inherits descriptor value (true/false) for an @property rule.';
        funcNode.tags = ['parsing', 'inheritance'];
      } else if (fn.name === 'parse' && fn.startLine === 307) {
        funcNode.summary = 'Parses the initial value descriptor for an @property rule as a SpecifiedValue.';
        funcNode.tags = ['parsing', 'initial-value'];
      } else if (fn.name === 'unregistered') {
        funcNode.summary = 'Returns a static Descriptors instance for unregistered properties with universal syntax and inherits default.';
        funcNode.tags = ['utility', 'defaults'];
      } else if (fn.name === 'inherits') {
        funcNode.summary = 'Returns whether the property inherits by default, based on the inherits descriptor.';
        funcNode.tags = ['getter', 'inheritance'];
      } else if (fn.name === 'is_universal') {
        funcNode.summary = 'Checks whether the syntax descriptor is the universal syntax definition.';
        funcNode.tags = ['getter', 'syntax'];
      }
    } else if (r.path.includes('syntax/ascii.rs')) {
      if (fn.name === 'trim_ascii_whitespace') {
        funcNode.summary = 'Trims leading and trailing ASCII whitespace from a string slice using byte-level iteration.';
        funcNode.tags = ['utility', 'string-manipulation'];
      } else if (fn.name === 'trim_ascii_whitespace_test') {
        funcNode.summary = 'Unit tests for the trim_ascii_whitespace function with edge cases.';
        funcNode.tags = ['test', 'utility'];
      }
    } else if (r.path.includes('syntax/data_type.rs')) {
      if (fn.name === 'unpremultiply') {
        funcNode.summary = 'Converts a pre-multiplied data type (TransformList) to its un-premultiplied equivalent component.';
        funcNode.tags = ['utility', 'syntax-component'];
      } else if (fn.name === 'from_str') {
        funcNode.summary = 'Parses a data type name string to the corresponding DataType enum variant.';
        funcNode.tags = ['parsing', 'data-types'];
      } else if (fn.name === 'dependent_types') {
        funcNode.summary = 'Returns which dependent data types (length, color) a given data type may reference.';
        funcNode.tags = ['dependency-analysis', 'data-types'];
      } else if (fn.name === 'to_css') {
        funcNode.summary = 'Serializes a DataType to its CSS syntax representation (e.g. <length>, <color>).';
        funcNode.tags = ['serialization', 'css-output'];
      }
    } else if (r.path.includes('syntax/mod.rs')) {
      if (fn.name === 'universal') {
        funcNode.summary = 'Creates the universal syntax descriptor (matches any value).';
        funcNode.tags = ['factory', 'syntax-descriptor'];
      } else if (fn.name === 'is_universal') {
        funcNode.summary = 'Checks whether this descriptor is the universal syntax definition.';
        funcNode.tags = ['getter', 'syntax-descriptor'];
      } else if (fn.name === 'specified_string') {
        funcNode.summary = 'Returns the original specified syntax string if one was saved.';
        funcNode.tags = ['getter', 'syntax-descriptor'];
      } else if (fn.name === 'from_css_parser') {
        funcNode.summary = 'Parses a syntax descriptor from a CSS parser token stream.';
        funcNode.tags = ['parsing', 'syntax-descriptor'];
      } else if (fn.name === 'try_parse_multiplier') {
        funcNode.summary = 'Attempts to parse a space (+) or comma (#) multiplier from the CSS parser.';
        funcNode.tags = ['parsing', 'multiplier'];
      } else if (fn.name === 'try_parse_component_name') {
        funcNode.summary = 'Attempts to parse a syntax component name, either a data type or custom ident.';
        funcNode.tags = ['parsing', 'component-name'];
      } else if (fn.name === 'from_str') {
        funcNode.summary = 'Parses a syntax descriptor from a string, implementing the spec algorithm for consuming a syntax definition.';
        funcNode.tags = ['parsing', 'syntax-descriptor'];
      } else if (fn.name === 'dependent_types') {
        funcNode.summary = 'Returns bitflags of dependent data types across all syntax components.';
        funcNode.tags = ['dependency-analysis', 'syntax-descriptor'];
      } else if (fn.name === 'to_css') {
        funcNode.summary = 'Serializes the syntax descriptor to CSS, using the specified string if available.';
        funcNode.tags = ['serialization', 'css-output'];
      } else if (fn.name === 'name') {
        funcNode.summary = 'Returns the syntax component name reference.';
        funcNode.tags = ['getter', 'syntax-component'];
      } else if (fn.name === 'multiplier') {
        funcNode.summary = 'Returns the optional multiplier for the syntax component.';
        funcNode.tags = ['getter', 'syntax-component'];
      } else if (fn.name === 'unpremultiplied') {
        funcNode.summary = 'Returns the un-premultiplied component, resolving type names like transform-list.';
        funcNode.tags = ['utility', 'syntax-component'];
      } else if (fn.name === 'parse' && fn.startLine === 351) {
        funcNode.summary = 'Internal recursive parser that iterates syntax components separated by pipes.';
        funcNode.tags = ['parsing', 'internal'];
      } else if (fn.name === 'parse_data_type_name') {
        funcNode.summary = 'Character-level parsing of a data type name within angle brackets.';
        funcNode.tags = ['parsing', 'internal'];
      } else if (fn.name === 'parse_name') {
        funcNode.summary = 'Character-level parsing of a component name (data type or custom ident).';
        funcNode.tags = ['parsing', 'internal'];
      } else if (fn.name === 'parse_component') {
        funcNode.summary = 'Parses a single syntax component including optional multiplier.';
        funcNode.tags = ['parsing', 'internal'];
      }
    } else if (r.path.includes('value.rs')) {
      if (fn.name === 'serialization_types' && fn.startLine === 71) {
        funcNode.summary = 'Determines CSS token serialization types (dimension, number, percentage, etc.) for a GenericValueComponent.';
        funcNode.tags = ['serialization', 'css-tokens'];
      } else if (fn.name === 'animate' && fn.startLine === 162) {
        funcNode.summary = 'Animates a ComponentList by interpolating component values with the same multiplier.';
        funcNode.tags = ['animation', 'interpolation'];
      } else if (fn.name === 'to_css') {
        funcNode.summary = 'Serializes a ComponentList to CSS with appropriate space or comma separators.';
        funcNode.tags = ['serialization', 'css-output'];
      } else if (fn.name === 'new' && fn.startLine === 239) {
        funcNode.summary = 'Constructs a new Value with the given inner value and URL data.';
        funcNode.tags = ['constructor', 'value-type'];
      } else if (fn.name === 'universal') {
        funcNode.summary = 'Creates a universal Value from an untyped variable value, preserving attr taint.';
        funcNode.tags = ['constructor', 'universal-value'];
      } else if (fn.name === 'serialization_types' && fn.startLine === 265) {
        funcNode.summary = 'Delegates serialization type determination to the inner value component or list.';
        funcNode.tags = ['serialization', 'css-tokens'];
      } else if (fn.name === 'to_variable_value') {
        funcNode.summary = 'Converts a typed registered value to an untyped variable value for CSSOM serialization.';
        funcNode.tags = ['conversion', 'serialization'];
      } else if (fn.name === 'compute') {
        funcNode.summary = 'Computes a registered custom property value from specified to computed form using a property registration.';
        funcNode.tags = ['computation', 'value-conversion'];
      } else if (fn.name === 'parse' && fn.startLine === 344) {
        funcNode.summary = 'Parses and validates a registered custom property value according to its syntax descriptor.';
        funcNode.tags = ['parsing', 'value-parsing', 'validation'];
      } else if (fn.name === 'as_universal') {
        funcNode.summary = 'Returns the contained universal variable value if present, otherwise None.';
        funcNode.tags = ['accessor', 'universal-value'];
      } else if (fn.name === 'new' && fn.startLine === 423) {
        funcNode.summary = 'Creates a new Parser instance for parsing custom property values.';
        funcNode.tags = ['constructor', 'parser'];
      } else if (fn.name === 'parse' && fn.startLine === 435) {
        funcNode.summary = 'Parses custom property value components against syntax descriptor components.';
        funcNode.tags = ['parsing', 'internal'];
      } else if (fn.name === 'parse_value') {
        funcNode.summary = 'Parses one or more value components for a syntax component with optional multiplier.';
        funcNode.tags = ['parsing', 'internal'];
      } else if (fn.name === 'parse_component_without_multiplier') {
        funcNode.summary = 'Parses a single syntax component value (length, color, transform, etc.) without multiplier handling.';
        funcNode.tags = ['parsing', 'data-types'];
      } else if (fn.name === 'expect_multiplier') {
        funcNode.summary = 'Expects and consumes a multiplier separator (whitespace or comma) from the CSS token stream.';
        funcNode.tags = ['parsing', 'multiplier'];
      } else if (fn.name === 'animate' && fn.startLine === 631) {
        funcNode.summary = 'Interpolates two CustomAnimatedValues with the same property name.';
        funcNode.tags = ['animation', 'interpolation'];
      } else if (fn.name === 'from_computed') {
        funcNode.summary = 'Constructs a CustomAnimatedValue from a computed value.';
        funcNode.tags = ['constructor', 'animation'];
      } else if (fn.name === 'from_declaration') {
        funcNode.summary = 'Constructs a CustomAnimatedValue from a property declaration, handling CSS-wide keywords and unparsed values.';
        funcNode.tags = ['constructor', 'conversion', 'animation'];
      } else if (fn.name === 'to_declaration') {
        funcNode.summary = 'Converts an animated value back to a PropertyDeclaration.';
        funcNode.tags = ['conversion', 'property-declaration'];
      }
    }

    allFuncNodes[funcId] = funcNode;
  }

  // Create class nodes
  for (const cls of (r.classes || [])) {
    if (!shouldIncludeClass(cls, r.path)) continue;
    const lines = cls.endLine - cls.startLine + 1;
    const methods = (cls.methods || []).length;
    const exported = isExport(r.path, cls.name);

    const clsKey = r.path + ':' + cls.name;
    const classNode = {
      id: 'class:' + r.path + ':' + cls.name,
      type: 'class',
      name: cls.name,
      filePath: r.path,
      lineRange: [cls.startLine, cls.endLine],
      tags: [],
      complexity: lines < 20 ? 'simple' : lines < 50 ? 'moderate' : 'complex'
    };

    if (cls.name === 'PropertyRegistration') {
      classNode.summary = 'A computed, validated custom property registration containing name, syntax/inherits/initial-value descriptors, URL data, and source location.';
      classNode.tags = ['registration', 'data-model', 'css-houdini'];
    } else if (cls.name === 'ScriptRegistry') {
      classNode.summary = 'In-memory registry of custom properties registered via script API, backed by a PrecomputedHashMap.';
      classNode.tags = ['registry', 'storage', 'script-api'];
    } else if (cls.name === 'PropertyRegistrationError') {
      classNode.summary = 'Enum of errors possible during property registration: missing initial value, invalid value, or computationally dependent value.';
      classNode.tags = ['error-type', 'validation'];
    } else if (cls.name === 'PropertyRuleName') {
      classNode.summary = 'A custom property name wrapper that includes the -- prefix when serializing to CSS.';
      classNode.tags = ['name-wrapper', 'serialization'];
    } else if (cls.name === 'Inherits') {
      classNode.summary = 'Enum representing the inherits descriptor value (true/false) for @property rules.';
      classNode.tags = ['enum', 'inheritance'];
    } else if (cls.name === 'DependentDataTypes') {
      classNode.summary = 'Bitflags tracking which dependent data types (length, color) a syntax descriptor may reference for computation.';
      classNode.tags = ['bitflags', 'dependency', 'data-types'];
    } else if (cls.name === 'DataType') {
      classNode.summary = 'Enum of all supported CSS data types for @property syntax descriptors, including length, number, color, image, transform, and string.';
      classNode.tags = ['enum', 'data-types', 'css-values'];
    } else if (cls.name === 'Descriptor') {
      classNode.summary = 'A parsed @property syntax descriptor containing a list of syntax components with methods for parsing, serialization, and dependent type analysis.';
      classNode.tags = ['syntax-descriptor', 'parsing', 'data-model'];
    } else if (cls.name === 'Multiplier') {
      classNode.summary = 'Enum representing space or comma multipliers for syntax component lists.';
      classNode.tags = ['enum', 'multiplier', 'syntax'];
    } else if (cls.name === 'Component') {
      classNode.summary = 'A single syntax component with a name (data type or custom ident) and optional multiplier.';
      classNode.tags = ['syntax-component', 'data-model'];
    } else if (cls.name === 'ComponentName') {
      classNode.summary = 'Enum representing a syntax component name, either a data type (e.g. <length>) or a custom ident.';
      classNode.tags = ['enum', 'component-name', 'syntax'];
    } else if (cls.name === 'GenericValueComponent') {
      classNode.summary = 'Generic enum with 12 type parameters representing a single value component of a registered custom property, supporting all CSS data types.';
      classNode.tags = ['generic-enum', 'value-component', 'css-types'];
    } else if (cls.name === 'ComponentList') {
      classNode.summary = 'A list of value components with an associated multiplier (space or comma separated).';
      classNode.tags = ['value-list', 'multiplier'];
    } else if (cls.name === 'Value') {
      classNode.summary = 'A registered custom property value that preserves its URL data for recomputation and attr taint flag for security.';
      classNode.tags = ['value-wrapper', 'custom-property'];
    } else if (cls.name === 'ValueInner') {
      classNode.summary = 'Enum representing the inner value of a registered custom property: single component, universal value, or list.';
      classNode.tags = ['enum', 'value-inner'];
    } else if (cls.name === 'AllowComputationallyDependent') {
      classNode.summary = 'Enum controlling whether computationally dependent values (like 3em or var()) are permitted during parsing.';
      classNode.tags = ['enum', 'parsing-mode'];
    } else if (cls.name === 'CustomAnimatedValue') {
      classNode.summary = 'An animated custom property value that tracks the property name and supports construction from computed values or declarations.';
      classNode.tags = ['animation', 'custom-property'];
    }

    allClassNodes[clsKey] = classNode;
  }
}

// Split into parts (alphabetical by file path)
const sortedFiles = Object.keys(allFileNodes).sort();
const N = sortedFiles.length;
const parts = 2;
const chunkSize = Math.ceil(N / parts);

const part1Files = sortedFiles.slice(0, chunkSize);
const part2Files = sortedFiles.slice(chunkSize);

console.log('Part 1 files:', part1Files);
console.log('Part 2 files:', part2Files);

function getNodesForFiles(files) {
  const nodes = [];
  for (const f of files) {
    nodes.push(allFileNodes[f]);
    for (const [k, v] of Object.entries(allClassNodes)) {
      if (k.startsWith(f + ':')) nodes.push(v);
    }
    for (const [k, v] of Object.entries(allFuncNodes)) {
      if (k.startsWith('function:' + f + ':')) nodes.push(v);
    }
  }
  return nodes;
}

function getEdgesForFiles(files) {
  const edges = [];
  for (const f of files) {
    const fileId = 'file:' + f;

    // contains edges
    for (const [k, v] of Object.entries(allClassNodes)) {
      if (k.startsWith(f + ':')) {
        edges.push({ source: fileId, target: v.id, type: 'contains', direction: 'forward', weight: 1.0 });
      }
    }
    for (const [k, v] of Object.entries(allFuncNodes)) {
      if (k.startsWith('function:' + f + ':')) {
        edges.push({ source: fileId, target: v.id, type: 'contains', direction: 'forward', weight: 1.0 });
      }
    }

    // exports edges
    for (const [k, v] of Object.entries(allClassNodes)) {
      if (k.startsWith(f + ':') && isExport(f, v.name)) {
        edges.push({ source: fileId, target: v.id, type: 'exports', direction: 'forward', weight: 0.8 });
      }
    }
    for (const [k, v] of Object.entries(allFuncNodes)) {
      if (k.startsWith('function:' + f + ':')) {
        // Check original function name (before disambiguation)
        const cleanName = v.name.split('::')[0].split('_l')[0];
        if (isExport(f, cleanName)) {
          edges.push({ source: fileId, target: v.id, type: 'exports', direction: 'forward', weight: 0.8 });
        }
      }
    }

    // imports edges
    const imports = bid[f] || [];
    for (const imp of imports) {
      edges.push({ source: fileId, target: 'file:' + imp, type: 'imports', direction: 'forward', weight: 0.7 });
    }
  }
  return edges;
}

const p1Nodes = getNodesForFiles(part1Files);
const p1Edges = getEdgesForFiles(part1Files);
console.log('Part 1: ' + p1Nodes.length + ' nodes, ' + p1Edges.length + ' edges');

const p2Nodes = getNodesForFiles(part2Files);
const p2Edges = getEdgesForFiles(part2Files);
console.log('Part 2: ' + p2Nodes.length + ' nodes, ' + p2Edges.length + ' edges');

// Validate
function validate(nodes, edges, label) {
  const nodeIds = new Set(nodes.map(n => n.id));
  let errors = [];
  for (const e of edges) {
    if (!nodeIds.has(e.source) && !e.source.startsWith('file:style/')) {
      errors.push('Source not found: ' + e.source);
    }
    if (!nodeIds.has(e.target)) {
      // Target might be in other batch (import target)
      if (!e.target.startsWith('file:style/')) {
        errors.push('Target not found: ' + e.target);
      }
    }
  }
  if (errors.length > 0) {
    console.log(label + ' ERRORS:', errors);
  } else {
    console.log(label + ' VALID');
  }
}

validate(p1Nodes, p1Edges, 'Part 1');
validate(p2Nodes, p2Edges, 'Part 2');

fs.writeFileSync('D:/Projects/stylo/.understand-anything/intermediate/batch-18-part-1.json', JSON.stringify({ nodes: p1Nodes, edges: p1Edges }, null, 2));
fs.writeFileSync('D:/Projects/stylo/.understand-anything/intermediate/batch-18-part-2.json', JSON.stringify({ nodes: p2Nodes, edges: p2Edges }, null, 2));

console.log('Files written successfully.');
