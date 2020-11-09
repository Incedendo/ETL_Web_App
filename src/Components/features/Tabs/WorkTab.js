import React, { useState, useEffect, useContext } from 'react';
import Spinner from 'react-bootstrap/Spinner';
import { WorkspaceContext } from '../../context/WorkspaceContext';
import ConfigurationGrid from '../GridComponents/Grids/ConfigurationGrid';
import GenericConfigurationGrid from '../GenericTable/GenericConfigurationGrid';
import PkEditModal from '../Modals/PkEditModal';
import SearchModal from '../Modals/SearchModal';
import JobModal from '../Modals/JobModal';
import Route_Action_Modal from '../Modals/Route_Action_Modal';


import '../../../css/mymodal.scss';
import '../../../css/workspace.scss';

const WorkTab = () => {
    const {
        debug,
        table, columnDataTypes, 
        tableLoaded, tableLoading, tableSearching, setReloadTable,
        primaryKeys, setPrimaryKeys, columns,
        insertError, editError,
        system_configs,
        routeConfigs
    } = useContext(WorkspaceContext);

    // debug && console.log("Calling WorkTab with table ", table);

    // const [searchObj, setSearchObj] = useState({});

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
        <div className={"card expanded-height"}>
            <PrimaryKeysPanel />

            {table === "ETLF_EXTRACT_CONFIG" && <ModalPanels />}
            {table === "ETLFCALL" && 
                <JobModal
                    data={{}}
                    //for later check when insert or update row
                    uniqueCols={['WORK_GROUP_ID', 'SOURCE_TABLE']}
                    dataTypes={columnDataTypes}
                />
            }
        </div>
    )

    const ModalPanels = () => (
        <div className="modal-button">
            <div className="left-float-div">
                {
                    // system_configs && 
                    // routeConfigs  && 
                    (Object.keys(system_configs).length !== 0 && system_configs.constructor === Object) &&
                    (Object.keys(routeConfigs).length !== 0 && routeConfigs.constructor === Object) && 
                    <Route_Action_Modal />
                }
                {/* <SearchModal 
                    searchObj={searchObj}
                    setSearchObj={setSearchObj}
                /> */}
            </div>
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
        <div>
            <TableConfigPanel />

            <InsertStatus />
            <UpdateStatus />

            {tableSearching && <div>seaching...</div>}

            {
                !tableLoaded ?
                <div>
                    <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                    />
                    <span style={{ 'marginLeft': '5px' }}>loading Table {table}...</span>
                </div>
                :
                <ConfigurationGrid/> 
            }
        </div>
    )
}

export default WorkTab;