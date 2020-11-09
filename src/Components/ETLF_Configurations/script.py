import csv

class System_config:
  def __init__(self, ETLF_SYSTEM_CONFIG_ID, SYSTEM_CONFIG_TYPE, SYSTEM_CONFIG_JSON):
    self.ETLF_SYSTEM_CONFIG_ID = ETLF_SYSTEM_CONFIG_ID
    self.SYSTEM_CONFIG_TYPE = SYSTEM_CONFIG_TYPE
    self.SYSTEM_CONFIG_JSON = SYSTEM_CONFIG_JSON

configs = []

with open('ETLF_Custom_Code.csv') as csv_file, open('ETLF_SYSTEM_CONFIG.js', 'w') as f2:
    csv_reader = csv.reader(csv_file, delimiter=',')
    line_count = 0
    for row in csv_reader:
        # ETLF_SYSTEM_CONFIG_ID = row[0]
        # SYSTEM_CONFIG_TYPE = row[1]
        # SYSTEM_CONFIG_JSON = row[3]

        # newConfig = System_config(row[0], row[1], row[3])
        
        if line_count == 0:
            print(f'Column names are {", ".join(row)}')
            line_count += 1
            f2.write('const configs = [')
        else: 
            # print(f'ETLF_SYSTEM_CONFIG_ID: \t{row[0]} - \t SYSTEM_CONFIG_TYPE:{row[1]} - \t SYSTEM_CONFIG_JSON {row[3]}. \n -------------------------------------------------------------------------------------------- \n')
            newConfig = '''
                    {
                        ETLF_SYSTEM_CONFIG_ID: %s,
                        SYSTEM_CONFIG_TYPE: "%s",
                        SYSTEM_CONFIG_DESCRIPTION: "%s",
                        SYSTEM_CONFIG_JSON: %s
                    },
                    ''' % (row[0], row[1], row[2], row[3])

            configs.append(newConfig)
            f2.write(newConfig)
            line_count += 1
    print(f'Processed {line_count} lines.')
    f2.write(']\n export default configs;')

for config in configs:
    print(config)
