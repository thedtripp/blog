// Diagram card entry point: spec -> validate -> verify sources -> layout -> SVG.
//   buildDiagram(spec, { body }) -> { errors: string[], svg?: string, note?: string|null }
// Any error means "don't use the diagram"; the caller falls back to the normal card.
import { validateSpec } from './spec.mjs';
import { layoutDiagram } from './layout.mjs';
import { renderSvg } from './render.mjs';
import { verifySpec } from './verify.mjs';

export function buildDiagram(spec, { body } = {}) {
	const specErrors = validateSpec(spec);
	if (specErrors.length) return { errors: specErrors };
	// With the post body, every box and arrow must quote it. Without it (unit tests), skip.
	if (body !== undefined) {
		const sourceErrors = verifySpec(spec, body);
		if (sourceErrors.length) return { errors: sourceErrors };
	}
	const laid = layoutDiagram(spec);
	if (laid.errors.length) return { errors: laid.errors };
	return { errors: [], svg: renderSvg(laid), note: laid.note };
}
