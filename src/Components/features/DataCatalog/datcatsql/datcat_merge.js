//1
export const merge_data_steward = (searchObj, fields) => {
    const EMAIL = searchObj['EMAIL'];
    console.log(fields);

    for(let item of fields){
        if(!(item in searchObj)){
            searchObj[item] = '';
        }
    }

    console.log(searchObj);

    const FNAME = searchObj['FNAME'];
    const LNAME = searchObj['LNAME'];

    let sql = `MERGE INTO SHARED_TOOLS_DEV.ETL.DATA_STEWARD TT
    USING (
        SELECT ABS(HASH(UPPER(TRIM('` + EMAIL + `')))) as DATA_STEWARD_ID,
                UPPER(TRIM('` + FNAME + `')) AS FNAME,
                UPPER(TRIM('` + LNAME + `')) AS LNAME,
                UPPER(TRIM('` + EMAIL + `')) AS EMAIL
       from dual
    ) st 
    ON (TT.DATA_STEWARD_ID = ST.DATA_STEWARD_ID)
    WHEN matched THEN
    UPDATE 
    SET tt.FNAME = st.FNAME, tt.LNAME = st.LNAME
    when not matched then
    insert (
        DATA_STEWARD_ID, FNAME, LNAME, EMAIL
    ) 
    values 
    (
        st.DATA_STEWARD_ID, st.FNAME, st.LNAME, st.EMAIL
    );`

    console.log(sql);

    return sql;
}

//2
export const merge_data_domain = (searchObj, fields) => {
    for(let item of fields){
        if(!(item in searchObj)){
            searchObj[item] = '';
        }
    }

    const DOMAIN = searchObj['DOMAIN'];
    const DOMAIN_DESCRIPTIONS = searchObj['DOMAIN_DESCRIPTIONS'];

    let sql =  `MERGE INTO SHARED_TOOLS_DEV.ETL.DATA_DOMAIN TT
    USING (
        SELECT ABS(HASH(UPPER(TRIM('` + DOMAIN + `')))) as DATA_DOMAIN_ID,
                UPPER(TRIM('` + DOMAIN + `')) AS DOMAIN,
                UPPER(TRIM('` + DOMAIN_DESCRIPTIONS + `')) AS DOMAIN_DESCRIPTIONS
       from dual
    ) st 
    ON (TT.DATA_DOMAIN_ID = ST.DATA_DOMAIN_ID)
    WHEN matched THEN
    UPDATE 
    SET tt.DOMAIN_DESCRIPTIONS = st.DOMAIN_DESCRIPTIONS
    WHEN NOT matched THEN
    INSERT (
        DATA_DOMAIN_ID, DOMAIN, DOMAIN_DESCRIPTIONS
    ) 
    VALUES 
    (
        st.DATA_DOMAIN_ID, st.DOMAIN, st.DOMAIN_DESCRIPTIONS
    );`

    return sql;
}

//3
export const merge_data_steward_domain = (searchObj) => {
    const DATA_DOMAIN_ID = searchObj['DATA_DOMAIN_ID'];
    const DATA_STEWARD_ID = searchObj['DATA_STEWARD_ID'];

    let sql = `MERGE INTO SHARED_TOOLS_DEV.ETL.DATA_STEWARD_DOMAIN TT
    USING (
        SELECT UPPER(TRIM('` + DATA_DOMAIN_ID + `')) AS DATA_DOMAIN_ID,
                UPPER(TRIM('` + DATA_STEWARD_ID + `')) AS DATA_STEWARD_ID
       FROM DUAL
    ) st 
    ON (TT.DATA_DOMAIN_ID = ST.DATA_DOMAIN_ID AND TT.DATA_STEWARD_ID = ST.DATA_STEWARD_ID)
    WHEN NOT matched THEN
    INSERT (
        DATA_DOMAIN_ID, DATA_STEWARD_ID
    ) 
    VALUES 
    (
        st.DATA_DOMAIN_ID, st.DATA_STEWARD_ID
    );`

    return sql;
}

//4
export const merge_catalog_entity_domain = (searchObj) => {
    console.log(searchObj);

    const DATA_DOMAIN_ID = searchObj['DATA_DOMAIN_ID'];
    const CATALOG_ENTITIES_ID = searchObj['CATALOG_ENTITIES_ID'];

    let sql = `MERGE INTO SHARED_TOOLS_DEV.ETL.CATALOG_ENTITY_DOMAIN TT
    USING (
        SELECT UPPER(TRIM('` + DATA_DOMAIN_ID + `')) AS DATA_DOMAIN_ID,
                UPPER(TRIM('` + CATALOG_ENTITIES_ID + `')) AS CATALOG_ENTITIES_ID
       FROM DUAL
    ) st 
    ON (TT.DATA_DOMAIN_ID = ST.DATA_DOMAIN_ID AND TT.CATALOG_ENTITIES_ID = ST.CATALOG_ENTITIES_ID)
    WHEN NOT matched THEN
    INSERT (
        DATA_DOMAIN_ID, CATALOG_ENTITIES_ID
    ) 
    VALUES 
    (
        st.DATA_DOMAIN_ID, st.CATALOG_ENTITIES_ID
    );`;

    return sql;
}

