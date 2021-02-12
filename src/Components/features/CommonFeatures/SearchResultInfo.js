import React, { useState, useEffect, useContext } from 'react';
import { WorkspaceContext } from '../../context/WorkspaceContext';
import SearchNextXrows from './SearchNextXrows';
import { steps } from '../../context/privilege';

const SearchResultInfo = () => {

    const {
        debug, 
        table, rows,
        selectAllCounts,
        axiosCallToGetTableRows,
    } = useContext(WorkspaceContext);

    const [counts, setCounts] = useState(0);

    useEffect(() => {
        if(rows.length > 0){
            setCounts(rows.length);
        }
    }, [rows]);

    return(
        <div style={{display: 'flex'}}>
            <span style={{ 'fontWeight': 'bold', 'marginRight': '5px' }}>Found: {selectAllCounts} results</span> 
            <SearchNextXrows 
                steps={steps}
            />
        </div>
    );
}

export default SearchResultInfo;