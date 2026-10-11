"""Adversarial 002B trial: independent fixture-based story transformations.
Important: this reference adapter uses one shared composition function for B/C.
Equality therefore tests implementation consistency, NOT creative superiority.
"""
import unittest
from dataclasses import replace
from story_adapter import Scene,run,compare,LENSES,STORY_SCOPE

CASES=[
 ("character-continuity",Scene(id="ADV-CHAR",character="Mara",event="Mara is called Mira in a later scene",physical_cause="a record copied an earlier alias",character_choice="Mara rejects the alias")),
 ("conflicting-motivation",Scene(id="ADV-MOTIVE",character="Ivo",event="Ivo protects a rival while seeking revenge",physical_cause="the rival holds a required medicine",character_choice="Ivo chooses rescue before retaliation")),
 ("world-rule-consistency",Scene(id="ADV-WORLD",character="Sel",event="a prohibited gate appears open",physical_cause="the gate opens only during the third bell",character_choice="Sel waits for the third bell")),
 ("narrative-transformation",Scene(id="ADV-CHANGE",character="Nia",event="a failed plan becomes a new cooperative route",physical_cause="the old bridge cannot bear a cart",character_choice="Nia divides the cargo into hand-carried bundles")),
]
class AdversarialStoryTests(unittest.TestCase):
 def test_four_nim_invariant_and_scope(self):
  for _,s in CASES:
   x=run(s,"C")
   self.assertEqual(x["fourth_nim"],"Nimveyru")
   self.assertEqual(set(x["passes"][0]),set(LENSES))
   self.assertEqual(x["source_ref"],s.source_ref)
   self.assertEqual(run(replace(s,scope="non-story"),"C")["status"],"REFUSE_OUT_OF_SCOPE")
 def test_repeated_outputs_and_staged_three_bound(self):
  for _,s in CASES:
   for m in "ABC": self.assertEqual(run(s,m),run(s,m))
   self.assertTrue(all(len(p)<=3 for p in run(s,"B")["passes"]))
 def test_semantic_evidence_retention(self):
  for _,s in CASES:
   c=run(s,"C")
   self.assertIn(s.physical_cause.capitalize(),c["story"])
   self.assertIn(s.character_choice,c["story"])
   self.assertEqual(c["evidence"]["identity"],s.character)
 def test_comparison_not_superiority(self):
  for _,s in CASES:
   x=compare(s)
   self.assertTrue(x["B_story_equals_C_story"])
   self.assertFalse(x["C_superiority_proven"])
 def test_controls(self):
  for _,s in CASES:
   self.assertEqual(run(replace(s,composition_needed=False),"C")["status"],"REFUSE_UNNECESSARY_FOURTH")
   self.assertEqual(run(replace(s,fifth_needed=True),"C")["status"],"RETURN_DECOMPOSE")
   self.assertEqual(run(replace(s,ambiguous_lead=True),"C")["status"],"HOLD_LEAD_AMBIGUITY")
if __name__=="__main__": unittest.main()
