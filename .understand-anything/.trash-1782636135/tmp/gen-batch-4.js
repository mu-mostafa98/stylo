const fs = require('fs');

const extract = JSON.parse(fs.readFileSync('D:/Projects/stylo/.understand-anything/tmp/ua-file-extract-results-4.json'));

// File-level metadata
const fileMeta = {};

fileMeta['style/media_queries/media_query.rs'] = {
  summary: 'Core media query representation, parsing, and serialization implementing the CSS Media Queries specification with Qualifier, MediaType, MediaQuery, and MediaQueryType types.',
  tags: ['media-queries', 'css-parsing', 'serialization', 'responsive-design'],
  languageNotes: 'Rust enums with derive macros for parsing, ToCss, and memory accounting.'
};
fileMeta['style/media_queries/mod.rs'] = {
  summary: 'Module declaration re-exporting MediaList, MediaQuery, MediaQueryType, MediaType, and Qualifier from submodules.',
  tags: ['module', 're-export', 'barrel']
};
fileMeta['style/parallel.rs'] = {
  summary: 'Parallel DOM tree traversal infrastructure using Rayon thread pool, distributing style computation work across worker threads.',
  tags: ['parallelism', 'dom-traversal', 'rayon', 'thread-pool'],
  languageNotes: 'Unsafe SendNode wrappers enable thread-safe DOM node sharing across rayon scoped tasks.'
};
fileMeta['style/str.rs'] = {
  summary: 'String utility functions for whitespace handling, number parsing, string joining, and ASCII case-insensitive operations used across the style system.',
  tags: ['utility', 'string-processing', 'whitespace', 'parsing']
};
fileMeta['style/style_adjuster.rs'] = {
  summary: 'Style fixup pass implementing CSS 2.1 section 9.7 blockification rules, display type adjustments, overflow fixup, Ruby annotation adjustments, visited link handling, and position-try fallback tactics.',
  tags: ['style-adjustment', 'css-fixup', 'spec-compliance'],
  languageNotes: 'Heavy use of conditional compilation (cfg(feature = "gecko") vs "servo") for platform-specific adjustments.'
};
fileMeta['style/style_resolver.rs'] = {
  summary: 'Style resolution for elements and pseudo-elements, handling matching, cascading, style sharing cache lookups, and starting-style/after-change-style resolution.',
  tags: ['style-resolution', 'cascade', 'pseudo-elements', 'matching'],
  languageNotes: 'StyleResolverForElement uses PhantomData for lifetime safety with conditional compilation for Gecko/Servo backends.'
};
fileMeta['style/stylesheet_set.rs'] = {
  summary: 'Centralized stylesheet collection management for documents and shadow roots, supporting append, insert, remove operations per CSS origin with dirty tracking and invalidation.',
  tags: ['stylesheet-management', 'cssom', 'invalidation', 'origin-tracking']
};
fileMeta['style/thread_state.rs'] = {
  summary: 'Thread-local state tracking for distinguishing script, layout, and worker threads with assertion helpers.',
  tags: ['thread-safety', 'assertions', 'state-tracking']
};
fileMeta['style/traversal.rs'] = {
  summary: 'DOM tree traversal infrastructure for style computation including PerLevelTraversalData, PreTraverseToken, DomTraversal trait, resolve_style for undisplayed elements, and recalc_style_at for per-node restyling.',
  tags: ['dom-traversal', 'style-computation', 'invalidation', 'bloom-filter'],
  languageNotes: 'Generic over TElement with parallel traversal support via SendNode wrapper.'
};
fileMeta['style/traversal_flags.rs'] = {
  summary: 'Bitflag definitions controlling traversal behavior including animation-only mode, CSS rule change handling, and parallel traversal enablement.',
  tags: ['traversal', 'flags', 'animation']
};
fileMeta['style/values/animated/color.rs'] = {
  summary: 'Animated color interpolation implementing Animate, ComputeSquaredDistance, and ToAnimatedZero for AbsoluteColor and GenericColor types.',
  tags: ['animation', 'color', 'interpolation', 'css-animations']
};
fileMeta['style/values/animated/effects.rs'] = {
  summary: 'Type aliases for animated filter and shadow values bridging computed types with animated representations.',
  tags: ['animation', 'effects', 'type-aliases', 'css-animations']
};
fileMeta['style/values/animated/font.rs'] = {
  summary: 'Animation implementations for FontVariationSettings including interpolation, squared distance computation, and animated zero.',
  tags: ['animation', 'font', 'variation-settings', 'css-animations']
};
fileMeta['style/values/animated/mod.rs'] = {
  summary: 'Core animated value infrastructure defining the Animate, ToAnimatedValue, and ToAnimatedZero traits with implementations for numeric types, Option, Vec, Box, and other containers.',
  tags: ['animation', 'traits', 'interpolation', 'type-conversion'],
  languageNotes: 'Implements the Web Animations specification procedures for interpolation, addition, and accumulation.'
};
fileMeta['style/values/animated/transform.rs'] = {
  summary: 'CSS transform animation and interpolation implementing matrix decomposition/recomposition, quaternion slerp, and per-function interpolation for 2D and 3D transforms.',
  tags: ['animation', 'transforms', 'matrix', 'quaternion', 'css-transforms'],
  languageNotes: 'Implements both Gecko and Servo decomposition algorithms with conditional compilation for platform differences.'
};
fileMeta['style/values/computed/angle.rs'] = {
  summary: 'Computed angle value type with radian/degree conversion, CSS serialization, squared distance computation for animation, and standard mathematical trait implementations.',
  tags: ['computed-values', 'angle', 'css-units', 'animation']
};
fileMeta['style/values/computed/background.rs'] = {
  summary: 'Type aliases for computed background-size and re-exported BackgroundRepeat from specified values.',
  tags: ['computed-values', 'background', 'type-aliases']
};
fileMeta['style/values/computed/basic_shape.rs'] = {
  summary: 'Computed basic shape types for clip-path, shape-outside, and shape() CSS functions with animation between path() and shape() via command-level interpolation.',
  tags: ['computed-values', 'basic-shape', 'css-shapes', 'animation']
};
fileMeta['style/values/computed/color.rs'] = {
  summary: 'Computed color type with CSS serialization, color-mix simplification, currentColor resolution, contrast-color evaluation, and animated zero implementation.',
  tags: ['computed-values', 'color', 'css-serialization', 'animation']
};
fileMeta['style/values/computed/column.rs'] = {
  summary: 'Type alias for computed column-count values wrapping positive integers.',
  tags: ['computed-values', 'column', 'type-aliases']
};
fileMeta['style/values/computed/easing.rs'] = {
  summary: 'Computed CSS easing function types supporting cubic-bezier, steps(), linear(), and keyword timing functions with per-progress output calculation.',
  tags: ['computed-values', 'easing', 'animation', 'timing-functions']
};
fileMeta['style/values/computed/effects.rs'] = {
  summary: 'Type aliases for computed box-shadow, filter, and drop-shadow values bridging generic effect types with computed color, length, and angle parameters.',
  tags: ['computed-values', 'effects', 'type-aliases']
};
fileMeta['style/values/computed/flex.rs'] = {
  summary: 'Type alias for computed flex-basis values with an auto() constructor.',
  tags: ['computed-values', 'flex', 'type-aliases']
};
fileMeta['style/values/computed/font.rs'] = {
  summary: 'Computed font property types including FontWeight (fixed-point), FontSize, FontFamily, FontStyle (fixed-point oblique angle), FontStretch, LineHeight resolution, and font-feature/variation-settings deduplication.',
  tags: ['computed-values', 'font', 'fixed-point', 'css-fonts'],
  languageNotes: 'Uses fixed-point arithmetic (u16 with configurable fractional bits) for FontWeight, FontStyle, and FontStretch to reduce memory footprint.'
};
fileMeta['style/values/computed/image.rs'] = {
  summary: 'Computed image type supporting gradient directions, image-set() resolution selection, cross-fade, and conversion from specified to computed values.',
  tags: ['computed-values', 'images', 'gradients', 'image-set', 'css-images']
};

