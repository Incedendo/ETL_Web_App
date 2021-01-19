import React, { useState, useEffect, useContext } from 'react';
import { useOktaAuth } from '@okta/okta-react';
import { WorkspaceContext } from '../../context/WorkspaceContext';
import axios from 'axios';
import Spinner from 'react-bootstrap/Spinner';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import ConfigurationGrid from '../GridComponents/Grids/ConfigurationGrid';
import GenericConfigurationGrid from './GenericConfigurationGrid';
import SearchModal from '../Modals/SearchModal';

const TABLESNOWFLAKE_URL = 'https://jda1ch7sk2.execute-api.us-east-1.amazonaws.com/dev/table-snowflake';
const ARN_APIGW_GET_TABLE_SNOWFLAKE = 'arn:aws:execute-api:us-east-1:516131926383:9c4k4civ0g/*/GET/table-snowflake';

const SecondaryTableNotSharingContext = ({ 
    privilege, getStatement, tableName, route,
    rows, columns, numberColumns, primaryKeys, searchCriteria, table,
    sortingStates, editingStateColumnExtensions, tableColumnExtensions,
    columnWidths, setColumnWidths, columnDataTypes, setAddedRows
}) => {
    
    console.log(rows);

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

    return <TableWrapper />
}

export default SecondaryTableNotSharingContext;
