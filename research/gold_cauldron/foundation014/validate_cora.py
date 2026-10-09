"""Independent, read-only CORA dataset qualification (not a scientific replay)."""
import argparse
import csv
import hashlib
import json
from datetime import datetime
from pathlib import Path

EXPECTED = {
    "figure10.tab": ("817585f520179496a86dd022c5df58831261528ed4465bfecd3062322c71e525", 1440),
    "figure11.tab": ("50c58542a7aaad70aae02f747879df6dc75f55de90ad0da3652a04a03575df60", 290),
    "figure12.tab": ("7fddf1d9542914598c5b0a0b7cd425d4e4c349641bfa42eb079efec2a075d1d2", 290),
    "figure14.tab": ("3c71d6a4be78c3465faed3900f5381d618160c89d117a11333a5f9f2b33e9b5b", 288),
    "figure15.tab": ("5251ed349672e5ad1d9914b45045697c0977e4c884386be7f080c9b4c6ec19f4", 1440),
    "figure17.tab": ("87bb7b61271675ad4daa0bf95c7f630e0b38bd55b2ae59c2164f8ba26c5874d9", 2262),
}
def inspect(path):
    raw = path.read_bytes()
    actual = hashlib.sha256(raw).hexdigest()
    expected, expected_rows = EXPECTED[path.name]
    with path.open(encoding="utf-8-sig", newline="") as stream:
        records = list(csv.reader(stream, delimiter="\t"))
    records = [r for r in records if r]
    header = records[0]
    data = [r for r in records[1:] if any(c.strip() for c in r)]
    shape_ok = all(len(r) == len(header) for r in data)
    observed = []
    invalid_time = 0
    for row in data:
        try:
            observed.append(datetime.strptime(row[0].strip() + " " + row[1].strip().strip('"'), "%d-%m-%y %H:%M"))
        except (ValueError, IndexError):
            invalid_time += 1
    strictly_increasing = all(b > a for a,b in zip(observed,observed[1:]))
    empty_by_column = {head: sum(len(r) <= i or not r[i].strip() for r in data) for i,head in enumerate(header)}
    success = (actual == expected and len(data) == expected_rows and shape_ok and not invalid_time and strictly_increasing)
    return {"file":path.name,"status":"PASS" if success else "HOLD","sha256":actual,"rows":len(data),"expected_rows":expected_rows,"columns":header,"empty_cells":empty_by_column,"valid_timestamps":len(observed),"invalid_timestamps":invalid_time,"strictly_increasing":strictly_increasing,"column_widths_valid":shape_ok}
def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("folder",type=Path)
    args=parser.parse_args()
    results=[]
    for name in EXPECTED:
        file=args.folder/name
        results.append(inspect(file) if file.is_file() else {"file":name,"status":"HOLD","reason":"missing"})
    print(json.dumps({"experiment":"CORA DATA2588 / independent QA only","scientific_replay":"NOT_AUTHORIZED","results":results},indent=2))
    raise SystemExit(0 if all(r["status"]=="PASS" for r in results) else 1)
if __name__=="__main__":
    main()
