//1
export const merge_data_steward = searchObj => {
    const EMAIL = searchObj['EMAIL'];
    const FNAME = ('FNAME' in searchObj) ? searchObj['FNAME'] : '';
    const LNAME = ('LNAME' in searchObj) ? searchObj['LNAME'] : '';


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

    return sql;
}

//2
export const merge_data_domain = searchObj => {
    const DOMAIN = searchObj['DOMAIN'];
    const DOMAIN_DESCRIPTIONS = ('DOMAIN_DESCRIPTIONS' in searchObj) ? searchObj['DOMAIN_DESCRIPTIONS'] : '';

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
export const merge_data_steward_domain = searchObj => {
    const DATA_DOMAIN_ID = searchObj['DATA_DOMAIN_ID'];
    const DATA_STEWARD_ID = searchObj['DATA_STEWARD_ID'];

    let sql = `MERGE INTO SHARED_TOOLS_DEV.ETL.DATA_STEWARD_DOMAIN TT
    USING (
        SELECT '` + DATA_DOMAIN_ID + `' AS DATA_DOMAIN_ID,
                '` + DATA_STEWARD_ID + `' AS DATA_STEWARD_ID
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