//5
export const merge_catalog_items = (searchObj, fields) => {

    console.log(fields);

    for(let item of fields){
        if(!(item in searchObj)){
            searchObj[item] = '';
        }
    }

    console.log(searchObj);
    

    const ENTITIES_ARR = (searchObj['CATALOG_ENTITIES'].split('-')).map(val => val.trim());
    console.log(ENTITIES_ARR);

    const COLUMN_NAME = searchObj['COLUMN_NAME'];
    const DATA_TYPE = searchObj['DATA_TYPE'];
    const CATALOG_ENTITIES_ID = searchObj['CATALOG_ENTITIES_ID'];

    const PII = ('PII' in searchObj) ? searchObj['PII'] : '';
    const COMMENTS = ('COMMENTS' in searchObj) ? searchObj['COMMENTS'] : '';

    const sql = `MERGE INTO SHARED_TOOLS_DEV.ETL.CATALOG_ITEMS TT
    USING (
        SELECT ABS(HASH(UPPER(TRIM('` + ENTITIES_ARR[0] + `')), UPPER(TRIM('` + ENTITIES_ARR[1] + `')), UPPER(TRIM('` + ENTITIES_ARR[2] + `')), UPPER(TRIM('` + COLUMN_NAME + `')) )) AS CATALOG_ITEMS_ID,
               UPPER(TRIM('` + CATALOG_ENTITIES_ID + `')) as CATALOG_ENTITIES_ID, //GRAB FROM TABLE
               UPPER(TRIM('` + COLUMN_NAME + `')) AS COLUMN_NAME, 
               UPPER(TRIM('` + DATA_TYPE + `')) AS DATA_TYPE,
               UPPER(TRIM('` + PII + `')) AS PII,
               UPPER(TRIM('` + COMMENTS + `')) AS COMMENTS
       FROM DUAL
    ) st 
    ON (TT.CATALOG_ITEMS_ID = ST.CATALOG_ITEMS_ID)
    WHEN matched THEN
       UPDATE SET tt.DATA_TYPE = st.DATA_TYPE, tt.PII = st.PII, tt.COMMENTS = st.COMMENTS  
    WHEN NOT matched THEN
      INSERT (
          CATALOG_ITEMS_ID, CATALOG_ENTITIES_ID, COLUMN_NAME, DATA_TYPE, PII, COMMENTS
      ) 
      VALUES 
      (
          ST.CATALOG_ITEMS_ID, ST.CATALOG_ENTITIES_ID, ST.COLUMN_NAME, ST.DATA_TYPE, ST.PII, ST.COMMENTS
      );`

    return sql;
}

//6
export const merge_catalog_entities = (searchObj) => {
    console.log(searchObj);

    const DATABASE = searchObj['TARGET_DATABASE'];
    const SCHEMA = searchObj['TARGET_SCHEMA'];
    const TABLE = searchObj['TARGET_TABLE'];

    const COMMENTS = ('COMMENTS' in searchObj) ? searchObj['COMMENTS'] : '';

    let sql = `merge into SHARED_TOOLS_DEV.ETL.CATALOG_ENTITIES TT
    using (
        SELECT ABS(HASH(UPPER(TRIM('` + DATABASE + `')), UPPER(TRIM('` + SCHEMA + `')), UPPER(TRIM('` + TABLE + `')) )) as CATALOG_ENTITIES_ID, 
               UPPER(TRIM('` + DATABASE + `')) AS TARGET_DATABASE, 
               UPPER(TRIM('` + SCHEMA + `')) AS TARGET_SCHEMA,
               UPPER(TRIM('` + TABLE + `')) AS TARGET_TABLE,
               UPPER(TRIM('` + COMMENTS + `')) AS COMMENTS
       from dual
    ) st on (TT.CATALOG_ENTITIES_ID = ST.CATALOG_ENTITIES_ID)
    when matched then
    update set tt.COMMENTS = st.COMMENTS 
    when not matched then
    insert (
        CATALOG_ENTITIES_ID, TARGET_DATABASE, TARGET_SCHEMA, TARGET_TABLE, COMMENTS
    ) 
    values 
    (
        ST.CATALOG_ENTITIES_ID, st.TARGET_DATABASE, st.TARGET_SCHEMA, st.TARGET_TABLE, st.COMMENTS
    );`

    return sql;

}

