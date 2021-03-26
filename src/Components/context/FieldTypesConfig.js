export const fieldTypesConfigs = {
    ETLFCALL: {
        primaryKeys: ['ETLFCALL_ID'],
        codeFields: {
            JSON_PARAM: 'Enter your code here...',
        },
        dropdownFields: {
            // WORK_GROUP_ID: [],
            GROUP_ID: [],
            // INGESTION_STATUS: ['PENDING'],
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
            'CATALOG_ENTITY_LINEAGE': 'EXTRACT_CONFIG_ID'
        }

    }, 

    ETLF_CUSTOM_CODE: {
        primaryKeys: ['CUSTOM_CODE_ID'],
        codeFields: {
            'CODE': '',
        },
        dropdownFields: {
            ACTIVE: ['Y', 'N'],
            CODE_TYPE: ['ADHOC_QUERY', 'BLOCK_FORMATION']
        },
        'links':{
            'ETLF_EXTRACT_CONFIG': 'EXTRACT_CONFIG_ID'
        }
    },

    DATA_STEWARD: {
        primaryKeys: ["DATA_STEWARD_ID"],
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
        dropdownFields: {

        },
        'links':{
            'DATA_DOMAIN': 'DATA_STEWARD_ID'
        },
    },

    DATA_DOMAIN: {
        primaryKeys: ["DATA_DOMAIN_ID"],
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
            'DATA_STEWARD': 'DATA_DOMAIN_ID',
            'CATALOG_ENTITIES': 'DATA_DOMAIN_ID'
        },
    },

    //composite table
    DATA_STEWARD_DOMAIN: {
        primaryKeys: ['DATA_DOMAIN_ID,DATA_STEWARD_ID'],

        dataTypes:{
            'DOMAIN': 'string',
            'EMAIL': 'string',
        },
        codeFields: {},
        dropdownFields: {
            // 'DOMAIN': [], //SHOW DATA DOMAIN BUT GET DATA_DOMAIN_ID
            'EMAIL': [] // SHOW DATA_STEWARD BUT GET DATA_STEWARD_ID 
        },
        multiSelect: ['DOMAIN'],
        'links':{
            'DATA_STEWARD': 'DATA_DOMAIN_ID',
            'DATA_DOMAIN': 'DATA_STEWARD_ID'
        }
    },

    //composite table
    CATALOG_ENTITY_DOMAIN: {
        primaryKeys: ['DATA_DOMAIN_ID,CATALOG_ENTITIES_ID'],
        dataTypes:{
            'DOMAIN': 'string',
            'CATALOG_ENTITIES': 'string',
        },
        codeFields: {},
        dropdownFields: {
            'DOMAIN': [],
            // 'CATALOG_ENTITIES': []
        },
        multiSelect: ['CATALOG_ENTITIES'],
        'links':{
            'DATA_DOMAIN': 'CATALOG_ENTITIES_ID',
            'CATALOG_ENTITIES': 'DATA_DOMAIN_ID'
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
            // 'TARGET_DATABASE': [],
            // 'TARGET_SCHEMA': [],
            // 'TARGET_TABLE': []
        },
        'links':{
            'DATA_DOMAIN': 'CATALOG_ENTITIES_ID',
            'CATALOG_ENTITY_LINEAGE': 'CATALOG_ENTITIES_ID', 
            'CATALOG_ITEMS': 'CATALOG_ENTITIES_ID'
        }
        // 'links':{
        //     'DATA_DOMAIN': {
        //         'KEYS': ['CATALOG_ENTITIES_ID', 'DATA_DOMAIN_ID'], //linked through DATA_STEWARD_DOMAIN -- 3 table search
        //         'LINK': '/datacataloglinked'
        //     },
        //     'CATALOG_ENTITY_LINEAGE': {
        //         'KEYS': ['CATALOG_ENTITIES_ID'], //linked through DATA_STEWARD_DOMAIN -- 3 table search
        //         'LINK': '/datacataloglinked'
        //     },
        //     'CATALOG_ITEMS': {
        //         'KEYS': ['CATALOG_ENTITIES_ID'], //linked through DATA_STEWARD_DOMAIN -- 3 table search
        //         'LINK': '/datacataloglinked'
        //     }
        // }
    },

    CATALOG_ITEMS: {
        primaryKeys: ['CATALOG_ITEMS_ID'],
        dataTypes:{
            'CATALOG_ENTITIES': 'string', 
            //CATALOG_ITEMS_ID calculated on the fly when insert
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
        dropdownFields: {
            'CATALOG_ENTITIES': [],
        },
        'links':{
            'CATALOG_ENTITIES': 'CATALOG_ENTITIES_ID'
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
            'ETLF_EXTRACT_CONFIG': 'EXTRACT_CONFIG_ID',
            'CATALOG_ENTITIES': 'CATALOG_ENTITIES_ID'
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
export const DATA_CATALOG_TABLE = ["DATA_STEWARD", "DATA_DOMAIN","CATALOG_ENTITIES","CATALOG_ENTITY_LINEAGE","CATALOG_ITEMS", 'DATA_STEWARD_DOMAIN','CATALOG_ENTITY_DOMAIN'];


export const compositeTables = {
    'DATA_STEWARD_DOMAIN': {},
    'CATALOG_ENTITY_DOMAIN':{},
};

// export const joinedTableDataCatalog = {
//     'CATALOG_ITEMS': {
//         'joinedTable': 'CATALOG_ENTITIES',
//         'joinedColumns': ['TARGET_DATABASE', 'TARGET_SCHEMA', 'TARGET_TABLE'],
//         'joinedCriterion': 'CATALOG_ENTITIES_ID'
//     },
//     'CATALOG_ENTITY_LINEAGE': {
//         'joinedTable': 'CATALOG_ENTITIES',
//         'joinedColumns': ['TARGET_DATABASE', 'TARGET_SCHEMA', 'TARGET_TABLE'],
//         'joinedCriterion': 'CATALOG_ENTITIES_ID'
//     }
// };

// export const TABLES_NON_EDITABLE_COLUMNS = {
//     "ETLF_EXTRACT_CONFIG": ["EXTRACT_CONFIG_ID"],
//     "ETLFCALL": ["ETLFCALL_ID"],
//     "DATA_STEWARD": ['EMAIL'],
//     "DATA_DOMAIN": ['DOMAIN'],
//     "CATALOG_ENTITIES": [ 'TARGET_DATABASE', 'TARGET_SCHEMA', 'TARGET_TABLE'],
//     "CATALOG_ENTITY_LINEAGE": [],
//     "CATALOG_ITEMS": [ 'TARGET_DATABASE', 'TARGET_SCHEMA', 'TARGET_TABLE', 'COLUMN_NAME'],
//     'DATA_STEWARD_DOMAIN': ['EMAIL', 'DOMAIN'],
//     'CATALOG_ENTITY_DOMAIN': ['TARGET_DATABASE', 'TARGET_SCHEMA', 'TARGET_TABLE'],
// }

export const TABLES_NON_EDITABLE_COLUMNS = {
    "ETLF_EXTRACT_CONFIG": ["EXTRACT_CONFIG_ID"],
    "ETLFCALL": ["ETLFCALL_ID", 'INGESTION_STATUS', 'SOURCE_TABLE', 'WORK_GROUP_ID', 'LAST_UPDATE_DATE','CREATED_DATE'],
    "ETLF_CUSTOM_CODE": ['SOURCE_TABLE', 'CUSTOM_CODE_ID', "EXTRACT_CONFIG_ID",'CREATEDDT', 'LASTMODIFIEDDT'],
    "DATA_STEWARD": ['EMAIL'],
    "DATA_DOMAIN": ['DOMAIN'],
    "CATALOG_ENTITIES": ['TARGET_DATABASE', 'TARGET_SCHEMA', 'TARGET_TABLE', 'DOMAIN'],
    "CATALOG_ENTITY_LINEAGE": ['CATALOG_ENTITIES_ID', 'DOMAIN', 'TARGET_DATABASE', 'TARGET_SCHEMA', 'TARGET_TABLE'],
    "CATALOG_ITEMS": ['DOMAIN', 'TARGET_DATABASE', 'TARGET_SCHEMA', 'TARGET_TABLE', 'COLUMN_NAME', 'DATA_TYPE'],
    'DATA_STEWARD_DOMAIN': ['EMAIL', 'FNAME', 'LNAME', 'DOMAIN', 'DOMAIN_DESCRIPTIONS'],
    'CATALOG_ENTITY_DOMAIN': ['TARGET_DATABASE', 'TARGET_SCHEMA', 'TARGET_TABLE', 'DOMAIN', 'DOMAIN_DESCRIPTIONS'],
}

//NOT USED YET BUT THERE'S a excludedFields ARRAY IN DisplayField Class
export const TABLES_HIDDEN_IN_TABLE_COLUMNS = [
    "DATA_STEWARD_ID", "DATA_DOMAIN_ID","CATALOG_ENTITIES_ID","CATALOG_ENTITY_LINEAGE_ID","CATALOG_ITEMS_ID",
    'CREATEDDATE', 'LASTMODIFIEDDATE', 
    // 'PRIVILEGE'
]

export const HIDDEN_FIELDS_IN_ROW_EXPANSION = [
    'EDITABLE',"PRIVILEGE", "RN", "TOTAL_NUM_ROWS", "id",
    'CREATEDDT', 'LASTMODIFIEDDT',
    'EXTRACT_CONFIG_ID', 'CUSTOM_CODE_ID', 'ETLFCALL_ID',
    "DATA_STEWARD_ID", "DATA_DOMAIN_ID","CATALOG_ENTITIES_ID","CATALOG_ENTITY_LINEAGE_ID","CATALOG_ITEMS_ID",
    'CREATEDDATE', 'LASTMODIFIEDDATE', 
    // "ROUTE_ID", 'ACTION_ID'
]
// {
//     "ETLF_EXTRACT_CONFIG": ['CREATEDDATE', 'LASTMODIFIEDDATE'],
//     "ETLFCALL": ['CREATEDDATE', 'LASTMODIFIEDDATE'],
//     "DATA_STEWARD": ["DATA_STEWARD_ID", 'CREATEDDATE', 'LASTMODIFIEDDATE'],
//     "DATA_DOMAIN": ["DATA_DOMAIN_ID", 'CREATEDDATE', 'LASTMODIFIEDDATE'],
//     "CATALOG_ENTITIES": ["CATALOG_ENTITIES_ID", 'CREATEDDATE', 'LASTMODIFIEDDATE'],
//     "CATALOG_ENTITY_LINEAGE": ["CATALOG_ENTITY_LINEAGE_ID", 'CATALOG_ENTITIES_ID', 'CREATEDDATE', 'LASTMODIFIEDDATE'],
//     "CATALOG_ITEMS": ["CATALOG_ITEMS_ID", 'CATALOG_ENTITIES_ID', 'CREATEDDATE', 'LASTMODIFIEDDATE'],
//     'DATA_STEWARD_DOMAIN': ['DATA_STEWARD_ID', 'DATA_DOMAIN_ID', 'CREATEDDATE', 'LASTMODIFIEDDATE'],
//     'CATALOG_ENTITY_DOMAIN': ['CATALOG_ENTITIES_ID', 'DATA_DOMAIN_ID', 'CREATEDDATE', 'LASTMODIFIEDDATE'],
// }

export const CatalogTableConfigs = {};