import React, { useState, useEffect, useContext } from 'react';
import { useOktaAuth } from '@okta/okta-react';
import { WorkspaceContext } from '../../context/WorkspaceContext';
import Button from 'react-bootstrap/Button';
import { mergeUpdateCatalogEntitiesFromView,
    mergeUpdateCatalogItemsFromView,
    mergeUpdateCatalogEntityLineageFromView
} from './datcatsql/refreshDataCatalog';

import { UPDATE_URL, INSERT_URL } from '../../context/URLs';

const DataCatalogRefresher = () => {
    const [isRefreshing, setRefreshing] = useState(false);

    const options = {
        headers: {
            'Content-Type': 'application/json'
        },
    }

    // const updateEntity = axios.post(INSERT_URL, {
    //     'sqlStatement': mergeUpdateCatalogEntitiesFromView
    // } , options);

    // const updateItem = axios.post(INSERT_URL, {
    //     'sqlStatement': mergeUpdateCatalogItemsFromView
    // } , options);

    // const updateLineage = axios.post(INSERT_URL, {
    //     'sqlStatement': mergeUpdateCatalogEntityLineageFromView
    // } , options);

    function simulateNetworkRequest() {
        return new Promise((resolve) => setTimeout(resolve, 2000));
    }

    //refresh 3 tables in Data Catalog
    useEffect(() => {
        if (isRefreshing) {
            simulateNetworkRequest().then(() => {
                setRefreshing(false);
            });

            // axios.all([updateEntity, updateItem, updateLineage]).then(axios.spread((...responses) => {
            //     const responseOne = responses[0];
            //     const responseTwo = responses[1];
            //     const responesThree = responses[2];
            //     // use/access the results 
            // })).catch(errors => {
            //     // react on errors.
            // }).finally(() =>{
            //     setRefreshing(false);
            // })
        }
    }, [isRefreshing]);

    const handleClick = () => setRefreshing(true);

    return (
        <div style={{ 'paddingTop': '10px', 'float': 'right' }}>
            <Button
                variant="outline-primary"
                disabled={isRefreshing}
                onClick={!isRefreshing ? handleClick : null}
            >
                {isRefreshing ? 'Refreshing…' : 'Refresh Data Catalog'}
            </Button>   
        </div>
    )
}

export default DataCatalogRefresher;