//7
export const merge_catalog_entity_lineage = (searchObj, fields) => {
    console.log(fields);

    for(let item of fields){
        if(!(item in searchObj)){
            if(['EXTRACT_CONFIG_ID', 'REFRESH_INTERVAL'].indexOf(item) >= 0)
                searchObj[item] = 0; // need fix later
            else
                searchObj[item] = '';
        }
    }

    console.log(searchObj);


    const CATALOG_ENTITIES_ID = searchObj['CATALOG_ENTITIES_ID'];
    const ORIGIN_INFORMATION = searchObj['ORIGIN_INFORMATION'];
    const CONFIG_NAME = searchObj['CONFIG_NAME'];
    const EXTRACT_CONFIG_ID = searchObj['EXTRACT_CONFIG_ID'];
    const SOURCE_TABLE = searchObj['SOURCE_TABLE'];
    const EXTRACT_SCHEMA = searchObj['EXTRACT_SCHEMA'];
    const SYSTEM_CONFIG_TYPE = searchObj['SYSTEM_CONFIG_TYPE'];
    const LINEAGE = searchObj['LINEAGE'];
    const NOTIFICATIONEMAILS = searchObj['NOTIFICATIONEMAILS'];
    const REFRESH_INTERVAL = searchObj['REFRESH_INTERVAL'];

    let sql = `merge into SHARED_TOOLS_DEV.ETL.CATALOG_ENTITY_LINEAGE TT
    using (
        SELECT UPPER(TRIM('` + CATALOG_ENTITIES_ID + `')) AS CATALOG_ENTITIES_ID,
                UPPER(TRIM('` + ORIGIN_INFORMATION + `')) AS ORIGIN_INFORMATION,
                UPPER(TRIM('` + CONFIG_NAME + `')) AS CONFIG_NAME, 
                ` + EXTRACT_CONFIG_ID + ` AS EXTRACT_CONFIG_ID, 
                UPPER(TRIM('` + SOURCE_TABLE + `')) AS SOURCE_TABLE,
                UPPER(TRIM('` + EXTRACT_SCHEMA + `')) AS EXTRACT_SCHEMA,
                UPPER(TRIM('` + SYSTEM_CONFIG_TYPE + `')) AS SYSTEM_CONFIG_TYPE,
                UPPER(TRIM('` + LINEAGE + `')) AS LINEAGE,
                UPPER(TRIM('` + NOTIFICATIONEMAILS + `')) AS NOTIFICATIONEMAILS,
                ` + REFRESH_INTERVAL + ` AS REFRESH_INTERVAL
       from dual
    ) st on (TT.CATALOG_ENTITIES_ID = ST.CATALOG_ENTITIES_ID)
    when matched then
    update set  TT.ORIGIN_INFORMATION = st.ORIGIN_INFORMATION, 
            TT.CONFIG_NAME = st.CONFIG_NAME, 
            TT.EXTRACT_CONFIG_ID = st.EXTRACT_CONFIG_ID, 
            TT.SOURCE_TABLE = st.SOURCE_TABLE, 
            TT.EXTRACT_SCHEMA = ST.EXTRACT_SCHEMA, 
            TT.SYSTEM_CONFIG_TYPE = ST.SYSTEM_CONFIG_TYPE, 
            TT.LINEAGE = ST.LINEAGE, 
            TT.NOTIFICATIONEMAILS = ST.NOTIFICATIONEMAILS, 
            TT.REFRESH_INTERVAL = ST.REFRESH_INTERVAL
    when not matched then
    insert (
        CATALOG_ENTITIES_ID, ORIGIN_INFORMATION, CONFIG_NAME, EXTRACT_CONFIG_ID, SOURCE_TABLE, EXTRACT_SCHEMA, SYSTEM_CONFIG_TYPE, LINEAGE, NOTIFICATIONEMAILS, REFRESH_INTERVAL
    ) 
    values 
    (
        ST.CATALOG_ENTITIES_ID, st.ORIGIN_INFORMATION, st.CONFIG_NAME, st.EXTRACT_CONFIG_ID, st.SOURCE_TABLE, ST.EXTRACT_SCHEMA, ST.SYSTEM_CONFIG_TYPE, ST.LINEAGE, ST.NOTIFICATIONEMAILS, ST.REFRESH_INTERVAL
    );`

    return sql;

}
