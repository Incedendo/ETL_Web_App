import React, { useState, useEffect, useContext } from 'react';
import { useOktaAuth } from '@okta/okta-react';
import { WorkspaceContext } from '../../context/WorkspaceContext';
import { fieldTypesConfigs, TABLES_NON_EDITABLE_COLUMNS, DATA_CATALOG_TABLE } from '../../context/FieldTypesConfig';
import { Link } from "react-router-dom";
// import LinkLogo16 from '../../../media/LinkIcon/link16x16.svg';
import LinkLogo12 from '../../../media/LinkIcon/link12x12.svg';
import { getSearchFieldValue } from '../../sql_statements';

const getStandardSearchStmt = (destinationTable, searchObj) => {
    let sql = `SELECT ec.*, 'READ/WRITE' AS PRIVILEGE
    FROM "SHARED_TOOLS_DEV"."ETL"."` + destinationTable + `" ec
    WHERE ` + getSearchFieldValue(searchObj) + `
    ;`

    return sql;
}

const sql_linking_dataSteward_To_dataDomain = searchObj => {
    console.log('sql_linking_dataSteward_To_dataDomain...');
    console.log(searchObj);

    // const sql = `SELECT C1.DATA_DOMAIN_ID, C.DOMAIN, C.DOMAIN_DESCRIPTIONS, C1.CREATEDDATE, C1.LASTMODIFIEDDATE, 'READ/WRITE' AS PRIVILEGE
    // FROM
    // (SELECT A.FNAME, A.LNAME, A.EMAIL, B.DATA_STEWARD_ID, B.DATA_DOMAIN_ID, B.CREATEDDATE, B.LASTMODIFIEDDATE
    //   FROM SHARED_TOOLS_DEV.ETL.DATA_STEWARD A
    //   INNER JOIN SHARED_TOOLS_DEV.ETL.DATA_STEWARD_DOMAIN B 
    //   ON A.DATA_STEWARD_ID = B.DATA_STEWARD_ID
    //   WHERE UPPER(TRIM(A.DATA_STEWARD_ID)) LIKE UPPER(TRIM('%` + searchObj['DATA_STEWARD_ID'] + `%'))) C1
    // INNER JOIN SHARED_TOOLS_DEV.ETL.DATA_DOMAIN C
    // ON C1.DATA_DOMAIN_ID = C.DATA_DOMAIN_ID;`

    const sql = `SELECT A.*, 'READ/WRITE' AS PRIVILEGE
    FROM SHARED_TOOLS_DEV.ETL.DATA_DOMAIN A
    INNER JOIN SHARED_TOOLS_DEV.ETL.DATA_STEWARD_DOMAIN B 
    ON A.DATA_DOMAIN_ID = B.DATA_DOMAIN_ID
    INNER JOIN SHARED_TOOLS_DEV.ETL.DATA_STEWARD C
    ON C.DATA_STEWARD_ID = B.DATA_STEWARD_ID
    WHERE UPPER(TRIM(C.DATA_STEWARD_ID)) LIKE UPPER(TRIM('%` + searchObj['DATA_STEWARD_ID'] + `%'));`

    // console.log(sql);

    return sql;
}

const sql_linking_dataDomain_To_dataSteward = searchObj => {
    console.log('sql_linking_dataDomain_To_dataSteward...');
    console.log(searchObj);

    // const sql = `SELECT C.FNAME, C.LNAME, C.EMAIL, C.DATA_STEWARD_ID, C1.CREATEDDATE, C1.LASTMODIFIEDDATE, 'READ/WRITE' AS PRIVILEGE
    // FROM
    // (SELECT A.DOMAIN, A.DOMAIN_DESCRIPTIONS, B.DATA_DOMAIN_ID, B.DATA_STEWARD_ID, B.CREATEDDATE, B.LASTMODIFIEDDATE
    //   FROM SHARED_TOOLS_DEV.ETL.DATA_DOMAIN A
    //   INNER JOIN SHARED_TOOLS_DEV.ETL.DATA_STEWARD_DOMAIN B 
    //   ON A.DATA_DOMAIN_ID = B.DATA_DOMAIN_ID
    //   WHERE UPPER(TRIM(A.DATA_DOMAIN_ID)) LIKE UPPER(TRIM('%` + searchObj['DATA_DOMAIN_ID'] + `%')) ) C1
    // INNER JOIN SHARED_TOOLS_DEV.ETL.DATA_STEWARD C
    // ON C1.DATA_STEWARD_ID = C.DATA_STEWARD_ID;`

    const sql = `SELECT A.*, 'READ/WRITE' AS PRIVILEGE
    FROM SHARED_TOOLS_DEV.ETL.DATA_STEWARD A
    INNER JOIN SHARED_TOOLS_DEV.ETL.DATA_STEWARD_DOMAIN B 
    ON A.DATA_STEWARD_ID = B.DATA_STEWARD_ID
    INNER JOIN SHARED_TOOLS_DEV.ETL.DATA_DOMAIN C
    ON C.DATA_DOMAIN_ID = B.DATA_DOMAIN_ID
    WHERE UPPER(TRIM(C.DATA_DOMAIN_ID)) LIKE UPPER(TRIM('%` + searchObj['DATA_DOMAIN_ID'] + `%'))
    ;`

    console.log(sql);

    return sql;
}

