import React, {
    useState,
    useEffect,
    useContext
} from 'react';
import axios from 'axios';
import { WorkspaceContext } from '../../context/WorkspaceContext';

const PlaygroundTab2 = () => {
    const {
        debug, accessToken,
        ARN_APIGW_GET_TABLE_SNOWFLAKE
    } = useContext(WorkspaceContext);
    
    const [rows, setState] = useState([]);

    // useEffect(() => {
    //     debug && console.log("calling useEffect in Playground Tab 2")
    //     const proposed_get_statenent = 'SELECT ETLF_SYSTEM_CONFIG_ID, SYSTEM_CONFIG_TYPE, SYSTEM_CONFIG_DESCRIPTION, SYSTEM_CONFIG_JSON FROM SHARED_TOOLS_DEV.ETL.ETLF_SYSTEM_CONFIG;';
    //     const ETLF_SYSTEM_CONFIG = 'ETLF_SYSTEM_CONFIG';
    //     const getURL = 'https://9c4k4civ0g.execute-api.us-east-1.amazonaws.com/dev/table-snowflake';
    //     if (accessToken !== '') {
    //         axios.get(getURL, {
    //                 headers: {
    //                     'type': 'TOKEN',
    //                     'methodArn': ARN_APIGW_GET_TABLE_SNOWFLAKE,
    //                     'authorizorToken': accessToken
    //                 },
    //                 //params maps to event.queryStringParameters in lambda
    //                 params: {
    //                     sql_statement: proposed_get_statenent,
    //                     tableName: ETLF_SYSTEM_CONFIG,
    //                     database: "SHARED_TOOLS_DEV",
    //                     schema: "ETL",
    //                 }
    //             })
    //             //have to setState in .then() due to asynchronous opetaions
    //             .then(response => {
    //                 debug && console.log(response.data.rows);
    //                 setState(response.data.rows);
    //             })
    //     }
    // }, [accessToken]);

    return(
        <div>
            Welcome to Playground 2
            {/* <ul>
                {
                    rows.length !== 0 && rows.map(row => row["ETLF_SYSTEM_CONFIG_ID"])
                }
            </ul> */}
            
        </div>
    )
}

export default PlaygroundTab2;