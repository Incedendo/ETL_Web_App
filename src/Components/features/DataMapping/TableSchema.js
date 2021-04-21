import React, { useState, useEffect, useContext } from 'react';
import { useOktaAuth } from '@okta/okta-react';

import { WorkspaceContext } from '../../context/WorkspaceContext';
import { AdminContext } from '../../context/AdminContext';

const TableSchema = () => {

    const taleOptions = [ 
        'DATA_DOMAIN',
        'DATA_STEWARD', 
        'DATA_STEWARD_DOMAIN',
        'CATALOG_ENTITY_DOMAIN',
        'CATALOG_ENTITIES',
        'CATALOG_ITEMS',
        'CATALOG_ENTITY_LINEAGE',
    ]

    return(
        <div>

        </div>
    )
}

export default TableSchema;