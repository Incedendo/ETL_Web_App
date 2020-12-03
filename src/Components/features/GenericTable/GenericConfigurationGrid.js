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
  
import DetailCell from '../GridComponents/DetailsRow/DetailCell';
import ToggleCell from  '../GridComponents/DetailsRow/ToggleCell';


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
                editorComponent={NumberEditor} />

            <Toolbar />
            <SearchState defaultValue={''} />
            <SearchPanel />
            {/* <SortingState
                defaultSorting={sortingStates}
            /> */}
            {/* <IntegratedSorting /> */}

            <FilteringState defaultFilters={[]} />
            <IntegratedFiltering />

            {/* <EditingState
                onCommitChanges={commitChanges}
                columnExtensions={editingStateColumnExtensions}
                onAddedRowsChange={changeAddedRows}
            /> */}
            
            <RowDetailState
                defaultExpandedRowIds={[]} />
            <Table
                columnExtensions={tableColumnExtensions}
                cellComponent={Cell} />
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
                defaultHiddenColumnNames={defaultHiddenColumnNames}/>
            <TableColumnReordering 
                defaultOrder={columns.map(column => column.name)} />
            <TableRowDetail
                contentComponent={GenericRowExpansion}
                cellComponent={DetailCell} 
                toggleCellComponent={ToggleCell}
            />
            
            {/* <GroupingState
                grouping={grouping}
                onGroupingChange={setGrouping}
            />
            <IntegratedGrouping />
            <TableGroupRow />
            <GroupingPanel 
                // showGroupingControls 
            /> */}

            {/* need to place at the end */}
            <PagingState
                defaultCurrentPage={0}
                pageSize={10} />
            <IntegratedPaging />
            <PagingPanel />

            <ColumnChooser />
        </Grid> 
    );
}
        
export default GenericConfigurationGrid;