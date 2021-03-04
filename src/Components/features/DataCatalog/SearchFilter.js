import React, { useState, useEffect, useContext } from 'react';
import { WorkspaceContext } from '../../context/WorkspaceContext';
import { AdminContext } from '../../context/AdminContext';
import { fieldTypesConfigs, ETLF_tables } from '../../context/FieldTypesConfig';
import { 
    getSearchFieldValue, search_multi_field, 
    search_multi_field_catalog_DataSteward,
    search_multi_field_catalog_DataDomain,
    search_ItemsLineage,
    // search_ItemsLineage_joined_Entity_Domain, 
    search_composite_DATA_STEWARD_DOMAIN, 
    search_composite_CATALOG_ENTITY_DOMAIN ,
    search_CATALOG_ENTITIES_JOINED_DOMAIN
} from '../../sql_statements';
import { startingLo, selectCount, caseAdmin, caseOperator } from '../../context/privilege';

const SearchFilter= ({ currentSearchCriteria, setCurrentSearchCriteria }) =>{
    const {
        debug, username ,
        database, schema, table, 
        steps,
        axiosCallToGetCountsAndTableRows,
        setSelectAllStmtEveryX
    } = useContext(WorkspaceContext);

    const { isAdmin, isSteward } = useContext(AdminContext);

    const caseSteward = `CASE
        WHEN DS.EMAIL = UPPER(TRIM('` + username + `'))
        THEN 'READ/WRITE'
        ELSE 'READ ONLY'
    END AS PRIVILEGE`;

    console.log(table);
    const uniqueKeysToSeparateRows = fieldTypesConfigs[table]['primaryKeys'];


    const getSingleSearchObj = (currentSearchObj) => {
        console.log(table);
        let bodySQL = ``;
        let selectCriteria = ``;

        console.log(currentSearchObj);
        // return;

        
        let multiSearchSqlStatement = '';
        if(ETLF_tables.indexOf(table) >= 0){
            // console.log("table is in ETLF Framework");
            const groupIDColumn = table === "ETLF_EXTRACT_CONFIG" ? 'GROUP_ID' : 'WORK_GROUP_ID'
            if(table === 'ETLF_CUSTOM_CODE'){
                bodySQL = `
                FROM "SHARED_TOOLS_DEV"."ETL"."ETLF_CUSTOM_CODE" EC
                INNER JOIN "SHARED_TOOLS_DEV"."ETL"."ETLF_EXTRACT_CONFIG" EEC
                ON (EC.EXTRACT_CONFIG_ID = EEC.EXTRACT_CONFIG_ID)
                LEFT JOIN "SHARED_TOOLS_DEV"."ETL"."ETLF_ACCESS_AUTHORIZATION" EAA
                ON (EEC.GROUP_ID = EAA.APP_ID)
                WHERE ` + getSearchFieldValue(currentSearchObj);

                selectCriteria = `SELECT EEC.SOURCE_TABLE, EC.*, COALESCE (EAA.PRIVILEGE, 'READ ONLY') AS PRIVILEGE, , row_number() OVER(ORDER BY EEC.EXTRACT_CONFIG_ID ASC) RN`;
            }
            else if(table === 'ETLFCALL' && ('GROUP_ID' in currentSearchObj) ){

                //update 'GROUP_ID'  to 'WORK_GROUP_ID' in searchObject
                let newSearchObj = {}
                Object.keys(currentSearchObj).map(col => col !== 'GROUP_ID' 
                    ? newSearchObj[col] = currentSearchObj[col]
                    : newSearchObj['WORK_GROUP_ID'] = currentSearchObj[col]
                )
                selectCriteria = `SELECT ec.*, ec.WORK_GROUP_ID AS GROUP_ID, COALESCE (auth.PRIVILEGE, 'READ ONLY') AS PRIVILEGE,
                row_number() OVER(ORDER BY ec.`+ groupIDColumn +` ASC) rn`;
                bodySQL = search_multi_field(username, database, schema, table, groupIDColumn, newSearchObj);
            }else{
                selectCriteria = `SELECT ec.*, COALESCE (auth.PRIVILEGE, 'READ ONLY') AS PRIVILEGE,
                row_number() OVER(ORDER BY ec.`+ groupIDColumn +` ASC) rn`;
                bodySQL = search_multi_field(username, database, schema, table, groupIDColumn, currentSearchObj);
            }
        }else if(table === 'CATALOG_ITEMS' || table === 'CATALOG_ENTITY_LINEAGE'){
            // if(isAdmin){
            //     privilegeLogic = caseAdmin;
            // }else if(isSteward){
            //     privilegeLogic = caseSteward;
            // }else{
            //     privilegeLogic = caseOperator;
            // }
            selectCriteria =`SELECT *`
            bodySQL = search_ItemsLineage(table, currentSearchObj); 
        }else if(table === 'DATA_STEWARD_DOMAIN'){
            selectCriteria = `SELECT C1.FNAME, C1.LNAME, C1.EMAIL, C1.DATA_STEWARD_ID, C1.DATA_DOMAIN_ID, C.DOMAIN, C.DOMAIN_DESCRIPTIONS, C1.CREATEDDATE, C1.LASTMODIFIEDDATE, row_number() OVER(ORDER BY C1.DATA_STEWARD_ID ASC) RN`;
            multiSearchSqlStatement = search_composite_DATA_STEWARD_DOMAIN(currentSearchObj);
        }else if(table === 'CATALOG_ENTITY_DOMAIN'){
            selectCriteria = `SELECT C1.TARGET_DATABASE, C1.TARGET_SCHEMA, C1.TARGET_TABLE, C1.CATALOG_ENTITIES_ID, C1.DATA_DOMAIN_ID, C.DOMAIN, C.DOMAIN_DESCRIPTIONS, C1.CREATEDDATE, C1.LASTMODIFIEDDATE, row_number() OVER(ORDER BY C1.CATALOG_ENTITIES_ID ASC) RN`;
            multiSearchSqlStatement = search_composite_CATALOG_ENTITY_DOMAIN(currentSearchObj);
        }else if(table === 'CATALOG_ENTITIES'){
            // if(isAdmin){
            //     privilegeLogic = caseAdmin;
            // }else if(isSteward){
            //     privilegeLogic = caseSteward;
            // }else{
            //     privilegeLogic = caseOperator;
            // }
            selectCriteria = `SELECT *`;
            bodySQL = search_CATALOG_ENTITIES_JOINED_DOMAIN(currentSearchObj);
        }else if(table === 'DATA_STEWARD'){
            // if(isAdmin){
            //     privilegeLogic = caseAdmin;
            // }else{
            //     privilegeLogic = `CASE
            //         WHEN ec.EMAIL = UPPER(TRIM('` + username + `'))
            //         THEN 'READ/WRITE'
            //         ELSE 'READ ONLY'
            //     END AS PRIVILEGE`;
            // }
            selectCriteria = `SELECT *`;
            bodySQL = search_multi_field_catalog_DataSteward(currentSearchObj);
        }else if(table === 'DATA_DOMAIN'){
            // if(isAdmin){
            //     privilegeLogic = caseAdmin;
            // }else{
            //     privilegeLogic = caseSteward;
            // }
            selectCriteria = `SELECT *`;
            bodySQL = search_multi_field_catalog_DataDomain(isAdmin, caseSteward, currentSearchObj);
        }
            
        debug && console.log(multiSearchSqlStatement);

        let res = {
            bodySQL: bodySQL,
            selectCriteria: selectCriteria
        }
        return res;
    }

    const SearchFilterItem = ({col, singleSearchObj, getRowsCount, singleSearchSqlStatementFirstX, separatorStr}) =>
        (
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
                        axiosCallToGetCountsAndTableRows(getRowsCount, singleSearchSqlStatementFirstX, uniqueKeysToSeparateRows);
        
                        // axiosCallToGetTableRows( searchStmt , uniqueKeysToSeparateRows );
                    }}
                >
                    {col}: {currentSearchCriteria[col]}
                </a>{separatorStr}
            </span>
        )
    
    const Filters = () => {
        return (
            Object.keys(currentSearchCriteria).map((col, index) => {
            let singleSearchObj = {
                [col]: currentSearchCriteria[col]
            };
            
            // let searchStmt = singleSearch(singleSearchObj);

            const sqlObj = getSingleSearchObj(singleSearchObj);
            const bodySQL = sqlObj.bodySQL;
            const selectCriteria = sqlObj.selectCriteria;

            const getRowsCount = selectCount + bodySQL;
            const singleSearchSqlStatement = `SELECT * FROM (\n` 
                + selectCriteria + `\n` 
                + bodySQL + `\n)`;
            setSelectAllStmtEveryX(singleSearchSqlStatement);
            const singleSearchSqlStatementFirstX = singleSearchSqlStatement +
            `\nWHERE RN >= ` + startingLo +` AND RN <= ` + steps;
            
            
            const criteria_length = (Object.keys(currentSearchCriteria)).length;
            console.log(index, col);
            if(index === criteria_length-1)
                return <SearchFilterItem key={col}
                    col={col}
                    singleSearchObj={singleSearchObj}
                    getRowsCount={getRowsCount}
                    singleSearchSqlStatementFirstX={singleSearchSqlStatementFirstX}
                    separatorStr={""}
                /> 
            else 
                return <SearchFilterItem key={col}
                    col={col}
                    singleSearchObj={singleSearchObj}
                    getRowsCount={getRowsCount}
                    singleSearchSqlStatementFirstX={singleSearchSqlStatementFirstX}
                    separatorStr={">"}
                />
            })
        )
    }

    return (
        <div>
            {Object.keys(currentSearchCriteria).length > 0 
            ?
            <div style={{ 
                'display': 'flex', 
                'float': 'left',
                "marginBottom": "10px"
            }}>
                <span style={{ 'fontWeight': 'bold', marginLeft:'0px', 'marginRight': '5px' }}>Filtered by: </span> 

                <Filters />
            </div>
            : null}
        </div>
    )
}

export default SearchFilter;