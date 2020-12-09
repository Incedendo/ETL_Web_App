import React, { useState, useEffect, useContext } from 'react';
import { useOktaAuth } from '@okta/okta-react';
import { WorkspaceContext } from '../../context/WorkspaceContext';
import axios from 'axios';
import Spinner from 'react-bootstrap/Spinner';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import GenericConfigurationGrid from './GenericConfigurationGrid';

const TABLESNOWFLAKE_URL = 'https://jda1ch7sk2.execute-api.us-east-1.amazonaws.com/dev/table-snowflake';
const ARN_APIGW_GET_TABLE_SNOWFLAKE = 'arn:aws:execute-api:us-east-1:516131926383:9c4k4civ0g/*/GET/table-snowflake';

const Table = ({ privilege, getStatement, tableName, route }) => {

    const { authState } = useOktaAuth();

    const {
        debug
    } = useContext(WorkspaceContext);


    // debug && console.log("%c prop data: ", "color: red; font-weight: bold");
    // debug && console.log(privilege);
    
    const [database, setDatabase] = useState('SHARED_TOOLS_DEV');
    const [schema, setSchema] = useState('ETL');
    const [table, setTable] = useState(tableName);
    const [reloadTable, setReloadTable] = useState(false)
    const [sqlStatement, setSqlStatement] = useState('SELECT * FROM ' + table + ';');
    
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
    
    const ID = 'EXTRACT_CONFIG_ID';

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

        debug && console.log('Current Table: ', table);
        if (table !== '') {
            axiosCallToGetTable(sqlStatement);
        } else {
            setTableLoaded(false);
            setColumns([]);
            setRows([]);
            setSearchCriteria([]);
        }

        return () => {
            abortController.abort();
        };

    }, [table]);

    useEffect(() => {
        const abortController = new AbortController();
        if (reloadTable) {
            debug && console.log('Current Table: ', table)
            axiosCallToGetTable(sqlStatement)
            setReloadTable(false);
        }

        return () => {
            abortController.abort();
        };
    }, [reloadTable]);

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

    const DropDown = ({ target, currentVal, menus, setState }) => {
        return (
            <div className="InlineDiv">
                <DropdownButton
                    id="dropdown-item-button"
                    title={!currentVal ? 'Select a ' + target : currentVal}
                    // disabled={tableSearching || tableLoading}
                >
                    {menus.map(item => (
                        <Dropdown.Item as="button" key={item}
                            onSelect={() => {
                                if (item !== table) {
                                    setState(item)
                                }
                            }}
                        >
                            {item}
                        </Dropdown.Item>

                    )
                    )}
                </DropdownButton>
            </div>
        )
    }

    const TableOptions = () => (
        <div style={{ 'height': '90px' }}>
            <div className="InlineDiv db-div">
                <div className="label-text db-text">Catalog table:</div>
                <DropDown 
                    target='Database' 
                    currentVal={table} 
                    menus={[ 
                        'DATA_STEWARD', 
                        'DATA_DOMAIN',
                        'DATA_STEWARD_DOMAIN',
                        'CATALOG_ENTITY_DOMAIN',
                        'CATALOG_ENTITIES',
                        'CATALOG_ITEMS',
                        'CATALOG_ENTITY_LINEAGE'
                    ]} 
                    setState={setTable} />
            </div>

            {/* <div className="InlineDiv auto-complete-outerDiv">
                <div className="auto-complete-div-margin">
                    <div className="label-text">Table:</div>
                    <CustomAutoCompleteComp
                        list={tableList}
                        setTarget={setTable}
                        autoSuggestModalClassName="auto-suggest-box" />
                </div>
            </div> */}
        </div>
    )

    const axiosCallToGetTable = (sqlStatement) => {
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
        debug && console.log('Propose GET sql statement: ', sqlStatement)

        debug && console.log('Table name:', table);
        debug && console.time("Pulling config for generic table");
        axios.get(TABLESNOWFLAKE_URL, {
            // headers: {
            //     'type': 'TOKEN',
            //     'methodArn': ARN_APIGW_GET_TABLE_SNOWFLAKE,
            //     'authorizorToken': accessToken
            // },
            params: { //params maps to event.queryStringParameters
                sql_statement: sqlStatement,
                database: database,
                schema: schema,
                tableName: table,
            }
        })
            //have to setState in .then() due to asynchronous opetaions
            .then(response => {
                // returning the data here allows the caller to get it through another .then(...)
                // debug && console.log('---------GET RESPONSE-----------');
                debug && console.log(response.data);

                let data = response.data.rows;
                if (data.length === 0)
                    return;

                const columnsInfo = response.data.columns;

                let originalColumns = [];
                if (columnsInfo.length > 0) {
                    originalColumns = response.data.columns.map(row => row.COLUMN_NAME);
                }
                //For generic table, cannot set Primarykeys bc
                // can't pass (for now) as props to RowExpansion Comp 
                //have to add to metaData field in each Row
                // setPrimaryKeys(['CUSTOM_CODE_ID']);

                //Case: Non-empty table
                if (data.length > 0) {

                    setSearchCriteria(originalColumns);

                    let number_typeColumns = response.data.columns.map(row => {
                        if (row.DATA_TYPE === 'NUMBER') return row.COLUMN_NAME;
                    })
                    setNumberColumns(number_typeColumns);

                    // derive an array of headers from the COLUMNS Table in INFORMATION_SCHEMA
                    let headers = response.data.columns.map(row => row.COLUMN_NAME)
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
                    setColumns([]);
                    setRows([]);
                    setSearchCriteria([]);
                }
            })
            .catch(error => {
                debug && console.log(error);
                setColumns([]);
                setRows([]);
                setSearchCriteria([]);
                setTable('');
            })
            .finally(() => {
                setTableLoaded(true);
                setTableLoading(false);
                debug && console.log("%c Time to load Table", "color: red; font-weight:bold");
                debug && console.timeEnd("Pulling config for generic table");
            });
    }
    
    const TableWrapper = () => (
        <div>
            {/* {primaryKeys.map(key=> <h1 key={key}>{key}</h1>)} */}
            <TableOptions/>
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
        </div>
    )

    return (
        <>
            {tableLoaded 
                ? <TableWrapper />
                : <div className="central-spinning-div">
                    <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                    />
                    <span style={{ 'marginLeft': '5px' }}>loading Table {table}...</span>
                </div>
            }
        </>
    )
}

export default Table;
