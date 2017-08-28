import csv


# ------------
# this generates the list of referees from a public spreadsheet taken in a csv form
# ------------
cool_list = []
with open('Sedzie.csv', 'r', encoding='utf8') as csvf:
	rdr = csv.reader(csvf)
	fst = 3
	for row in rdr:
		if fst:
			fst -= 1
			continue
		cool_list.append(row[3].strip().lower().title())

sedzie_str = 'var sedzie = [\n\t'
cool_list.sort()
for g in cool_list:
	sedzie_str += '"' + g.strip().lower().title() + '",\n\t'
sedzie_str = sedzie_str[:-3]
sedzie_str += '\n]'

with open('sedzie.js', 'w', encoding='utf-8-sig') as ff:
	ff.write(sedzie_str)
print(sedzie_str)