// Function/class metadata keyed by "filePath:name"
function getFuncMeta(filePath, name) {
  const key = filePath + ':' + name;
  const map = {};
  // media_query.rs
  map['style/media_queries/media_query.rs:screen'] = 'Creates a MediaType representing the screen media type.';
  map['style/media_queries/media_query.rs:print'] = 'Creates a MediaType representing the print media type.';
  map['style/media_queries/media_query.rs:parse'] = 'Parses a media type identifier or media query from CSS input.';
  map['style/media_queries/media_query.rs:to_css'] = 'Serializes a MediaQuery to CSS text with qualifier, media type, and condition.';
  map['style/media_queries/media_query.rs:never_matching'] = 'Returns a media query that never matches, used as fallback on parse failure.';
  map['style/media_queries/media_query.rs:is_viewport_dependent'] = 'Checks whether this media query depends on viewport dimensions.';
  map['style/media_queries/media_query.rs:matches'] = 'Checks if a MediaQueryType matches a given MediaType.';
  // parallel.rs
  map['style/parallel.rs:create_thread_local_context'] = 'Creates a ThreadLocalStyleContext for a worker thread slot.';
  map['style/parallel.rs:distribute_one_chunk'] = 'Spawns one chunk of work items to the thread pool via rayon ScopeFifo.';
  map['style/parallel.rs:distribute_work'] = 'Iterates work items and distributes them in chunks to worker threads.';
  map['style/parallel.rs:style_trees'] = 'Processes discovered DOM nodes, spawning work to other threads when queue is large.';
  // str.rs
  map['style/str.rs:char_is_whitespace'] = 'Checks if a character is an HTML space character.';
  map['style/str.rs:is_whitespace'] = 'Checks if a string consists entirely of HTML whitespace.';
  map['style/str.rs:split_html_space_chars'] = 'Splits a string on HTML whitespace, filtering empty segments.';
  map['style/str.rs:split_commas'] = 'Splits a string on commas, filtering empty segments.';
  map['style/str.rs:is_ascii_digit'] = 'Checks if a character is an ASCII digit 0-9.';
  map['style/str.rs:read_numbers'] = 'Reads ASCII digits into an integer with overflow-safe arithmetic.';
  map['style/str.rs:read_fraction'] = 'Reads a decimal fraction after a decimal point from an iterator.';
  map['style/str.rs:read_exponent'] = 'Reads an exponent notation e[+-]digits from a character iterator.';
  map['style/str.rs:str_join'] = 'Joins string-like values with a delimiter into a single String.';
  map['style/str.rs:starts_with_ignore_ascii_case'] = 'Case-insensitive prefix check for ASCII strings.';
  map['style/str.rs:string_as_ascii_lowercase'] = 'ASCII-lowercase conversion, only allocating when needed.';
  // thread_state.rs
  map['style/thread_state.rs:is_worker'] = 'Checks if current thread is a worker thread.';
  map['style/thread_state.rs:is_script'] = 'Checks if current thread is a script thread.';
  map['style/thread_state.rs:is_layout'] = 'Checks if current thread is a layout thread.';
  map['style/thread_state.rs:initialize'] = 'Initializes the current thread state with a given state flag.';
  map['style/thread_state.rs:initialize_layout_worker_thread'] = 'Initializes current thread as a layout worker.';
  map['style/thread_state.rs:get'] = 'Gets the current thread state, defaulting to empty.';
  map['style/thread_state.rs:enter'] = 'Enters a temporary thread state, panicking if re-entering.';
  map['style/thread_state.rs:exit'] = 'Exits a temporary thread state flag.';
  // traversal_flags.rs
  map['style/traversal_flags.rs:assert_traversal_flags_match'] = 'Asserts all TraversalFlags match ServoTraversalFlags equivalents in Gecko.';
  map['style/traversal_flags.rs:for_animation_only'] = 'Returns true if the traversal is for animation-only restyles.';
  // animated/color.rs
  map['style/values/animated/color.rs:animate'] = 'Interpolates between two color values using color mixing.';
  map['style/values/animated/color.rs:compute_squared_distance'] = 'Computes squared RGBA distance between colors for animation.';
  map['style/values/animated/color.rs:to_animated_zero'] = 'Returns transparent black as the zero value for color animation.';
  // animated/font.rs
  map['style/values/animated/font.rs:animate'] = 'Interpolates font variation settings by animating each setting value.';
  map['style/values/animated/font.rs:compute_squared_distance'] = 'Computes squared distance for font variation settings.';
  map['style/values/animated/font.rs:to_animated_zero'] = 'Returns error for font variation settings as they have no zero value.';
  // animated/mod.rs
  map['style/values/animated/mod.rs:compare_property_priority'] = 'Sorts PropertyIds by category (physical, logical, shorthand) and shorthand complexity.';
  map['style/values/animated/mod.rs:animate_multiplicative_factor'] = 'Animates multiplicative factors by treating 1 as identity.';
  map['style/values/animated/mod.rs:weights'] = 'Returns interpolation weights from a Procedure enum value.';
  // computed/angle.rs
  map['style/values/computed/angle.rs:to_css'] = 'Serializes an angle in degrees with deg unit.';
  map['style/values/computed/angle.rs:from_radians'] = 'Creates an Angle from radians.';
  map['style/values/computed/angle.rs:from_degrees'] = 'Creates an Angle from degrees.';
  map['style/values/computed/angle.rs:radians'] = 'Returns the angle in radians as f32.';
  map['style/values/computed/angle.rs:radians64'] = 'Returns the angle in radians as f64.';
  map['style/values/computed/angle.rs:degrees'] = 'Returns the angle in degrees.';
  map['style/values/computed/angle.rs:zero'] = 'Returns a zero-angle value.';
  map['style/values/computed/angle.rs:is_zero'] = 'Checks if the angle is zero.';
  map['style/values/computed/angle.rs:compute_squared_distance'] = 'Computes squared radian distance between two angles.';
  map['style/values/computed/angle.rs:neg'] = 'Negates the angle value.';
  // computed/basic_shape.rs
  map['style/values/computed/basic_shape.rs:animate'] = 'Animates between PathOrShapeFunction variants with command-level interpolation.';
  // computed/color.rs
  map['style/values/computed/color.rs:to_css'] = 'Serializes a Color value to CSS text.';
  map['style/values/computed/color.rs:from_color_mix'] = 'Creates a Color from a color-mix, simplifying to absolute if possible.';
  map['style/values/computed/color.rs:resolve_to_absolute'] = 'Resolves a color to absolute by replacing currentColor.';
  map['style/values/computed/color.rs:to_animated_zero'] = 'Returns transparent black as animated zero for AbsoluteColor.';
  // computed/easing.rs
  map['style/values/computed/easing.rs:calculate_step_output'] = 'Calculates step timing function output for steps() easing.';
  map['style/values/computed/easing.rs:calculate_output'] = 'Evaluates timing function output given progress, handling all easing types.';
  // computed/flex.rs
  map['style/values/computed/flex.rs:auto'] = 'Returns the auto flex-basis value.';
  // computed/font.rs
  map['style/values/computed/font.rs:from_float'] = 'Creates a fixed-point value from a float.';
  map['style/values/computed/font.rs:to_float'] = 'Converts fixed-point value back to float.';
  map['style/values/computed/font.rs:normal'] = 'Returns the normal (400) font weight.';
  map['style/values/computed/font.rs:is_bold'] = 'Returns true if weight is 600 or above.';
  map['style/values/computed/font.rs:value'] = 'Returns font weight as a float.';
  map['style/values/computed/font.rs:bolder'] = 'Returns the bolder relative weight per CSS fonts spec.';
  map['style/values/computed/font.rs:lighter'] = 'Returns the lighter relative weight per CSS fonts spec.';
  map['style/values/computed/font.rs:computed_size'] = 'Returns the computed font size.';
  map['style/values/computed/font.rs:used_size'] = 'Returns the used font size after constraints.';
  map['style/values/computed/font.rs:zoom'] = 'Applies zoom factor to font size.';
  map['style/values/computed/font.rs:medium'] = 'Returns the default medium font size.';
  map['style/values/computed/font.rs:serif'] = 'Returns the serif generic font family.';
  map['style/values/computed/font.rs:generic'] = 'Returns a static generic font family reference.';
  map['style/values/computed/font.rs:to_css'] = 'Serializes font family list to CSS.';
  map['style/values/computed/font.rs:single_generic'] = 'Returns the generic font family if only one generic is listed.';
  map['style/values/computed/font.rs:none'] = 'Returns the none font-size-adjust value.';
  map['style/values/computed/font.rs:to_computed_value'] = 'Converts specified font values to computed values.';
  map['style/values/computed/font.rs:dedup_font_settings'] = 'Deduplicates font settings keeping only the last occurrence per tag.';
  map['style/values/computed/font.rs:to_str'] = 'Converts font language override to string representation.';
  map['style/values/computed/font.rs:hundred'] = 'Returns 100% font stretch (normal).';
  map['style/values/computed/font.rs:to_percentage'] = 'Converts font stretch to a percentage.';
  map['style/values/computed/font.rs:from_percentage'] = 'Creates font stretch from a percentage.';
  map['style/values/computed/font.rs:from_keyword'] = 'Returns font stretch value from a keyword.';
  map['style/values/computed/font.rs:as_keyword'] = 'Returns the keyword if stretch matches a keyword value.';
  map['style/values/computed/font.rs:oblique'] = 'Creates an oblique font style with given degrees.';
  map['style/values/computed/font.rs:oblique_degrees'] = 'Returns the oblique angle in degrees.';
  // computed/image.rs
  map['style/values/computed/image.rs:to_typed'] = 'Converts Image to TypedValue for typed OM.';
  map['style/values/computed/image.rs:to_computed_value'] = 'Converts specified Image to computed value.';
  map['style/values/computed/image.rs:points_downwards'] = 'Checks if gradient line direction points downward.';
  map['style/values/computed/image.rs:to_css'] = 'Serializes gradient line direction to CSS.';
  return map[key] || null;
}

