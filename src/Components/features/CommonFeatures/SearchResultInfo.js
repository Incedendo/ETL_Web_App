import React, { useState, useEffect, useContext } from 'react';
import { WorkspaceContext } from '../../context/WorkspaceContext';
import SearchNextXrows from './SearchNextXrows';
import { steps } from '../../context/privilege';

const SearchResultInfo = () => {

    const {
        selectAllCounts,
    } = useContext(WorkspaceContext);

    return(
        <div style={{display: 'flex'}}>
            <span style={{fontWeight: 'bold', marginLeft: '0px', marginRight: '5px' }}>Found {selectAllCounts} results:</span> 
            <SearchNextXrows 
                steps={steps}
            />
        </div>
    );
}

export default SearchResultInfo;