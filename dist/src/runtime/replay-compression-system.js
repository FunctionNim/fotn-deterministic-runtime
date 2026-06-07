export var ReplayCompressionLevel;
(function (ReplayCompressionLevel) {
    ReplayCompressionLevel["Raw"] = "Raw";
    ReplayCompressionLevel["Condensed"] = "Condensed";
    ReplayCompressionLevel["Symbolic"] = "Symbolic";
    ReplayCompressionLevel["Mythic"] = "Mythic";
})(ReplayCompressionLevel || (ReplayCompressionLevel = {}));
export class ReplayCompressionSystem {
    compress(input) {
        const compressionRatio = clamp01(1 - (input.uniqueStateSignatureCount / Math.max(1, input.eventCount)));
        const meaningWeight = clamp01(input.symbolicWeight * 0.55 + input.historicalWeight * 0.45);
        return {
            replayId: input.replayId,
            level: compressionLevelFor(compressionRatio, meaningWeight),
            compressionRatio,
            preservesDeterminism: input.uniqueStateSignatureCount > 0,
            archiveRecommended: meaningWeight >= 0.65,
        };
    }
}
function compressionLevelFor(compressionRatio, meaningWeight) {
    if (meaningWeight >= 0.85 && compressionRatio >= 0.75) {
        return ReplayCompressionLevel.Mythic;
    }
    if (meaningWeight >= 0.65)
        return ReplayCompressionLevel.Symbolic;
    if (compressionRatio >= 0.35)
        return ReplayCompressionLevel.Condensed;
    return ReplayCompressionLevel.Raw;
}
function clamp01(value) {
    if (Number.isNaN(value))
        return 0;
    return Math.max(0, Math.min(1, value));
}