function getClassMeta(filePath, name) {
  const key = filePath + ':' + name;
  const map = {};
  map['style/media_queries/media_query.rs:Qualifier'] = 'Enum representing the only and not media query qualifiers.';
  map['style/media_queries/media_query.rs:MediaType'] = 'A media type wrapper around CustomIdent representing device categories like screen or print.';
  map['style/media_queries/media_query.rs:MediaQuery'] = 'A parsed media query with optional qualifier, media type, and condition.';
  map['style/media_queries/media_query.rs:MediaQueryType'] = 'Enum representing a known (concrete) or all media query type.';
  map['style/style_adjuster.rs:StyleAdjuster'] = 'Implements all computed-value-time style fixups per CSS specifications.';
  map['style/style_resolver.rs:PseudoElementResolution'] = 'Enum controlling whether pseudo-elements are resolved if applicable or forced.';
  map['style/style_resolver.rs:StyleResolverForElement'] = 'Resolves styles for elements and pseudo-elements through matching and cascading.';
  map['style/style_resolver.rs:MatchingResults'] = 'Internal struct holding rule node and flags from selector matching.';
  map['style/style_resolver.rs:ResolvedStyle'] = 'A style result wrapping an Arc of ComputedValues.';
  map['style/style_resolver.rs:PrimaryStyle'] = 'Primary style result with reuse-via-rule-node tracking.';
  map['style/style_resolver.rs:ResolvedElementStyles'] = 'Complete element style including primary and eager pseudo styles.';
  map['style/stylesheet_set.rs:StylesheetSetEntry'] = 'Internal entry wrapping a stylesheet with committed state tracking.';
  map['style/stylesheet_set.rs:DataValidity'] = 'Enum tracking cascade and invalidation data validity per origin.';
  map['style/stylesheet_set.rs:DocumentStylesheetFlusher'] = 'Flusher for iterating dirty stylesheets per origin during rebuild.';
  map['style/stylesheet_set.rs:SheetRebuildKind'] = 'Enum indicating full or cascade-only stylesheet rebuild.';
  map['style/stylesheet_set.rs:SheetCollectionFlusher'] = 'Flusher for iterating over a single origin\'s sheet entries.';
  map['style/stylesheet_set.rs:SheetCollection'] = 'Internal collection of stylesheets per origin with dirty tracking.';
  map['style/stylesheet_set.rs:DocumentStylesheetSet'] = 'Top-level stylesheet set for a document, organized by CSS origin.';
  map['style/stylesheet_set.rs:AuthorStylesheetSet'] = 'Stylesheet set for a Shadow Root, owning a single collection.';
  map['style/stylesheet_set.rs:AuthorStylesheetFlusher'] = 'Flusher for author stylesheet collection.';
  map['style/traversal.rs:PerLevelTraversalData'] = 'Per-traversal-level data carrying current DOM depth for bloom filter.';
  map['style/traversal.rs:PreTraverseToken'] = 'Token indicating whether traversal should proceed, carrying optional traversal root.';
  map['style/traversal.rs:DomTraversal'] = 'Trait defining preorder/postorder DOM traversal methods for style computation.';
  map['style/values/animated/mod.rs:PropertyCategory'] = 'Enum categorizing properties as custom, physical, logical, or shorthand for animation ordering.';
  map['style/values/animated/mod.rs:Animate'] = 'Trait for animating from one value to another with a given procedure.';
  map['style/values/animated/mod.rs:Procedure'] = 'Enum representing Interpolate, Add, or Accumulate animation procedures.';
  map['style/values/animated/mod.rs:Context'] = 'Context providing the computed style for animated value conversion.';
  map['style/values/animated/mod.rs:ToAnimatedValue'] = 'Trait for converting between computed values and intermediate animation values.';
  map['style/values/animated/mod.rs:ToAnimatedZero'] = 'Trait for producing a zero value for additive animation.';
  map['style/values/animated/transform.rs:InnerMatrix2D'] = '2x2 matrix component for 2D transform decomposition.';
  map['style/values/animated/transform.rs:Translate2D'] = '2D translation component in decomposed matrix.';
  map['style/values/animated/transform.rs:Scale2D'] = '2D scale component in decomposed matrix.';
  map['style/values/animated/transform.rs:MatrixDecomposed2D'] = 'Decomposed 2D transform matrix with translate, scale, rotation, and inner matrix.';
  map['style/values/animated/transform.rs:Translate3D'] = '3D translation component for 3D matrix decomposition.';
  map['style/values/animated/transform.rs:Scale3D'] = '3D scale component for 3D matrix decomposition.';
  map['style/values/animated/transform.rs:Skew'] = 'Skew component for 3D matrix decomposition.';
  map['style/values/animated/transform.rs:Perspective'] = 'Perspective component for 3D matrix decomposition.';
  map['style/values/animated/transform.rs:Quaternion'] = 'Quaternion representing rotation in 3D matrix decomposition.';
  map['style/values/animated/transform.rs:MatrixDecomposed3D'] = 'Complete decomposed 3D matrix with translate, scale, skew, perspective, and quaternion.';
  map['style/values/computed/angle.rs:Angle'] = 'Computed angle value stored in degrees with radian conversion utilities.';
  map['style/values/computed/font.rs:FixedPoint'] = 'Generic fixed-point numeric type with configurable fractional bits for compact font property storage.';
  map['style/values/computed/font.rs:FontWeight'] = 'Computed font-weight using unsigned 10.6 fixed-point representation.';
  map['style/values/computed/font.rs:FontSize'] = 'Computed font-size with both computed and used size tracking.';
  map['style/values/computed/font.rs:FontFamily'] = 'Computed font-family with prioritized font family list and system font tracking.';
  map['style/values/computed/font.rs:FamilyName'] = 'Named font family with syntax (quoted or identifier) tracking.';
  map['style/values/computed/font.rs:FontFamilyNameSyntax'] = 'Enum distinguishing quoted string vs identifier syntax for font family names.';
  map['style/values/computed/font.rs:SingleFontFamily'] = 'Enum of either a named family or a generic family reference.';
  map['style/values/computed/font.rs:GenericFontFamily'] = 'Standard CSS generic font families (serif, sans-serif, monospace, etc.).';
  map['style/values/computed/font.rs:FontFamilyList'] = 'Ordered list of font families with prioritization for user font settings.';
  map['style/values/computed/font.rs:FontLanguageOverride'] = 'Computed font language override stored as a packed u32.';
  map['style/values/computed/font.rs:FontStyle'] = 'Computed font-style using signed 8.8 fixed-point for oblique angle.';
  map['style/values/computed/font.rs:FontStretch'] = 'Computed font-stretch using unsigned 10.6 fixed-point percentage.';
  map['style/values/computed/image.rs:LineDirection'] = 'Enum for gradient line direction: angle, horizontal, vertical, or corner.';
  return map[key] || null;
}

