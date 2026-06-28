const fs = require('fs');

const nodes = [];
const edges = [];

// ============================================================
// FILE NODES
// ============================================================

const filesInfo = [
  { path: "style/values/animated/color.rs", type: "file", name: "color.rs", summary: "Animation implementations for CSS color values, providing Animate, ComputeSquaredDistance, and ToAnimatedZero trait implementations for AbsoluteColor and GenericColor types.", tags: ["animation", "color", "css-values"], complexity: "moderate" },
  { path: "style/values/animated/effects.rs", type: "file", name: "effects.rs", summary: "Type aliases for animated filter and shadow values used in CSS effects animations including drop-shadow and filter functions.", tags: ["animation", "effects", "type-definition"], complexity: "simple" },
  { path: "style/values/animated/font.rs", type: "file", name: "font.rs", summary: "Animation trait implementations for font variation settings, supporting interpolation of variable font axis values.", tags: ["animation", "font", "css-values"], complexity: "simple" },
  { path: "style/values/animated/mod.rs", type: "file", name: "mod.rs", summary: "Core animated values module defining fundamental animation traits (Animate, ToAnimatedValue, ToAnimatedZero) and the Procedure enum, with blanket implementations for primitive types and standard containers.", tags: ["animation", "core-traits", "css-values"], complexity: "complex", languageNotes: "Defines the core animation traits Animate, ToAnimatedValue, and ToAnimatedZero with derive-compatible macros and blanket impls for Option, Vec, Box, SmallVec, and ThinVec." },
  { path: "style/values/animated/transform.rs", type: "file", name: "transform.rs", summary: "Animation implementations for CSS transform functions, including 2D and 3D matrix decomposition, quaternion-based rotation interpolation (slerp), and individual transform property animation for rotate, translate, and scale.", tags: ["animation", "transform", "matrix", "quaternion"], complexity: "complex", languageNotes: "Implements the CSS Transforms spec's decomposition algorithm (Graphics Gems unmatrix), quaternion spherical linear interpolation for 3D rotations, and feature-gated (servo/gecko) matrix animation paths." },
  { path: "style/values/computed/align.rs", type: "file", name: "align.rs", summary: "Computed values for CSS Box Alignment properties, primarily handling the justify-items property with special legacy keyword semantics.", tags: ["css-values", "alignment", "computed-style"], complexity: "simple" },
  { path: "style/values/computed/animation.rs", type: "file", name: "animation.rs", summary: "Computed values for CSS animation and transition properties including AnimationDuration, AnimationIterationCount, AnimationTimeline, and animation range types.", tags: ["animation", "computed-style", "css-values"], complexity: "moderate" },
  { path: "style/values/computed/border.rs", type: "file", name: "border.rs", summary: "Computed types for CSS border properties including border-width, border-image, border-radius, and border-spacing with resolved value handling.", tags: ["css-values", "border", "computed-style"], complexity: "moderate" },
  { path: "style/values/computed/box.rs", type: "file", name: "box.rs", summary: "Computed values for CSS box properties including resize, zoom, perspective, contain-intrinsic-size, line-clamp, overflow-clip-margin, and baseline-shift.", tags: ["css-values", "box-model", "computed-style"], complexity: "moderate" },
  { path: "style/values/computed/calc.rs", type: "file", name: "calc.rs", summary: "Computed-value calc() expression leaf type (ComputedLeaf) implementing the CalcNodeLeaf trait for unit-aware arithmetic across length, percentage, number, angle, time, and resolution unit types.", tags: ["css-values", "calc", "computed-style"], complexity: "moderate" },
  { path: "style/values/computed/counters.rs", type: "file", name: "counters.rs", summary: "Computed type aliases for CSS counter properties including counter-increment, counter-reset, counter-set, and the content property with Image generic parameter.", tags: ["css-values", "counters", "type-definition"], complexity: "simple" },
  { path: "style/values/computed/transform.rs", type: "file", name: "transform.rs", summary: "Computed types and matrix operations for CSS 2D and 3D transforms, providing Matrix3D, Matrix, TransformOperation, and individual transform property (Rotate, Translate, Scale) implementations.", tags: ["css-values", "transform", "matrix", "computed-style"], complexity: "complex", languageNotes: "Matrix3D implements full 4x4 matrix operations including determinant, transpose, inverse, multiply, and perspective/translate/scale manipulation used by the animation matrix decomposition algorithm." }
];

