import React, { useState, useEffect, useContext } from 'react';
import { WorkspaceContext } from '../../context/WorkspaceContext';
import { AdminContext } from '../../context/AdminContext';
import { fieldTypesConfigs, ETLF_tables } from '../../context/FieldTypesConfig';
import { 
    getSearchFieldValue, search_multi_field, 
    search_multi_field_catalog_DataSteward,
    search_multi_field_catalog_DataDomain,
    search_ItemsLineage_joined_Entity_Domain, 
    search_composite_DATA_STEWARD_DOMAIN, 
    search_composite_CATALOG_ENTITY_DOMAIN ,
    search_CATALOG_ENTITIES_JOINED_DOMAIN
} from '../../sql_statements';

const SearchFilter= ({ currentSearchCriteria, setCurrentSearchCriteria }) =>{
    const {
        debug, username ,
        database, schema, table,
        axiosCallToGetTableRows
    } = useContext(WorkspaceContext);

    const { isAdmin, isSteward } = useContext(AdminContext);
    const [currentSearchObj, setCurrentSearchObj] = useState({});

    const caseAdmin = `'READ/WRITE' as PRIVILEGE`;
    const caseSteward = `CASE
        WHEN DS.EMAIL = UPPER(TRIM('` + username + `'))
        THEN 'READ/WRITE'
        ELSE 'READ ONLY'
    END AS PRIVILEGE`;
    const caseOperator = `CASE
        WHEN AA.USERNAME IS NOT NULL
        THEN 'READ/WRITE'
        ELSE 'READ ONLY'
    END AS PRIVILEGE`;

    let privilegeLogic = ``;

    const uniqueKeysToSeparateRows = fieldTypesConfigs[table]['primaryKeys'];

    const singleSearch = (currentSearchObj) => {
        let start = 0;
        let end = 100;
        // const searchTable = 'ETLF_SYSTEM_CONFIG';
        console.log(table);
        // if (verifySearchObj()) {
        // setCurrentSearchCriteria(currentSearchObj);

        console.log(currentSearchObj);
        // return;

        
        let multiSearchSqlStatement = '';
        if(ETLF_tables.indexOf(table) >= 0){
            // console.log("table is in ETLF Framework");
            const groupIDColumn = table === "ETLF_EXTRACT_CONFIG" ? 'GROUP_ID' : 'WORK_GROUP_ID'
            if(table === 'ETLF_CUSTOM_CODE'){
                multiSearchSqlStatement = `SELECT EEC.SOURCE_TABLE, EC.*, COALESCE (EAA.PRIVILEGE, 'READ ONLY') AS PRIVILEGE
                FROM "SHARED_TOOLS_DEV"."ETL"."ETLF_CUSTOM_CODE" EC
                INNER JOIN "SHARED_TOOLS_DEV"."ETL"."ETLF_EXTRACT_CONFIG" EEC
                ON (EC.EXTRACT_CONFIG_ID = EEC.EXTRACT_CONFIG_ID)
                LEFT JOIN "SHARED_TOOLS_DEV"."ETL"."ETLF_ACCESS_AUTHORIZATION" EAA
                ON (EEC.GROUP_ID = EAA.APP_ID)
                WHERE ` + getSearchFieldValue(currentSearchObj);
            }
            else if(table === 'ETLFCALL' && ('GROUP_ID' in currentSearchObj) ){

                //update 'GROUP_ID'  to 'WORK_GROUP_ID' in searchObject
                let newSearchObj = {}
                Object.keys(currentSearchObj).map(col => col !== 'GROUP_ID' 
                    ? newSearchObj[col] = currentSearchObj[col]
                    : newSearchObj['WORK_GROUP_ID'] = currentSearchObj[col]
                )

                multiSearchSqlStatement = search_multi_field(username, database, schema, table, groupIDColumn, newSearchObj, start, end);
            }else{
                multiSearchSqlStatement = search_multi_field(username, database, schema, table, groupIDColumn, currentSearchObj, start, end);
            }
        }else if(table === 'CATALOG_ITEMS' || table === 'CATALOG_ENTITY_LINEAGE'){
            if(isAdmin){
                privilegeLogic = caseAdmin;
            }else if(isSteward){
                privilegeLogic = caseSteward;
            }else{
                privilegeLogic = caseOperator;
            }
            multiSearchSqlStatement = search_ItemsLineage_joined_Entity_Domain(privilegeLogic, table, currentSearchObj); 
        }else if(table === 'DATA_STEWARD_DOMAIN'){
            multiSearchSqlStatement = search_composite_DATA_STEWARD_DOMAIN(currentSearchObj);
        }else if(table === 'CATALOG_ENTITY_DOMAIN'){
            multiSearchSqlStatement = search_composite_CATALOG_ENTITY_DOMAIN(currentSearchObj);
        }else if(table === 'CATALOG_ENTITIES'){
            if(isAdmin){
                privilegeLogic = caseAdmin;
            }else if(isSteward){
                privilegeLogic = caseSteward;
            }else{
                privilegeLogic = caseOperator;
            }
            multiSearchSqlStatement = search_CATALOG_ENTITIES_JOINED_DOMAIN(privilegeLogic, currentSearchObj);
        }else if(table === 'DATA_STEWARD'){
            if(isAdmin){
                privilegeLogic = caseAdmin;
            }else{
                privilegeLogic = `CASE
                    WHEN ec.EMAIL = UPPER(TRIM('` + username + `'))
                    THEN 'READ/WRITE'
                    ELSE 'READ ONLY'
                END AS PRIVILEGE`;
            }
            multiSearchSqlStatement = search_multi_field_catalog_DataSteward(privilegeLogic, database, schema, table, currentSearchObj, start, end);
        }else if(table === 'DATA_DOMAIN'){
            if(isAdmin){
                privilegeLogic = caseAdmin;
            }else{
                privilegeLogic = caseSteward;
            }
            multiSearchSqlStatement = search_multi_field_catalog_DataDomain(privilegeLogic, database, schema, table, currentSearchObj, start, end);
        }
            
        debug && console.log(multiSearchSqlStatement);

        return multiSearchSqlStatement;
    }

    return (
        Object.keys(currentSearchCriteria).length > 0 
            ?
            <div style={{ 
                'display': 'flex', 
                'float': 'left',
                "marginBottom": "10px"
            }}>
                <span style={{ 'fontWeight': 'bold', 'marginRight': '5px' }}>Filtered by: </span> 

                {Object.keys(currentSearchCriteria).map(col => {
                    let singleSearchObj = {
                        [col]: currentSearchCriteria[col]
                    };
                    
                    let searchStmt = singleSearch(singleSearchObj);

                    if((Object.keys(currentSearchCriteria)).indexOf(col) === (Object.keys(currentSearchCriteria)).length -1 ){
                        return(
                            <span 
                                key={col}
                                style={{ 'marginRight': '5px' }}
                            >
                                <a  style={{    
                                        color: '#007bff',
                                        // textDecoration: 'underline',
                                        backgroundColor: 'transparent',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() =>{
                                        setCurrentSearchCriteria(singleSearchObj);
                                        axiosCallToGetTableRows( searchStmt , uniqueKeysToSeparateRows );
                                    }}
                                >
                                    {col}: {currentSearchCriteria[col]}
                                </a>
                            </span>
                        )
                    }else{
                        return(
                            <span 
                                key={col}
                                style={{ 'marginRight': '5px' }}
                            >
                                <a
                                    style={{    
                                        color: '#007bff',
                                        // textDecoration: 'underline',
                                        backgroundColor: 'transparent',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() =>{
                                        // setLoading(true)
                                        axiosCallToGetTableRows( searchStmt , uniqueKeysToSeparateRows );
                                    }}
                                >
                                    {col}: {currentSearchCriteria[col]}
                                </a> >
                            </span>
                        )
                    }
                })} 
            </div>
            : null
    )
}

export default SearchFilter;