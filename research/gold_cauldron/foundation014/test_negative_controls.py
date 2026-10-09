"""Negative controls for CORA Foundation 014 validator. No scientific replay."""
import importlib.util
import tempfile
from pathlib import Path

spec = importlib.util.spec_from_file_location("qualifier", Path(__file__).with_name("validate_cora.py"))
q = importlib.util.module_from_spec(spec)
spec.loader.exec_module(q)

def main():
    source = Path(__file__).resolve().parent / "data"
    files = [source / name for name in q.EXPECTED]
    assert all(f.is_file() for f in files), "Source files missing"
    count = 0
    for f in files:
        assert q.inspect(f)["status"] == "PASS", f.name
        raw = f.read_bytes()
        with tempfile.TemporaryDirectory() as tmp:
            target = Path(tmp) / f.name
            cases = {
                "tamper_value": raw.replace(b"26.8", b"27.8", 1) if b"26.8" in raw else raw + b"x",
                "truncate": raw[:max(1,len(raw)//2)],
                "swap_header": raw.replace(b"Date",b"Zate",1),
            }
            for name, contents in cases.items():
                target.write_bytes(contents)
                assert q.inspect(target)["status"] == "HOLD", (f.name,name)
                count += 1
    print(f"PASS: {len(files)} positive fixtures, {count} negative controls, fail-closed on each mutation")
if __name__=="__main__": main()
