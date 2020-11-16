import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import '../../../../css/etlframework.scss';
import RowExpansion from '../RowExpansion';

import {WorkspaceContext} from '../../../context/WorkspaceContext';

import {
    SearchState, 
    SortingState, IntegratedSorting, 
    FilteringState, IntegratedFiltering, DataTypeProvider,
    PagingState, IntegratedPaging,
    GroupingState, IntegratedGrouping, 
    SummaryState, IntegratedSummary,
    RowDetailState, EditingState,
} from '@devexpress/dx-react-grid';

import {
    Grid, VirtualTable, DragDropProvider,
    TableHeaderRow, TableFilterRow, TableGroupRow, TableRowDetail, TableEditRow, TableSummaryRow,
    TableColumnResizing, TableColumnReordering, TableColumnVisibility,
    Toolbar, ColumnChooser,
    SearchPanel,GroupingPanel,
    PagingPanel
} from '@devexpress/dx-react-grid-bootstrap4';


import {
    getRowId,
    getCellValue, Cell, LookupEditCell,
    NumberEditor,
} from './GridHelperClass';


import { generateUpdateSQLStatement } from '../../../SQL_Operations/Edit';
import { 
    validateNumberOfFieldsForNewRow, 
    validatedDatatypesNewRow,
    generateMergeStatement,
} from '../../../SQL_Operations/Insert';

const INSERT_URL = 'https://jda1ch7sk2.execute-api.us-east-1.amazonaws.com/dev/insert';