const sql_linking_dataDomain_To_catalogEntities = searchObj => {
    console.log('sql_linking_dataDomain_To_catalogEntities...');
    console.log(searchObj);

    // const sql = `SELECT C1. DOMAIN, C.TARGET_DATABASE, C.TARGET_SCHEMA, C.TARGET_TABLE, C.COMMENTS, C.CATALOG_ENTITIES_ID, C1.CREATEDDATE, C1.LASTMODIFIEDDATE, 'READ/WRITE' AS PRIVILEGE
    // FROM
    // (SELECT A.DOMAIN, A.DOMAIN_DESCRIPTIONS, B.DATA_DOMAIN_ID, B.CATALOG_ENTITIES_ID,  B.CREATEDDATE, B.LASTMODIFIEDDATE
    //   FROM SHARED_TOOLS_DEV.ETL.DATA_DOMAIN A
    //   INNER JOIN SHARED_TOOLS_DEV.ETL.CATALOG_ENTITY_DOMAIN B 
    //   ON A.DATA_DOMAIN_ID = B.DATA_DOMAIN_ID
    //   WHERE UPPER(TRIM(A.DATA_DOMAIN_ID)) LIKE UPPER(TRIM('%` + searchObj['DATA_DOMAIN_ID'] + `%')) ) C1
    // INNER JOIN SHARED_TOOLS_DEV.ETL.CATALOG_ENTITIES C
    // ON C1.CATALOG_ENTITIES_ID = C.CATALOG_ENTITIES_ID;`

    const sql = `SELECT C.DOMAIN, E.* 
    FROM SHARED_TOOLS_DEV.ETL.CATALOG_ENTITIES E
    LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.CATALOG_ENTITY_DOMAIN B 
    ON (E.CATALOG_ENTITIES_ID = B.CATALOG_ENTITIES_ID)
    LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.DATA_DOMAIN C
    ON (B.DATA_DOMAIN_ID = C.DATA_DOMAIN_ID )
    WHERE UPPER(TRIM(C.DATA_DOMAIN_ID)) LIKE UPPER(TRIM('%` + searchObj['DATA_DOMAIN_ID'] + `%'));`

    // console.log(sql);

    return sql;
}

const sql_linking_catalogEntities_To_dataDomain = searchObj => {
    console.log('sql_linking_catalogEntities_To_dataDomain...');
    console.log(searchObj);

    // const sql = `SELECT C.DOMAIN, C.DOMAIN_DESCRIPTIONS, C.DATA_DOMAIN_ID, C1.CREATEDDATE, C1.LASTMODIFIEDDATE, 'READ/WRITE' AS PRIVILEGE
    // FROM
    // (SELECT A.TARGET_DATABASE, A.TARGET_SCHEMA, A.TARGET_TABLE, B.CATALOG_ENTITIES_ID, B.DATA_DOMAIN_ID, B.CREATEDDATE, B.LASTMODIFIEDDATE
    //   FROM SHARED_TOOLS_DEV.ETL.CATALOG_ENTITIES A
    //   INNER JOIN SHARED_TOOLS_DEV.ETL.CATALOG_ENTITY_DOMAIN B 
    //   ON A.CATALOG_ENTITIES_ID = B.CATALOG_ENTITIES_ID
    //   WHERE UPPER(TRIM(A.CATALOG_ENTITIES_ID)) LIKE UPPER(TRIM('%` + searchObj['CATALOG_ENTITIES_ID'] + `%')) ) C1
    // INNER JOIN SHARED_TOOLS_DEV.ETL.DATA_DOMAIN C
    // ON C1.DATA_DOMAIN_ID = C.DATA_DOMAIN_ID;`

    const sql = `SELECT E.* 
    FROM SHARED_TOOLS_DEV.ETL.DATA_DOMAIN E
    LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.CATALOG_ENTITY_DOMAIN B 
    ON (E.DATA_DOMAIN_ID = B.DATA_DOMAIN_ID)
    LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.CATALOG_ENTITIES C
    ON (B.CATALOG_ENTITIES_ID = C.CATALOG_ENTITIES_ID )
    WHERE UPPER(TRIM(C.CATALOG_ENTITIES_ID)) LIKE UPPER(TRIM('%` + searchObj['CATALOG_ENTITIES_ID'] + `%'));`

    console.log(sql);

    return sql;
}

