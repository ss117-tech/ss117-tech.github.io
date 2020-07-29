import json
f = open('test_csv_json.csv','r')
arr=[]
headers = []

for header in f.readline().split(','):
    headers.append(header)



for line in f.readlines():
  lineItems = {}
  for i,item in enumerate(line.strip().split(',')):
    lineItems[headers[i]] = item
  arr.append(lineItems)

f.close()

jsonText = json.dumps(arr)

print(jsonText)
