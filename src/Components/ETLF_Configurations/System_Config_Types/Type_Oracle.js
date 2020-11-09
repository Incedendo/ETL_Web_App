import configs from '../ETLF_SYSTEM_CONFIG';

const oracle_configs = configs.filter(
    value => value.SYSTEM_CONFIG_JSON.SOURCE_DATABASE_CONF.type === "oracle")
export default oracle_configs;