//missing domain
const sql_linking_catalogEntities_To_Item_Lineage = (searchObj, destination) => {
    console.log('sql_linking_catalogEntities_To_catalogItems...');
    console.log(searchObj);

    // const sql = `SELECT *, 'READ/WRITE' AS PRIVILEGE  FROM (
    //     SELECT C.DOMAIN, C1.TARGET_DATABASE, C1.TARGET_SCHEMA, C1.TARGET_TABLE, C1.CATALOG_ENTITIES_ID, C1.CREATEDDATE, C1.LASTMODIFIEDDATE, 'READ/WRITE' AS PRIVILEGE
    //     FROM
    //     (SELECT A.TARGET_DATABASE, A.TARGET_SCHEMA, A.TARGET_TABLE, B.CATALOG_ENTITIES_ID, B.DATA_DOMAIN_ID, B.CREATEDDATE, B.LASTMODIFIEDDATE
    //       FROM SHARED_TOOLS_DEV.ETL.CATALOG_ENTITIES A
    //       INNER JOIN SHARED_TOOLS_DEV.ETL.CATALOG_ENTITY_DOMAIN B 
    //       ON A.CATALOG_ENTITIES_ID = B.CATALOG_ENTITIES_ID
    //       WHERE UPPER(TRIM(A.CATALOG_ENTITIES_ID)) LIKE UPPER(TRIM('%` + searchObj['CATALOG_ENTITIES_ID'] + `%')) ) C1
    //     INNER JOIN SHARED_TOOLS_DEV.ETL.DATA_DOMAIN C
    //     ON C1.DATA_DOMAIN_ID = C.DATA_DOMAIN_ID
    //   )C2
    //   INNER JOIN SHARED_TOOLS_DEV.ETL.CATALOG_ITEMS D
    //   ON C2.CATALOG_ENTITIES_ID = D.CATALOG_ENTITIES_ID
    //   WHERE C2.CATALOG_ENTITIES_ID LIKE '%` + searchObj['CATALOG_ENTITIES_ID'] + `%';`
    
      //item and lineage MUST have a catalog table 
    const sql = `SELECT C2.*, D.*, 'READ/WRITE' AS PRIVILEGE  
    FROM SHARED_TOOLS_DEV.ETL.` + destination + ` D
    INNER JOIN (
        SELECT J.DOMAINS AS DOMAIN, J.TARGET_DATABASE, J.TARGET_SCHEMA, J.TARGET_TABLE, J.CATALOG_ENTITIES_ID 
        FROM (
            SELECT NVL(C.DOMAIN, '') DOMAINS, E.* 
            FROM SHARED_TOOLS_DEV.ETL.CATALOG_ENTITIES E
            LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.CATALOG_ENTITY_DOMAIN B 
            ON (E.CATALOG_ENTITIES_ID = B.CATALOG_ENTITIES_ID)
            LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.DATA_DOMAIN C
            ON (B.DATA_DOMAIN_ID = C.DATA_DOMAIN_ID )
            WHERE UPPER(TRIM(E.CATALOG_ENTITIES_ID)) LIKE UPPER(TRIM('%` + searchObj['CATALOG_ENTITIES_ID'] + `%'))
        ) J
    )C2
    ON C2.CATALOG_ENTITIES_ID = D.CATALOG_ENTITIES_ID
    WHERE C2.CATALOG_ENTITIES_ID LIKE '%` + searchObj['CATALOG_ENTITIES_ID'] + `%';`

    return sql;
}

