import configs from '../ETLF_SYSTEM_CONFIG';

const salesforce_configs = configs.filter(
    value => value.SYSTEM_CONFIG_JSON.SOURCE_DATABASE_CONF.type === "salesforce")
export default salesforce_configs;