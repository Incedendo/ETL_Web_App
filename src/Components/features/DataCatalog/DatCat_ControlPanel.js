import React, { useState, useEffect, useContext } from 'react';
import { useOktaAuth } from '@okta/okta-react';
import { WorkspaceContext } from '../../context/WorkspaceContext';
import SearchModal from '../Modals/SearchModal';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Spinner from 'react-bootstrap/Spinner';

import DataCatalogModal from './DataCatalogModal';

const DropDown = ({ target, currentVal, menus, table, setState }) => {
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

// const TableOptions = () => (
//     <div style={{ 'height': '90px' }}>
//         <div className="InlineDiv db-div">
//             <div className="label-text db-text">Catalog table:</div>
//             <DropDown 
//                 target='Table' 
//                 currentVal={table} 
//                 menus={[ 
//                     'DATA_STEWARD', 
//                     'DATA_DOMAIN',
//                     'DATA_STEWARD_DOMAIN',
//                     'CATALOG_ENTITY_DOMAIN',
//                     'CATALOG_ENTITIES',
//                     'CATALOG_ITEMS',
//                     'CATALOG_ENTITY_LINEAGE'
//                 ]} 
//                 setState={setTable} />
//         </div>

//         {/* <div className="InlineDiv auto-complete-outerDiv">
//             <div className="auto-complete-div-margin">
//                 <div className="label-text">Table:</div>
//                 <CustomAutoCompleteComp
//                     list={tableList}
//                     setTarget={setTable}
//                     autoSuggestModalClassName="auto-suggest-box" />
//             </div>
//         </div> */}
//     </div>
// )

const DatCat_ControlPanel = () => {

    const {
        debug,
        username,
        database, schema,
        table, setTable,
        columns, columnsLoaded,
        tableLoaded,setTableLoaded,
        
    } = useContext(WorkspaceContext);

    return (
        <>
            <div style={{ 'height': '90px' }}>
                <div className="InlineDiv db-div">
                    <div className="label-text db-text">Catalog table:</div>
                    <DropDown 
                        target='Table' 
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
                        table={table}
                        setState={setTable} />
                </div>
            </div>

            {!columnsLoaded ? 
                <div className="central-spinning-div">
                    <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                    />
                    <span style={{ 'marginLeft': '5px' }}>loading...</span>
                </div>
                :
                <SearchModal
                    database={database} 
                    schema={schema} 
                    table={table} 
                    groupIDColumn={'GroupID Not applicable for Catalog'}
                    username={username} 
                    columns={columns}
                /> 
            }

            <DataCatalogModal
                table={table}
            />
        </>

    )
}

export default DatCat_ControlPanel;