filesInfo.forEach(f => {
  const node = { id: "file:" + f.path, type: f.type, name: f.name, filePath: f.path, summary: f.summary, tags: f.tags, complexity: f.complexity };
  if (f.languageNotes) node.languageNotes = f.languageNotes;
  nodes.push(node);
});

// ============================================================
// FUNCTION NODES - color.rs
// ============================================================
const fns_color = [
  { name: "AbsoluteColor::animate", startLine: 20, endLine: 33, summary: "Animates AbsoluteColor by mixing RGBA channels using weighted color interpolation.", tags: ["animation", "color", "interpolation"] },
  { name: "AbsoluteColor::compute_squared_distance", startLine: 38, endLine: 56, summary: "Computes squared color distance using alpha-premultiplied RGBA channel differences.", tags: ["animation", "color", "distance"] },
  { name: "GenericColor::animate", startLine: 67, endLine: 85, summary: "Animates GenericColor by converting to a color-mix representation with weighted percentages.", tags: ["animation", "color", "interpolation"] }
];
fns_color.forEach(fn => {
  nodes.push({ id: "function:style/values/animated/color.rs:" + fn.name, type: "function", name: fn.name, filePath: "style/values/animated/color.rs", lineRange: [fn.startLine, fn.endLine], summary: fn.summary, tags: fn.tags, complexity: "simple" });
  edges.push({ source: "file:style/values/animated/color.rs", target: "function:style/values/animated/color.rs:" + fn.name, type: "contains", direction: "forward", weight: 1.0 });
});

// ============================================================
// FUNCTION NODES - mod.rs
// ============================================================
const fns_mod = [
  { name: "compare_property_priority", startLine: 69, endLine: 90, summary: "Sorts PropertyIds for keyframe prioritization: physical longhands before logical longhands before shorthands, with shorthand ordering by subproperty count then IDL name.", tags: ["animation", "property-ordering", "keyframes"], isPub: true },
  { name: "animate_multiplicative_factor", startLine: 93, endLine: 99, summary: "Animates multiplicative CSS values (like scale factors) by converting to additive space, interpolating, and converting back.", tags: ["animation", "utility", "multiplicative"], isPub: true }
];
fns_mod.forEach(fn => {
  nodes.push({ id: "function:style/values/animated/mod.rs:" + fn.name, type: "function", name: fn.name, filePath: "style/values/animated/mod.rs", lineRange: [fn.startLine, fn.endLine], summary: fn.summary, tags: fn.tags, complexity: "simple" });
  edges.push({ source: "file:style/values/animated/mod.rs", target: "function:style/values/animated/mod.rs:" + fn.name, type: "contains", direction: "forward", weight: 1.0 });
  if (fn.isPub) { edges.push({ source: "file:style/values/animated/mod.rs", target: "function:style/values/animated/mod.rs:" + fn.name, type: "exports", direction: "forward", weight: 0.8 }); }
});

// ============================================================
// CLASS NODES - mod.rs
// ============================================================
const classes_mod = [
  { name: "Animate", startLine: 115, endLine: 118, summary: "Core trait defining how CSS values animate from one state to another given an animation procedure.", tags: ["trait", "animation", "core"] },
  { name: "Procedure", startLine: 125, endLine: 132, summary: "Enum representing CSS animation procedures: Interpolate, Add, and Accumulate.", tags: ["enum", "animation", "procedure"] },
  { name: "ToAnimatedValue", startLine: 145, endLine: 154, summary: "Trait for conversion between computed values and intermediate animated representations, notably used for color channel decomposition.", tags: ["trait", "animation", "conversion"] },
  { name: "ToAnimatedZero", startLine: 167, endLine: 176, summary: "Trait for producing the zero value of a CSS type, used in SMIL by-animation where interpolation starts from the zero value.", tags: ["trait", "animation", "zero-value"] }
];
classes_mod.forEach(cls => {
  nodes.push({ id: "class:style/values/animated/mod.rs:" + cls.name, type: "class", name: cls.name, filePath: "style/values/animated/mod.rs", lineRange: [cls.startLine, cls.endLine], summary: cls.summary, tags: cls.tags, complexity: "simple" });
  edges.push({ source: "file:style/values/animated/mod.rs", target: "class:style/values/animated/mod.rs:" + cls.name, type: "contains", direction: "forward", weight: 1.0 });
  edges.push({ source: "file:style/values/animated/mod.rs", target: "class:style/values/animated/mod.rs:" + cls.name, type: "exports", direction: "forward", weight: 0.8 });
});

