export function shouldPersistEvent(event) {
    return event.emotionalWeight >= 0.6 || event.propagationStrength >= 0.7;
}
