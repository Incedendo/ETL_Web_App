import React, { useState, useEffect, useContext } from 'react';
import { useOktaAuth } from '@okta/okta-react';
import { WorkspaceContext } from '../../context/WorkspaceContext';
import { AdminContext } from '../../context/AdminContext';
import { fieldTypesConfigs, TABLES_NON_EDITABLE_COLUMNS, DATA_CATALOG_TABLE } from '../../context/FieldTypesConfig';
import { Link } from "react-router-dom";
// import LinkLogo16 from '../../../media/LinkIcon/link16x16.svg';
import LinkLogo12 from '../../../media/LinkIcon/link12x12.svg';
import { getSearchFieldValueExact } from '../../sql_statements';
import { steps } from '../../context/privilege';
const startingLo = 1;
const startingHi = steps;

const selectCount = `SELECT COUNT(*) as COUNT`;
const caseAdmin = `'READ/WRITE' as PRIVILEGE`;

const sql_linking_Lineage_To_ETLF_Extract_Config = value => {

    const body = `
    FROM "SHARED_TOOLS_DEV"."ETL"."ETLF_EXTRACT_CONFIG" EC
    LEFT JOIN "SHARED_TOOLS_DEV"."ETL"."ETLF_ACCESS_AUTHORIZATION" A
    ON EC.GROUP_ID = A.APP_ID
    WHERE UPPER(TRIM(EC.EXTRACT_CONFIG_ID)) = UPPER(TRIM('`+ value + `'))`;

    return body
}

const sql_linking_dataSteward_To_dataDomain = value => {

    const body = `
    FROM SHARED_TOOLS_DEV.ETL.DATA_DOMAIN DD
    INNER JOIN SHARED_TOOLS_DEV.ETL.DATA_STEWARD_DOMAIN DSD 
    ON DD.DATA_DOMAIN_ID = DSD.DATA_DOMAIN_ID
    INNER JOIN SHARED_TOOLS_DEV.ETL.DATA_STEWARD DS
    ON DSD.DATA_STEWARD_ID = DS.DATA_STEWARD_ID
    WHERE UPPER(TRIM(DS.DATA_STEWARD_ID)) = UPPER(TRIM('` + value + `'))
    `

    return body;
}

const sql_linking_dataDomain_To_dataSteward = value => {

    const body = `
    FROM SHARED_TOOLS_DEV.ETL.DATA_STEWARD DS
    INNER JOIN SHARED_TOOLS_DEV.ETL.DATA_STEWARD_DOMAIN DSD 
    ON DS.DATA_STEWARD_ID = DSD.DATA_STEWARD_ID
    INNER JOIN SHARED_TOOLS_DEV.ETL.DATA_DOMAIN DD
    ON DD.DATA_DOMAIN_ID = DSD.DATA_DOMAIN_ID
    WHERE UPPER(TRIM(DD.DATA_DOMAIN_ID)) = UPPER(TRIM('` + value + `'))
    `;

    return body;
}

const sql_linking_dataDomain_To_catalogEntities = value => {
    const body = `
    FROM SHARED_TOOLS_DEV.ETL.CATALOG_ENTITIES E
    LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.CATALOG_ENTITY_DOMAIN B 
    ON (E.CATALOG_ENTITIES_ID = B.CATALOG_ENTITIES_ID)
    LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.DATA_DOMAIN C
    ON (B.DATA_DOMAIN_ID = C.DATA_DOMAIN_ID )
    WHERE UPPER(TRIM(C.DATA_DOMAIN_ID)) = UPPER(TRIM('` + value + `'))`;

    return body;
}

const sql_linking_catalogEntities_To_dataDomain = value => {

    const body = `
    FROM SHARED_TOOLS_DEV.ETL.DATA_DOMAIN DD
    LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.CATALOG_ENTITY_DOMAIN B 
    ON (DD.DATA_DOMAIN_ID = B.DATA_DOMAIN_ID)
    WHERE UPPER(TRIM(B.CATALOG_ENTITIES_ID)) = UPPER(TRIM('` + value + `'))`;

    return body;
}