// ============================================================
// FUNCTION AND CLASS NODES - transform.rs (animated)
// ============================================================
const fns_transform = [
  { name: "MatrixDecomposed2D::animate", startLine: 93, endLine: 133, summary: "Interpolates decomposed 2D matrix components (translate, scale, rotation, inner matrix) handling axis flips and shortest-path rotation.", tags: ["animation", "transform", "matrix-decomposition"] },
  { name: "MatrixDecomposed2D::compute_squared_distance", startLine: 138, endLine: 147, summary: "Computes squared distance between decomposed 2D matrix states as sum of component squared distances.", tags: ["animation", "transform", "distance"] },
  { name: "MatrixDecomposed2D::from_matrix3d", startLine: 153, endLine: 215, summary: "Decomposes a 2D matrix into translate, scale, rotation, and inner matrix components using the CSS Transforms unmatrix algorithm.", tags: ["transform", "matrix-decomposition"], complexity: "moderate" },
  { name: "MatrixDecomposed2D::recompose_to_matrix3d", startLine: 221, endLine: 252, summary: "Recomposes a full transform matrix from decomposed translate, scale, and rotation components.", tags: ["transform", "matrix-recomposition"] },
  { name: "Quaternion::from_direction_and_angle", startLine: 346, endLine: 377, summary: "Creates a quaternion from a unit direction vector and rotation angle, clamping angle to within one full rotation.", tags: ["quaternion", "rotation", "3d-transform"] },
  { name: "Quaternion::animate", startLine: 411, endLine: 487, summary: "Implements quaternion spherical linear interpolation (slerp) for 3D rotation animation with a specialized accumulation code path.", tags: ["animation", "quaternion", "slerp", "3d-transform"], complexity: "moderate" },
  { name: "MatrixDecomposed3D::recompose_to_matrix3d", startLine: 520, endLine: 577, summary: "Recomposes a 3D transform matrix from decomposed translate, scale, skew, perspective, and quaternion rotation components.", tags: ["transform", "matrix-recomposition", "3d"], complexity: "moderate" },
  { name: "decompose_3d_matrix", startLine: 583, endLine: 727, summary: "Decomposes a 3D matrix into translation, scale, skew, perspective, and quaternion components using the Graphics Gems unmatrix algorithm.", tags: ["transform", "matrix-decomposition", "3d", "unmatrix"], complexity: "complex" },
  { name: "decompose_2d_matrix", startLine: 851, endLine: 900, summary: "Gecko-specific 2D matrix decomposition into translate, scale, shear, perspective, and quaternion rotation components.", tags: ["transform", "matrix-decomposition", "2d", "gecko"], complexity: "moderate" },
  { name: "Matrix3D::animate", startLine: 904, endLine: 935, summary: "Animates 4x4 matrices by decomposition to MatrixDecomposed3D or MatrixDecomposed2D depending on whether either operand is 3D.", tags: ["animation", "matrix", "3d-transform"] },
  { name: "is_matched_operation", startLine: 968, endLine: 991, summary: "Determines whether two CSS transform operations have matching types for pairwise interpolation.", tags: ["transform", "matching", "interpolation"] },
  { name: "ComputedTransform::animate", startLine: 996, endLine: 1084, summary: "Animates CSS transform lists by pairwise interpolation of matched operations with identity padding for remainder items.", tags: ["animation", "transform", "list-interpolation"], complexity: "moderate" },
  { name: "ComputedTransformOperation::animate", startLine: 1110, endLine: 1255, summary: "Dispatches animation between matching transform operation types (translate, scale, rotate, skew, matrix, perspective) with type coercion between related operations.", tags: ["animation", "transform", "operation-dispatch"], complexity: "complex" },
  { name: "animate_mismatched_transforms", startLine: 1273, endLine: 1299, summary: "Handles animation between mismatched transform lists by falling back to InterpolateMatrix or AccumulateMatrix wrappers.", tags: ["animation", "transform", "mismatch-fallback"] },
  { name: "ComputedRotate::animate", startLine: 1416, endLine: 1530, summary: "Animates the individual CSS rotate property using quaternion slerp for 3D rotations or angle interpolation for 2D rotations.", tags: ["animation", "rotate", "individual-transform"], complexity: "moderate" },
  { name: "ComputedTranslate::animate", startLine: 1597, endLine: 1609, summary: "Animates the individual CSS translate property by interpolating x, y, and z components.", tags: ["animation", "translate", "individual-transform"] },
  { name: "ComputedScale::animate", startLine: 1638, endLine: 1658, summary: "Animates the individual CSS scale property using multiplicative factor animation.", tags: ["animation", "scale", "individual-transform"] }
];

