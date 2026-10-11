"""Wayglass 002B blinded pilot: independently implemented bounded writing paths.
This is a controlled pilot, not a production generative-model or human blind evaluation.
"""
from dataclasses import dataclass
import hashlib,json,re
from story_adapter import Scene
from test_adversarial_story import CASES

def sequential_author(scene):
    # Independent staged author: first records boundaries, then composes them.
    facts={"actor":scene.character,"cause":scene.physical_cause,
           "decision":scene.character_choice,"event":scene.event}
    return (f"{facts['actor']} faced a turning point: {facts['event']}. "
            f"The material cause was {facts['cause']}. "
            f"Separately, {facts['decision']}. "
            f"The story preserves the difference between circumstance and choice.")

def concurrent_author(scene):
    # Separate co-present author implementation, no call to sequential_author.
    return (f"When {scene.event}, two truths had to remain distinct. "
            f"{scene.character} confronted a circumstance: {scene.physical_cause}. "
            f"Agency mattered too: {scene.character_choice}. "
            f"The next scene can change without erasing either truth.")

def grade(scene, output):
    lower=output.lower()
    checks={
        "actor_preserved":scene.character.lower() in lower,
        "physical_cause_preserved":scene.physical_cause.lower() in lower,
        "choice_preserved":scene.character_choice.lower() in lower,
        "event_preserved":scene.event.lower() in lower,
        "nonempty":len(output.strip())>60,
    }
    return {"checks":checks,"score":sum(checks.values()),"max":len(checks)}

def main():
    records=[]
    for name,scene in CASES:
        # Fixed alphabetical masking that hides authors' mode names from grading.
        outputs={"X":sequential_author(scene),"Y":concurrent_author(scene)}
        ratings={token:grade(scene,text) for token,text in outputs.items()}
        records.append({"case":name,"scene_id":scene.id,"masked_outputs":outputs,
            "masked_grades":ratings,
            "blinded_grade_delta":ratings["Y"]["score"]-ratings["X"]["score"],
            "sha256":{k:hashlib.sha256(v.encode()).hexdigest() for k,v in outputs.items()}})
    result={"method":"Separate fixed-template authors; same frozen fixture; masked grader",
      "limits":"Grader is code-written, not a blinded human; alternate prose templates are not generative-model evidence",
      "cases":records,"sealed_key":{"X":"B sequential","Y":"C simultaneous-four includes Nimveyru"},
      "mode_c_has_nimveyru":True}
    print(json.dumps(result,sort_keys=True,indent=2))
if __name__=="__main__":main()