//missing domain
const sql_linking_catalogEntities_To_Item_Lineage = (value, destination) => {

    const body = ` 
    FROM SHARED_TOOLS_DEV.ETL.` + destination + ` D
    INNER JOIN (
        SELECT TARGET_DATABASE, TARGET_SCHEMA, TARGET_TABLE, CATALOG_ENTITIES_ID
        FROM SHARED_TOOLS_DEV.ETL.CATALOG_ENTITIES
        WHERE UPPER(TRIM(CATALOG_ENTITIES_ID)) = UPPER(TRIM('` + value + `'))
    )C2
    ON C2.CATALOG_ENTITIES_ID = D.CATALOG_ENTITIES_ID
    WHERE C2.CATALOG_ENTITIES_ID = '` + value + `'`;

    return body;
}

const sql_linking_ItemsLineage_To_CatalogEntities = value => {

    const sql = `
    FROM (
        SELECT * 
        FROM SHARED_TOOLS_DEV.ETL.CATALOG_ENTITIES
        WHERE UPPER(TRIM(CATALOG_ENTITIES_ID)) = UPPER(TRIM('` + value + `'))
    )`;
    
    return sql;
}

const sql_linking_ETLF_Extract_Config_To_catalogEntityLineage = value => {

    const body = `
    FROM "SHARED_TOOLS_DEV"."ETL"."CATALOG_ENTITY_LINEAGE" A
    INNER JOIN (
        SELECT TARGET_TABLE, CATALOG_ENTITIES_ID
        FROM (
            SELECT *
            FROM SHARED_TOOLS_DEV.ETL.CATALOG_ENTITIES
        ) 
    ) D
    ON A.CATALOG_ENTITIES_ID = D.CATALOG_ENTITIES_ID
    WHERE UPPER(TRIM(A.EXTRACT_CONFIG_ID)) = UPPER(TRIM('` + value + `'))`

    return body;
}

