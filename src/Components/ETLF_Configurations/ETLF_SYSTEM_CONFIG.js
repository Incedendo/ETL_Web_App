const configs = [
  {
    ETLF_SYSTEM_CONFIG_ID: 6,
    SYSTEM_CONFIG_TYPE: "ORC_SS_PROD",
    SYSTEM_CONFIG_DESCRIPTION: "***SS PROD*** Connection For Oracle SS PROD DB",
    SYSTEM_CONFIG_JSON: {
  "SOURCE_DATABASE_CONF": {
    "cursor_size": 10000,
    "src_ora_host_url": "selfservice.valic.com",
    "src_ora_password": "AxALoBe4uaL70jd/AX5ywA=",
    "src_ora_port": "1523",
    "src_ora_service_name": "SSPRD.WORLD",
    "src_ora_username": "HADOOP_APP",
    "type": "oracle"
  }
}
  },
  {
    ETLF_SYSTEM_CONFIG_ID: 3,
    SYSTEM_CONFIG_TYPE: "SNF_DIH_DB_DEV",
    SYSTEM_CONFIG_DESCRIPTION: "***GR DIH*** Snowflake-Lands extracts into DIH schema",
    SYSTEM_CONFIG_JSON: {
  "SOURCE_DATABASE_CONF": {
    "tgt_snf_account": "aig.us-east-1",
    "tgt_snf_database": "GR_DEV",
    "tgt_snf_password": "BbOZytvNtLO52V1i6Sf6DA==",
    "tgt_snf_region": "AWS US West",
    "tgt_snf_schema": "DIH",
    "tgt_snf_user_id": "USER_GR_DEV_DEVELOPER",
    "tgt_snf_warehouse": "WH_GR_GP_XS",
    "type": "snowflake"
  }
}
  },
  {
    ETLF_SYSTEM_CONFIG_ID: 22,
    SYSTEM_CONFIG_TYPE: "SNF_DIH_DB_DEV",
    SYSTEM_CONFIG_DESCRIPTION: "***GR DIH*** Snowflake-Lands extracts into DIH schema",
    SYSTEM_CONFIG_JSON: {
  "SOURCE_DATABASE_CONF": {
    "tgt_snf_account": "aig.us-east-1",
    "tgt_snf_database": "SHARED_TOOLS_DEV",
    "tgt_snf_password": "NrtFwjZOgi3ZSBxoN6l86C7Xhd4eEpuZsxt6hG9hKqk=",
    "tgt_snf_region": "AWS US West",
    "tgt_snf_schema": "ETL",
    "tgt_snf_user_id": "USER_LIFE_DEV_LIFE_REPORTING_DEVELOPER",
    "tgt_snf_warehouse": "WH_LIFE_GP_XS",
    "type": "source snowflake"
  }
}
  },
  {
    ETLF_SYSTEM_CONFIG_ID: 5,
    SYSTEM_CONFIG_TYPE: "RPI_DEV_DB",
    SYSTEM_CONFIG_DESCRIPTION: "***RPI*** Connection for SalesForce RPI DEV DB",
    SYSTEM_CONFIG_JSON: {
  "SOURCE_DATABASE_CONF": {
    "src_rpi_password": "30KFgQ88tastNE5nzgfbbg==",
    "src_rpi_url": "https://test.salesforce.com/services/Soap/u/44.0",
    "src_rpi_user_id": "rpi.data.support@aig.com.dev",
    "type": "salesforce" 
    
  }
}
  },
  {
    ETLF_SYSTEM_CONFIG_ID: 2,
    SYSTEM_CONFIG_TYPE: "ORC_ALIP_PROD",
    SYSTEM_CONFIG_DESCRIPTION: "***ALIP*** Connection For Oracle ALIP PROD DB",
    SYSTEM_CONFIG_JSON: {
  "SOURCE_DATABASE_CONF": {
    "cursor_size": 10000,
    "src_ora_host_url": "a2ec701c1-scan.us2.ocm.s7130945.oraclecloudatcustomer.com",
    "src_ora_password": "Xyg/LBs24GnwxY8MagrY6w==",
    "src_ora_port": "1521",
    "src_ora_service_name": "SLRPPOLADM.us2.ocm.s7130945.oraclecloudatcustomer.com",
    "src_ora_username": "por_ldh_etl",
    "type": "oracle"
  }
}
  },
  {
    ETLF_SYSTEM_CONFIG_ID: 10,
    SYSTEM_CONFIG_TYPE: "ORA_SS_DEV",
    SYSTEM_CONFIG_DESCRIPTION: "***SS DEV*** Connection For Oracle SS DEV DB",
    SYSTEM_CONFIG_JSON: {
  "SOURCE_DATABASE_CONF": {
    "cursor_size": 10000,
    "src_ora_host_url": "a2ec702c1-scan.us2.ocm.s7130945.oraclecloudatcustomer.com",
    "src_ora_password": "yb4yR+4ihMX+eGf011IZ8w==",
    "src_ora_port": "1521",
    "src_ora_service_name": "SLRSSDEV.us2.ocm.s7130945.oraclecloudatcustomer.com",
    "src_ora_username": "HADOOP_APP",
    "type": "oracle"
  }
}
  },
  {
    ETLF_SYSTEM_CONFIG_ID: 1,
    SYSTEM_CONFIG_TYPE: "SNF_DIH_DB_DEV",
    SYSTEM_CONFIG_DESCRIPTION: "***LIFE_REPORTING*** Snowflake-Lands extracts into LIFE_REPORTING schema",
    SYSTEM_CONFIG_JSON: {
  "SOURCE_DATABASE_CONF": {
    "tgt_snf_account": "aig.us-east-1",
    "tgt_snf_database": "LIFE_DEV",
    "tgt_snf_password": "NrtFwjZOgi3ZSBxoN6l86C7Xhd4eEpuZsxt6hG9hKqk=",
    "tgt_snf_region": "AWS US West",
    "tgt_snf_schema": "LIFE_REPORTING",
    "tgt_snf_user_id": "USER_LIFE_DEV_LIFE_REPORTING_DEVELOPER",
    "tgt_snf_warehouse": "WH_LIFE_GP_XS",
    "type": "snowflake"
  }
}
  },
  {
    ETLF_SYSTEM_CONFIG_ID: 11,
    SYSTEM_CONFIG_TYPE: "SNF_DIH_DB_DEV",
    SYSTEM_CONFIG_DESCRIPTION: "***GR DIH LANDING*** Snowflake-Lands extracts into DIH schema",
    SYSTEM_CONFIG_JSON: {
  "SOURCE_DATABASE_CONF": {
    "tgt_snf_account": "aig.us-east-1",
    "tgt_snf_database": "GR_DEV",
    "tgt_snf_password": "BbOZytvNtLO52V1i6Sf6DA==",
    "tgt_snf_region": "AWS US West",
    "tgt_snf_schema": "DIH_LANDING",
    "tgt_snf_user_id": "USER_GR_DEV_DEVELOPER",
    "tgt_snf_warehouse": "WH_GR_GP_XS",
    "type": "snowflake"
  }
}
  },
  {
    ETLF_SYSTEM_CONFIG_ID: 26,
    SYSTEM_CONFIG_TYPE: "ORA_LHODS_DEV",
    SYSTEM_CONFIG_DESCRIPTION: "***LH DEV***Connection for Oracle LHODS",
    SYSTEM_CONFIG_JSON: {
  "SOURCE_DATABASE_CONF": {
    "cursor_size": 10000,
    "src_ora_host_url": "a2ec702c1-scan.us2.ocm.s7130945.oraclecloudatcustomer.com",
    "src_ora_password": "yb4yR+4ihMX+eGf011IZ8w==",
    "src_ora_port": "1521",
    "src_ora_schema": "LHODS",
    "src_ora_service_name": "SLRLHDEV.us2.ocm.s7130945.oraclecloudatcustomer.com",
    "src_ora_username": "HADOOP_APP",
    "type": "oracle"
  }
}
  },
  {
    ETLF_SYSTEM_CONFIG_ID: 25,
    SYSTEM_CONFIG_TYPE: "ORA_PMPR10_PROD",
    SYSTEM_CONFIG_DESCRIPTION: " Oracle PMPR10 PROD DB",
    SYSTEM_CONFIG_JSON: {
  "SOURCE_DATABASE_CONF": {
    "cursor_size": 10000,
    "src_ora_host_url": "lighthousebi.valic.com",
    "src_ora_password": "AKQngY9rqw57kyNjlzg1vw==",
    "src_ora_port": "1522",
    "src_ora_service_name": "PMPR10.WORLD",
    "src_ora_username": "bparanth",
    "type": "oracle"
  }
}
  },
  {
    ETLF_SYSTEM_CONFIG_ID: 24,
    SYSTEM_CONFIG_TYPE: "ORA_FPQT_UAT",
    SYSTEM_CONFIG_DESCRIPTION: " Oracle PMQT UAT DB",
    SYSTEM_CONFIG_JSON: {
  "SOURCE_DATABASE_CONF": {
    "cursor_size": 10000,
    "src_ora_host_url": "tusadslh01.r1-core.r1.aig.net",
    "src_ora_password": "AKQngY9rqw57kyNjlzg1vw==",
    "src_ora_port": "1521",
    "src_ora_service_name": "PMQT.WORLD",
    "src_ora_username": "bparanth",
    "type": "oracle"
  }
}
  },
  {
    ETLF_SYSTEM_CONFIG_ID: 23,
    SYSTEM_CONFIG_TYPE: "ORA_FPQT_DEV",
    SYSTEM_CONFIG_DESCRIPTION: " Oracle FPQT DEV DB",
    SYSTEM_CONFIG_JSON: {
  "SOURCE_DATABASE_CONF": {
    "cursor_size": 10000,
    "src_ora_host_url": "a2ec702c1-scan.us2.ocm.s7130945.oraclecloudatcustomer.com",
    "src_ora_password": "B1h9F5z725NPfmFTc3b1eg==",
    "src_ora_port": "1521",
    "src_ora_service_name": "SLRFPQT.us2.ocm.s7130945.oraclecloudatcustomer.com",
    "src_ora_username": "bparanth",
    "type": "oracle"
  }
}
  },
  {
    ETLF_SYSTEM_CONFIG_ID: 28,
    SYSTEM_CONFIG_TYPE: "ORA_LHODS_DEV",
    SYSTEM_CONFIG_DESCRIPTION: "***LH PQT*** Connection for Oracle LHPQT",
    SYSTEM_CONFIG_JSON: {
  "SOURCE_DATABASE_CONF": {
    "cursor_size": 10000,
    "src_ora_host_url": "tusadslh01.r1-core.r1.aig.net",
    "src_ora_password": "yb4yR+4ihMX+eGf011IZ8w==",
    "src_ora_port": "1521",
    "src_ora_service_name": "PMQT.WORLD",
    "src_ora_username": "HADOOP_APP",
    "type": "oracle"
  }
}
  },
  {
    ETLF_SYSTEM_CONFIG_ID: 27,
    SYSTEM_CONFIG_TYPE: "ORC_HAD_APP_P",
    SYSTEM_CONFIG_DESCRIPTION: "***LH PROD *** Connection to LH Production",
    SYSTEM_CONFIG_JSON: {
  "SOURCE_DATABASE_CONF": {
    "cursor_size": 10000,
    "src_ora_host_url": "lighthouse.valic.com",
    "src_ora_password": "AxALoBe4uaL70jd/AX5ywA==",
    "src_ora_port": "1521",
    "src_ora_schema": "LHODS",
    "src_ora_service_name": "LHPRD.WORLD",
    "src_ora_username": "HADOOP_APP",
    "type": "oracle"
  }
}
  },
  {
    ETLF_SYSTEM_CONFIG_ID: 30,
    SYSTEM_CONFIG_TYPE: "ORA_LHODS_DAB",
    SYSTEM_CONFIG_DESCRIPTION: "Do NOT USE***LH DAB***Connection for Oracle LHODS DANIEL",
    SYSTEM_CONFIG_JSON: {
  "SOURCE_DATABASE_CONF": {
    "cursor_size": 10000,
    "src_ora_host_url": "lighthouse.valic.com",
    "src_ora_password": "jZZuK1QrY68OueUda3eukg==",
    "src_ora_port": "1521",
    "src_ora_schema": "LHODS",
    "src_ora_service_name": "LHPRD.WORLD",
    "src_ora_username": "T54VSM6",
    "type": "oracle"
  }
}
  },
  {
    ETLF_SYSTEM_CONFIG_ID: 31,
    SYSTEM_CONFIG_TYPE: "LHODSDEV_SNFAPP",
    SYSTEM_CONFIG_DESCRIPTION: "Ora snf app",
    SYSTEM_CONFIG_JSON: {
  "SOURCE_DATABASE_CONF": {
    "cursor_size": 10000,
    "src_ora_host_url": "a2ec702c1-scan.us2.ocm.s7130945.oraclecloudatcustomer.com",
    "src_ora_password": "Yv5ysn3Cy4gH5YRbUY/7jQ==",
    "src_ora_port": "1521",
    "src_ora_schema": "LHODS",
    "src_ora_service_name": "SLRLHDEV.us2.ocm.s7130945.oraclecloudatcustomer.com",
    "src_ora_username": "SNOWFLAKE_APP",
    "type": "oracle"
  }
}
  },
  {
    ETLF_SYSTEM_CONFIG_ID: 32,
    SYSTEM_CONFIG_TYPE: "Ora_GIADMIN",
    SYSTEM_CONFIG_DESCRIPTION: "connection for Oracle GIADMIN",
    SYSTEM_CONFIG_JSON: {
  "SOURCE_DATABASE_CONF": {
    "cursor_size": 10000,
    "src_ora_host_url": "a2ec702c1-scan.us2.ocm.s7130945.oraclecloudatcustomer.com",
    "src_ora_password": "yCI2enkED2l6DzSi533cvA==",
    "src_ora_port": "1521",
    "src_ora_schema": "GIADMIN",
    "src_ora_service_name": "SLRSSDEV.us2.ocm.s7130945.oraclecloudatcustomer.com",
    "src_ora_username": "SNOWFLAKE_APP",
    "type": "oracle"
  }
}
  },
  {
    ETLF_SYSTEM_CONFIG_ID: 33,
    SYSTEM_CONFIG_TYPE: "Ora_PLADMIN",
    SYSTEM_CONFIG_DESCRIPTION: "connection for Oracle PLADMIN",
    SYSTEM_CONFIG_JSON: {
  "SOURCE_DATABASE_CONF": {
    "cursor_size": 10000,
    "src_ora_host_url": "a2ec702c1-scan.us2.ocm.s7130945.oraclecloudatcustomer.com",
    "src_ora_password": "yCI2enkED2l6DzSi533cvA==",
    "src_ora_port": "1521",
    "src_ora_schema": "PLADMIN",
    "src_ora_service_name": "SLRSSDEV.us2.ocm.s7130945.oraclecloudatcustomer.com",
    "src_ora_username": "SNOWFLAKE_APP",
    "type": "oracle"
  }
}
  },
  {
    ETLF_SYSTEM_CONFIG_ID: 34,
    SYSTEM_CONFIG_TYPE: "Ora_SSADMIN",
    SYSTEM_CONFIG_DESCRIPTION: "connection for Oracle SSADMIN",
    SYSTEM_CONFIG_JSON: {
  "SOURCE_DATABASE_CONF": {
    "cursor_size": 10000,
    "src_ora_host_url": "a2ec702c1-scan.us2.ocm.s7130945.oraclecloudatcustomer.com",
    "src_ora_password": "yCI2enkED2l6DzSi533cvA==",
    "src_ora_port": "1521",
    "src_ora_schema": "SSADMIN",
    "src_ora_service_name": "SLRSSDEV.us2.ocm.s7130945.oraclecloudatcustomer.com",
    "src_ora_username": "SNOWFLAKE_APP",
    "type": "oracle"
  }
}
  },
  {
    ETLF_SYSTEM_CONFIG_ID: 99,
    SYSTEM_CONFIG_TYPE: "ORA_SS_DEV_ME",
    SYSTEM_CONFIG_DESCRIPTION: "connection for Oracle LHODS",
    SYSTEM_CONFIG_JSON: {
  "SOURCE_DATABASE_CONF": {
    "cursor_size": 10000,
    "src_ora_host_url": "dusadslh01.r1-core.r1.aig.net",
    "src_ora_password": "9m6i6TyRF/HcE4QdvbiuOQ==",
    "src_ora_port": "1521",
    "src_ora_service_name": "SSDEV.WORLD",
    "src_ora_username": "meke",
    "type": "oracle"
  }
}
  },
  {
    ETLF_SYSTEM_CONFIG_ID: 35,
    SYSTEM_CONFIG_TYPE: "Ora_LHSTAGE",
    SYSTEM_CONFIG_DESCRIPTION: "Connection for Ora lhstage for snowflakeapp",
    SYSTEM_CONFIG_JSON: {
  "SOURCE_DATABASE_CONF": {
    "cursor_size": 10000,
    "src_ora_host_url": "a2ec702c1-scan.us2.ocm.s7130945.oraclecloudatcustomer.com",
    "src_ora_password": "Yv5ysn3Cy4gH5YRbUY/7jQ==",
    "src_ora_port": "1521",
    "src_ora_schema": "LHODS",
    "src_ora_service_name": "SLRLHDEV.us2.ocm.s7130945.oraclecloudatcustomer.com",
    "src_ora_username": "SNOWFLAKE_APP",
    "type": "oracle"
  }
}
  },
  {
    ETLF_SYSTEM_CONFIG_ID: 98,
    SYSTEM_CONFIG_TYPE: "ORA_LH_P_JAY",
    SYSTEM_CONFIG_DESCRIPTION: "connection for Oracle LHODS",
    SYSTEM_CONFIG_JSON: {
  "SOURCE_DATABASE_CONF": {
    "cursor_size": 10000,
    "src_ora_host_url": "lighthouse.valic.com",
    "src_ora_password": "W/us4aPUtDlq+qMFyX/DMQ==",
    "src_ora_port": "1521",
    "src_ora_schema": "LHODS",
    "src_ora_service_name": "LHPRD.WORLD",
    "src_ora_username": "jkaliyam",
    "type": "oracle"
  }
}
  },
  {
    ETLF_SYSTEM_CONFIG_ID: 97,
    SYSTEM_CONFIG_TYPE: "ORA_SS_P_BAL",
    SYSTEM_CONFIG_DESCRIPTION: "connection for Oracle SS",
    SYSTEM_CONFIG_JSON: {
  "SOURCE_DATABASE_CONF": {
    "cursor_size": 10000,
    "src_ora_host_url": "selfservice.valic.com",
    "src_ora_password": "A0u+DBWWB8mCyP+Y5ShqxQ==",
    "src_ora_port": "1523",
    "src_ora_service_name": "SSPRD.WORLD",
    "src_ora_username": "bparanth",
    "type": "oracle"
  }
}
  },
  {
    ETLF_SYSTEM_CONFIG_ID: 36,
    SYSTEM_CONFIG_TYPE: "SNF_STAGE",
    SYSTEM_CONFIG_DESCRIPTION: "Snowflake DIH Staging",
    SYSTEM_CONFIG_JSON: {
  "SOURCE_DATABASE_CONF": {
    "tgt_snf_account": "aig.us-east-1",
    "tgt_snf_database": "GR_DEV",
    "tgt_snf_password": "BbOZytvNtLO52V1i6Sf6DA==",
    "tgt_snf_region": "AWS US West",
    "tgt_snf_schema": "DIH_STAGING",
    "tgt_snf_user_id": "USER_GR_DEV_DEVELOPER",
    "tgt_snf_warehouse": "WH_GR_GP_XS",
    "type": "snowflake"
  }
}
  },
  {
    ETLF_SYSTEM_CONFIG_ID: 9,
    SYSTEM_CONFIG_TYPE: "SNF_PII_DEV",
    SYSTEM_CONFIG_DESCRIPTION: "***GR PII*** Snowflake-Lands extracts into PII schema",
    SYSTEM_CONFIG_JSON: {
  "SOURCE_DATABASE_CONF": {
    "pii_target_schema": "DIH_LANDING",
    "pii_tgt_password": "BbOZytvNtLO52V1i6Sf6DA==",
    "pii_tgt_role": "RL_GR_DEV_DEVELOPER",
    "pii_tgt_user_id": "USER_GR_DEV_DEVELOPER",
    "tgt_snf_account": "aig.us-east-1",
    "tgt_snf_database": "GR_DEV",
    "tgt_snf_password": "DmjUSyIWtxDzR7ZD0Izurg==",
    "tgt_snf_region": "AWS US West",
    "tgt_snf_schema": "PII",
    "tgt_snf_user_id": "USER_GR_DEV_PII_ETL",
    "tgt_snf_warehouse": "WH_GR_GP_XS",
    "type": "GR DEV PII User for PII extracts"
  }
}
  },
  {
    ETLF_SYSTEM_CONFIG_ID: 12,
    SYSTEM_CONFIG_TYPE: "ORA_SS_D_BAL",
    SYSTEM_CONFIG_DESCRIPTION: "***SS DEV*** Connection For Oracle SS DEV DB",
    SYSTEM_CONFIG_JSON: {
  "SOURCE_DATABASE_CONF": {
    "cursor_size": 10000,
    "src_ora_host_url": "dusadslh01.r1-core.r1.aig.net",
    "src_ora_password": "B1h9F5z725NPfmFTc3b1eg==",
    "src_ora_port": "1521",
    "src_ora_service_name": "SSDEV.WORLD",
    "src_ora_username": "bparanth",
    "type": "oracle"
  }
}
  },
  {
    ETLF_SYSTEM_CONFIG_ID: 111,
    SYSTEM_CONFIG_TYPE: "SS_UAT_SNFAPP",
    SYSTEM_CONFIG_DESCRIPTION: "Connection For Oracle SSADMIN",
    SYSTEM_CONFIG_JSON: {
  "SOURCE_DATABASE_CONF": {
    "cursor_size": 10000,
    "src_ora_host_url": "tusadslh01.r1-core.r1.aig.net",
    "src_ora_password": "zAO4EofoA36AMZm9iUT9XQ==",
    "src_ora_port": "1528",
    "src_ora_schema": "SSADMIN",
    "src_ora_service_name": "SSPQT.WORLD",
    "src_ora_username": "SNOWFLAKE_APP",
    "type": "oracle"
  }
}
  },
  {
    ETLF_SYSTEM_CONFIG_ID: 52,
    SYSTEM_CONFIG_TYPE: "SNF_RPI_DB_DEV",
    SYSTEM_CONFIG_DESCRIPTION: "***GR RPI*** Snowflake-Lands extracts into RPI schema",
    SYSTEM_CONFIG_JSON: {
  "SOURCE_DATABASE_CONF": {
    "tgt_snf_account": "aig.us-east-1",
    "tgt_snf_database": "GR_DEV",
    "tgt_snf_password": "BbOZytvNtLO52V1i6Sf6DA==",
    "tgt_snf_region": "AWS US West",
    "tgt_snf_schema": "RPI",
    "tgt_snf_user_id": "USER_GR_DEV_DEVELOPER",
    "tgt_snf_warehouse": "WH_GR_GP_XS",
    "type": "snowflake"
  }
}
  },
  {
    ETLF_SYSTEM_CONFIG_ID: 38,
    SYSTEM_CONFIG_TYPE: "NAV_HOQA3_DB",
    SYSTEM_CONFIG_DESCRIPTION: "***HOQA3*** Connection For Oracle HOQA3 DB",
    SYSTEM_CONFIG_JSON: {
  "SOURCE_DATABASE_CONF": {
    "cursor_size": 100000,
    "src_ora_host_url": "a2ec702c1-scan.us2.ocm.s7130945.oraclecloudatcustomer.com",
    "src_ora_password": "GdIFQF0wu/f0FjYLHou8DQ==",
    "src_ora_port": "1521",
    "src_ora_service_name": "SLRHOQA3.us2.ocm.s7130945.oraclecloudatcustomer.com",
    "src_ora_username": "NV17_QA_ADW_CRDL",
    "type": "oracle"
  }
}
  },
  {
    ETLF_SYSTEM_CONFIG_ID: 39,
    SYSTEM_CONFIG_TYPE: "INST_MRKTS_DEV",
    SYSTEM_CONFIG_DESCRIPTION: "***INST_MARKETS*** PII Connection For INST_MARKETS DEV database",
    SYSTEM_CONFIG_JSON: {
  "SOURCE_DATABASE_CONF": {
    "pii_target_schema": "INST_MARKETS_STG",
    "pii_tgt_password": "ynVieFg6S3UXEsOfhP+QGA==",
    "pii_tgt_role": "RL_IR_DEV_DEVELOPER",
    "pii_tgt_user_id": "USER_IR_DEV_DEVELOPER",
    "tgt_snf_account": "aig.us-east-1",
    "tgt_snf_database": "IR_DEV",
    "tgt_snf_password": "adVQj4RJX/F/c9ghbvq/rw==",
    "tgt_snf_region": "AWS US West",
    "tgt_snf_schema": "PII",
    "tgt_snf_user_id": "USER_IR_DEV_PII_ETL",
    "tgt_snf_warehouse": "WH_IR_GP_XS",
    "type": "IR DEV PII User for PII extracts"
  }
}
  },
  {
    ETLF_SYSTEM_CONFIG_ID: 40,
    SYSTEM_CONFIG_TYPE: "NAV_HOS1_DB",
    SYSTEM_CONFIG_DESCRIPTION: "***HOS1*** Connection For Oracle HOS1 DB",
    SYSTEM_CONFIG_JSON: {
  "SOURCE_DATABASE_CONF": {
    "cursor_size": 100000,
    "src_ora_host_url": "a2ec702c1-scan.us2.ocm.s7130945.oraclecloudatcustomer.com",
    "src_ora_password": "4CvS3pHkC3bMw55a+wdQsQ==",
    "src_ora_port": "1521",
    "src_ora_service_name": "SLRHOS1.us2.ocm.s7130945.oraclecloudatcustomer.com",
    "src_ora_username": "NV17_STG_ADW_CRDL",
    "type": "oracle"
  }
}
  },
  {
    ETLF_SYSTEM_CONFIG_ID: 41,
    SYSTEM_CONFIG_TYPE: "SNF_C360_DB_DEV",
    SYSTEM_CONFIG_DESCRIPTION: "***GR CUSTOMER_360*** Snowflake-Lands extracts into CUSTOMER_360 schema",
    SYSTEM_CONFIG_JSON: {
  "SOURCE_DATABASE_CONF": {
    "tgt_snf_account": "aig.us-east-1",
    "tgt_snf_database": "GR_DEV",
    "tgt_snf_password": "htRjGjRHmJ5hW8iyXSma5A==",
    "tgt_snf_region": "AWS US West",
    "tgt_snf_schema": "CUSTOMER_360",
    "tgt_snf_user_id": "USER_GR_DEV_CUSTOMER_360_ETL",
    "tgt_snf_warehouse": "WH_GR_GP_XS",
    "type": "snowflake"
  }
}
  },
  {
    ETLF_SYSTEM_CONFIG_ID: 42,
    SYSTEM_CONFIG_TYPE: "Ora_LHSTAGE",
    SYSTEM_CONFIG_DESCRIPTION: "connection for Oracle LHSTAGE",
    SYSTEM_CONFIG_JSON: {
  "SOURCE_DATABASE_CONF": {
    "cursor_size": 10000,
    "src_ora_host_url": "a2ec702c1-scan.us2.ocm.s7130945.oraclecloudatcustomer.com",
    "src_ora_password": "Yv5ysn3Cy4gH5YRbUY/7jQ==",
    "src_ora_port": "1521",
    "src_ora_schema": "LHSTAGE",
    "src_ora_service_name": "SLRLHDEV.us2.ocm.s7130945.oraclecloudatcustomer.com",
    "src_ora_username": "SNOWFLAKE_APP",
    "type": "oracle"
  }
}
  },
  {
    ETLF_SYSTEM_CONFIG_ID: 43,
    SYSTEM_CONFIG_TYPE: "INST_MARKETS",
    SYSTEM_CONFIG_DESCRIPTION: "***INST_MARKETS*** Non-PII Connection For INST_MARKETS DEV database",
    SYSTEM_CONFIG_JSON: {
  "SOURCE_DATABASE_CONF": {
    "tgt_snf_account": "aig.us-east-1",
    "tgt_snf_database": "IR_DEV",
    "tgt_snf_password": "ynVieFg6S3UXEsOfhP+QGA==",
    "tgt_snf_region": "AWS US West",
    "tgt_snf_schema": "INST_MARKETS_STG",
    "tgt_snf_user_id": "USER_IR_DEV_DEVELOPER",
    "tgt_snf_warehouse": "WH_IR_GP_XS",
    "type": "IR DEV User for Non-PII extracts"
  }
}
  },
  {
    ETLF_SYSTEM_CONFIG_ID: 44,
    SYSTEM_CONFIG_TYPE: "SNF_NEXUS_DEV",
    SYSTEM_CONFIG_DESCRIPTION: "***GR.DEV NEXUS*** Snowflake-Lands extracts into NEXUS schema",
    SYSTEM_CONFIG_JSON: {
  "SOURCE_DATABASE_CONF": {
    "tgt_snf_account": "aig.us-east-1",
    "tgt_snf_database": "GR_DEV",
    "tgt_snf_password": "KN3B4u/hk8dRhj7ZitaZ/w==",
    "tgt_snf_region": "AWS US West",
    "tgt_snf_schema": "DIH_LANDING",
    "tgt_snf_user_id": "USER_GR_DEV_NEXUS",
    "tgt_snf_warehouse": "WH_GR_GP_XS",
    "type": "snowflake"
  }
}
  },
  {
    ETLF_SYSTEM_CONFIG_ID: 51,
    SYSTEM_CONFIG_TYPE: "SNF_C360_DB_PRD",
    SYSTEM_CONFIG_DESCRIPTION: "***GR CUSTOMER_360*** Snowflake-Lands extracts into CUSTOMER_360 schema",
    SYSTEM_CONFIG_JSON: {
  "SOURCE_DATABASE_CONF": {
    "tgt_snf_account": "aig.us-east-1",
    "tgt_snf_database": "GR_PROD",
    "tgt_snf_password": "KN3B4u/hk8dRhj7ZitaZ/w==",
    "tgt_snf_region": "AWS US West",
    "tgt_snf_schema": "CUSTOMER_360",
    "tgt_snf_user_id": "USER_GR_PROD_CUSTOMER_360_ETL",
    "tgt_snf_warehouse": "WH_GR_PROD_XS",
    "type": "snowflake"
  }
}
  },
  {
    ETLF_SYSTEM_CONFIG_ID: 99,
    SYSTEM_CONFIG_TYPE: "ORA_SS_P_VAI",
    SYSTEM_CONFIG_DESCRIPTION: "connection for Oracle SS",
    SYSTEM_CONFIG_JSON: {
  "SOURCE_DATABASE_CONF": {
    "cursor_size": 10000,
    "src_ora_host_url": "selfservice.valic.com",
    "src_ora_password": "h3j10QIxBMs9w/0qEW2dlw==",
    "src_ora_port": "1523",
    "src_ora_service_name": "SSPRD.WORLD",
    "src_ora_username": "varavich",
    "type": "oracle"
  }
}
  },
  {
    ETLF_SYSTEM_CONFIG_ID: 100,
    SYSTEM_CONFIG_TYPE: "ORA_SS_D_KAN",
    SYSTEM_CONFIG_DESCRIPTION: "***SS DEV*** Connection For Oracle SS DEV DB",
    SYSTEM_CONFIG_JSON: {
  "SOURCE_DATABASE_CONF": {
    "cursor_size": 10000,
    "src_ora_host_url": "dusadslh01.r1-core.r1.aig.net",
    "src_ora_password": "XwwS5/vFTRlftxQFMJmNFw==",
    "src_ora_port": "1521",
    "src_ora_service_name": "SSDEV.WORLD",
    "src_ora_username": "kbalasub",
    "type": "oracle"
  }
}
  },
  {
    ETLF_SYSTEM_CONFIG_ID: 101,
    SYSTEM_CONFIG_TYPE: "ORA_SS_D_SA",
    SYSTEM_CONFIG_DESCRIPTION: "***SS DEV SNOWFLAKE APP*** Connection For Oracle SS DEV DB SNOWFLAKE APP USER",
    SYSTEM_CONFIG_JSON: {
  "SOURCE_DATABASE_CONF": {
    "cursor_size": 10000,
    "src_ora_host_url": "a2ec702c1-scan.us2.ocm.s7130945.oraclecloudatcustomer.com",
    "src_ora_password": "yCI2enkED2l6DzSi533cvA==",
    "src_ora_port": "1521",
    "src_ora_service_name": "SLRSSDEV.us2.ocm.s7130945.oraclecloudatcustomer.com",
    "src_ora_username": "SNOWFLAKE_APP",
    "type": "oracle"
  }
}
  },
  {
    ETLF_SYSTEM_CONFIG_ID: 102,
    SYSTEM_CONFIG_TYPE: "ORA_LH_D_SA",
    SYSTEM_CONFIG_DESCRIPTION: "***LH DEV SNOWFLAKE APP*** Connection For Oracle LH DEV DB SNOWFLAKE APP USER",
    SYSTEM_CONFIG_JSON: {
  "SOURCE_DATABASE_CONF": {
    "cursor_size": 10000,
    "src_ora_host_url": "a2ec702c1-scan.us2.ocm.s7130945.oraclecloudatcustomer.com",
    "src_ora_password": "Yv5ysn3Cy4gH5YRbUY/7jQ==",
    "src_ora_port": "1521",
    "src_ora_schema": "LHODS",
    "src_ora_service_name": "SLRLHDEV.us2.ocm.s7130945.oraclecloudatcustomer.com",
    "src_ora_username": "SNOWFLAKE_APP",
    "type": "oracle"
  }
}
  },
  {
    ETLF_SYSTEM_CONFIG_ID: 75,
    SYSTEM_CONFIG_TYPE: "SNF_SF_DEMOS",
    SYSTEM_CONFIG_DESCRIPTION: "***SF_DEMOS**** Connection for SF_DEMOS",
    SYSTEM_CONFIG_JSON: {
  "SOURCE_DATABASE_CONF": {
    "tgt_snf_account": "aig.us-east-1",
    "tgt_snf_database": "GR_DEV",
    "tgt_snf_password": "lV01UPWl74/vlY5yIUyy3Q==",
    "tgt_snf_region": "AWS US West",
    "tgt_snf_schema": "SF_DEMOS",
    "tgt_snf_user_id": "USER_GR_DEV_SF_DEMOS_DEVELOPER",
    "tgt_snf_warehouse": "WH_GR_GP_XS",
    "type": "snowflake"
  }
}
  },
  {
    ETLF_SYSTEM_CONFIG_ID: 49,
    SYSTEM_CONFIG_TYPE: "Ora_FEEADMIN",
    SYSTEM_CONFIG_DESCRIPTION: "connection for Oracle for SnowflakeApp User",
    SYSTEM_CONFIG_JSON: {
  "SOURCE_DATABASE_CONF": {
    "cursor_size": 10000,
    "src_ora_host_url": "a2ec702c1-scan.us2.ocm.s7130945.oraclecloudatcustomer.com",
    "src_ora_password": "yCI2enkED2l6DzSi533cvA==",
    "src_ora_port": "1521",
    "src_ora_schema": "FEEADMIN",
    "src_ora_service_name": "SLRSSDEV.us2.ocm.s7130945.oraclecloudatcustomer.com",
    "src_ora_username": "SNOWFLAKE_APP",
    "type": "oracle"
  }
}
  },
  {
    ETLF_SYSTEM_CONFIG_ID: 48,
    SYSTEM_CONFIG_TYPE: "Ora_LHWEB",
    SYSTEM_CONFIG_DESCRIPTION: "connection for Oracle for SnowflakeApp User",
    SYSTEM_CONFIG_JSON: {
  "SOURCE_DATABASE_CONF": {
    "cursor_size": 10000,
    "src_ora_host_url": "a2ec702c1-scan.us2.ocm.s7130945.oraclecloudatcustomer.com",
    "src_ora_password": "yCI2enkED2l6DzSi533cvA==",
    "src_ora_port": "1521",
    "src_ora_schema": "LHWEB",
    "src_ora_service_name": "SLRSSDEV.us2.ocm.s7130945.oraclecloudatcustomer.com",
    "src_ora_username": "SNOWFLAKE_APP",
    "type": "oracle"
  }
}
  },
  {
    ETLF_SYSTEM_CONFIG_ID: 47,
    SYSTEM_CONFIG_TYPE: "Ora_SSINQ",
    SYSTEM_CONFIG_DESCRIPTION: "connection for Oracle for SnowflakeApp User",
    SYSTEM_CONFIG_JSON: {
  "SOURCE_DATABASE_CONF": {
    "cursor_size": 10000,
    "src_ora_host_url": "a2ec702c1-scan.us2.ocm.s7130945.oraclecloudatcustomer.com",
    "src_ora_password": "yCI2enkED2l6DzSi533cvA==",
    "src_ora_port": "1521",
    "src_ora_schema": "SSINQ",
    "src_ora_service_name": "SLRSSDEV.us2.ocm.s7130945.oraclecloudatcustomer.com",
    "src_ora_username": "SNOWFLAKE_APP",
    "type": "oracle"
  }
}
  },
  {
    ETLF_SYSTEM_CONFIG_ID: 46,
    SYSTEM_CONFIG_TYPE: "Ora_PRMRMI",
    SYSTEM_CONFIG_DESCRIPTION: "connection for Oracle for SnowflakeApp User",
    SYSTEM_CONFIG_JSON: {
  "SOURCE_DATABASE_CONF": {
    "cursor_size": 10000,
    "src_ora_host_url": "a2ec702c1-scan.us2.ocm.s7130945.oraclecloudatcustomer.com",
    "src_ora_password": "yCI2enkED2l6DzSi533cvA==",
    "src_ora_port": "1521",
    "src_ora_schema": "PRMRMI",
    "src_ora_service_name": "SLRSSDEV.us2.ocm.s7130945.oraclecloudatcustomer.com",
    "src_ora_username": "SNOWFLAKE_APP",
    "type": "oracle"
  }
}
  },
  {
    ETLF_SYSTEM_CONFIG_ID: 45,
    SYSTEM_CONFIG_TYPE: "Ora_FPERFADMIN",
    SYSTEM_CONFIG_DESCRIPTION: "connection for Oracle for SnowflakeApp User",
    SYSTEM_CONFIG_JSON: {
  "SOURCE_DATABASE_CONF": {
    "cursor_size": 10000,
    "src_ora_host_url": "a2ec702c1-scan.us2.ocm.s7130945.oraclecloudatcustomer.com",
    "src_ora_password": "yCI2enkED2l6DzSi533cvA==",
    "src_ora_port": "1521",
    "src_ora_schema": "FPERFADMIN",
    "src_ora_service_name": "SLRSSDEV.us2.ocm.s7130945.oraclecloudatcustomer.com",
    "src_ora_username": "SNOWFLAKE_APP",
    "type": "oracle"
  }
}
  },
  {
    ETLF_SYSTEM_CONFIG_ID: 76,
    SYSTEM_CONFIG_TYPE: "SNF_SF_D_test",
    SYSTEM_CONFIG_DESCRIPTION: "***SF_DEMOS**** Connection for SF_DEMOS",
    SYSTEM_CONFIG_JSON: {
  "SOURCE_DATABASE_CONF": {
    "tgt_snf_account": "aig.us-east-1",
    "tgt_snf_database": "GR_DEV",
    "tgt_snf_password": "BbOZytvNtLO52V1i6Sf6DA==",
    "tgt_snf_region": "AWS US West",
    "tgt_snf_schema": "SF_DEMOS",
    "tgt_snf_user_id": "USER_GR_DEV_DEVELOPER",
    "tgt_snf_warehouse": "WH_GR_GP_XS",
    "type": "snowflake"
  }
}
  },
  {
    ETLF_SYSTEM_CONFIG_ID: 53,
    SYSTEM_CONFIG_TYPE: "CASS_DB_DEV",
    SYSTEM_CONFIG_DESCRIPTION: "***Cassandra C360** Snowflake move data into cassandra",
    SYSTEM_CONFIG_JSON: {
  "SOURCE_DATABASE_CONF": {
    "tgt_cass_host_url": "dlgsasc2tm0114.r1-core.r1.aig.net",
    "tgt_cass_keyspace": "customer360",
    "tgt_cass_keystore_pass": "a5afun3n+rwYNJ3s+3MfRA==",
    "tgt_cass_parallel_count": "300",
    "tgt_cass_password": "g9VSsjHzbsGySemcQuB44Fo/2q8I7FlvGJo+5mPInds=",
    "tgt_cass_port": "9042",
    "tgt_cass_truststore": "/RDL_TLD7_DEV/DEV/RETIREMENT_DL/RAW/ETLF/cassandra_keystore",
    "tgt_cass_username": "customer360_etl",
    "type": "cassandra"
  }
}
  },
  {
    ETLF_SYSTEM_CONFIG_ID: 54,
    SYSTEM_CONFIG_TYPE: "SNF_DIH_DB_DEV",
    SYSTEM_CONFIG_DESCRIPTION: "***GR DIH*** Snowflake-Lands extracts into DIH schema",
    SYSTEM_CONFIG_JSON: {
  "SOURCE_DATABASE_CONF": {
    "src_snf_account": "aig.us-east-1",
    "src_snf_database": "GR_DEV",
    "src_snf_password": "BbOZytvNtLO52V1i6Sf6DA==",
    "src_snf_region": "AWS US West",
    "src_snf_schema": "DIH",
    "src_snf_user_id": "USER_GR_DEV_DEVELOPER",
    "src_snf_warehouse": "WH_GR_GP_XS",
    "type": "snowflake"
  }
}
  },
  {
    ETLF_SYSTEM_CONFIG_ID: 55,
    SYSTEM_CONFIG_TYPE: "CASS_DB_DEV",
    SYSTEM_CONFIG_DESCRIPTION: "***Cassandra C360** Snowflake move data into cassandra",
    SYSTEM_CONFIG_JSON: {
  "SOURCE_DATABASE_CONF": {
    "src_cass_host_url": "dlgsascs5086000.r1-core.r1.aig.net",
    "src_cass_keyspace": "customer360",
    "src_cass_keystore": "/RDL_TLD7_DEV/DEV/RETIREMENT_DL/RAW/ETLF/cassandra_keystore/DIH_DEV-truststore.jks",
    "src_cass_keystore_pass": "a5afun3n+rwYNJ3s+3MfRA==",
    "src_cass_parallel_count": "200",
    "src_cass_password": "g9VSsjHzbsGySemcQuB44Fo/2q8I7FlvGJo+5mPInds=",
    "src_cass_port": "9042",
    "src_cass_username": "customer360_etl",
    "type": "cassandra"
  }
}
  },
  {
    ETLF_SYSTEM_CONFIG_ID: 56,
    SYSTEM_CONFIG_TYPE: "SNF_C360_DB_DEV",
    SYSTEM_CONFIG_DESCRIPTION: "***GR CUSTOMER_360*** CUSTOMER_360 AS SOURCE",
    SYSTEM_CONFIG_JSON: {
  "SOURCE_DATABASE_CONF": {
    "src_snf_account": "aig.us-east-1",
    "src_snf_database": "GR_DEV",
    "src_snf_password": "htRjGjRHmJ5hW8iyXSma5A==",
    "src_snf_region": "AWS US West",
    "src_snf_schema": "CUSTOMER_360",
    "src_snf_user_id": "USER_GR_DEV_CUSTOMER_360_ETL",
    "src_snf_warehouse": "WH_GR_GP_XS",
    "type": "snowflake"
  }
}
  },
  {
    ETLF_SYSTEM_CONFIG_ID: 58,
    SYSTEM_CONFIG_TYPE: "Ora_PSADMIN",
    SYSTEM_CONFIG_DESCRIPTION: "PSADMIN connection for Oracle for SnowflakeApp User",
    SYSTEM_CONFIG_JSON: {
  "SOURCE_DATABASE_CONF": {
    "cursor_size": 10000,
    "src_ora_host_url": "a2ec702c1-scan.us2.ocm.s7130945.oraclecloudatcustomer.com",
    "src_ora_password": "yCI2enkED2l6DzSi533cvA==",
    "src_ora_port": "1521",
    "src_ora_schema": "PSADMIN",
    "src_ora_service_name": "SLRSSDEV.us2.ocm.s7130945.oraclecloudatcustomer.com",
    "src_ora_username": "SNOWFLAKE_APP",
    "type": "oracle"
  }
}
  },
  {
    ETLF_SYSTEM_CONFIG_ID: 59,
    SYSTEM_CONFIG_TYPE: "AURORA SRC",
    SYSTEM_CONFIG_DESCRIPTION: "AURORA SOURCE CONNECTION",
    SYSTEM_CONFIG_JSON: {
  "SOURCE_DATABASE_CONF": {
    "src_aurr_db": "IM_CMOS",
    "src_aurr_host_url": "rds-xe1-nprd-dbpbem-0.cbblnd6enb2h.us-east-1.rds.amazonaws.com",
    "src_aurr_password": "y8VCkDIWmDfk44WdvS2PSg==",
    "src_aurr_port": "5432",
    "src_aurr_schema": "cm",
    "src_aurr_username": "master_cm",
    "type": "aurora"
  }
}
  },
  {
    ETLF_SYSTEM_CONFIG_ID: 60,
    SYSTEM_CONFIG_TYPE: "DEMO_DB_DIH",
    SYSTEM_CONFIG_DESCRIPTION: "GE_DEMO_DB DIH_LANDING connection for Snowflake",
    SYSTEM_CONFIG_JSON: {
  "SOURCE_DATABASE_CONF": {
    "tgt_snf_account": "aig.us-east-1",
    "tgt_snf_database": "GR_DEMOS_DEV",
    "tgt_snf_password": "Fyygqw2/tBiR+pGsrNftXg==",
    "tgt_snf_region": "AWS US West",
    "tgt_snf_schema": "DIH_LANDING",
    "tgt_snf_user_id": "USER_GR_DEMOS_DEV_DIH_LANDING_ETL",
    "tgt_snf_warehouse": "WH_GR_GP_XS",
    "type": "snowflake"
  }
}
  },
  {
    ETLF_SYSTEM_CONFIG_ID: 61,
    SYSTEM_CONFIG_TYPE: "DEMO_DB_DIH",
    SYSTEM_CONFIG_DESCRIPTION: "GE_DEMO_DB DIH connection for Snowflake",
    SYSTEM_CONFIG_JSON: {
  "SOURCE_DATABASE_CONF": {
    "tgt_snf_account": "aig.us-east-1",
    "tgt_snf_database": "GR_DEMOS_DEV",
    "tgt_snf_password": "Fyygqw2/tBiR+pGsrNftXg==",
    "tgt_snf_region": "AWS US West",
    "tgt_snf_schema": "DIH",
    "tgt_snf_user_id": "USER_GR_DEMOS_DEV_DIH_ETL",
    "tgt_snf_warehouse": "WH_GR_GP_XS",
    "type": "snowflake"
  }
}
  },
  {
    ETLF_SYSTEM_CONFIG_ID: 62,
    SYSTEM_CONFIG_TYPE: "DEMO_DB_DIH",
    SYSTEM_CONFIG_DESCRIPTION: "GE_DEMO_DB DIH_STAGING connection for Snowflake",
    SYSTEM_CONFIG_JSON: {
  "SOURCE_DATABASE_CONF": {
    "tgt_snf_account": "aig.us-east-1",
    "tgt_snf_database": "GR_DEMOS_DEV",
    "tgt_snf_password": "Fyygqw2/tBiR+pGsrNftXg==",
    "tgt_snf_region": "AWS US West",
    "tgt_snf_schema": "DIH_STAGING",
    "tgt_snf_user_id": "USER_GR_DEMOS_DEV_DIH_STAGING_ETL",
    "tgt_snf_warehouse": "WH_GR_GP_XS",
    "type": "snowflake"
  }
}
  },
  {
    ETLF_SYSTEM_CONFIG_ID: 13,
    SYSTEM_CONFIG_TYPE: "SNF_CORPRT_MRKT",
    SYSTEM_CONFIG_DESCRIPTION: "Snowflake-Lands extracts into CORPORATE_MARKETS schema",
    SYSTEM_CONFIG_JSON: {
  "SOURCE_DATABASE_CONF": {
    "tgt_snf_account": "aig.us-east-1",
    "tgt_snf_database": "IM_DEV",
    "tgt_snf_password": "4j/B0HhTjzUUZpdOPkSxb2t+7FZmildsG2zS/5xoT2Q=",
    "tgt_snf_region": "AWS US West",
    "tgt_snf_schema": "CORPORATE_MARKETS",
    "tgt_snf_user_id": "USER_IM_DEV_CORPORATE_MARKETS_ETL",
    "tgt_snf_warehouse": "WH_IM_GP_XS",
    "type": "snowflake"
  }
}
  },
  {
    ETLF_SYSTEM_CONFIG_ID: 14,
    SYSTEM_CONFIG_TYPE: "SNF_CORPRT_SRC",
    SYSTEM_CONFIG_DESCRIPTION: "Snowflake-Source connecting from CORPORATE_MARKETS schema",
    SYSTEM_CONFIG_JSON: {
  "SOURCE_DATABASE_CONF": {
    "src_snf_account": "aig.us-east-1",
    "src_snf_database": "IM_DEV",
    "src_snf_password": "4j/B0HhTjzUUZpdOPkSxb2t+7FZmildsG2zS/5xoT2Q=",
    "src_snf_region": "AWS US West",
    "src_snf_schema": "CORPORATE_MARKETS",
    "src_snf_user_id": "USER_IM_DEV_CORPORATE_MARKETS_ETL",
    "src_snf_warehouse": "WH_IM_GP_XS",
    "type": "snowflake"
  }
}
  },
  {
    ETLF_SYSTEM_CONFIG_ID: 70,
    SYSTEM_CONFIG_TYPE: "DEMO_DB_DIH",
    SYSTEM_CONFIG_DESCRIPTION: "GE_DEMO_DB DIH_STAGING connection for Snowflake",
    SYSTEM_CONFIG_JSON: {
  "SOURCE_DATABASE_CONF": {
    "cursor_size": 10000,
    "src_ora_host_url": "a2ec702c1-scan.us2.ocm.s7130945.oraclecloudatcustomer.com",
    "src_ora_password": "yb4yR+4ihMX+eGf011IZ8w==",
    "src_ora_port": "1521",
    "src_ora_service_name": "SLRLHDEV.us2.ocm.s7130945.oraclecloudatcustomer.com",
    "src_ora_username": "hadoop_app",
    "type": "oracle"
  }
}
  },
  {
    ETLF_SYSTEM_CONFIG_ID: 71,
    SYSTEM_CONFIG_TYPE: "SHARED_TOOL",
    SYSTEM_CONFIG_DESCRIPTION: "GE_DEMO_DB DIH_STAGING connection for Snowflake",
    SYSTEM_CONFIG_JSON: {
  "SOURCE_DATABASE_CONF": {
    "src_snf_account": "aig.us-east-1",
    "src_snf_database": "SHARED_TOOLS_DEV",
    "src_snf_password": "BbOZytvNtLO52V1i6Sf6DA==",
    "src_snf_region": "AWS US West",
    "src_snf_schema": "ETL",
    "src_snf_user_id": "USER_GR_DEV_DEVELOPER",
    "src_snf_warehouse": "WH_GR_GP_XS",
    "type": "snowflake"
  }
}
  },
  {
    ETLF_SYSTEM_CONFIG_ID: 72,
    SYSTEM_CONFIG_TYPE: "CASS POLL",
    SYSTEM_CONFIG_DESCRIPTION: "CASSANDRA POLLING CONNECTION",
    SYSTEM_CONFIG_JSON: {
  "SOURCE_DATABASE_CONF": {
    "cass_errornoticeemail": "michael.eke@aig.com,Jagadeep.Kummari1@aig.com",
    "cass_poll_datatable": "cda_polling_data",
    "cass_poll_jobid": "EXTRACT_CDA_API_DATA",
    "source_table": "cda_event_log",
    "src_cass_host_url": "dlgsasc2tm0114.r1-core.r1.aig.net",
    "src_cass_keyspace": "customer360",
    "src_cass_keystore": "/RDL_TLD7_DEV/DEV/RETIREMENT_DL/RAW/ETLF/cassandra_keystore/DIH_DEV-truststore.jks",
    "src_cass_keystore_pass": "a5afun3n+rwYNJ3s+3MfRA==",
    "src_cass_password": "g9VSsjHzbsGySemcQuB44Fo/2q8I7FlvGJo+5mPInds=",
    "src_cass_port": "9042",
    "src_cass_username": "customer360_etl",
    "target_table": "cda_event_log",
    "tgt_file_path": "/RDL_TLD7_DEV/DEV/RETIREMENT_DL/RAW/ETLF/tmp_files/cda_event_log.csv",
    "tgt_snf_account": "aig.us-east-1",
    "tgt_snf_database": "GR_DEV",
    "tgt_snf_password": "htRjGjRHmJ5hW8iyXSma5A==",
    "tgt_snf_schema": "CUSTOMER_360",
    "tgt_snf_user_id": "USER_GR_DEV_CUSTOMER_360_ETL",
    "tgt_snf_warehouse": "WH_GR_GP_XS",
    "type": "cassandra and snowflake"
  }
}
  },
  {
    ETLF_SYSTEM_CONFIG_ID: 73,
    SYSTEM_CONFIG_TYPE: "SF POLL",
    SYSTEM_CONFIG_DESCRIPTION: "SNOWFLAKE POLLING CONNECTION",
    SYSTEM_CONFIG_JSON: {
  "SOURCE_DATABASE_CONF": {
    "snf_account": "aig.us-east-1",
    "snf_database": "GR_DEV",
    "snf_password": "htRjGjRHmJ5hW8iyXSma5A==",
    "snf_schema": "CUSTOMER_360",
    "snf_targettable": "cda_event_log",
    "snf_userid": "USER_GR_DEV_CUSTOMER_360_ETL",
    "snf_warehouse": "WH_GR_GP_XS",
    "type": "snowflake"
  }
}
  },
  {
    ETLF_SYSTEM_CONFIG_ID: 15,
    SYSTEM_CONFIG_TYPE: "AUR_IM_CMOS_SRC",
    SYSTEM_CONFIG_DESCRIPTION: "Aurora-Source connecting from IM_CMOS/CM schema",
    SYSTEM_CONFIG_JSON: {
  "SOURCE_DATABASE_CONF": {
    "src_aurr_db": "IM_CMOS",
    "src_aurr_host_url": "rds-xe1-nprd-dbpbem-0.cbblnd6enb2h.us-east-1.rds.amazonaws.com",
    "src_aurr_password": "y8VCkDIWmDfk44WdvS2PSg==",
    "src_aurr_port": "5432",
    "src_aurr_schema": "cm",
    "src_aurr_username": "master_cm",
    "type": "aurora"
  }
}
  },
  {
    ETLF_SYSTEM_CONFIG_ID: 16,
    SYSTEM_CONFIG_TYPE: "AUR_IM_CMOS",
    SYSTEM_CONFIG_DESCRIPTION: "Aurora-Source connecting from IM_CMOS/CM schema",
    SYSTEM_CONFIG_JSON: {
  "SOURCE_DATABASE_CONF": {
    "tgt_aurr_db": "IM_CMOS",
    "tgt_aurr_host_url": "rds-xe1-nprd-dbpbem-0.cbblnd6enb2h.us-east-1.rds.amazonaws.com",
    "tgt_aurr_password": "y8VCkDIWmDfk44WdvS2PSg==",
    "tgt_aurr_port": "5432",
    "tgt_aurr_schema": "cm",
    "tgt_aurr_username": "master_cm",
    "type": "aurora"
  }
}
  },
  {
    ETLF_SYSTEM_CONFIG_ID: 82,
    SYSTEM_CONFIG_TYPE: "OMIMA001",
    SYSTEM_CONFIG_DESCRIPTION: "MIMS databases connection",
    SYSTEM_CONFIG_JSON: {
  "SOURCE_DATABASE_CONF": {
    "cursor_size": 10000,
    "src_ora_host_url": "a2ec702c1-scan.us2.ocm.s7130945.oraclecloudatcustomer.com",
    "src_ora_password": "rQQp9x88uuyffcvj073L1A==",
    "src_ora_port": "1521",
    "src_ora_service_name": "SLROMIMA001.us2.ocm.s7130945.oraclecloudatcustomer.com",
    "src_ora_username": "POR_AIS_LANA",
    "type": "oracle"
  }
}
  },
  {
    ETLF_SYSTEM_CONFIG_ID: 83,
    SYSTEM_CONFIG_TYPE: "WINOPS",
    SYSTEM_CONFIG_DESCRIPTION: "WINOPS database connection",
    SYSTEM_CONFIG_JSON: {
  "SOURCE_DATABASE_CONF": {
    "src_jdbc_driver": "adsjdbc.jar",
    "src_jdbc_driver_class": "com.extendedsystems.jdbc.advantage.ADSDriver",
    "src_jdbc_host_url": "jdbc:extendedsystems:advantage://dwsaasvcold01.r1-core.r1.aig.net:6262; user=sqladvanced;password=work4aignow;catalog = //dwsaasvcold01.r1-core.r1.aig.net/winops/WINOPS2/winops/DATABASE/winops.add",
    "src_jdbc_password": "ueLQRMzqGpwXirUg8JIUMg==",
    "src_jdbc_username": "SQLADVANCED",
    "type": "winops"
  }
}
  },
  {
    ETLF_SYSTEM_CONFIG_ID: 84,
    SYSTEM_CONFIG_TYPE: "SNF_WINOPS_DEV",
    SYSTEM_CONFIG_DESCRIPTION: "WINOPS database connection",
    SYSTEM_CONFIG_JSON: {
      "SOURCE_DATABASE_CONF": {
        "tgt_snf_account": "aig.us-east-1",
        "tgt_snf_database": "GR_DEV",
        "tgt_snf_password": "",
        "tgt_snf_region": "AWS US West",
        "tgt_snf_schema": "WINOPS",
        "tgt_snf_user_id": "",
        "tgt_snf_warehouse": "WH_GR_GP_XS",
        "type": "snowflake"
      }
    }
  },
  {
    ETLF_SYSTEM_CONFIG_ID: 37,
    SYSTEM_CONFIG_TYPE: "SS_DEV_SNFAPP",
    SYSTEM_CONFIG_DESCRIPTION: "Connection For Oracle CD2ADMIN",
    SYSTEM_CONFIG_JSON: {
  "SOURCE_DATABASE_CONF": {
    "cursor_size": 10000,
    "src_ora_host_url": "a2ec702c1-scan.us2.ocm.s7130945.oraclecloudatcustomer.com",
    "src_ora_password": "yCI2enkED2l6DzSi533cvA==",
    "src_ora_port": "1521",
    "src_ora_schema": "CD2ADMIN",
    "src_ora_service_name": "SLRSSDEV.us2.ocm.s7130945.oraclecloudatcustomer.com",
    "src_ora_username": "SNOWFLAKE_APP",
    "type": "oracle"
  }
}
  },]
export default configs;