// Significance filter
function isSignificantFunction(func, fileResult) {
  const lineCount = func.endLine - func.startLine + 1;
  if (lineCount >= 10) return true;
  if (fileResult.exports && fileResult.exports.some(e => e.name === func.name)) return true;
  return false;
}

function isSignificantClass(cls, fileResult) {
  const lineCount = cls.endLine - cls.startLine + 1;
  if (cls.methods && cls.methods.length >= 2) return true;
  if (lineCount >= 20) return true;
  if (fileResult.exports && fileResult.exports.some(e => e.name === cls.name)) return true;
  return false;
}

// Generate all nodes and edges
const allNodes = [];
const allEdges = [];
const usedIds = new Set();

function makeUniqueId(baseId) {
  if (!usedIds.has(baseId)) {
    usedIds.add(baseId);
    return baseId;
  }
  let counter = 2;
  while (usedIds.has(baseId + '_' + counter)) counter++;
  const unique = baseId + '_' + counter;
  usedIds.add(unique);
  return unique;
}

for (const fileResult of extract.results) {
  const filePath = fileResult.path;
  const meta = fileMeta[filePath];
  if (!meta) {
    console.log('Missing metadata for:', filePath);
    continue;
  }

  const fileNodeId = 'file:' + filePath;
  const fileName = filePath.split('/').pop();
  usedIds.add(fileNodeId);

  const complexity = fileResult.totalLines < 50 ? 'simple'
    : fileResult.totalLines < 200 ? 'moderate' : 'complex';

  const fileNode = {
    id: fileNodeId,
    type: 'file',
    name: fileName,
    filePath: filePath,
    summary: meta.summary,
    tags: meta.tags,
    complexity: complexity
  };
  if (meta.languageNotes) fileNode.languageNotes = meta.languageNotes;
  allNodes.push(fileNode);

  // Track which function/class IDs we create for this file
  const fileFuncNames = new Set();
  const fileClsNames = new Set();

  for (const func of fileResult.functions || []) {
    if (!isSignificantFunction(func, fileResult)) continue;
    // Deduplicate function names within file by appending line number for overloads
    let funcName = func.name;
    if (fileFuncNames.has(funcName)) {
      funcName = func.name + '_L' + func.startLine;
    }
    fileFuncNames.add(func.name);

    const funcId = 'function:' + filePath + ':' + funcName;
    const lineCount = func.endLine - func.startLine + 1;
    const fmeta = getFuncMeta(filePath, func.name);

    allNodes.push({
      id: funcId,
      type: 'function',
      name: funcName,
      filePath: filePath,
      lineRange: [func.startLine, func.endLine],
      summary: fmeta || 'Function ' + func.name + ' in ' + fileName,
      tags: ['function'],
      complexity: lineCount < 10 ? 'simple' : lineCount < 50 ? 'moderate' : 'complex'
    });

    allEdges.push({
      source: fileNodeId, target: funcId, type: 'contains', direction: 'forward', weight: 1.0
    });

    if (fileResult.exports && fileResult.exports.some(e => e.name === func.name)) {
      allEdges.push({
        source: fileNodeId, target: funcId, type: 'exports', direction: 'forward', weight: 0.8
      });
    }
  }

  for (const cls of fileResult.classes || []) {
    if (!isSignificantClass(cls, fileResult)) continue;
    const clsId = 'class:' + filePath + ':' + cls.name;
    const lineCount = (cls.endLine || cls.startLine) - cls.startLine + 1;
    const clsMeta = getClassMeta(filePath, cls.name);

    allNodes.push({
      id: clsId,
      type: 'class',
      name: cls.name,
      filePath: filePath,
      lineRange: [cls.startLine, cls.endLine || cls.startLine],
      summary: clsMeta || 'Class/enum ' + cls.name + ' in ' + fileName,
      tags: ['class'],
      complexity: cls.methods && cls.methods.length > 5 ? 'moderate' : 'simple'
    });

    allEdges.push({
      source: fileNodeId, target: clsId, type: 'contains', direction: 'forward', weight: 1.0
    });

    if (fileResult.exports && fileResult.exports.some(e => e.name === cls.name)) {
      allEdges.push({
        source: fileNodeId, target: clsId, type: 'exports', direction: 'forward', weight: 0.8
      });
    }
  }
}