const classes_transform = [
  { name: "InnerMatrix2D", startLine: 40, endLine: 45, summary: "Represents the inner 2x2 matrix of a decomposed 2D transform with scale-preserving animation of diagonal elements.", tags: ["struct", "matrix", "2d-transform"] },
  { name: "MatrixDecomposed2D", startLine: 80, endLine: 89, summary: "Decomposed representation of a 2D transform matrix with translate, scale, rotation, and inner matrix components.", tags: ["struct", "matrix-decomposition", "2d-transform"] },
  { name: "Quaternion", startLine: 341, endLine: 341, summary: "Quaternion representation for 3D rotation with slerp-based animation and utility methods for dot product, scaling, and addition.", tags: ["struct", "quaternion", "3d-rotation"] },
  { name: "MatrixDecomposed3D", startLine: 504, endLine: 515, summary: "Decomposed representation of a 3D transform matrix with translate, scale, skew, perspective, and quaternion rotation components.", tags: ["struct", "matrix-decomposition", "3d-transform"] }
];

fns_transform.forEach(fn => {
  nodes.push({ id: "function:style/values/animated/transform.rs:" + fn.name, type: "function", name: fn.name, filePath: "style/values/animated/transform.rs", lineRange: [fn.startLine, fn.endLine], summary: fn.summary, tags: fn.tags, complexity: fn.complexity || "simple" });
  edges.push({ source: "file:style/values/animated/transform.rs", target: "function:style/values/animated/transform.rs:" + fn.name, type: "contains", direction: "forward", weight: 1.0 });
});

classes_transform.forEach(cls => {
  nodes.push({ id: "class:style/values/animated/transform.rs:" + cls.name, type: "class", name: cls.name, filePath: "style/values/animated/transform.rs", lineRange: [cls.startLine, cls.endLine], summary: cls.summary, tags: cls.tags, complexity: "simple" });
  edges.push({ source: "file:style/values/animated/transform.rs", target: "class:style/values/animated/transform.rs:" + cls.name, type: "contains", direction: "forward", weight: 1.0 });
  edges.push({ source: "file:style/values/animated/transform.rs", target: "class:style/values/animated/transform.rs:" + cls.name, type: "exports", direction: "forward", weight: 0.8 });
});

// ============================================================
// CLASS NODES - align.rs
// ============================================================
nodes.push({ id: "class:style/values/computed/align.rs:ComputedJustifyItems", type: "class", name: "ComputedJustifyItems", filePath: "style/values/computed/align.rs", lineRange: [39, 48], summary: "Computed value for justify-items carrying both specified and computed forms to handle the legacy keyword without breaking style sharing.", tags: ["struct", "alignment", "computed-value"], complexity: "simple" });
edges.push({ source: "file:style/values/computed/align.rs", target: "class:style/values/computed/align.rs:ComputedJustifyItems", type: "contains", direction: "forward", weight: 1.0 });
edges.push({ source: "file:style/values/computed/align.rs", target: "class:style/values/computed/align.rs:ComputedJustifyItems", type: "exports", direction: "forward", weight: 0.8 });

