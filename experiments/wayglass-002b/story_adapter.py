"""Wayglass 002B isolated fictional scene revision reference adapter.
Not Wayglass production runtime; fictional fixtures, no live tools.
"""
from dataclasses import dataclass
import hashlib
import json

LENSES = ("NimF-Gree", "ZintosNim", "DyroneNim", "Nimveyru")
STORY_SCOPE = "make-believe-story-creation-tool"

@dataclass(frozen=True)
class Scene:
    id: str = "BRIDGE-SCENE-001"
    source_ref: str = "T-BROWN-005"
    scope: str = STORY_SCOPE
    character: str = "Mara"
    event: str = "the bridge broke as Mara crossed"
    physical_cause: str = "a cracked support failed under load"
    character_choice: str = "Mara chose to cross after seeing a warning"
    composition_needed: bool = True
    fifth_needed: bool = False
    ambiguous_lead: bool = False

def evidence(scene):
    return {
        "identity": scene.character,
        "event": scene.event,
        "physical_cause": scene.physical_cause,
        "choice": scene.character_choice,
    }

def compose(scene, e):
    # Explicit, deterministic illustrative story transformation.
    return (f"{e['identity']} reached the bridge. {e['physical_cause'].capitalize()}. "
            f"{e['choice']}. The failure had a physical cause; "
            f"the decision to cross remains {e['identity']}'s choice.")

def run(scene, mode):
    if mode not in "ABC": raise ValueError("Unsupported mode")
    out = {"mode": mode, "source_ref": scene.source_ref, "scene_id": scene.id,
           "status": "ROUTE", "passes": [], "story": None, "evidence": evidence(scene),
           "necessity_reason": None, "fourth_nim": None}
    if scene.ambiguous_lead:
        out["status"] = "HOLD_LEAD_AMBIGUITY"
        return out
    if mode == "C":
        if scene.scope != STORY_SCOPE:
            out["status"] = "REFUSE_OUT_OF_SCOPE"
            return out
        if scene.fifth_needed:
            out["status"] = "RETURN_DECOMPOSE"
            return out
        if not scene.composition_needed:
            out["status"] = "REFUSE_UNNECESSARY_FOURTH"
            return out
        out["passes"] = [list(LENSES)]
        out["fourth_nim"] = "Nimveyru"
        out["necessity_reason"] = "Composition is requested for this fixed fixture"
    elif mode == "B":
        out["passes"] = [list(LENSES[:3]), ["Nimveyru"]]
    else:
        out["passes"] = [list(LENSES[:3])]
    if mode in ("B", "C"):
        out["story"] = compose(scene, out["evidence"])
    else:
        out["status"] = "CLASSIFIED_NO_COMPOSITION"
    return out

def canonical_bytes(value):
    return json.dumps(value,sort_keys=True,ensure_ascii=False,separators=(",",":")).encode("utf8")

def compare(scene):
    modes = {m: run(scene,m) for m in "ABC"}
    hashes = {m: hashlib.sha256(canonical_bytes(x)).hexdigest() for m,x in modes.items()}
    return {"scene_id":scene.id,"modes":modes,"hashes":hashes,
            "B_story_equals_C_story": modes["B"]["story"] == modes["C"]["story"],
            "C_superiority_proven": False,
            "qualification":"REFERENCE_ADAPTER_ONLY"}
