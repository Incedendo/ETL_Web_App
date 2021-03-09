import React, { useState, useEffect, useContext } from 'react';
import { useOktaAuth } from '@okta/okta-react';
import { WorkspaceContext } from '../../context/WorkspaceContext';
import ConfigurationGrid from '../GridComponents/Grids/ConfigurationGrid';
import DatCat_ControlPanel from '../DataCatalog/DatCat_ControlPanelLinked';

const Table = ({ privilege, tableName, route, isDataCatalog, linkState }) => {

    const { authState } = useOktaAuth();

    const {
        setTable,
        tableLoaded
    } = useContext(WorkspaceContext);

    useEffect(()=> {
        setTable('CATALOG_ENTITY_LINEAGE');
    }, []);

    return (
        <div>
            { isDataCatalog && <DatCat_ControlPanel linkState={linkState} /> }
            { tableLoaded && <ConfigurationGrid/> }
        </div>
    )
}

export default Table;
