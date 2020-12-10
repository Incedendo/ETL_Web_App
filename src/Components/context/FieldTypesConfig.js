export const fieldTypesConfigs = {
    ETLFCALL: {
        codeFields: {
            JSON_PARAM: 'Enter your code here...',
        },
        dropdownFields: {
            WORK_GROUP_ID: [],
            INGESTION_STATUS: ['PENDING'],
        }
    },

    ETLF_EXTRACT_CONFIG: {
        codeFields: {

        },
        dropdownFields: {
            GROUP_ID: [],
            TGT_TABLE_ACTION: ['RECREATE', 'TRUNCATE'],
            ROUTE_ID: [1,2,3,4,5,6],
            ACTION_ID: [],
            SOURCE_SYSTEM_ID: [],
            TARGET_SYSTEM_ID: [],
            ACTIVE: ['Y', 'N'],
            DIEONMISMATCH: ['Y', 'N'],
            PX_PARALLELEXECNUM: Array.from({length: 20}, (v, k) => k+1),
            PX_SPLITNUM: Array.from({ length: 20 }, (v, k) => k + 1),
            SOURCE_FILE_TYPE: ['CSV', 'XLSX', 'XLS']
        }
    }, 

    ETLF_CUSTOM_CODE: {
        codeFields: {
            'CODE': 'Enter your code here...',
        },
        dropdownFields: {
            ACTIVE: ['Y', 'N'],
            CODE_TYPE: ['ADHOC_QUERY', 'BLOCK_FORMATION']
        }
    },

    DATA_STEWARD: {
        codeFields: {
            'FNAME': 'Enter your info here...',
            'LNAME': 'Enter your info here...',
            'EMAIL': 'Enter your info here...',
        },
    },

    DATA_DOMAIN: {
        codeFields: {
            'DOMAIN': 'Enter your info here...',
            'DOMAIN_DESCRIPTIONS': 'Enter your info here...'
        }
    },

    //composite table
    DATA_STEWARD_DOMAIN: {
        dropdownFields: {
            DATA_DOMAIN_ID: [],
            DATA_STEWARD_ID: []
        }
    },

    //composite table
    CATALOG_ENTITY_DOMAIN: {
        dropdownFields: {
            DATA_DOMAIN_ID: [],
            CATALOG_ENTITIES_ID: []
        }
    },

    CATALOG_ENTITIES: {
        codeFields: {
            'CATALOG_ENTITIES_HASH': 'Enter your code here...',
            'COMMENTS': 'Enter your code here...',
        },
        dropdownFields: {
            TARGET_DATABASE: [],
            TARGET_SCHEMA: [],
            TARGET_TABLE: []
        }
    },

    CATALOG_ITEMS: {
        codeFields: {
            'CATALOG_ENTITIES_HASH': 'Enter your code here...',
            'COLUMN_NAME': 'Enter your code here...',
            'DATA_TYPE': 'Enter your code here...',
            'PII': 'Enter your code here...',
            'DENSITY': 'Enter your code here...',
            'SEARCH_KEY': 'Enter your code here...',
            'COMMENTS': 'Enter your code here...',
        },
        dropdownFields: {}
    },

    CATALOG_ENTITY_LINEAGE: {
        codeFields: {
            'CATALOG_ENTITIES_HASH': 'Enter your code here...',
            'ORIGIN_INFORMATION': 'Enter your code here...',
            'CONFIG_NAME': 'Enter your code here...',
            'EXTRACT_CONFIG_ID': 'Enter your code here...',
            'SOURCE_TABLE': 'Enter your code here...',
            'EXTRACT_SCHEMA': 'Enter your code here...',
            'SYSTEM_CONFIG_TYPE': 'Enter your code here...',
            'LINEAGE': 'Enter your code here...',
            'NOTIFICATIONEMAILS': 'Enter your code here...',
            'REFRESH_INTERVAL': 'Enter your code here...',
        },
        dropdownFields: {}
    }
}

//fields not shown in the form BUT will be automatically inserted into the TABLE
export const autofilledFields = {
    CUSTOM_CODE_ID: 'SHARED_TOOLS_DEV.ETL.ETLFSEQ.NEXTVAL', 
    CREATEDDT: 'CURRENT_TIMESTAMP:: timestamp_ntz', 
    LASTMODIFIEDDT: 'CURRENT_TIMESTAMP:: timestamp_ntz',
};

export const ETLF_tables = ['ETLF_EXTRACT_CONFIG', 'ETLFCALL', 'ETLF_CUSTOM_CODE']