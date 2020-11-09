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
            'ACTIVE': ['Y', 'N'],
            'CODE_TYPE': ['ADHOC_QUERY', 'BLOCK_FORMATION']
        }
    }
}

//fields not shown in the form BUT will be automatically inserted into the TABLE
export const autofilledFields = {
    CUSTOM_CODE_ID: 'SHARED_TOOLS_DEV.ETL.ETLFSEQ.NEXTVAL', 
    CREATEDDT: 'CURRENT_TIMESTAMP:: timestamp_ntz', 
    LASTMODIFIEDDT: 'CURRENT_TIMESTAMP:: timestamp_ntz',
};