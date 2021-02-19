import React, { useState, useEffect, useContext } from 'react';
import { WorkspaceContext } from '../../context/WorkspaceContext';
import { startingLo, startingHi, steps, caseAdmin, caseOperator, selectCount } from '../../context/privilege'

import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import CustomAutoCompleteComponent from '../GridComponents/CustomAutoCompleteComp';
import { search_multi_field, search_multi_field_catalog } from '../../sql_statements';
import '../../../css/mymodal.scss';
import UpArrow8 from '../../../media/LinkIcon/up-arrow_8.svg';
import DownArrow8 from '../../../media/LinkIcon/down-arrow_8.svg';

const SearchModal_CustomCode = ({ setCurrentSearchCriteria }) => {
    
    const {
        debug,
        setTable,
        clearLoHi,
        axiosCallToGetTableRows,
        setSelectAllStmtEveryX,
        axiosCallToGetCountsAndTableRows
    } = useContext(WorkspaceContext);

    const [show, setShow] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [fontSize, setFontsize] = useState(15);

    // useEffect(()=> {
    //     // setTable('ETLF_CUSTOM_CODE');
    // }, [])

    // const multiSearch_ETLF_EXTRACT_CONFIG = () => {
    //     let searchStmt = 
    //     `SELECT ec.*, COALESCE (auth.PRIVILEGE, 'READ ONLY') AS PRIVILEGE,
    //         row_number() OVER(ORDER BY ec.GROUP_ID ASC) rn,
    //         COUNT(*) OVER() total_num_rows
    //         FROM "SHARED_TOOLS_DEV"."ETL"."ETLF_EXTRACT_CONFIG" ec
    //         FULL OUTER JOIN SHARED_TOOLS_DEV.ETL.ETLF_ACCESS_AUTHORIZATION auth 
    //         ON ec.GROUP_ID = auth.APP_ID AND auth.USERNAME = 'kiet.nguyen@aig.com'
    //         WHERE EXTRACT_CONFIG_ID IN (
    //             SELECT EXTRACT_CONFIG_ID FROM "SHARED_TOOLS_DEV"."ETL"."ETLF_CUSTOM_CODE"
    //             WHERE UPPER(TRIM(CODE)) LIKE UPPER('%`+ searchValue +`%')
    //     );`;
        
    //     debug && console.log(searchStmt)
    //     axiosCallToGetTableRows( searchStmt, ['EXTRACT_CONFIG_ID'] );
    // }

    const multiSearch_CUSTOM_CODE = () => {
        // setTable('ETLF_CUSTOM_CODE');
        clearLoHi();

        setCurrentSearchCriteria({
            'CUSTOM_CODE': searchValue
        })

        // let searchStmt = `
        // SELECT A.SOURCE_TABLE, B.*, COALESCE (auth.PRIVILEGE, 'READ ONLY') AS PRIVILEGE
        // FROM "SHARED_TOOLS_DEV"."ETL"."ETLF_EXTRACT_CONFIG" A
        // LEFT JOIN SHARED_TOOLS_DEV.ETL.ETLF_ACCESS_AUTHORIZATION auth 
        // ON A.GROUP_ID = auth.APP_ID 
        // INNER JOIN (
        //     SELECT * FROM "SHARED_TOOLS_DEV"."ETL"."ETLF_CUSTOM_CODE"
        //     WHERE UPPER(TRIM(CODE)) LIKE UPPER('%`+ searchValue +`%')
        // ) B
        // ON A.EXTRACT_CONFIG_ID = B.EXTRACT_CONFIG_ID`

        const selectCriteria = `SELECT EEC.SOURCE_TABLE, ECC.*, COALESCE (auth.PRIVILEGE, 'READ ONLY') AS PRIVILEGE, ROW_NUMBER() OVER(ORDER BY EEC.EXTRACT_CONFIG_ID ASC) RN `;
        const bodySQL = `
        FROM "SHARED_TOOLS_DEV"."ETL"."ETLF_EXTRACT_CONFIG" EEC
        LEFT JOIN SHARED_TOOLS_DEV.ETL.ETLF_ACCESS_AUTHORIZATION auth 
        ON EEC.GROUP_ID = auth.APP_ID 
        INNER JOIN "SHARED_TOOLS_DEV"."ETL"."ETLF_CUSTOM_CODE" ECC
        ON EEC.EXTRACT_CONFIG_ID = ECC.EXTRACT_CONFIG_ID
        WHERE UPPER(TRIM(CODE)) LIKE UPPER('%`+ searchValue +`%')`

        const getRowsCount = selectCount + bodySQL;
        let SearchSqlStatement = `SELECT * FROM (
            ` + selectCriteria + `
            ` + bodySQL + `    
        )
        `;
        setSelectAllStmtEveryX(SearchSqlStatement);
        let SearchSqlStatementFirstX = SearchSqlStatement +`
        WHERE RN >= ` + startingLo +` AND RN <= ` + startingHi;
        
        // debug && console.log(searchStmt);
        
        //wait till table === 'ETLF_CUSTOM_CODE'
        // axiosCallToGetTableRows( searchStmt, ['CUSTOM_CODE_ID'] );

        axiosCallToGetCountsAndTableRows(getRowsCount, SearchSqlStatementFirstX, ['CUSTOM_CODE_ID']);
        
    }

    return (
        <div style={{float: "left", marginRight: "10px"}}>
            <Button className=""
                variant="outline-primary"
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
                        {/* <div className="searchModal-div"> */}
                        <div>
                            <div style={{'marginBottom': '10px'}}>
                                <span style={{'marginRight': '5px'}}>Custom Code:</span> 
                                <button style={{'height': '25px'}} onClick={()=>setFontsize(fontSize+1)}><img src={UpArrow8} /></button>
                                <button style={{'height': '25px'}} onClick={()=>setFontsize(fontSize-1)}><img src={DownArrow8} /></button>
                            </div>
                            
                            {/* <input value={searchValue} onChange={(e) => setSearchValue(e.target.value)} /> */}
                            
                            <Editor
                                value={searchValue}
                                onValueChange={
                                    value => setSearchValue(value)
                                }
                                disabled={false}
                                highlight={code => highlight(code, languages.js, 'javascript')}
                                padding={10}
                                style={{
                                    fontFamily: '"Fira code", "Fira Mono", monospace',
                                    fontSize: fontSize,
                                }}
                            />

                            <button 
                                className="search-button btn btn-primary topMargin"
                                onClick={()=>{
                                    setTable('ETLF_CUSTOM_CODE');
                                    multiSearch_CUSTOM_CODE();
                                }}
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