nodes.push({ id: "function:style/values/computed/align.rs:to_computed_value", type: "function", name: "to_computed_value", filePath: "style/values/computed/align.rs", lineRange: [66, 83], summary: "Computes justify-items value, resolving legacy keyword to inherited value while preserving the specified value for StyleAdjuster special-casing.", tags: ["computation", "alignment", "legacy"], complexity: "simple" });
edges.push({ source: "file:style/values/computed/align.rs", target: "function:style/values/computed/align.rs:to_computed_value", type: "contains", direction: "forward", weight: 1.0 });

// ============================================================
// CLASS NODES - animation.rs
// ============================================================
nodes.push({ id: "class:style/values/computed/animation.rs:AnimationIterationCount", type: "class", name: "AnimationIterationCount", filePath: "style/values/computed/animation.rs", lineRange: [40, 40], summary: "Computed value for animation-iteration-count wrapping an f32 with special infinite value handling, CSS serialization, and typed-OM conversion.", tags: ["struct", "animation", "iteration-count"], complexity: "simple" });
edges.push({ source: "file:style/values/computed/animation.rs", target: "class:style/values/computed/animation.rs:AnimationIterationCount", type: "contains", direction: "forward", weight: 1.0 });
edges.push({ source: "file:style/values/computed/animation.rs", target: "class:style/values/computed/animation.rs:AnimationIterationCount", type: "exports", direction: "forward", weight: 0.8 });

// ============================================================
// CLASS NODES - border.rs
// ============================================================
nodes.push({ id: "class:style/values/computed/border.rs:BorderSideWidth", type: "class", name: "BorderSideWidth", filePath: "style/values/computed/border.rs", lineRange: [33, 33], summary: "Computed value for border-side-width wrapping Au, with animation via CSSPixelLength and resolved value logic that zeros widths when border style is none or hidden.", tags: ["struct", "border", "computed-value"], complexity: "moderate" });
edges.push({ source: "file:style/values/computed/border.rs", target: "class:style/values/computed/border.rs:BorderSideWidth", type: "contains", direction: "forward", weight: 1.0 });
edges.push({ source: "file:style/values/computed/border.rs", target: "class:style/values/computed/border.rs:BorderSideWidth", type: "exports", direction: "forward", weight: 0.8 });

// ============================================================
// CLASS NODES - box.rs
// ============================================================
nodes.push({ id: "class:style/values/computed/box.rs:Zoom", type: "class", name: "Zoom", filePath: "style/values/computed/box.rs", lineRange: [141, 141], summary: "Computed value for the CSS zoom property with effective zoom computation for nested elements, inversion, and animation via animated Number type.", tags: ["struct", "zoom", "computed-value"], complexity: "moderate" });
edges.push({ source: "file:style/values/computed/box.rs", target: "class:style/values/computed/box.rs:Zoom", type: "contains", direction: "forward", weight: 1.0 });
edges.push({ source: "file:style/values/computed/box.rs", target: "class:style/values/computed/box.rs:Zoom", type: "exports", direction: "forward", weight: 0.8 });

// ============================================================
// CLASS NODES - calc.rs
// ============================================================
nodes.push({ id: "class:style/values/computed/calc.rs:ComputedLeaf", type: "class", name: "ComputedLeaf", filePath: "style/values/computed/calc.rs", lineRange: [29, 36], summary: "Enum representing computed calc() expression leaf values (Length, Percentage, Number, Angle, Time, Resolution) implementing CalcNodeLeaf for unit-aware arithmetic operations.", tags: ["enum", "calc", "expression-evaluation"], complexity: "moderate" });
edges.push({ source: "file:style/values/computed/calc.rs", target: "class:style/values/computed/calc.rs:ComputedLeaf", type: "contains", direction: "forward", weight: 1.0 });
edges.push({ source: "file:style/values/computed/calc.rs", target: "class:style/values/computed/calc.rs:ComputedLeaf", type: "exports", direction: "forward", weight: 0.8 });

// ============================================================
// CLASS NODES - computed/transform.rs
// ============================================================
nodes.push({ id: "class:style/values/computed/transform.rs:Matrix3D", type: "class", name: "Matrix3D", filePath: "style/values/computed/transform.rs", lineRange: [55, 55], summary: "Computed value for CSS matrix3d() providing full 4x4 matrix operations: determinant, transpose, inverse, multiply, perspective/translate/scale manipulation, and 2D conversion.", tags: ["struct", "matrix", "3d-transform", "computed-value"], complexity: "complex" });
edges.push({ source: "file:style/values/computed/transform.rs", target: "class:style/values/computed/transform.rs:Matrix3D", type: "contains", direction: "forward", weight: 1.0 });

