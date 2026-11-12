// Diagram card entry point: spec -> validate -> layout -> SVG.
//   buildDiagram(spec) -> { errors: string[], svg?: string }
// Any error means "don't use the diagram"; the caller falls back to the normal card.
import { validateSpec } from './spec.mjs';
import { layoutDiagram } from './layout.mjs';
import { renderSvg } from './render.mjs';

export function buildDiagram(spec) {
	const specErrors = validateSpec(spec);
	if (specErrors.length) return { errors: specErrors };
	const laid = layoutDiagram(spec);
	if (laid.errors.length) return { errors: laid.errors };
	return { errors: [], svg: renderSvg(laid) };
}
