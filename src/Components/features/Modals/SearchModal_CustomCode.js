import React, { useState, useEffect, useContext } from 'react';
import { useOktaAuth } from '@okta/okta-react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import CustomAutoCompleteComponent from '../GridComponents/CustomAutoCompleteComp';
import { WorkspaceContext } from '../../context/WorkspaceContext';
import { search_multi_field, search_multi_field_catalog } from '../../sql_statements';
import '../../../css/mymodal.scss';
import axios from 'axios';

import { ETLF_tables } from '../../context/FieldTypesConfig';

const TABLESNOWFLAKE_URL = 'https://jda1ch7sk2.execute-api.us-east-1.amazonaws.com/dev/table-snowflake';

const SearchModal_CustomCode = () => {

    // const { authState, authService } = useOktaAuth();
    
    const {
        debug, username,
        // database, schema, table, ,
        // columns,
        // axiosCallToGetTable,
        axiosCallToGetTableRows
    } = useContext(WorkspaceContext);


    // console.log(groupIDColumn);

    const [show, setShow] = useState(false);

    const [searchValue, setSearchValue] = useState('');

    function verifySearchObj() {
        return true;
    }

    const multiSearch = () => {
//         let searchStmt = 
// `SELECT * FROM "SHARED_TOOLS_DEV"."ETL"."ETLF_EXTRACT_CONFIG" WHERE EXTRACT_CONFIG_ID IN (
//     SELECT EXTRACT_CONFIG_ID FROM "SHARED_TOOLS_DEV"."ETL"."ETLF_CUSTOM_CODE"
//     WHERE UPPER(TRIM(CODE)) LIKE UPPER('%`+ searchValue +`%')
// );`;
    let searchStmt = 
    `SELECT ec.*, COALESCE (auth.PRIVILEGE, 'READ ONLY') AS PRIVILEGE,
        row_number() OVER(ORDER BY ec.GROUP_ID ASC) rn,
        COUNT(*) OVER() total_num_rows
        FROM "SHARED_TOOLS_DEV"."ETL"."ETLF_EXTRACT_CONFIG" ec
        FULL OUTER JOIN SHARED_TOOLS_DEV.ETL.ETLF_ACCESS_AUTHORIZATION auth 
        ON ec.GROUP_ID = auth.APP_ID AND auth.USERNAME = 'kiet.nguyen@aig.com'
        WHERE EXTRACT_CONFIG_ID IN (
            SELECT EXTRACT_CONFIG_ID FROM "SHARED_TOOLS_DEV"."ETL"."ETLF_CUSTOM_CODE"
            WHERE UPPER(TRIM(CODE)) LIKE UPPER('%`+ searchValue +`%')
    );`;
    
    console.log(searchStmt)
    axiosCallToGetTableRows( searchStmt );
    }

    return (
        <div style={{float: "left", marginLeft: "10px", marginRight: "10px"}}>
            <Button className=""
                variant="primary"
                onClick={() => { setShow(true); }}>
                Search Custom Code
            </Button>

            <Modal
                show={show}
                onHide={() => setShow(false)}
                dialogClassName="modal-150w"
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title id="example-custom-modal-styling-title">
                        Search CustomCode
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="body-height">
                        <div className="searchModal-div">
                            Custom Code: <input value={searchValue} onChange={(e) => setSearchValue(e.target.value)} />
                            <button
                                className="search-button btn btn-primary"
                                onClick={multiSearch}
                            >
                                Search
                            </button>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
}

export default SearchModal_CustomCode;


// res += `AND UPPER(TRIM(' + 'ec.` + item + `)) LIKE UPPER('%` + surroundWithQuotesIfString(currentSearchObj[item]) + `%'`;