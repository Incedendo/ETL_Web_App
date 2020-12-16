export const fieldTypesConfigs = {
    ETLFCALL: {
        primaryKeys: ['ETLFCALL_ID'],
        codeFields: {
            JSON_PARAM: 'Enter your code here...',
        },
        dropdownFields: {
            WORK_GROUP_ID: [],
            INGESTION_STATUS: ['PENDING'],
        },
        'links':{
            
        }
    },

    ETLF_EXTRACT_CONFIG: {
        primaryKeys: ['EXTRACT_CONFIG_ID'],
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
        },
        'links':{

        }

    }, 

    ETLF_CUSTOM_CODE: {
        primaryKeys: ['CUSTOM_CODE_ID'],
        codeFields: {
            'CODE': 'Enter your code here...',
        },
        dropdownFields: {
            ACTIVE: ['Y', 'N'],
            CODE_TYPE: ['ADHOC_QUERY', 'BLOCK_FORMATION']
        },
        'links':{
            
        }
    },

    DATA_STEWARD: {
        primaryKeys: ['EMAIL'],
        dataTypes: {
            'FNAME': 'string',
            'LNAME': 'string',
            'EMAIL': 'string',
        },
        codeFields: {
            // 'FNAME': 'Enter your info here...',
            // 'LNAME': 'Enter your info here...',
            // 'EMAIL': 'Enter your info here...',
        },
        dropdownFields: {},
        'links':{
            'EMAIL': {
                'TABLE': 'DATA_DOMAIN', //linked through DATA_STEWARD_DOMAIN -- 3 table search
                'LINK': '/datacataloglinked'
            },
        }
    },

    DATA_DOMAIN: {
        primaryKeys: ['DOMAIN'],
        dataTypes:{
            'DOMAIN': 'string',
            'DOMAIN_DESCRIPTIONS': 'string',
        },
        codeFields: {
            // 'DOMAIN': 'Enter your info here...',
            // 'DOMAIN_DESCRIPTIONS': 'Enter your info here...'
        },
        dropdownFields: {},
        'links':{
            'DOMAIN': {
                'TABLE': 'CATALOG_ENTITIES', //linked through CATALOG_ENTITY_DOMAIN -- 3 table search
                'LINK': '/datacataloglinked'
            },
        }
    },

    //composite table
    DATA_STEWARD_DOMAIN: {
        // primaryKeys: ['DATA_STEWARD_ID'],

        dataTypes:{
            'DATA_DOMAIN': 'string',
            'DATA_STEWARD': 'string',
        },
        codeFields: {},
        dropdownFields: {
            'DATA_DOMAIN': [], //SHOW DATA DOMAIN BUT GET DATA_DOMAIN_ID
            'DATA_STEWARD': [] // SHOW DATA_STEWARD BUT GET DATA_STEWARD_ID 
        },
        'links':{
            
        }
    },

    //composite table
    CATALOG_ENTITY_DOMAIN: {
        // primaryKeys: ['CATALOG_ENTITIES_HASH'],
        dataTypes:{
            'DATA_DOMAIN': 'string',
            'CATALOG_ENTITIES': 'string',
        },
        codeFields: {},
        dropdownFields: {
            'DATA_DOMAIN': [],
            'CATALOG_ENTITIES': []
        },
        'links':{
            
        }
    },

    CATALOG_ENTITIES: {
        primaryKeys: ['CATALOG_ENTITIES_ID'],
        dataTypes:{
            'COMMENTS': 'string',
            'TARGET_DATABASE': 'string',
            'TARGET_SCHEMA': 'string',
            'TARGET_TABLE': 'string',
        },
        codeFields: {
            // 'CATALOG_ENTITIES_HASH': 'Enter your code here...',
            // 'COMMENTS': 'Enter your code here...',
        },
        dropdownFields: {
            'TARGET_DATABASE': [],
            'TARGET_SCHEMA': [],
            'TARGET_TABLE': []
        },
        'links':{
            'CATALOG_ENTITIES_HASH': [
                {
                    'TABLE': 'CATALOG_ITEMS',
                    'LINK': '/datacataloglinked'
                },
                {
                    'TABLE': 'CATALOG_ENTITY_LINEAGE',
                    'LINK': '/datacataloglinked'
                }
            ]
        }
    },

    CATALOG_ITEMS: {
        primaryKeys: ['CATALOG_ITEMS_ID'],
        dataTypes:{
            'COLUMN_NAME': 'string',
            'DATA_TYPE': 'string',
            'PII': 'string',
            'SEARCH_KEY': 'string',
            'COMMENTS': 'string',
            'DENSITY': 'number',
        },
        codeFields: {
            // 'CATALOG_ENTITIES_HASH': 'Enter your code here...',
            // 'COLUMN_NAME': 'Enter your code here...',
            // 'DATA_TYPE': 'Enter your code here...',
            // 'PII': 'Enter your code here...',
            // 'DENSITY': 'Enter your code here...',
            // 'SEARCH_KEY': 'Enter your code here...',
            // 'COMMENTS': 'Enter your code here...',
        },
        dropdownFields: {},
        'links':{
            'CATALOG_ENTITIES_HASH': [
                {
                    'TABLE': 'CATALOG_ENTITIES',
                    'LINK': '/datacataloglinked'
                },
                {
                    'TABLE': 'CATALOG_ENTITY_LINEAGE',
                    'LINK': '/datacataloglinked'
                }
            ]
        }
    },

    CATALOG_ENTITY_LINEAGE: {
        primaryKeys: ['CATALOG_ENTITY_LINEAGE_ID'],
        dataTypes:{
            'CATALOG_ENTITIES': 'string',
            'ORIGIN_INFORMATION': 'string',
            'CONFIG_NAME': 'string',
            'SOURCE_TABLE': 'string',
            'EXTRACT_SCHEMA': 'string',
            'SYSTEM_CONFIG_TYPE': 'string',
            'LINEAGE': 'string',
            'NOTIFICATIONEMAILS': 'string',
            'REFRESH_INTERVAL': 'string',
            'EXTRACT_CONFIG_ID': 'number',
        },
        codeFields: {
            // 'CATALOG_ENTITIES_HASH': 'Enter your code here...',
            // 'ORIGIN_INFORMATION': 'Enter your code here...',
            // 'CONFIG_NAME': 'Enter your code here...',
            // 'EXTRACT_CONFIG_ID': 'Enter your code here...',
            // 'SOURCE_TABLE': 'Enter your code here...',
            // 'EXTRACT_SCHEMA': 'Enter your code here...',
            // 'SYSTEM_CONFIG_TYPE': 'Enter your code here...',
            // 'LINEAGE': 'Enter your code here...',
            // 'NOTIFICATIONEMAILS': 'Enter your code here...',
            // 'REFRESH_INTERVAL': 'Enter your code here...',
        },
        dropdownFields: {
            'CATALOG_ENTITIES': [],
        },
        'links': {
            'EXTRACT_CONFIG_ID': [
                {
                    'TABLE': 'ETLF_EXTRACT_CONFIG',
                    'LINK': '/etlframework'
                },
                {
                    'TABLE': 'ETLF_EXTRACT_CONFIG',
                    'LINK': '/etlframework'
                },
                {
                    'TABLE': 'ETLF_EXTRACT_CONFIG',
                    'LINK': '/etlframework'
                }
            ],
            'SOURCE_TABLE': [{
                'TABLE': 'ETLF_EXTRACT_CONFIG',
                'LINK': '/etlframework/'
            }],
            'EXTRACT_SCHEMA': [{
                'TABLE': 'ETLF_EXTRACT_CONFIG',
                'LINK': '/etlframework'
            }],
            'CATALOG_ENTITIES_HASH': [
                {
                    'TABLE': 'CATALOG_ITEMS',
                    'LINK': '/datacataloglinked'
                },
                {
                    'TABLE': 'CATALOG_ENTITIES',
                    'LINK': '/datacataloglinked'
                }
            ]
        }
    }
}

//fields not shown in the form BUT will be automatically inserted into the TABLE
export const autofilledFields = {
    CUSTOM_CODE_ID: 'SHARED_TOOLS_DEV.ETL.ETLFSEQ.NEXTVAL', 
    CREATEDDT: 'CURRENT_TIMESTAMP:: timestamp_ntz', 
    LASTMODIFIEDDT: 'CURRENT_TIMESTAMP:: timestamp_ntz',
};

export const ETLF_tables = ['ETLF_EXTRACT_CONFIG', 'ETLFCALL', 'ETLF_CUSTOM_CODE'];
export const joinedTableDataCatalog = ['CATALOG_ITEMS'];


export const CatalogTableConfigs = {};