import React, { useState, useEffect, useContext } from 'react';
import { useOktaAuth } from '@okta/okta-react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import '../../../css/mymodal.scss';
import '../../../css/rowExpansion.scss';
import CustomCodeModal from './CustomCodeModal';
import { WorkspaceContext } from '../../context/WorkspaceContext';
import GenericConfigurationGrid from '../GenericTable/GenericConfigurationGrid';
import SecondaryTableNotSharingContext from '../GenericTable/SecondaryTableNotSharingContext';
import axios from 'axios';
import { getDataType, getFieldType } from '../FormComponents/FormUtils';
import { fieldTypesConfigs, TABLES_NON_EDITABLE_COLUMNS } from '../../context/FieldTypesConfig';
import { SELECT_URL, ARN_APIGW_GET_SELECT, INSERT_URL } from '../../context/URLs';

const GenericTableModal = ({ modalName, tableName, route, EXTRACT_CONFIG_ID, privilege }) => {

    const { authState } = useOktaAuth();
    const {
        debug,
        performAuditOperation
    } = useContext(WorkspaceContext);

    // const ID = 'EXTRACT_CONFIG_ID';
    const sqlGetStmt = `SELECT * FROM SHARED_TOOLS_DEV.ETL.ETLF_CUSTOM_CODE WHERE EXTRACT_CONFIG_ID = ` 
    + EXTRACT_CONFIG_ID + `;`;
    
    const [show, setShow] = useState(false);
    debug && console.log("route code: ", tableName);
    debug && console.log("route: ", route);

    console.log(tableName);

    debug && console.log("%c prop data: ", "color: red; font-weight: bold");
    // debug && console.log(privilege);
    
    const [database, setDatabase] = useState('SHARED_TOOLS_DEV');
    const [schema, setSchema] = useState('ETL');
    const [table, setTable] = useState(tableName);
    // const [reloadTable, setReloadTable] = useState(false)
    
    // const [sqlStatement, setSqlStatement] = useState(sqlGetStmt);
    
    const [tableLoading, setTableLoading] = useState(false)
    const [tableLoaded, setTableLoaded] = useState(false)
    const [tableSearching, setTableSeaching] = useState(false)

    const [editMode, setEditMode] = useState(false)
    const [insertMode, setInsertMode] = useState(false)
    const [deleteMode, setDeleteMode] = useState(false)

    const [insertSuccess, setInsertSuccess] = useState(false);
    const [insertError, setInsertError] = useState('');
    const [editSuccess, setEditSuccess] = useState(false);
    const [editError, setEditError] = useState('');

    const [isNewClicked, setIsNewClicked] = useState(false);
    const [isSaveClicked, setIsSaveClicked] = useState(false);
    // const[isCancelClicked, setIsCancelClicked] = useState(false);

    //update
    const [enabledEdit, setEnabledEdit] = useState(false);
    const [primaryKeys, setPrimaryKeys] = useState(['CUSTOM_CODE_ID']);
    const [remainingPrimaryKeys, setRemainingPrimaryKeys] = useState([]);

    //for Search Box:
    const [searchCriteria, setSearchCriteria] = useState([]);
    const [columnID, setColumnID] = useState('');
    const [searchValue, setSearchValue] = useState('');

    //unique columns
    const [uniqueCols, setUniqueCols] = useState([]);
    const [uniqueColumnsObj, setUniqueColumnsObj] = useState({});

    //filtering numeric values for grid
    const [numberColumns, setNumberColumns] = useState([]);

    //React Xtreme dev Grid
    const [headers, setHeaders] = useState([]);
    const [columns, setColumns] = useState([]);
    const [rows, setRows] = useState([]);
    const [addedRows, setAddedRows] = useState([]);
    const [editingStateColumnExtensions, setEditingStateColumnExtensions] = useState([]);

    const [tableColumnExtensions, setTableColumnExtensions] = useState([]);
    const [sortingStates, setSortingStates] = useState([]);
    const [columnDataTypes, setColumnDataTypes] = useState({});
    const [columnWidths, setColumnWidths] = useState([]);
    const [customCodeDataTypeObj, setCustomCodeDataTypeObj] = useState({});
    
    useEffect(() => {
        setEditMode(false);
        setInsertMode(false);
        setInsertSuccess(false);
        setInsertError('');
        setEditSuccess(false);
        setEditError('');
        setIsNewClicked(false);
        setIsSaveClicked(false);
        // setEnabledEdit(false);
        // setGenericTableDataTypeObj(customCodeDataTypeObj);
    }, []);
    
    useEffect(() => {
        const abortController = new AbortController();
        if(show){
            axiosCallToGetTable(sqlGetStmt);
        }
        return () => {
            abortController.abort();
        };

    }, [show]);

    useEffect(()=>{
        debug && console.log(rows);
    }, [rows]);

    useEffect(() => {
        
        const abortController = new AbortController();
        const { accessToken } = authState;

        let sql = `SELECT COLUMN_NAME, DATA_TYPE, IS_IDENTITY FROM "SHARED_TOOLS_DEV"."INFORMATION_SCHEMA"."COLUMNS" 
    WHERE 
    //TABLE_SCHEMA = '' AND 
    TABLE_NAME = 'ETLF_CUSTOM_CODE'
    ORDER BY ORDINAL_POSITION;`;

        // const getURL = 'https://9c4k4civ0g.execute-api.us-east-1.amazonaws.com/dev/table-snowflake';
        axios.get(SELECT_URL, {
                headers: {
                    'type': 'TOKEN',
                    'methodArn': ARN_APIGW_GET_SELECT,
                    'authorizorToken': accessToken
                },
                params: { //params maps to event.queryStringParameters
                    sqlStatement: sql,
                }
            })
            //have to setState in .then() due to asynchronous opetaions
            .then(response => {
                const columnsInfo = response.data;
                setSearchCriteria(columnsInfo);
                //derive an array of types of item in above array.

                if (response.data.length > 0) {

                    // setSearchCriteria(originalColumns);

                    let number_typeColumns = response.data.map(row => {
                        if (row.DATA_TYPE === 'NUMBER') return row.COLUMN_NAME;
                    })
                    setNumberColumns(number_typeColumns);

                    // derive an array of headers from the COLUMNS Table in INFORMATION_SCHEMA
                    let headers = response.data.map(row => row.COLUMN_NAME)
                    headers.push("PRIVILEGE");
                    setHeaders(headers);
                    // debug && console.log('******headers :', tableColumns)

                    //React Grid Lib Columns must follow a predefined structure of Extreme Dev columns
                    setColumns(
                        headers.map(header => ({ name: header, title: header }))
                    )

                    setColumnWidths(
                        headers.map(header => ({ columnName: header, width: 150 }))
                    )

                    setTableColumnExtensions(
                        headers.map(header => ({ columnName: header, align: 'center' }))
                    )

                    setSortingStates(
                        headers.map(header => ({ columnName: header, direction: 'asc' }))
                    )

                    //derive an array of types of item in above array.
                    let dataTypeObj = {}
                    for (let id in columnsInfo) {
                        let column_name = columnsInfo[id].COLUMN_NAME
                        let column_type = columnsInfo[id].DATA_TYPE
                        if (column_type === 'TEXT') {
                            dataTypeObj[column_name] = "string"
                        } else if (column_type === 'TIMESTAMP_NTZ') {
                            dataTypeObj[column_name] = "timestamp"
                        } else {
                            dataTypeObj[column_name] = "number"
                        }
                    }

                    debug && console.log('Data types OBJ of columns in table: ', dataTypeObj);

                    // debug && console.log(dataTypeObj)
                    // columnsInfo.map(row => {
                        
                    //     row['metaData'] = {
                    //         database: 'SHARED_TOOLS_DEV',
                    //         schema: 'ETL',
                    //         table: tableName,
                    //         primaryKeys: primaryKeys,
                    //         PRIVILEGE: privilege === 'READ ONLY'
                    //             ? row.PRIVILEGE = "READ ONLY"
                    //             : row.PRIVILEGE = "READ/WRITE",
                    //         route: route
                    //     };
                    // })

                    // let dataTypeObj = {}
                    // for (let id in columnsInfo) {
                    //     let column_name = columnsInfo[id].COLUMN_NAME;
                    //     let column_type = columnsInfo[id].DATA_TYPE;
                    //     dataTypeObj[column_name] = getDataType(column_type);
                    // }   
                    // debug && console.log(dataTypeObj)

                    debug && console.log('Data types OBJ of columns in table: ', dataTypeObj);
                    setCustomCodeDataTypeObj(dataTypeObj)
                }
            });

        return () => {
            abortController.abort();
        };
        
    }, [])

    const disableColumnsContainingPK = () => {
        let columnDisabledArr = [
            { columnName: 'PRIVILEGE', editingEnabled: false },
        ]

        for (let key in primaryKeys) {
            debug && console.log("primary key: ", primaryKeys[key])
            columnDisabledArr.push({
                columnName: primaryKeys[key], editingEnabled: false
            })
        }

        debug && console.log('>>>>>>>>Disabled Columns>>>>>>>>>>>', columnDisabledArr);
        setEditingStateColumnExtensions(columnDisabledArr)
    }

    useEffect(() => disableColumnsContainingPK(), [primaryKeys])

    const getCustomColumns = (columns, field, condition) => {
        let result = []
        columns.map(row => {
            if (row[field] === condition) {
                result.push(row.COLUMN_NAME)
            }
        })

        return result;
    }

    const axiosCallToGetTable = (sqlGetStmt) => {
        const { accessToken } = authState;
        // const getURL = 'https://9c4k4civ0g.execute-api.us-east-1.amazonaws.com/dev/table-snowflake';

        setTableLoaded(false);
        setTableLoading(true);
        setTableSeaching(false);
        setSearchValue('');

        setEditMode(false);
        setInsertMode(false);

        setEditError('');
        setInsertError('');

        // Use Username to generate Get Statement Inner Join
        // with Authorization table.
        // let proposed_get_statenent = 'SELECT * FROM SHARED_TOOLS_DEV.ETL.ETLF_CUSTOM_CODE WHERE EXTRACT_CONFIG_ID = '
        //     + propData[ID] + ';'; 
        debug && console.log('Propose GET sql statement: ', sqlGetStmt)

        debug && console.log('Table name:', table);
        debug && console.time("Pulling config for generic table");
        axios.get(SELECT_URL, {
            headers: {
                'type': 'TOKEN',
                'methodArn': ARN_APIGW_GET_SELECT,
                'authorizorToken': accessToken
            },
            params: { //params maps to event.queryStringParameters
                sqlStatement: sqlGetStmt
            }
        })
            //have to setState in .then() due to asynchronous opetaions
            .then(response => {
                // returning the data here allows the caller to get it through another .then(...)
                // debug && console.log('---------GET RESPONSE-----------');
                debug && console.log(response.data);
                let data = response.data;
                //Case: Non-empty table
                if (data.length > 0) {
                    //need this to set PRIVILEGE for each row of Data based on Privilege of Parent
                    data.map(row => {
                        row['metaData'] = {
                            database: 'SHARED_TOOLS_DEV',
                            schema: 'ETL',
                            table: tableName,
                            primaryKeys: primaryKeys,
                            PRIVILEGE: privilege === 'READ ONLY'
                                ? row.PRIVILEGE = "READ ONLY"
                                : row.PRIVILEGE = "READ/WRITE",
                            route: route
                        };
                    })
                    
                    setRows(data.map((row, index) => ({
                        id: index,
                        ...row
                    })));
                }
                //empty table
                else {
                    //reset all fields from previous table load
                    setRows([]);
                }
            })
            .catch(error => {
                debug && console.log(error);
                // setColumns([]);
                setRows([]);
                // setSearchCriteria([]);
                setTable('');
            })
            .finally(() => {
                setTableLoaded(true);
                setTableLoading(false);
                debug && console.log("%c Time to load Table", "color: red; font-weight:bold");
                debug && console.timeEnd("Pulling config for generic table");
            });
    }

    const loadTableRows = (dbTableRows, primaryKey) => {

        // setPrivilege(dbTableRows.map(row => row.PRIVILEGE));
        setRows([]);
        setRows(
            dbTableRows.map((row, index) => ({
                id: row[primaryKey],
                ...row
            }))
        )
    }

    const insertUsingMergeStatement = (sqlMergeStatement, values, setValidating, performReload) => {

        // const url = 'https://9c4k4civ0g.execute-api.us-east-1.amazonaws.com/dev/insert';

        // Can't use performEditOperation in Context
        // bc need to ASYNCHRONOUSLY setLoading to false
        // after AXIOS call 

        //data maps to event.body in lambda
        const data = {
            sqlStatement: sqlMergeStatement,
        };

        const options = {
            headers: {
                'Content-Type': 'application/json'
            },
        }

        const userConfirmedMsg = " Please confirm Insert Merge SQL statement: " + sqlMergeStatement;

        if (window.confirm(userConfirmedMsg)) {
            let insert_status = "FAILURE";
            console.log(values);
            axios.post(INSERT_URL, data, options)
                .then(response => {
                    // returning the data here allows the caller to get it through another .then(...)
                    debug && console.log(response.data);
                    debug && console.log(response.status);
                    if (response.status === 200) {
                        if (response.data[0]['number of rows inserted'] > 0) {
                            setInsertSuccess(true);
                            setInsertError('');

                            let newRows = [...rows];
                            
                            console.log('----B4 adding extra fields');
                            console.log(rows);
                            console.log(newRows);
                            
                            // if(performReload) setReloadTable(true);
                            values['PRIVILEGE'] = 'READ/WRITE';                            
                            //CONVERT ALL NON-NUMERIC VAL TO UPPER CASE B4 SAVING:    
                            (Object.keys(values)).map(col => {
                                if(isNaN(values[col]))
                                    values[col] = values[col].toUpperCase().trim();
                            })

                            values['metaData'] = {
                                'database': database,
                                'schema': schema,
                                'table': table,
                                'primaryKeys': fieldTypesConfigs[table]['primaryKeys'],
                                
                            }

                            console.log('----after modifying values to newRows...');
                            console.log(values);
                            newRows.push(values);
                            console.log(newRows);
                            
                            // setRows([]);
                            // setRows(newRows);

                            loadTableRows(newRows, fieldTypesConfigs[table]['primaryKeys'])

                            insert_status = "SUCCESS";
                        }
                        // else if (response.data[0]['number of rows inserted'] === 0 && table !=='ETLF_CUSTOM_CODE') {
                        //     debug && console.log("Insert Error: App ID ", values.GROUP_ID, " has no WRITE Privilege");
                        //     setInsertSuccess(false);
                        //     setInsertError("Insert Error: App ID ", values.GROUP_ID, " has no WRITE Privilege");
                        // }
                    }
                })
                .catch(err => {
                    debug && console.log(err.message);
                    setInsertSuccess(false);
                    setInsertError(err.message);
                })
                .finally(() => {
                    // axiosCallToGetTable(sqlGetStmt);
                    performAuditOperation('INSERT', primaryKeys, values, sqlMergeStatement, insert_status)
                })
        }else{
            setValidating(false);
        }
    }



    return (
        <div className="job-modal">
            <Button className="button-margin"
                variant="primary"
                onClick={() => setShow(true)}>
                Custom Code
            </Button>

            <Modal
                show={show}
                onHide={() => setShow(false)}
                dialogClassName="route-modal-width"
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title id="example-custom-modal-styling-title">
                        {modalName}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <CustomCodeModal
                        table={tableName}
                        EXTRACT_CONFIG_ID={EXTRACT_CONFIG_ID}
                        privilege={privilege}
                        uniqueCols={[]}
                        insertUsingMergeStatement={insertUsingMergeStatement}
                        customCodeDataTypeObj={customCodeDataTypeObj}
                    />

                    {tableLoading && 
                        <div style={{'display': 'flex', 'marginLeft': 'auto', 'marginRight': 'auto'}}>
                            loading data ...
                        </div>
                    }

                    {privilege !== undefined && tableLoaded && 
                        // <Table
                        //     // propData={data}
                        //     privilege={data['PRIVILEGE']}
                        //     getStatement={proposed_get_statenent}
                        //     tableName={tableName}
                        //     route={route}
                        //     isDataCatalog={false}
                        // />
                        <GenericConfigurationGrid
                            rows={rows}
                            columns={columns}
                            numberColumns={numberColumns}
                            primaryKeys={primaryKeys}
                            searchCriteria={searchCriteria}
                            // reloadTable={reloadTable}
                            // setReloadTable={setReloadTable}
                            table={table}
                            sortingStates={sortingStates}
                            editingStateColumnExtensions={editingStateColumnExtensions}
                            tableColumnExtensions={tableColumnExtensions}
                            columnWidths={columnWidths}
                            setColumnWidths={setColumnWidths}
                            columnDataTypes={columnDataTypes}
                            setAddedRows={setAddedRows}
                        />
                    }
                    
                </Modal.Body>
            </Modal>
        </div>
    )
}

export default GenericTableModal;