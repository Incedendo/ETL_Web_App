import React, { useState, useEffect, useContext } from 'react';
import {WorkspaceContext} from '../../context/WorkspaceContext';

import {
    EditingState,
    GroupingState, IntegratedGrouping,
    SortingState, IntegratedSorting,
    SearchState, 
    FilteringState, IntegratedFiltering, DataTypeProvider,
    PagingState, IntegratedPaging,
    RowDetailState,
} from '@devexpress/dx-react-grid';

import {
    Grid, DragDropProvider, 
    Table, TableHeaderRow, TableGroupRow, TableFilterRow, TableRowDetail,
    Toolbar, ColumnChooser,
    SearchPanel,
    PagingPanel, GroupingPanel,
    TableColumnResizing, TableColumnReordering, TableColumnVisibility
} from '@devexpress/dx-react-grid-bootstrap4';

import {
    getRowId,
    getCellValue, Cell, NumberEditor
} from '../GridComponents/Grids/GridHelperClass';
import GenericRowExpansion from './GenericRowExpansion';

const GenericConfigurationGrid = ({
   
    rows, columns, numberColumns,
    sortingStates,
    tableColumnExtensions,
    columnWidths, setColumnWidths,
}) => {

    const {debug} = useContext(WorkspaceContext);
    
    debug && console.log(rows);


    // const [grouping, setGrouping] = useState([{ columnName: 'ACTIVE' }]);
    const [grouping, setGrouping] = useState([]);
    const [defaultHiddenColumnNames] = useState([]);
    const [numberFilterOperations] = useState([
        'equal',
        'notEqual',
        'greaterThan',
        'greaterThanOrEqual',
        'lessThan',
        'lessThanOrEqual',
    ]);

    return(
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

            <PagingState
                defaultCurrentPage={0}
                pageSize={10}
            />
            
            <SearchState defaultValue={''} />
            <SortingState
                defaultSorting={sortingStates}
            />

            <GroupingState
                grouping={grouping}
                onGroupingChange={setGrouping}
            />

            <FilteringState defaultFilters={[]} />

            {/* <EditingState
                onCommitChanges={commitChanges}
                columnExtensions={editingStateColumnExtensions}
                onAddedRowsChange={changeAddedRows}
            /> */}

            <IntegratedPaging />
            <IntegratedSorting />
            <IntegratedGrouping />
            <IntegratedFiltering />

            <RowDetailState
                defaultExpandedRowIds={[]}
            />
            <Table
                columnExtensions={tableColumnExtensions}
                cellComponent={Cell}
            />
            <TableColumnResizing
                columnWidths={columnWidths}
                onColumnWidthsChange={setColumnWidths}
            />
            <TableHeaderRow 
                // showSortingControls 
                // showGroupingControls
            />

            {/* <TableFilterRow
                showFilterSelector
            /> */}

            <TableColumnVisibility
                defaultHiddenColumnNames={defaultHiddenColumnNames}
            />

            <TableColumnReordering defaultOrder={columns.map(column => column.name)} />
            
            <TableGroupRow />
            
            <TableRowDetail
                contentComponent={GenericRowExpansion}
            />

            {/* <TableEditRow
                cellComponent={EditCell}
            /> */}

            {/* <TableEditColumn
                width={60}
                // showAddCommand={!addedRows.length && insertMode}
                // showEditCommand={editMode && enabledEdit}
                // showDeleteCommand={rows.length && deleteMode}
                showEditCommand={true}
                showDeleteCommand={true}
                cellComponent={CommandColumnCell}
                
                //the actual add/edit/delete/save/cancel buttons
                commandComponent={Command}
            /> */}

            <Toolbar />
            <SearchPanel />
            <GroupingPanel showGroupingControls />
            <PagingPanel />

            <ColumnChooser />
        </Grid> 
    );
}
        
export default GenericConfigurationGrid;