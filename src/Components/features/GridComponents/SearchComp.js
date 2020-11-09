import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { WorkspaceContext } from '../../context/WorkspaceContext';
import '../../../css/workspace.scss';

const SearchComp = () => {

    const {
        table,
        tableSearching, setTableSeaching,
        tableLoading,
        columnID, setColumnID,
        searchCriteria,
        searchValue, setSearchValue,
        setRows
    } = useContext(WorkspaceContext);

    function searchOneKey() {
        const url = 'https://9c4k4civ0g.execute-api.us-east-1.amazonaws.com/dev/search';

        console.log(url)
        setTableSeaching(true);

        let value = searchValue.replace(/'/g, "\\'");

        return axios.get(url, {
            params: {
                tableName: table,
                username: 'kiet.nguyen@aig.com',
                password: '$1ttdlBTPD',
                criterion: columnID,
                value: value
            }
        })
            .then(response => {
                // returning the data here allows the caller to get it through another .then(...)
                console.log('---------------------');
                console.log(response.data);

                const data = response.data.rows ? response.data.rows : response.data;
                data.map(row => row.PRIVILEGE === 'rw' ? row.PRIVILEGE = "READ/WRITE" : row.PRIVILEGE = "READ ONLY")
                setRows(data.map((row, index) => ({
                    id: index,
                    ...row
                })
                ));
                setTableSeaching(false);
            })
            .catch(err => {
                console.log(err);
            })
    }

    return (
        <div className="search-box">
            <div className="dropdown">
                <button className="dropbtn">{columnID ? <span>Search by: {columnID}</span> : <span>Search Criterion</span>} </button>
                <div className="dropdown-content">
                    {searchCriteria.map(criterion => (
                        <a
                            values={criterion}
                            key={criterion}
                            href="#"
                            disabled={tableSearching || tableLoading}
                            onClick={() => setColumnID(criterion)}
                        >
                            {criterion}
                        </a>
                    ))}
                </div>
            </div>

            <input type="text"
                name="tableName"
                size="35"
                value={searchValue}
                disabled={tableSearching || tableLoading}
                onChange={event => setSearchValue(event.target.value)} />

            {columnID && <button
                style={{
                    'height': '42px',
                    'borderRadius': '5px',
                    'marginLeft': '5px'
                }}
                onClick={() => searchOneKey()}
                disabled={tableSearching || tableLoading}
            >Search</button>}
        </div>
    )
}

export default SearchComp;