const sql_linking_catalogEntities_To_catalogEntityLineage = searchObj => {
    console.log('sql_linking_catalogEntities_To_catalogItems...');
    console.log(searchObj);

    const sql = `SELECT *, 'READ/WRITE' AS PRIVILEGE FROM (
        SELECT C.DOMAIN, C1.TARGET_DATABASE, C1.TARGET_SCHEMA, C1.TARGET_TABLE, C1.CATALOG_ENTITIES_ID
        FROM
        (SELECT A.TARGET_DATABASE, A.TARGET_SCHEMA, A.TARGET_TABLE, B.DATA_DOMAIN_ID, B.CATALOG_ENTITIES_ID
          FROM SHARED_TOOLS_DEV.ETL.CATALOG_ENTITIES A
          INNER JOIN SHARED_TOOLS_DEV.ETL.CATALOG_ENTITY_DOMAIN B 
          ON A.CATALOG_ENTITIES_ID = B.CATALOG_ENTITIES_ID
          WHERE UPPER(TRIM(A.CATALOG_ENTITIES_ID)) LIKE UPPER(TRIM('%` + searchObj['CATALOG_ENTITIES_ID'] + `%')) 
        ) C1
        INNER JOIN SHARED_TOOLS_DEV.ETL.DATA_DOMAIN C
        ON C1.DATA_DOMAIN_ID = C.DATA_DOMAIN_ID
      )C2
      INNER JOIN SHARED_TOOLS_DEV.ETL.CATALOG_ENTITY_LINEAGE D
      ON C2.CATALOG_ENTITIES_ID = D.CATALOG_ENTITIES_ID
      WHERE C2.CATALOG_ENTITIES_ID LIKE '%` + searchObj['CATALOG_ENTITIES_ID'] + `%';`

    return sql;
}

const sql_linking_ItemsLineage_To_CatalogEntities = searchObj => {
    console.log('sql_linking_catalogItems_To_catalogEntities...');
    console.log(searchObj);

    const sql = `SELECT J.DOMAINS AS DOMAIN, J.*, 'READ/WRITE' AS PRIVILEGE 
    FROM (
        SELECT NVL(C.DOMAIN, '') DOMAINS, E.* 
        FROM SHARED_TOOLS_DEV.ETL.CATALOG_ENTITIES E
        LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.CATALOG_ENTITY_DOMAIN B 
        ON (E.CATALOG_ENTITIES_ID = B.CATALOG_ENTITIES_ID)
        LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.DATA_DOMAIN C
        ON (B.DATA_DOMAIN_ID = C.DATA_DOMAIN_ID )
        WHERE UPPER(TRIM(E.CATALOG_ENTITIES_ID)) LIKE UPPER(TRIM('%` + searchObj['CATALOG_ENTITIES_ID'] + `%'))
    ) J`;
    return sql;
}

const sql_linking_catalogItems_To_catalogEntities = searchObj => {
    console.log('sql_linking_catalogItems_To_catalogEntities...');
    console.log(searchObj);

    const sql = `SELECT C2.*
    FROM(
      SELECT C.DOMAIN, C1.*, 'READ/WRITE' AS PRIVILEGE
      FROM
      (SELECT A.TARGET_DATABASE, A.TARGET_SCHEMA, A.TARGET_TABLE, B.CATALOG_ENTITIES_ID, B.DATA_DOMAIN_ID, A.CREATEDDATE,A.LASTMODIFIEDDATE
        FROM SHARED_TOOLS_DEV.ETL.CATALOG_ENTITIES A
        INNER JOIN SHARED_TOOLS_DEV.ETL.CATALOG_ENTITY_DOMAIN B 
        ON A.CATALOG_ENTITIES_ID = B.CATALOG_ENTITIES_ID
      ) C1
      INNER JOIN SHARED_TOOLS_DEV.ETL.DATA_DOMAIN C
      ON C1.DATA_DOMAIN_ID = C.DATA_DOMAIN_ID
    )C2
    INNER JOIN SHARED_TOOLS_DEV.ETL.CATALOG_ITEMS D
    ON D.CATALOG_ENTITIES_ID = C2.CATALOG_ENTITIES_ID
    WHERE UPPER(TRIM(D.CATALOG_ENTITIES_ID)) LIKE UPPER(TRIM('%` + searchObj['CATALOG_ENTITIES_ID'] + `%'));`

    return sql;
}

