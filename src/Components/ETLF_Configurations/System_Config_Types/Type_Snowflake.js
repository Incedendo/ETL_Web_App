import configs from '../ETLF_SYSTEM_CONFIG';

const snowflake_configs = configs.filter(
    value => value.SYSTEM_CONFIG_JSON.SOURCE_DATABASE_CONF.type === "snowflake")
export default snowflake_configs;