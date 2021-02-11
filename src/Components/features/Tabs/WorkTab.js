import React, { useState, useEffect, useContext } from 'react';
import Spinner from 'react-bootstrap/Spinner';
import Dropdown from 'react-bootstrap/Dropdown';
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import { WorkspaceContext } from '../../context/WorkspaceContext';
import ConfigurationGrid from '../GridComponents/Grids/ConfigurationGrid';
import GenericConfigurationGrid from '../GenericTable/GenericConfigurationGrid';
import PkEditModal from '../Modals/PkEditModal';
import SearchModal from '../Modals/SearchModal';
import SearchModal_CustomCode from '../Modals/SearchModal_CustomCode';
import JobModal from '../Modals/JobModal';
import Route_Action_Modal from '../Modals/Route_Action_Modal';
import SearchFilter from '../DataCatalog/SearchFilter';

import '../../../css/mymodal.scss';
import '../../../css/workspace.scss';

const WorkTab = ({ shownModalUponChangingTable }) => {
    const {
        debug,
        table, 
        columnDataTypes, 
        tableLoaded, tableLoading, tableSearching, setReloadTable,
        primaryKeys, setPrimaryKeys, columns, columnsLoaded,
        insertError, editError,
        system_configs
    } = useContext(WorkspaceContext);

    const [currentSearchCriteria, setCurrentSearchCriteria] = useState([]);


    const TableConfigPanel = () => (
        // <div className={"card expanded-height"}>
        !columnsLoaded 
        ? <div style={{ 'float': 'left' }} className="central-spinning-div">
                <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                />
                <span style={{ 'marginLeft': '15px' }}>loading...</span>
            </div>
        : <div style={{
                "marginBottom":"30px",
            }}>
                <div style={{
                    "display": "inline-block",
                    "float": "left"
                }}>
                    {/* <PrimaryKeysPanel /> */}
                    {table === "ETLF_EXTRACT_CONFIG" 
                        && Object.keys(system_configs).length !== 0 
                        && system_configs.constructor === Object &&
                        // (Object.keys(routeConfigs).length !== 0 && routeConfigs.constructor === Object) && 
                        <div style={{float: "left", marginRight: "20px"}}>
                            <Route_Action_Modal />
                        </div>
                    }

                    {table === "ETLFCALL" && 
                        <JobModal
                            data={{}}
                            //for later check when insert or update row
                            uniqueCols={['WORK_GROUP_ID', 'SOURCE_TABLE']}
                            dataTypes={columnDataTypes}
                        />
                    }

                    <SearchModal 
                        groupIDColumn={table === "ETLF_EXTRACT_CONFIG" ? 'GROUP_ID' : 'WORK_GROUP_ID'}
                        shown={shownModalUponChangingTable}
                        setCurrentSearchCriteria={setCurrentSearchCriteria}
                    />

                    {table === 'ETLF_EXTRACT_CONFIG' &&  <SearchModal_CustomCode  setCurrentSearchCriteria={setCurrentSearchCriteria} />}
                </div>
            </div>
    )

    const handleRemovePK = value => {
        setPrimaryKeys(primaryKeys.filter(primaryKey => primaryKey !== value))
    }

    const PrimaryKeysPanel = () => (
        <div className="tableName-SearchBox-Div">
            <div className="table-header bg-dark reloadTable">
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
            <div style={{
                'fontWeight': 'bold',
                "textAlign": "left",
                "marginBottom": "10px",
                'color': 'GREEN',
            }}>
                Table: {table}
            </div>

            <TableConfigPanel />

            <InsertStatus />
            <UpdateStatus />

            {tableLoaded && 
                <>
                    <SearchFilter 
                        currentSearchCriteria={currentSearchCriteria}
                        setCurrentSearchCriteria={setCurrentSearchCriteria}
                    />
                    
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