const sql_linking_catalogEntityLineage_To_catalogEntities = searchObj => {
    console.log('sql_linking_catalogItems_To_catalogEntityLineage...');
    console.log(searchObj);

    const sql = `SELECT C2.*
    FROM(
      SELECT C.DOMAIN, C1.*, 'READ/WRITE' AS PRIVILEGE
      FROM
      (SELECT A.TARGET_DATABASE, A.TARGET_SCHEMA, A.TARGET_TABLE, B.CATALOG_ENTITIES_ID, B.DATA_DOMAIN_ID, A.CREATEDDATE,A.LASTMODIFIEDDATE
        FROM SHARED_TOOLS_DEV.ETL.CATALOG_ENTITIES A
        INNER JOIN SHARED_TOOLS_DEV.ETL.CATALOG_ENTITY_DOMAIN B 
        ON A.CATALOG_ENTITIES_ID = B.CATALOG_ENTITIES_ID
      ) C1
      INNER JOIN SHARED_TOOLS_DEV.ETL.DATA_DOMAIN C
      ON C1.DATA_DOMAIN_ID = C.DATA_DOMAIN_ID
    )C2
    INNER JOIN SHARED_TOOLS_DEV.ETL.CATALOG_ENTITY_LINEAGE D
    ON D.CATALOG_ENTITIES_ID = C2.CATALOG_ENTITIES_ID
    WHERE UPPER(TRIM(D.CATALOG_ENTITIES_ID)) LIKE UPPER(TRIM('%` + searchObj['CATALOG_ENTITIES_ID'] + `%'));`

    return sql;
}

const sql_linking_ETLF_Extract_Config_To_catalogEntityLineage = searchObj => {
    console.log('sql_linking_ETLF_Extract_Config_To_catalogEntityLineage...');
    console.log(searchObj);

    const sql = `SELECT D.DOMAIN, D.TARGET_DATABASE, D.TARGET_SCHEMA, D.TARGET_TABLE, A.*, 'READ/WRITE' AS PRIVILEGE
    FROM "SHARED_TOOLS_DEV"."ETL"."CATALOG_ENTITY_LINEAGE" A
    INNER JOIN (
        SELECT J.DOMAINS AS DOMAIN, J.TARGET_DATABASE, J.TARGET_SCHEMA, J.TARGET_TABLE, J.CATALOG_ENTITIES_ID 
        FROM (
            SELECT NVL(C.DOMAIN, '') DOMAINS, E.* 
            FROM SHARED_TOOLS_DEV.ETL.CATALOG_ENTITIES E
            LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.CATALOG_ENTITY_DOMAIN B 
            ON (E.CATALOG_ENTITIES_ID = B.CATALOG_ENTITIES_ID)
            LEFT OUTER JOIN SHARED_TOOLS_DEV.ETL.DATA_DOMAIN C
            ON (B.DATA_DOMAIN_ID = C.DATA_DOMAIN_ID )
        ) J
    ) D
    ON A.CATALOG_ENTITIES_ID = D.CATALOG_ENTITIES_ID
    WHERE UPPER(TRIM(A.EXTRACT_CONFIG_ID)) LIKE UPPER(TRIM('%` + searchObj['EXTRACT_CONFIG_ID'] + `%'));`

    return sql;
}

