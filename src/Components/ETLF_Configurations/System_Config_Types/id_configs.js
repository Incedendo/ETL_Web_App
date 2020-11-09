import configs from '../ETLF_SYSTEM_CONFIG';

//create the array of all Database Systems.
const system_types = configs.map(
    value => value.SYSTEM_CONFIG_JSON.SOURCE_DATABASE_CONF.type );

let system_configs = {};

// Create a MASTER system_types object:
//      Each key is a database system, value is all the configs belonging
//      to that BD system aggregated into an array
system_types.map(type => {
    system_configs[type] = configs.filter(
        value => value.SYSTEM_CONFIG_JSON.SOURCE_DATABASE_CONF.type === type);
    return;
})

const oracle_configs = configs.filter(
    value => value.SYSTEM_CONFIG_JSON.SOURCE_DATABASE_CONF.type === "oracle");

const salesforce_configs = configs.filter(
    value => value.SYSTEM_CONFIG_JSON.SOURCE_DATABASE_CONF.type === "salesforce");

const snowflake_configs = configs.filter(
    value => value.SYSTEM_CONFIG_JSON.SOURCE_DATABASE_CONF.type === "snowflake")

export {
    oracle_configs, salesforce_configs, snowflake_configs, system_configs
}