console.log('Total nodes:', allNodes.length);
console.log('Total edges:', allEdges.length);

// Split into parts
const parts = Math.ceil(Math.max(allNodes.length / 60, allEdges.length / 120));
console.log('Writing', parts, 'parts...');

// Sort files alphabetically and chunk
const fileOrder = extract.results.map(r => r.path).sort();
const filesPerPart = Math.ceil(fileOrder.length / parts);

for (let p = 0; p < parts; p++) {
  const start = p * filesPerPart;
  const end = Math.min(start + filesPerPart, fileOrder.length);
  const partFiles = new Set(fileOrder.slice(start, end));

  const partNodes = allNodes.filter(n => {
    if (!n.filePath) return false;
    return partFiles.has(n.filePath);
  });

  const partNodeIds = new Set(partNodes.map(n => n.id));

  const partEdges = allEdges.filter(e => partNodeIds.has(e.source));

  // Write part
  const partNum = p + 1;
  const partFile = 'D:/Projects/stylo/.understand-anything/intermediate/batch-4-part-' + partNum + '.json';
  fs.writeFileSync(partFile, JSON.stringify({ nodes: partNodes, edges: partEdges }, null, 2));
  console.log('Part ' + partNum + ': ' + partNodes.length + ' nodes, ' + partEdges.length + ' edges -> ' + partFile);
}

console.log('Done.');