const getBodyAndSelectCriteria = (username, table, destinationTable, value) => {
    let privilegeLogic = '';
    let selectCriteria = '';
    let body = '';

    const caseSteward = `CASE
        WHEN DS.EMAIL = UPPER(TRIM('` + username + `'))
        THEN 'READ/WRITE'
        ELSE 'READ ONLY'
    END AS PRIVILEGE`;

    if(table === 'ETLF_EXTRACT_CONFIG'){
        // selectCriteria = 'SELECT D.TARGET_DATABASE, D.TARGET_SCHEMA, D.TARGET_TABLE, A.*, row_number() OVER(ORDER BY A.CATALOG_ENTITY_LINEAGE_ID ASC) RN'
        selectCriteria = 'SELECT A.*, D.TARGET_TABLE, row_number() OVER(ORDER BY A.CATALOG_ENTITY_LINEAGE_ID ASC) RN'
        
        body = sql_linking_ETLF_Extract_Config_To_catalogEntityLineage(value);
    }if(table === 'ETLF_CUSTOM_CODE'){
        selectCriteria = 'SELECT *, row_number() OVER(ORDER BY EXTRACT_CONFIG_ID ASC) RN';
        body = sql_linking_Lineage_To_ETLF_Extract_Config(value);
    }else if(table === 'DATA_STEWARD'){
    
        selectCriteria = 'SELECT DD.*, ' + caseSteward + ', row_number() OVER(ORDER BY DD.DATA_DOMAIN_ID ASC) RN ';
        body = sql_linking_dataSteward_To_dataDomain(value);
        //
    }else if(table === 'DATA_STEWARD_DOMAIN'){

        if(destinationTable === 'DATA_STEWARD'){
            selectCriteria = `SELECT DS.*, ` + caseSteward + `, row_number() OVER(ORDER BY DS.DATA_STEWARD_ID ASC) RN`;
            body = sql_linking_dataDomain_To_dataSteward(value);
            //
        }else if(destinationTable === 'DATA_DOMAIN' ){
            selectCriteria = 'SELECT DD.*, row_number() OVER(ORDER BY DD.DATA_DOMAIN_ID ASC) RN ';
            body = sql_linking_dataSteward_To_dataDomain(value);
        }   //
    }else if(table === 'CATALOG_ENTITY_DOMAIN'){
        if(destinationTable === 'DATA_DOMAIN'){
            selectCriteria = `SELECT DD.*, ` + privilegeLogic + `, row_number() OVER(ORDER BY DD.DATA_DOMAIN_ID ASC) RN`
            body = sql_linking_catalogEntities_To_dataDomain(value);
            //
        }else if(destinationTable === 'CATALOG_ENTITIES' ){
            selectCriteria = `SELECT E.*, row_number() OVER(ORDER BY E.CATALOG_ENTITIES_ID ASC) RN`
            body = sql_linking_dataDomain_To_catalogEntities(value); 
            //
        }
    }else if(table === 'DATA_DOMAIN'){
        if(destinationTable === 'DATA_STEWARD'){
            selectCriteria = `SELECT DS.*, ` + caseSteward + `, row_number() OVER(ORDER BY DS.DATA_STEWARD_ID ASC) RN`;
            body = sql_linking_dataDomain_To_dataSteward(value);
            //
        }
        else if(destinationTable === 'CATALOG_ENTITIES' ){
            selectCriteria = `SELECT E.*, row_number() OVER(ORDER BY E.CATALOG_ENTITIES_ID ASC) RN`
            body = sql_linking_dataDomain_To_catalogEntities(value);
            //
        }
    }else if(table === 'CATALOG_ENTITIES'){
        if(destinationTable === 'CATALOG_ITEMS' || destinationTable === 'CATALOG_ENTITY_LINEAGE'){
            selectCriteria = `SELECT C2.*, D.*, row_number() OVER(ORDER BY D.CATALOG_ENTITIES_ID ASC) RN`;
            body =  sql_linking_catalogEntities_To_Item_Lineage(value, destinationTable); 
            //
        }else if(destinationTable === 'DATA_DOMAIN'){
            selectCriteria = `SELECT DD.*, row_number() OVER(ORDER BY DD.DATA_DOMAIN_ID ASC) RN`
            body = sql_linking_catalogEntities_To_dataDomain(value);
            //
        }
    }else if(table === 'CATALOG_ITEMS'){
        // privilegeLogic = getPrivilege3cases(isAdmin, isSteward, username);
        selectCriteria = `SELECT *, row_number() OVER(ORDER BY CATALOG_ENTITIES_ID ASC) RN`;
        body = sql_linking_ItemsLineage_To_CatalogEntities(value);
        //
    }else if(table === 'CATALOG_ENTITY_LINEAGE'){
        if(destinationTable === 'CATALOG_ENTITIES'){
            // privilegeLogic = getPrivilege3cases(isAdmin, isSteward, username);
            selectCriteria = `SELECT *, row_number() OVER(ORDER BY CATALOG_ENTITIES_ID ASC) RN`;
            body = sql_linking_ItemsLineage_To_CatalogEntities(value);
            //
        }else if(destinationTable === 'ETLF_EXTRACT_CONFIG'){
            selectCriteria = `SELECT EC.*, COALESCE(A.PRIVILEGE, 'READ ONLY') AS PRIVILEGE, row_number() OVER(ORDER BY EC.EXTRACT_CONFIG_ID ASC) RN`;
            body = sql_linking_Lineage_To_ETLF_Extract_Config(value);
        }
    }

    

    const res = {
        selectCriteria: selectCriteria,
        bodySQL: body
    }

    return res;
}


