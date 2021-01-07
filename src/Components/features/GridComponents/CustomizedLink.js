import React, { useState, useEffect, useContext } from 'react';
import { useOktaAuth } from '@okta/okta-react';
import { WorkspaceContext } from '../../context/WorkspaceContext';
import { fieldTypesConfigs, TABLES_NON_EDITABLE_COLUMNS, DATA_CATALOG_TABLE } from '../../context/FieldTypesConfig';
import { Link } from "react-router-dom";
// import LinkLogo16 from '../../../media/LinkIcon/link16x16.svg';
import LinkLogo12 from '../../../media/LinkIcon/link12x12.svg';
import { getSearchFieldValue } from '../../sql_statements';

const CustomizedLink = ({ row }) => {
    const {
        debug, table
    } = useContext(WorkspaceContext);

    const linkedTablesObject = fieldTypesConfigs[table]['links'];
    
    const getStandardSearchStmt = (linkedTable, searchObj) => {
        let sql = `SELECT ec.*, 'READ ONLY' AS PRIVILEGE
        FROM "SHARED_TOOLS_DEV"."ETL"."` + linkedTable + `" ec
        WHERE ` + getSearchFieldValue(searchObj) + `
        ;`

        return sql;
    }

    const sql_linking_dataSteward_To_dataDomain = searchObj => {
        console.log('sql_linking_dataSteward_To_dataDomain...');
        console.log(searchObj);

        const sql = `SELECT C1.DATA_DOMAIN_ID, C.DOMAIN, C.DOMAIN_DESCRIPTIONS, C1.CREATEDDATE, C1.LASTMODIFIEDDATE, 'READ/WRITE' AS PRIVILEGE
        FROM
        (SELECT A.FNAME, A.LNAME, A.EMAIL, B.DATA_STEWARD_ID, B.DATA_DOMAIN_ID, B.CREATEDDATE, B.LASTMODIFIEDDATE
          FROM SHARED_TOOLS_DEV.ETL.DATA_STEWARD A
          INNER JOIN SHARED_TOOLS_DEV.ETL.DATA_STEWARD_DOMAIN B 
          ON A.DATA_STEWARD_ID = B.DATA_STEWARD_ID
          WHERE UPPER(TRIM(A.DATA_STEWARD_ID)) LIKE UPPER(TRIM('%` + searchObj['DATA_STEWARD_ID'] + `%'))) C1
        INNER JOIN SHARED_TOOLS_DEV.ETL.DATA_DOMAIN C
        ON C1.DATA_DOMAIN_ID = C.DATA_DOMAIN_ID;`

        // console.log(sql);

        return sql;
    }

    const sql_linking_dataDomain_To_dataSteward = searchObj => {
        console.log('sql_linking_dataDomain_To_dataSteward...');
        console.log(searchObj);

        const sql = `SELECT C.DOMAIN, C.DOMAIN_DESCRIPTIONS, C1.CREATEDDATE, C1.LASTMODIFIEDDATE, 'READ/WRITE' AS PRIVILEGE
        FROM
        (SELECT A.TARGET_DATABASE, A.TARGET_SCHEMA, A.TARGET_TABLE, B.CATALOG_ENTITIES_ID, B.DATA_DOMAIN_ID, B.CREATEDDATE, B.LASTMODIFIEDDATE
          FROM SHARED_TOOLS_DEV.ETL.CATALOG_ENTITIES A
          INNER JOIN SHARED_TOOLS_DEV.ETL.CATALOG_ENTITY_DOMAIN B 
          ON A.CATALOG_ENTITIES_ID = B.CATALOG_ENTITIES_ID
          WHERE UPPER(TRIM(A.CATALOG_ENTITIES_ID)) LIKE UPPER(TRIM('%` + searchObj['CATALOG_ENTITIES_ID'] + `%')) ) C1
        INNER JOIN SHARED_TOOLS_DEV.ETL.DATA_DOMAIN C
        ON C1.DATA_DOMAIN_ID = C.DATA_DOMAIN_ID;`

        // console.log(sql);

        return sql;
    }

    const sql_linking_catalogEntities_To_dataDomain = searchObj => {
        console.log('sql_linking_dataDomain_To_dataSteward...');
        console.log(searchObj);

        const sql = `SELECT C.DOMAIN, C.DOMAIN_DESCRIPTIONS, C1.CREATEDDATE, C1.LASTMODIFIEDDATE, 'READ/WRITE' AS PRIVILEGE
        FROM
        (SELECT A.TARGET_DATABASE, A.TARGET_SCHEMA, A.TARGET_TABLE, B.CATALOG_ENTITIES_ID, B.DATA_DOMAIN_ID, B.CREATEDDATE, B.LASTMODIFIEDDATE
          FROM SHARED_TOOLS_DEV.ETL.CATALOG_ENTITIES A
          INNER JOIN SHARED_TOOLS_DEV.ETL.CATALOG_ENTITY_DOMAIN B 
          ON A.CATALOG_ENTITIES_ID = B.CATALOG_ENTITIES_ID
          WHERE UPPER(TRIM(A.CATALOG_ENTITIES_ID)) LIKE UPPER(TRIM('%` + searchObj['CATALOG_ENTITIES_ID'] + `%')) ) C1
        INNER JOIN SHARED_TOOLS_DEV.ETL.DATA_DOMAIN C
        ON C1.DATA_DOMAIN_ID = C.DATA_DOMAIN_ID;`

        // console.log(sql);

        return sql;
    }

    const sql_linking_dataDomain_To_catalogEntities = searchObj => {
        console.log('sql_linking_dataDomain_To_catalogEntities...');
        console.log(searchObj);

        const sql = `SELECT C.TARGET_DATABASE, C.TARGET_SCHEMA, C.TARGET_TABLE, C.CATALOG_ENTITIES_ID, C1.CREATEDDATE, C1.LASTMODIFIEDDATE, 'READ/WRITE' AS PRIVILEGE
        FROM
        (SELECT A.DOMAIN, A.DOMAIN_DESCRIPTIONS, B.DATA_DOMAIN_ID, B.CATALOG_ENTITIES_ID,  B.CREATEDDATE, B.LASTMODIFIEDDATE
          FROM SHARED_TOOLS_DEV.ETL.DATA_DOMAIN A
          INNER JOIN SHARED_TOOLS_DEV.ETL.CATALOG_ENTITY_DOMAIN B 
          ON A.DATA_DOMAIN_ID = B.DATA_DOMAIN_ID
          WHERE UPPER(TRIM(A.DATA_DOMAIN_ID)) LIKE UPPER(TRIM('%` + searchObj['DATA_DOMAIN_ID'] + `%')) ) C1
        INNER JOIN SHARED_TOOLS_DEV.ETL.CATALOG_ENTITIES C
        ON C1.CATALOG_ENTITIES_ID = C.CATALOG_ENTITIES_ID;`

        // console.log(sql);

        return sql;
    }


    return(
        <div>
            {(Object.keys(linkedTablesObject)).map(linkedTable => {
                // console.log("linked table: " + linkedTable)
                const criteria = linkedTablesObject[linkedTable];
                // console.log("search columns: " + criteria);

                let searchObj = {};
                searchObj[criteria] = row[criteria];
                console.log(searchObj);

                let searchStmt = '';
                if(table === 'DATA_STEWARD'){
                    searchStmt = sql_linking_dataSteward_To_dataDomain(searchObj);
                }else if(table === 'DATA_DOMAIN'){
                    if(linkedTable === 'DATA_STEWARD')
                        searchStmt = sql_linking_dataDomain_To_dataSteward(searchObj);
                    else if(linkedTable === 'CATALOG_ENTITIES' )
                        searchStmt = sql_linking_dataDomain_To_catalogEntities(searchObj);
                }else if(table === 'CATALOG_ENTITIES'){
                    if(linkedTable === 'CATALOG_ITEMS'  || linkedTable === 'CATALOG_ENTITY_LINEAGE')
                        searchStmt =  getStandardSearchStmt(linkedTable, searchObj);
                    else if(linkedTable === 'DATA_DOMAIN')
                        searchStmt = sql_linking_catalogEntities_To_dataDomain(searchObj);
                }else if(table === 'CATALOG_ITEMS'  || table === 'CATALOG_ENTITY_LINEAGE')
                    searchStmt =  getStandardSearchStmt(linkedTable, searchObj);
                
                console.log(searchStmt);

                return(
                    <div>
                        <Link 
                            to={{
                                pathname: '/datacataloglinked',
                                state: {
                                    'table': linkedTable,
                                    'searchObj': searchObj,
                                    'searchStmt': searchStmt,
                                }
                            }}
                        >
                            <img 
                                style={{'float': 'left'}} 
                                src={LinkLogo12} 
                                alt="React Logo" 
                                title={'This will link to table ' + linkedTable}
                            /> Link to table {linkedTable}
                        </Link>
                    </div>
                )
            })}
        </div>
    )
}

export default CustomizedLink;