nodes.push({ id: "class:style/values/computed/transform.rs:Matrix", type: "class", name: "Matrix", filePath: "style/values/computed/transform.rs", lineRange: [333, 333], summary: "Computed value for CSS matrix() with identity constructor and conversion to Matrix3D.", tags: ["struct", "matrix", "2d-transform", "computed-value"], complexity: "simple" });
edges.push({ source: "file:style/values/computed/transform.rs", target: "class:style/values/computed/transform.rs:Matrix", type: "contains", direction: "forward", weight: 1.0 });

// Function nodes for computed/transform.rs
const fns_computed_transform = [
  { name: "Matrix3D::into_2d", startLine: 69, endLine: 82, summary: "Converts a Matrix3D to a 2D Matrix if all 3D components are identity values.", tags: ["matrix", "conversion", "2d"], isPub: true },
  { name: "Matrix3D::determinant", startLine: 96, endLine: 121, summary: "Computes the determinant of a 4x4 matrix using Laplace expansion across the first row.", tags: ["matrix", "determinant", "linear-algebra"], isPub: true },
  { name: "Matrix3D::inverse", startLine: 135, endLine: 211, summary: "Computes the inverse of a 4x4 matrix using cofactor expansion with singular matrix detection.", tags: ["matrix", "inverse", "linear-algebra"], isPub: true, complexity: "complex" },
  { name: "Matrix3D::multiply", startLine: 226, endLine: 261, summary: "Multiplies two 4x4 matrices producing a new Matrix3D.", tags: ["matrix", "multiplication", "linear-algebra"], isPub: true },
  { name: "TransformOperation::to_translate_3d", startLine: 375, endLine: 404, summary: "Normalizes any CSS translate function (TranslateX, TranslateY, TranslateZ, Translate) to a Translate3D representation.", tags: ["transform", "translate", "normalization"], isPub: true },
  { name: "TransformOperation::to_rotate_3d", startLine: 409, endLine: 424, summary: "Normalizes any CSS rotate function (Rotate, RotateX, RotateY, RotateZ) to a Rotate3D representation.", tags: ["transform", "rotate", "normalization"], isPub: true },
  { name: "TransformOperation::to_scale_3d", startLine: 429, endLine: 446, summary: "Normalizes any CSS scale function (Scale, ScaleX, ScaleY, ScaleZ) to a Scale3D representation.", tags: ["transform", "scale", "normalization"], isPub: true },
  { name: "TransformOperation::to_animated_zero", startLine: 453, endLine: 537, summary: "Produces the identity value for each CSS transform operation type, used as the zero value for additive animation.", tags: ["animation", "transform", "identity"], isPub: true, complexity: "moderate" }
];

fns_computed_transform.forEach(fn => {
  nodes.push({ id: "function:style/values/computed/transform.rs:" + fn.name, type: "function", name: fn.name, filePath: "style/values/computed/transform.rs", lineRange: [fn.startLine, fn.endLine], summary: fn.summary, tags: fn.tags, complexity: fn.complexity || "simple" });
  edges.push({ source: "file:style/values/computed/transform.rs", target: "function:style/values/computed/transform.rs:" + fn.name, type: "contains", direction: "forward", weight: 1.0 });
  if (fn.isPub) { edges.push({ source: "file:style/values/computed/transform.rs", target: "function:style/values/computed/transform.rs:" + fn.name, type: "exports", direction: "forward", weight: 0.8 }); }
});

// ============================================================
// IMPORT EDGES
// ============================================================
const batchImportData = {
  "style/values/animated/color.rs": [],
  "style/values/animated/effects.rs": [],
  "style/values/animated/font.rs": [],
  "style/values/animated/mod.rs": ["style/values/animated/color.rs", "style/values/animated/effects.rs", "style/values/animated/font.rs", "style/values/animated/grid.rs", "style/values/animated/lists.rs", "style/values/animated/svg.rs", "style/values/animated/transform.rs"],
  "style/values/animated/transform.rs": [],
  "style/values/computed/align.rs": ["style/values/specified/mod.rs"],
  "style/values/computed/animation.rs": [],
  "style/values/computed/border.rs": [],
  "style/values/computed/box.rs": [],
  "style/values/computed/calc.rs": [],
  "style/values/computed/counters.rs": [],
  "style/values/computed/transform.rs": []
};