const CustomizedLink = ({ row }) => {
    const {
        debug, username , table, setSelectAllStmtEveryX
    } = useContext(WorkspaceContext);

    const { isAdmin, isSteward } = useContext(AdminContext);

    const linkedTablesObject = fieldTypesConfigs[table]['links'];

    const getLinkedValue = () => {
        let value = ''
        debug && console.log(row);
        switch(table){
            case 'ETLF_EXTRACT_CONFIG':
                value = 'EXTRACT_CONFIG_ID - ' + row['EXTRACT_CONFIG_ID'];
                break;
            case 'ETLF_CUSTOM_CODE':
                value = 'CUSTOM_CODE_ID - ' + row['CUSTOM_CODE_ID'];
                break;
            case 'DATA_DOMAIN':
                value = 'DOMAIN - ' + row['DOMAIN'];
                break;
            case 'DATA_STEWARD':
                value = 'STEWARD - ' + row['FNAME'] + ' ' + row['LNAME'] + ': ' + row['EMAIL'];
                break;
            case 'DATA_STEWARD_DOMAIN':
                break;
            case 'CATALOG_ENTITY_DOMAIN':
                value = row['DOMAIN'] + ' - ' + row['TARGET_DATABASE'] + ' - ' + row['TARGET_SCHEMA'] + ' - ' + row['TARGET_TABLE'];
                break;
            case 'CATALOG_ENTITIES':
                value = 'ENTITY - ' + row['TARGET_DATABASE'] + ' - ' + row['TARGET_SCHEMA'] + ' - ' + row['TARGET_TABLE'];
                break;
            case 'CATALOG_ITEMS':
                value = 'ITEM - ' + row['COLUMN_NAME'];
                break;
            case 'CATALOG_ENTITY_LINEAGE':
                value = 'EXTRACT_CONFIG_ID - ' + row['EXTRACT_CONFIG_ID'];
                break;
            default:
                break;
        }

        debug && console.log(value);
        return value;
    }

    return(
        <div style={{'marginTop': '30px'}}>
            {(Object.keys(linkedTablesObject)).map(destinationTable => {
                // console.log("linked table: " + destinationTable)
                const criteria = linkedTablesObject[destinationTable];
                // console.log("search columns: " + criteria);

                let searchObj = {};
                searchObj[criteria] = row[criteria];
                // console.log(searchObj);
                
                //new CODE
                const bodyAndSelectCriteria = getBodyAndSelectCriteria(username, table, destinationTable, row[criteria]);
                const selectCriteria = bodyAndSelectCriteria['selectCriteria'];
                const bodySQL = bodyAndSelectCriteria['bodySQL'];  

                debug && console.log(selectCriteria);
                debug && console.log(bodySQL);

                const getRowsCountStmt = selectCount + bodySQL;
                const linkingSqlStatement = `SELECT * FROM (
                    ` + selectCriteria + `
                    ` + bodySQL + `    
                )
                `;
                setSelectAllStmtEveryX(linkingSqlStatement);
                const linkingSqlStatementFirstX = linkingSqlStatement +`
                WHERE RN >= ` + startingLo +` AND RN <= ` + startingHi;
                //also had to join 3 tables entities to domain
                
                debug && console.log(getRowsCountStmt);
                debug && console.log(linkingSqlStatementFirstX);
                debug && console.log("\n***************************************************************\n")

                return(
                    <div style={{'marginBottom': '10px'}}>
                        <Link 
                            to={{
                                // pathname: '/datacataloglinked',
                                pathname: DATA_CATALOG_TABLE.indexOf(destinationTable) >= 0 ? '/datacatalog' : '/etlframework',
                                state: {
                                    'table': destinationTable,
                                    // 'searchStmt': searchStmt,
                                    'countStmt': getRowsCountStmt,
                                    'searchStmt': linkingSqlStatementFirstX,
                                    'filterState': {
                                        'table': table,
                                        'value': getLinkedValue()
                                    }
                                }
                            }}
                        >
                            <img 
                                style={{'float': 'left'}} 
                                src={LinkLogo12} 
                                alt="React Logo" 
                                title={'This will link to table ' + destinationTable}
                            /> Link to table {destinationTable}
                        </Link>
                    </div>
                )
            })}
        </div>
    )
}

export default CustomizedLink;