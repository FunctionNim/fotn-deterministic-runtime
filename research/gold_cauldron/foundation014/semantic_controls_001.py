"""Synthetic semantic counterexamples for Foundation 014; not physical replay."""
import datetime

def check(rows, header):
    issues=[];seen=set();previous=None
    for index,row in enumerate(rows,2):
        if len(row)!=len(header):
            issues.append((index,"width"));continue
        try:
            time=datetime.datetime.strptime(row[0]+" "+row[1].strip('"'),"%d-%m-%y %H:%M")
        except ValueError:
            issues.append((index,"bad_primary_time"));continue
        if time in seen:issues.append((index,"duplicate_primary_time"))
        if previous is not None and time<=previous:issues.append((index,"non_increasing_primary_time"))
        seen.add(time);previous=time
        for col,name in enumerate(header[2:],2):
            if name in ("Date_SI","Hour_SI") or not row[col].strip():continue
            try:float(row[col])
            except ValueError:issues.append((index,"invalid_numeric_"+name))
        if "Date_SI" in header:
            solar=[row[header.index(x)].strip() for x in ("Date_SI","Hour_SI","Solar irradiation")]
            if any(solar) and not all(solar):issues.append((index,"partial_solar_triplet"))
            elif all(solar):
                try:datetime.datetime.strptime(solar[0]+" "+solar[1].strip('"'),"%d-%m-%y %H:%M")
                except ValueError:issues.append((index,"bad_solar_time"))
    return issues

def test():
    h=["Date","Hour","Temperature","Date_SI","Hour_SI","Solar irradiation"]
    r=[["25-7-23","0:00","25.4","25-7-23","0:00","2"],
       ["25-7-23","0:01","25.5","","",""]]
    tests={
        "healthy":r,
        "duplicate_time":[r[0],r[0]],
        "bad_primary_time":[["25-7-23","25:01",*r[0][2:]]],
        "bad_numeric":[["25-7-23","0:00","bad",*r[0][3:]]],
        "partial_solar":[["25-7-23","0:00","25.4","25-7-23","","2"]],
        "bad_solar_time":[["25-7-23","0:00","25.4","25-7-23","99:00","2"]],
        "reversed_time":[r[1],r[0]],
        "wrong_width":[r[0][:-1]]}
    for name,rows in tests.items():
        assert bool(check(rows,h))==(name!="healthy"),name
    print("PASS 8/8 synthetic cases: one accepted, seven rejected")
if __name__=="__main__":test()
