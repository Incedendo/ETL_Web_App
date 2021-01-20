import React, { useState, useEffect, useContext } from 'react';
import Spinner from 'react-bootstrap/Spinner';
import { WorkspaceContext } from '../../context/WorkspaceContext';
import ConfigurationGrid from '../GridComponents/Grids/ConfigurationGrid';
import GenericConfigurationGrid from '../GenericTable/GenericConfigurationGrid';
import PkEditModal from '../Modals/PkEditModal';
import SearchModal from '../Modals/SearchModal';
import SearchModal_CustomCode from '../Modals/SearchModal_CustomCode';
import JobModal from '../Modals/JobModal';
import Route_Action_Modal from '../Modals/Route_Action_Modal';

import '../../../css/mymodal.scss';
import '../../../css/workspace.scss';

const WorkTab = ({ shownModalUponChangingTable }) => {
    const {
        debug, username,
        database, schema, table, 
        columnDataTypes, 
        tableLoaded, tableLoading, tableSearching, setReloadTable,
        primaryKeys, setPrimaryKeys, columns, columnsLoaded,
        insertError, editError,
        system_configs,
        routeConfigs
    } = useContext(WorkspaceContext);

    // debug && console.log("Calling WorkTab with table ", table);

    const [searchObj, setSearchObj] = useState({});
    const [currentSearchCriteria, setCurrentSearchCriteria] = useState([]);

    // useEffect(() => {
    //     console.log('[WorkTab] shownModalUponChangingTable: '+ shownModalUponChangingTable);
    //     setShowSearchModal(shownModalUponChangingTable);
    // }, [shownModalUponChangingTable]);

    // useEffect(() => {
    //     const abortController = new AbortController();
        
    //     setPrimaryKeys(table_primaryKeys[table]);
    //     setCodeFields(fieldTypesConfigs[table]['codeFields']);
    //     setDropdownFields(fieldTypesConfigs[table]['dropdownFields']);

    //     return () => {
    //         abortController.abort();
    //     };
    // }, [table]);

    const TableConfigPanel = () => (
        // <div className={"card expanded-height"}>
       
        <div style={{
            "marginBottom":"30px",
        }}>
            <div style={{
                "display": "inline-block",
                "float": "left"
            }}>
                {/* <PrimaryKeysPanel /> */}
                {table === "ETLF_EXTRACT_CONFIG" && <ETLF_EXTRACT_CONFIG_ModalPanels />}
                {table === "ETLFCALL" && <ETLFCALL_ModalPanels />} 
            </div>
        </div>
    )

    const ETLF_EXTRACT_CONFIG_ModalPanels = () => (
        // <div className="modal-button">
        <>
            {
                (Object.keys(system_configs).length !== 0 && system_configs.constructor === Object) &&
                // (Object.keys(routeConfigs).length !== 0 && routeConfigs.constructor === Object) && 
                <div style={{float: "left", marginLeft: "10px", marginRight: "10px"}}>
                    <Route_Action_Modal />
                </div>
            }

            <LoadableSearchModal groupIDColumn={'GROUP_ID'} /> 
        </>
    )

    const ETLFCALL_ModalPanels = () => (
        // <div className="modal-button">
        <>
            <JobModal
                data={{}}
                //for later check when insert or update row
                uniqueCols={['WORK_GROUP_ID', 'SOURCE_TABLE']}
                dataTypes={columnDataTypes}
            />

            <LoadableSearchModal groupIDColumn={'WORK_GROUP_ID'} /> 
        </>
    )

    const LoadableSearchModal = ({ groupIDColumn }) => (
        <div style={{ 'float': 'left' }}>
            {/* <div style={{'display': 'flex', 'justifyContent': 'center'}}>Loading configurations...</div> */}
            { !columnsLoaded ? 
                <div style={{ 'float': 'left' }} className="central-spinning-div">
                    <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                    />
                    <span style={{ 'marginLeft': '15px' }}>loading...</span>
                </div>
                :
                <>
                    {/* ETLF_EXTRACT_CONFIG SEARCH */}
                    <SearchModal 
                        database={database} 
                        schema={schema} 
                        table={table} 
                        groupIDColumn={groupIDColumn}
                        username={username} 
                        columns={columns}
                        shown={shownModalUponChangingTable}
                        setCurrentSearchCriteria={setCurrentSearchCriteria}
                    />

                    {table === 'ETLF_EXTRACT_CONFIG' && <SearchModal_CustomCode /> }
                </>
            }
        </div>
    )

    const handleRemovePK = value => {
        setPrimaryKeys(primaryKeys.filter(primaryKey => primaryKey !== value))
    }

    const PrimaryKeysPanel = () => (
        <div className="tableName-SearchBox-Div">
            <div className="table-header bg-dark reloadTable">
                {/* <button onClick={() => setReloadTable(true)}>
                    {table}
                </button> */}
                <a onClick={() => setReloadTable(true)}>
                    {table}
                </a>
            </div>

            <div className="column">
                <div className="primary-header">
                    <span className="header">Primary key:</span>
                    {/* <PkEditModal /> */}
                </div>

                {primaryKeys.map(pk => <div key={pk} className="field">
                    <div className='data'>
                        <p>
                            {pk}
                        </p>
                    </div>
                    {pk !== "EXTRACT_CONFIG_ID" &&
                        <div className="remove">
                            <p onClick={() => handleRemovePK(pk)}>
                                X
                            </p>
                        </div>
                    }
                </div>)}

            </div>

        </div>
    )

    const InsertStatus = () => (
        <div>
            {tableLoaded && insertError !== '' && <span className='errorSignal'>{insertError}</span>}
        </div>
    )

    const UpdateStatus = () => (
        <div>
            {tableLoaded && editError !== '' &&
                <div className='errorSignal'>
                    <h4 >Update Status</h4>
                    {editError}
                </div>
            }
        </div>
    )

    return (
        <div style={{
            "display": "flex",
            "flexDirection": "column"
        }}> 
            <TableConfigPanel />

            <InsertStatus />
            <UpdateStatus />

            {tableLoaded && 
                <>
                    {Object.keys(currentSearchCriteria).length > 0 &&
                        <div style={{ 
                            'display': 'flex', 
                            'float': 'left',
                            "marginBottom": "10px"
                        }}>
                            <span style={{ 'fontWeight': 'bold', 'marginRight': '5px' }}>Filtered by: </span> 
                            {/* {renderFilteredCriteria} */}


                            {Object.keys(currentSearchCriteria).map(col => {
                                if((Object.keys(currentSearchCriteria)).indexOf(col) === (Object.keys(currentSearchCriteria)).length -1 )
                                    return(
                                        <span 
                                            key={col}
                                            style={{ 'marginRight': '5px' }}
                                        >
                                            {col}: {currentSearchCriteria[col]} 
                                        </span>
                                    )
                                else
                                    return(
                                        <span 
                                            key={col}
                                            style={{ 'marginRight': '5px' }}
                                        >
                                            {col}: {currentSearchCriteria[col]} | 
                                        </span>
                                    )
                            })} 
                        </div>
                    }

                    <ConfigurationGrid/>
                </>
            
            }

            {tableSearching && <div>seaching...</div>}

            {tableSearching &&
                <div style={{
                    "position":"relative",
                    "display": "inline-block",
                    "alignItems": "center",
                }}>
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

            {/* { tableLoaded && <ConfigurationGrid/> } */}
        </div>
    )
}

export default WorkTab;