const ConfigurationGrid = () => {

    const {
        debug,
        appIDs,
        database, 
        schema, 

        table, setReloadTable,
         
        setInsertSuccess,
        setInsertError,
        setEditError,

        isNewClicked, setIsNewClicked,
        setIsSaveClicked,

        searchCriteria,
        columns, numberColumns,
        rows, setAddedRows,

   
        editMode,setEnabledEdit,
        primaryKeys, 

        columnWidths, setColumnWidths,
        tableColumnExtensions,
        sortingStates,
        columnDataTypes, 

        //API calls
        performEditOperation,
    } = useContext(WorkspaceContext);

    const [grouping, setGrouping] = useState([
        { columnName: 'PRIVILEGE' }
    ]);

    const [defaultHiddenColumnNames] = useState([]);
    const [totalSummaryItems] = useState([
        { columnName: 'EXTRACT_CONFIG_ID', type: 'count' },
    ]);

    const [numberFilterOperations] = useState([
        'equal',
        'notEqual',
        'greaterThan',
        'greaterThanOrEqual',
        'lessThan',
        'lessThanOrEqual',
    ]);

    useEffect(() => {
        const abortController = new AbortController();
        if (editMode){
            primaryKeys.length !== 0 ? setEnabledEdit(true) : setEnabledEdit(false)
        }
        return () => {
            abortController.abort();
        };
    }, [primaryKeys])

    const EditCell = (props) => {
        const { column } = props;
        // debug && console.log('EDIT CELLS for Column:', column)
        if (column.name === 'GROUP_ID' || column.name === 'WORK_GROUP_ID') {
            debug && console.log('---200---')
            return <LookupEditCell {...props} availableColumnValues={appIDs['Read-Write']} />;
        }
        return <TableEditRow.Cell {...props} />;
    };

    // Database ,Schema and Table name
    // are already saved since Insert is on the current Table
    const insert = (addedRow) => {
        const re = /^[0-9\b]+$/;
        debug && console.log(addedRow);

        if (addedRow === '')
            return;

        //
        const extractedValues = Object.keys(addedRow).map(key => addedRow[key]);

        //concat single quote to non-numeric values then ESCAPE single quotes if any
        const processExtractedValues = extractedValues.map(
            value => re.test(value) === false ? "'" + value.replace(/'/g, "\\'") + "'" : value
        );

        const valueString = processExtractedValues.toString();
        // {Object.keys(headers).map(key => <span>{key}</span>)}
        debug && console.log(valueString);

        // //avoiding mutating the headers const directly...
        // let tempHeaders = headers;
        // tempHeaders.pop(); //remove Column PRIVILEGE to insert only the original columns of the table
        // debug && console.log('+++++++Headers: ', headers);
        debug && console.log('+++++++Search Criteria: ', searchCriteria);

        insertUsingMergeStatement(addedRow);
    
        // insertWithInsertURL(addedRow, valueString)   
    }

    const insertUsingMergeStatement = (addedRow) => {
        debug && console.log(addedRow);

        // const url = 'https://9c4k4civ0g.execute-api.us-east-1.amazonaws.com/dev/insert';
        // const url = "https://9c4k4civ0g.execute-api.us-east-1.amazonaws.com/dev/update"; 

        const sqlMergeStatement = generateMergeStatement(database, schema, table, primaryKeys, searchCriteria, addedRow);

        // Can't use performEditOperation in Context
        // bc need to ASYNCHRONOUSLY setLoading to false
        // after AXIOS call

        //data maps to event.body in lambda
        const data = { 
            sqlMergeStatement: sqlMergeStatement,
        };

        const options = {
            headers: {
                'Content-Type': 'application/json'
            },
        }

        const userConfirmed = " Please confirm Insert Merge SQL statement: " + sqlMergeStatement;

        if (window.confirm(userConfirmed)) {
            axios.post(INSERT_URL, data, options)
                .then(response => {
                    // returning the data here allows the caller to get it through another .then(...)
                    debug && console.log(response.data);
                    debug && console.log(response.status);
                    if (response.status === 200) {
                        if (response.data[0]['number of rows inserted'] > 0) {
                            setInsertSuccess(true);
                        }
                        else if (response.data[0]['number of rows inserted'] === 0) {
                            debug && console.log("Insert Error: App ID ", addedRow.GROUP_ID, " has no WRITE Privilege");
                            setInsertSuccess(false);
                            setInsertError("Insert Error: App ID ", addedRow.GROUP_ID, " has no WRITE Privilege");
                        }
                    }
                })
                .catch(err => {
                    debug && console.log(err);
                    setInsertSuccess(false);
                    setInsertError(err.message);
                })
                .finally(
                    () => setReloadTable(true)
                )
        }
    }

    const changeAddedRows = value => setAddedRows(value);

    const commitAdd = (added) => {
        let changedRows;
        debug && console.log('---post Add SAVE  clicked ---');
        debug && console.log(added);
        setIsSaveClicked(true);
        setIsNewClicked(true);

        let isAllFieldfilled = validateNumberOfFieldsForNewRow(added[0], searchCriteria, setInsertError);
        
        if (!isAllFieldfilled){
            debug && console.log("does not insert record");
            return;
        }
        
        let isValidEntry = validatedDatatypesNewRow(added[0], columnDataTypes, setInsertError);
        
        if (!isValidEntry){
            debug && console.log("does not insert record");
            return;
        }
        
        // let isUniquePrimaryValues = isUnique(rows, primaryKeys, added[0], setInsertError)

        // if (!isUniquePrimaryValues) {
        //     debug && console.log("does not insert record");
        //     return
        // }
        
        insert(added[0]);
        const startingAddedId = rows.length > 0 ? rows[rows.length - 1].id + 1 : 0;
        
        changedRows = [
            ...rows,
            ...added.map((row, index) => ({
                id: startingAddedId + index,
                ...row,
            })),
        ];
    }

    const commitEdit = changed => {
        let changedRows;
        if (shouldCommitEdit(changed)) {
            debug && console.log('---Should commit Edit verified----')
            debug && console.log('Primary keys: ', primaryKeys);
            //update all the rows
            changedRows = rows.map(row => (changed[row.id] ? { ...row, ...changed[row.id] } : row));
            debug && console.log(changed)

            //get only the edited row ID:
            let updatedRowID;
            for (let i = 0; i < rows.length; i++) {
                if (changed[rows[i].id]) {
                    updatedRowID = rows[i].id;
                    break;
                }
            }

            let sqlUpdateStatement = generateUpdateSQLStatement(
                database, schema, table, primaryKeys,
                Object.values(changed)[0], changedRows[updatedRowID]);
            if(window.confirm(sqlUpdateStatement)){
                performEditOperation(sqlUpdateStatement);
            }
        }
    }

    const shouldCommitEdit = changed => {

        if(primaryKeys.length === 0){
            setEditError('No Primary Key on this Table, unable to edit')
            return false;
        }

        debug && console.log('---changed object---', changed);

        if (isNewClicked) {
            setIsNewClicked(false);
            setInsertError('');
        }

        // const expectedDataTypeObject = generateColumn_TypeObj(headers, columnDataTypes)
        debug && console.log("expectedDataTypeObject: ", columnDataTypes);
        
        //acquire  array of Objects, each object consists of key-value pairs of the columns :
        const currentEditRecord = (Object.values(changed))[0] //expect an object
        return validatedDatatypesNewRow(currentEditRecord, columnDataTypes, setEditError)
    }

    const commitChanges = ({ added, changed, deleted }) => {
        let changedRows;
        setEditError('')
        //added is an array of all changes
        if (added) {// added[0] is the new Object added
            commitAdd(added)
            return
        }

        if (changed) {
            if(Object.values(changed)[0] !== undefined){
                commitEdit(changed);
            }
            return
        }
        if (deleted) {
            const deletedSet = new Set(deleted);
            changedRows = rows.filter(row => !deletedSet.has(row.id));
        }
    };

    return(
        <div className="leftText table-responsive">
            <Grid
                rows={rows}
                columns={columns}
                getRowId={getRowId}
                getCellValue={getCellValue}
            >
                <DragDropProvider />
                <DataTypeProvider
                    for={numberColumns}
                    availableFilterOperations={numberFilterOperations}
                    editorComponent={NumberEditor}
                />
                
                {/* Toolbar required for Display Search Box and Column Chooser Box */}
                <Toolbar />

                <SearchState 
                    defaultValue={''} 
                />

                {/* <SortingState
                    defaultSorting={sortingStates}
                /> */}

                <GroupingState
                    grouping={grouping}
                    onGroupingChange={setGrouping}
                />
                {/* <FilteringState defaultFilters={[]} /> */}
                
                <SummaryState
                    totalItems={totalSummaryItems}
                />

                {/* <EditingState
                    // onAddedRowsChange={activateAddingEditRow}
                    // onEditingRowIdsChange={stopEditRows(0)}
                    // onRowChangesChange={cancelTableEditRow}
                    onCommitChanges={commitChanges}
                    // columnExtensions={editingStateColumnExtensions}
                    // onAddedRowsChange={changeAddedRows}
                /> */}

                {/* <IntegratedSorting /> */}
                <IntegratedGrouping />
                <IntegratedFiltering /> {/* need for searching */}
                <IntegratedSummary />

                

                {/* <Table
                    columnExtensions={tableColumnExtensions}
                    cellComponent={Cell}
                /> */}
                <VirtualTable
                    columnExtensions={tableColumnExtensions}
                    cellComponent={Cell}
                />

                {/* display the filter header for each column */}
                {/* <TableFilterRow
                    showFilterSelector
                /> */}

                
                <TableColumnResizing
                    columnWidths={columnWidths}
                    onColumnWidthsChange={setColumnWidths}
                />

                {/* Show the button to choose which columns to display on the table */}
                <TableColumnVisibility
                    defaultHiddenColumnNames={defaultHiddenColumnNames}
                />
                <ColumnChooser />
                
                <TableColumnReordering 
                    defaultOrder={columns.map(column => column.name)} 
                />

                <TableHeaderRow
                    // showSortingControls
                    // showGroupingControls
                />
                <TableSummaryRow />
                
                {/* show the groups header in the grid, must have this if want to group by header */}
                <TableGroupRow /> 

                <RowDetailState
                    defaultExpandedRowIds={[]}
                />
                <TableRowDetail
                    contentComponent={RowExpansion}
                />

                {/* <TableEditRow
                    cellComponent={EditCell}
                /> */}

                {/* <TableEditColumn
                    width={60}
                    showEditCommand={true}
                    showDeleteCommand={true}
                    cellComponent={CommandColumnCell}
                    
                    //the actual add/edit/delete/save/cancel buttons
                    commandComponent={Command}
                /> */}
                
                <SearchPanel />

                {/* Grouping panel display the panel in the top left corner 
                to drag and drop headers for grouping  */}
                {/* <GroupingPanel 
                    // showGroupingControls
                    // showSortingControls
                /> */}
            </Grid> 
        </div>
    );
}
        
export default ConfigurationGrid;