import React, { useState, useEffect, useContext } from 'react';
import { useOktaAuth } from '@okta/okta-react';
import { WorkspaceContext } from '../../context/WorkspaceContext';
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import { mergeUpdateCatalogEntitiesFromView,
    mergeUpdateCatalogItemsFromView,
    mergeUpdateCatalogEntityLineageFromView
} from './datcatsql/refreshDataCatalog';

import {  INSERT_URL } from '../../context/URLs';

const DataCatalogRefresher = () => {

    const { debug, columnsLoaded } = useContext(WorkspaceContext);
    const [isRefreshing, setRefreshing] = useState(false);
    const { authState, authService } = useOktaAuth();
    const { accessToken } = authState;

    const options = {
        headers: {
            'Content-Type': 'application/json'
        },
    }

    function simulateNetworkRequest() {
        return new Promise((resolve) => setTimeout(resolve, 2000));
    }

    //refresh 3 tables in Data Catalog
    useEffect(() => {
        let mounted = true;
        
        if (isRefreshing) {
            const updateEntity = axios.post(INSERT_URL, {
                'sqlStatement': mergeUpdateCatalogEntitiesFromView
            } , options);
    
            const updateItem = axios.post(INSERT_URL, {
                    'sqlStatement': mergeUpdateCatalogItemsFromView
                } , options);
    
            const updateLineage = axios.post(INSERT_URL, {
                'sqlStatement': mergeUpdateCatalogEntityLineageFromView
                } , options);
            
                debug && console.log("Refreshing the Datacatalog now....")
            simulateNetworkRequest().then(() => {
                setRefreshing(false);
            });

            axios.all([updateEntity, updateItem, updateLineage]
            ).then(axios.spread((...responses) => {
                const responseOne = responses[0];
                const responseTwo = responses[1];
                const responesThree = responses[2];

                debug && console.log(responseOne);
                debug && console.log(responseTwo);
                debug && console.log(responesThree);
                // use/access the results 
            })).catch(errors => {
                // react on errors.
                debug && console.log(errors.response)
            }).finally(() =>{
                setRefreshing(false);
            })
        }

        return () => mounted = false;
    }, [isRefreshing]);

    const handleClick = () => setRefreshing(true);

    return (
        <div style={{marginTop: '10px', float: 'right' }}>
            <Button
                variant="warning"
                disabled={isRefreshing || !columnsLoaded}
                onClick={!isRefreshing ? handleClick : null}
            >
                {isRefreshing ? 'Refreshing…' : 'Refresh Data Catalog'}
            </Button>   
        </div>
    )
}

export default DataCatalogRefresher;