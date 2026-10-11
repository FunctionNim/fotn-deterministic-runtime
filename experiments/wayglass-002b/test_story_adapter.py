import unittest
from dataclasses import replace
from story_adapter import Scene, run, compare, LENSES

class DeltaTests(unittest.TestCase):
    def test_replay_and_provenance(self):
        s=Scene()
        for m in "ABC":
            self.assertEqual(run(s,m),run(s,m))
            self.assertEqual(run(s,m)["source_ref"],"T-BROWN-005")
    def test_four_includes_nimveyru_and_no_fifth(self):
        c=run(Scene(),"C")
        self.assertEqual(c["passes"],[list(LENSES)])
        self.assertEqual(c["fourth_nim"],"Nimveyru")
        self.assertEqual(len(c["passes"][0]),4)
    def test_outputs_and_comparison(self):
        r=compare(Scene())
        self.assertIsNone(r["modes"]["A"]["story"])
        self.assertTrue(r["B_story_equals_C_story"])
        self.assertFalse(r["C_superiority_proven"])
        self.assertIn("cracked support",r["modes"]["C"]["story"])
        self.assertIn("Mara's choice",r["modes"]["C"]["story"])
    def test_refusals(self):
        s=Scene()
        self.assertEqual(run(replace(s,scope="general-tool"),"C")["status"],"REFUSE_OUT_OF_SCOPE")
        self.assertEqual(run(replace(s,composition_needed=False),"C")["status"],"REFUSE_UNNECESSARY_FOURTH")
        self.assertEqual(run(replace(s,fifth_needed=True),"C")["status"],"RETURN_DECOMPOSE")
        self.assertEqual(run(replace(s,ambiguous_lead=True),"C")["status"],"HOLD_LEAD_AMBIGUITY")
    def test_staged_does_not_break_three_limit(self):
        b=run(Scene(),"B")
        self.assertTrue(all(len(x)<=3 for x in b["passes"]))

if __name__=="__main__": unittest.main()