for (const [source, targets] of Object.entries(batchImportData)) {
  for (const target of targets) {
    edges.push({ source: "file:" + source, target: "file:" + target, type: "imports", direction: "forward", weight: 0.7 });
  }
}

// ============================================================
// CROSS-FILE RELATIONSHIP EDGES
// ============================================================

// animated/transform.rs depends on computed/transform.rs for matrix types
edges.push({ source: "file:style/values/animated/transform.rs", target: "file:style/values/computed/transform.rs", type: "depends_on", direction: "forward", weight: 0.6 });

// animated/transform.rs uses core animation traits from animated/mod.rs
edges.push({ source: "file:style/values/animated/transform.rs", target: "class:style/values/animated/mod.rs:Animate", type: "depends_on", direction: "forward", weight: 0.6 });
edges.push({ source: "file:style/values/animated/transform.rs", target: "class:style/values/animated/mod.rs:Procedure", type: "depends_on", direction: "forward", weight: 0.6 });
edges.push({ source: "file:style/values/animated/transform.rs", target: "class:style/values/animated/mod.rs:ToAnimatedZero", type: "depends_on", direction: "forward", weight: 0.6 });

// animated/color.rs uses core animation traits
edges.push({ source: "file:style/values/animated/color.rs", target: "class:style/values/animated/mod.rs:Animate", type: "depends_on", direction: "forward", weight: 0.6 });
edges.push({ source: "file:style/values/animated/color.rs", target: "class:style/values/animated/mod.rs:Procedure", type: "depends_on", direction: "forward", weight: 0.6 });
edges.push({ source: "file:style/values/animated/color.rs", target: "class:style/values/animated/mod.rs:ToAnimatedZero", type: "depends_on", direction: "forward", weight: 0.6 });

// computed/box.rs uses ToAnimatedValue from animated/mod.rs
edges.push({ source: "file:style/values/computed/box.rs", target: "class:style/values/animated/mod.rs:ToAnimatedValue", type: "depends_on", direction: "forward", weight: 0.6 });

// computed/border.rs uses ToAnimatedValue from animated/mod.rs
edges.push({ source: "file:style/values/computed/border.rs", target: "class:style/values/animated/mod.rs:ToAnimatedValue", type: "depends_on", direction: "forward", weight: 0.6 });

// computed/transform.rs re-exports from generics::transform
edges.push({ source: "file:style/values/computed/transform.rs", target: "class:style/values/animated/transform.rs:Quaternion", type: "depends_on", direction: "forward", weight: 0.6 });

// ============================================================
// WRITE & VALIDATE
// ============================================================
const output = { nodes, edges };
fs.writeFileSync('.understand-anything/intermediate/batch-10.json', JSON.stringify(output, null, 2));

console.log("nodeCount:", nodes.length);
console.log("edgeCount:", edges.length);

// Validate import edge count
let expectedImports = 0;
for (const targets of Object.values(batchImportData)) { expectedImports += targets.length; }
const actualImports = edges.filter(e => e.type === 'imports').length;
console.log("Import edges: expected", expectedImports, "actual", actualImports);

// Check for duplicate node IDs
const ids = nodes.map(n => n.id);
const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
if (dupes.length > 0) { console.log("DUPLICATE NODES:", dupes); }

// Check for self-referencing edges
const selfEdges = edges.filter(e => e.source === e.target);
if (selfEdges.length > 0) { console.log("SELF-REFERENCING EDGES:", selfEdges); }

// Validate node ID format
const badIds = nodes.filter(n => !n.id.match(/^(file|function|class|config|document|service|table|endpoint|pipeline|schema|resource):/));
if (badIds.length > 0) { console.log("NODES WITH BAD ID FORMAT:", badIds.map(n => n.id)); }

console.log("Output written successfully.");
