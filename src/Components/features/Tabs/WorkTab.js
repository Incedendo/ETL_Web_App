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

const WorkTab = () => {
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
            "margin-bottom":"30px",
        }}>
            <div style={{
                "display": "inline-block",
                "float": "left"
            }}>
                {/* <PrimaryKeysPanel /> */}
                {table === "ETLF_EXTRACT_CONFIG" && <ETLF_EXTRACT_CONFIG_ModalPanels />}
                {table === "ETLFCALL" && 
                    <>
                        <JobModal
                            data={{}}
                            //for later check when insert or update row
                            uniqueCols={['WORK_GROUP_ID', 'SOURCE_TABLE']}
                            dataTypes={columnDataTypes}
                        />

                        <LoadableSearchModal groupIDColumn={'WORK_GROUP_ID'} /> 
                    </>
                } 
            </div>
        </div>
    )

    const ETLF_EXTRACT_CONFIG_ModalPanels = () => (
        // <div className="modal-button">
        <>
            {
                (Object.keys(system_configs).length !== 0 && system_configs.constructor === Object) &&
                (Object.keys(routeConfigs).length !== 0 && routeConfigs.constructor === Object) && 
                <div style={{float: "left", marginLeft: "10px", marginRight: "10px"}}>
                    <Route_Action_Modal />
                </div>
            }

            <LoadableSearchModal groupIDColumn={'GROUP_ID'} /> 
        </>
    )

    const LoadableSearchModal = ({ groupIDColumn }) => (
        <>
            { !columnsLoaded ? 
                <div style={{ 'float': 'left' }} className="central-spinning-div">
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
                <>
                    {/* ETLF_EXTRACT_CONFIG SEARCH */}
                    <SearchModal 
                        database={database} 
                        schema={schema} 
                        table={table} 
                        groupIDColumn={groupIDColumn}
                        username={username} 
                        columns={columns}
                    />

                    {/* CUSTOMcODE CATALOG */}
                    <SearchModal_CustomCode /> 
                </>
            }
        </>
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
            "flex-direction": "column"
        }}> 
            <TableConfigPanel />

            <InsertStatus />
            <UpdateStatus />

            {tableSearching && <div>seaching...</div>}

            {tableSearching &&
                <div style={{
                    "position":"relative",
                    "display": "inline-block",
                    "align-items": "center",
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

            { tableLoaded && <ConfigurationGrid/> }
        </div>
    )
}

export default WorkTab;

