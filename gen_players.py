import csv


# ------------
# this generates the list of bowling players with registered licenses
# ------------
cool_list = []
with open('Licencje SKK.csv', 'r', encoding='utf8') as csvf:
	rdr = csv.reader(csvf)
	fst = True
	for row in rdr:
		if fst:
			fst = False
			continue
		if row[9]:  # wypozyczenie do klubu danego zawodnika
			cool_list.append([row[0],row[1],row[3],row[7], row[5], row[10]])
		else:
			cool_list.append([row[0],row[1],row[3],row[4], row[5], row[10]])

licencja_str = 'var zawodnicy = [\n\t'
for g in cool_list:
	licencja_str += '["' + '","'.join(g) + '"],\n\t'
licencja_str = licencja_str[:-3]
licencja_str += '\n]'

with open('licencje.js', 'w', encoding='utf-8-sig') as ff:
	ff.write(licencja_str)
print(licencja_str)