const getLinkSearchStmt = (table, destinationTable, searchObj) => {
    let searchStmt = '';
    if(table === 'ETLF_EXTRACT_CONFIG'){
        searchStmt = sql_linking_ETLF_Extract_Config_To_catalogEntityLineage(searchObj);
    }if(table === 'ETLF_CUSTOM_CODE'){
        searchStmt = getStandardSearchStmt(destinationTable, searchObj);
    }else if(table === 'DATA_STEWARD'){
        searchStmt = sql_linking_dataSteward_To_dataDomain(searchObj);
    }else if(table === 'DATA_STEWARD_DOMAIN'){
        if(destinationTable === 'DATA_STEWARD')
            searchStmt = sql_linking_dataDomain_To_dataSteward(searchObj);
        else if(destinationTable === 'DATA_DOMAIN' )
            searchStmt = sql_linking_dataSteward_To_dataDomain(searchObj);
    }else if(table === 'CATALOG_ENTITY_DOMAIN'){
        if(destinationTable === 'DATA_DOMAIN')
            searchStmt = sql_linking_catalogEntities_To_dataDomain(searchObj);
        else if(destinationTable === 'CATALOG_ENTITIES' )
            searchStmt = sql_linking_dataDomain_To_catalogEntities(searchObj); //!!!!!!!!!!!!!!!!!!! add DOMAIN
    }else if(table === 'DATA_DOMAIN'){
        if(destinationTable === 'DATA_STEWARD')
            searchStmt = sql_linking_dataDomain_To_dataSteward(searchObj);
        else if(destinationTable === 'CATALOG_ENTITIES' )
            searchStmt = sql_linking_dataDomain_To_catalogEntities(searchObj);
    }else if(table === 'CATALOG_ENTITIES'){
        if(destinationTable === 'CATALOG_ITEMS') 
            searchStmt =  sql_linking_catalogEntities_To_Item_Lineage(searchObj, 'CATALOG_ITEMS'); //!!!!!!!!!!!!!!!!!!!
        else if(destinationTable === 'CATALOG_ENTITY_LINEAGE')
            searchStmt = sql_linking_catalogEntities_To_Item_Lineage(searchObj, 'CATALOG_ENTITY_LINEAGE') //!!!!!!!!!!!!!!!!!!!
        else if(destinationTable === 'DATA_DOMAIN')
            searchStmt = sql_linking_catalogEntities_To_dataDomain(searchObj);
    }else if(table === 'CATALOG_ITEMS'){
        searchStmt = sql_linking_ItemsLineage_To_CatalogEntities(searchObj);
    }else if(table === 'CATALOG_ENTITY_LINEAGE'){
        if(destinationTable === 'CATALOG_ENTITIES') 
            searchStmt = sql_linking_ItemsLineage_To_CatalogEntities(searchObj);
        else if(destinationTable === 'ETLF_EXTRACT_CONFIG')
            searchStmt = getStandardSearchStmt(destinationTable, searchObj);
    }

    return searchStmt;
}

const CustomizedLink = ({ row }) => {
    const {
        debug, table
    } = useContext(WorkspaceContext);

    const linkedTablesObject = fieldTypesConfigs[table]['links'];

    const getLinkedValue = () => {
        let value = ''
        console.log(row);
        switch(table){
            case 'ETLF_EXTRACT_CONFIG':
                value = row['EXTRACT_CONFIG_ID'];
                break;
            case 'DATA_DOMAIN':
                value = row['DOMAIN'];
                break;
            case 'DATA_STEWARD':
                value = row['FNAME'] + ' ' + row['LNAME'] + ': ' + row['EMAIL'];
                break;
            case 'DATA_STEWARD_DOMAIN':
                break;
            case 'CATALOG_ENTITY_DOMAIN':
                value = row['DOMAIN'] + ' - ' + row['TARGET_DATABASE'] + ' - ' + row['TARGET_SCHEMA'] + ' - ' + row['TARGET_TABLE'];
                break;
            case 'CATALOG_ENTITIES':
                value = row['DOMAIN'] + ' - ' + row['TARGET_DATABASE'] + ' - ' + row['TARGET_SCHEMA'] + ' - ' + row['TARGET_TABLE'];
                break;
            case 'CATALOG_ITEMS':
                value = row['DOMAIN'] + ' - ' + row['TARGET_DATABASE'] + ' - ' + row['TARGET_SCHEMA'] + ' - ' + row['TARGET_TABLE'] + ' - ' + row['COLUMN_NAME'];
                break;
            case 'CATALOG_ENTITY_LINEAGE':
                value = 'EXTRACT_CONFIG_ID - ' + row['EXTRACT_CONFIG_ID'];
                break;
            default:
                break;
        }

        console.log(value);
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
                console.log(searchObj);

                let searchStmt = getLinkSearchStmt(table, destinationTable, searchObj);
                    
                //also had to join 3 tables entities to domain
                
                console.log(searchStmt);

                return(
                    <div style={{'marginBottom': '10px'}}>
                        <Link 
                            to={{
                                // pathname: '/datacataloglinked',
                                pathname: '/datacatalog',
                                state: {
                                    'table': destinationTable,
                                    'searchObj': searchObj,
                                    'searchStmt': searchStmt,
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