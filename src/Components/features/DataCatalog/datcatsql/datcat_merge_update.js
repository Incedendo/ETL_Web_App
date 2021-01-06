//1
export const merge_update_data_steward = (row, diff) => {

    row = {...row, ...diff};

    const EMAIL = row['EMAIL'];
    const FNAME = row['FNAME'];
    const LNAME = row['LNAME'];

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
export const merge_update_data_domain = (row, diff) => {

    row = {...row, ...diff};

    const DOMAIN = row['DOMAIN'];
    const DOMAIN_DESCRIPTIONS = row['DOMAIN_DESCRIPTIONS'];

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

//5
export const merge_update_catalog_items = (row, diff) => {

    row = {...row, ...diff};
    

    const DATABASE = row['TARGET_DATABASE'];
    const SCHEMA = row['TARGET_SCHEMA'];
    const TABLE = row['TARGET_TABLE'];
    const COLUMN_NAME = row['COLUMN_NAME'];
    const CATALOG_ENTITIES_ID = row['CATALOG_ENTITIES_ID'];

    const DATA_TYPE = row['DATA_TYPE'];
    const PII = ('PII' in row) ? row['PII'] : '';
    const COMMENTS = ('COMMENTS' in row) ? row['COMMENTS'] : '';

    const sql = `MERGE INTO SHARED_TOOLS_DEV.ETL.CATALOG_ITEMS TT
    USING (
        SELECT ABS(HASH(UPPER(TRIM('` + DATABASE + `')), UPPER(TRIM('` + SCHEMA + `')), UPPER(TRIM('` + TABLE + `')), UPPER(TRIM('` + COLUMN_NAME + `')) )) AS CATALOG_ITEMS_ID,
               UPPER(TRIM('` + CATALOG_ENTITIES_ID + `')) as CATALOG_ENTITIES_ID, //GRAB FROM TABLE
               UPPER(TRIM('` + COLUMN_NAME + `')) AS COLUMN_NAME, 
               UPPER(TRIM('` + DATA_TYPE + `')) AS DATA_TYPE,
               UPPER(TRIM('` + PII + `')) AS PII,
               UPPER(TRIM('` + COMMENTS + `')) AS COMMENTS
       FROM DUAL
    ) st 
    ON (TT.CATALOG_ITEMS_ID = ST.CATALOG_ITEMS_ID)
    WHEN matched THEN
       UPDATE 
       SET 
            tt.DATA_TYPE = st.DATA_TYPE,
            tt.PII = st.PII, 
            tt.COMMENTS = st.COMMENTS  
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
export const merge_update_catalog_entities = (row, diff) => {

    row = {...row, ...diff};

    console.log(row);

    const DATABASE = row['TARGET_DATABASE'];
    const SCHEMA = row['TARGET_SCHEMA'];
    const TABLE = row['TARGET_TABLE'];

    const COMMENTS = ('COMMENTS' in row) ? row['COMMENTS'] : '';

    let sql = `MERGE INTO SHARED_TOOLS_DEV.ETL.CATALOG_ENTITIES TT
    USING (
        SELECT ABS(HASH(UPPER(TRIM('` + DATABASE + `')), UPPER(TRIM('` + SCHEMA + `')), UPPER(TRIM('` + TABLE + `')) )) as CATALOG_ENTITIES_ID, 
               UPPER(TRIM('` + DATABASE + `')) AS TARGET_DATABASE, 
               UPPER(TRIM('` + SCHEMA + `')) AS TARGET_SCHEMA,
               UPPER(TRIM('` + TABLE + `')) AS TARGET_TABLE,
               UPPER(TRIM('` + COMMENTS + `')) AS COMMENTS
        FROM DUAL
    ) ST
    ON (TT.CATALOG_ENTITIES_ID = ST.CATALOG_ENTITIES_ID)
    WHEN matched THEN
    UPDATE 
    SET 
        ST.COMMENTS = TT.COMMENTS 
    WHEN NOT matched THEN
    INSERT (
        CATALOG_ENTITIES_ID, TARGET_DATABASE, TARGET_SCHEMA, TARGET_TABLE, COMMENTS
    ) 
    VALUES 
    (
        ST.CATALOG_ENTITIES_ID, ST.TARGET_DATABASE, ST.TARGET_SCHEMA, ST.TARGET_TABLE, ST.COMMENTS
    );`

    return sql;

}

export const merge_catalog_entity_lineage = (row, diff) => {
    row = {...row, ...diff};

    console.log(row);


    const CATALOG_ENTITIES_ID = row['CATALOG_ENTITIES_ID'];
    const ORIGIN_INFORMATION = row['ORIGIN_INFORMATION'];
    const CONFIG_NAME = row['CONFIG_NAME'];
    const EXTRACT_CONFIG_ID = row['EXTRACT_CONFIG_ID'];
    const SOURCE_TABLE = row['SOURCE_TABLE'];
    const EXTRACT_SCHEMA = row['EXTRACT_SCHEMA'];
    const SYSTEM_CONFIG_TYPE = row['SYSTEM_CONFIG_TYPE'];
    const LINEAGE = row['LINEAGE'];
    const NOTIFICATIONEMAILS = row['NOTIFICATIONEMAILS'];
    const REFRESH_INTERVAL = row['REFRESH_INTERVAL'];

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