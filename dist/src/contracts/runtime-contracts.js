// =====================================================
// RUNTIME CONTRACTS V1
// FUNCTIONS OF THE NOTHING
// =====================================================
export var Zone;
(function (Zone) {
    Zone["PUBLIC"] = "PUBLIC_ZONE";
    Zone["ENCOUNTER"] = "ENCOUNTER_ZONE";
    Zone["POLARITY"] = "POLARITY_ZONE";
    Zone["ABYSS"] = "ABYSS_ZONE";
    Zone["SURPRISE"] = "SURPRISE_ZONE";
})(Zone || (Zone = {}));
export var Phase;
(function (Phase) {
    Phase["START"] = "START_PHASE";
    Phase["MAIN"] = "MAIN_PHASE";
    Phase["JOURNEY"] = "JOURNEY_PHASE";
    Phase["ALCHEMIST"] = "ALCHEMIST_PHASE";
    Phase["BATTLE"] = "BATTLE_PHASE";
    Phase["DAMAGE"] = "DAMAGE_PHASE";
    Phase["END"] = "END_PHASE";
})(Phase || (Phase = {}));
export var EventType;
(function (EventType) {
    EventType["UNIT_ATTACKS_NOTHING_DECLARED"] = "UNIT_ATTACKS_NOTHING_DECLARED";
    EventType["UNIT_MOVED_TO_ENCOUNTER_ZONE"] = "UNIT_MOVED_TO_ENCOUNTER_ZONE";
    EventType["DECLARED_ATTACK_ENTERED_RESOLUTION"] = "DECLARED_ATTACK_ENTERED_RESOLUTION";
    EventType["ATTACK_RESPONSE_WINDOW_OPENED"] = "ATTACK_RESPONSE_WINDOW_OPENED";
    EventType["ATTACK_TARGET_VALIDATED"] = "ATTACK_TARGET_VALIDATED";
    EventType["NOTHING_COMBAT_STATE_CONFIRMED"] = "NOTHING_COMBAT_STATE_CONFIRMED";
    EventType["NOTHING_JUDGMENT_RESOLVED"] = "NOTHING_JUDGMENT_RESOLVED";
})(EventType || (EventType = {}));
