import { describe, expect, it } from 'vitest';
import { animationIntensityForResonance, ComplexityViewMode, shouldShowLink, } from '../../src/function-box/function-box-interaction-visual-state.js';
import { ResonanceType, } from '../../src/runtime/index.js';
describe('Function Box visual interaction runtime', () => {
    it('prioritizes fractured resonance animation intensity', () => {
        expect(animationIntensityForResonance(ResonanceType.Fractured))
            .toBeGreaterThan(animationIntensityForResonance(ResonanceType.Stable));
    });
    it('filters visible links in basic complexity mode', () => {
        expect(shouldShowLink(ResonanceType.Stable, ComplexityViewMode.Basic)).toBe(false);
        expect(shouldShowLink(ResonanceType.Fractured, ComplexityViewMode.Basic)).toBe(true);
    });
    it('shows all links in master complexity mode', () => {
        expect(shouldShowLink(ResonanceType.Stable, ComplexityViewMode.Master)).toBe(true);
    });
});
