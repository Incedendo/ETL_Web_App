import React from 'react';
import GenericConfigurationGrid from './GenericConfigurationGrid';

const SecondaryTableNotSharingContext = ({ 
    rows, columns, numberColumns, primaryKeys, searchCriteria, table,
    sortingStates, editingStateColumnExtensions, tableColumnExtensions,
    columnWidths, setColumnWidths, columnDataTypes, setAddedRows
}) => {
    
    console.log(rows);
    console.log(primaryKeys);

    const TableWrapper = () => (
        <div>
            {/* {primaryKeys.map(key=> <h1 key={key}>{key}</h1>)} */}
            {}

            <GenericConfigurationGrid
                rows={rows}
                columns={columns}
                numberColumns={numberColumns}
                primaryKeys={primaryKeys}
                searchCriteria={searchCriteria}
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

    return <TableWrapper />
}

export default SecondaryTableNotSharingContext;
