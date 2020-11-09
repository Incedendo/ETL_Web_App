import React, { useState, useEffect } from 'react';

// import 'bootstrap/dist/css/bootstrap.css';
// import 'bootstrap/dist/css/bootstrap-theme.css';
import axios from 'axios';
import logo from './logo.svg';
import './App.css';


import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import './css/dropdown.css';
import EditableTable from './Components/EditableTable';

import { EditingState } from '@devexpress/dx-react-grid';
import {
  Grid,
  Table,
  TableHeaderRow,
  TableEditRow,
  TableEditColumn,
} from '@devexpress/dx-react-grid-bootstrap4';

const introStyle = {
  height: '100px',
  fontWeight: 'bold',
  fontSize: '30px'
}

const successSignal = {
  color: 'green',
  fontWeight: 'bold',
}

const errorSignal = {
  color: 'red',
  fontWeight: 'bold',
}

const insertDivStyle = {
  height: '100px',
}

const dropdownStyle = {
  height: '100px',
}

const pStyle = {
  fontWeight: 'bold',
  fontSize: '15px',
  textAlign: 'center'
};

const tableStyle = {
  overflowX: 'auto',
  width: '100%',
}

const databases = ["GR_DEV", "GR_PROD", "GR_UAT",
                   "IR_DEV", "IR_UAT", "IR_PROD",
                   "LIFE_DEV", "LIFE_PROD", "LIFE_UAT"
                  ]

const schemas = ["USER_SPACE", "CUSTOMER_360"]

// const listOfTables = [
//                       "ETLF_EXTRACT_CONFIG_MEKE2407",
//                       "ETLF_CUSTOM_CODE_5_15"
//                       ]

const listOfTables = [
                      "REACT_TEST_TABLE",
                      "TI_ROOSTER"
                      ]


const getRowId = row => row.id;


const App = () => {
  const [database, setDatabase] = useState('GR_DEV');
  const [schema, setSchema] = useState('USER_SPACE');

  const [table, setTable] = useState('');
  const [tableRows, setTableRows] = useState([]);
  const [tableLoading, setTableLoading] = useState(false)
  const [tableLoaded, setTableLoaded] = useState(false)

  //for drop-down insert:
  const [insertTableName, setInsertTableName] = useState('');
  const [insertRow, setInsertRow] = useState({});

  const [insertValues, setInsertValues] = useState('');
  const [insertSuccess, setInsertSuccess] = useState(false);
  const [insertClicked, setInsertClicked] = useState(false);

  //for Search Box:
  const [searchCriteria, setSearchCriteria] = useState([]);
  const [columnID, setColumnID] = useState('');
  const [searchValue, setSearchValue] = useState('');

  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);

  function getCustomTable(tableName) {

    setTableLoaded(false);
    setTableLoading(true);

    // const url = 'https://xua2nz0nc5.execute-api.us-east-1.amazonaws.com/latest/getData';
    const url = 'http://localhost:9000/table/'+tableName;
    console.log(url)
    axios.get(url).then(response => {
      // returning the data here allows the caller to get it through another .then(...)
      console.log('---------------------');
      console.log(response);
      console.log(response.data);
      setTable(tableName);

      //Case: Empty table
      if(response.data.length !== 0){
        const headers = Object.keys(response.data[0]).map(key => key); //array of headers
        setColumns(
          headers.map(header => ({name: header, title: header}))
        )
        setRows(response.data.map((changedRow,index) => ({id: index,...changedRow})))
        setSearchCriteria(Object.keys(response.data[0]));
        setTableLoaded(true);
      }
      else{
        const headers = [];
        setColumns([]);
        setRows([]);
        setSearchCriteria([]);
        setTableLoaded(false);
      }

      setTableLoading(false);
    })
  }

  function searchOneKey() {
    let url;

    if(searchValue === ''){
      url = 'http://localhost:9000/table/' + table;
    }else{
      url = 'http://localhost:9000/search/' + table + '/' + columnID + '/' + searchValue;
      // url = 'http://localhost:9000/search/';
    }
    console.log(url)
    return axios.get(url).then(response => {
      // returning the data here allows the caller to get it through another .then(...)
      console.log('---------------------');
      console.log(response.data);

      // setTableRows(response.data);
      setRows(response.data);

      return response.data;
    })
  }

  {/*
    Database ,Schema and Table name
    are already saved since Insert is on the current TALble
  */}
  function insert(values) {
    setInsertSuccess(false);
    if(values === '')
      return;

    //
    let extractedValues = Object.keys(values).map(key => values[key]);

    // Convert all string fields to Lower Case
    // extractedValues = extractedValues.map(val => (isNaN(val) ? val.toLowerCase() : val))

    let valueString = extractedValues.join(',');
    // {Object.keys(headers).map(key => <span>{key}</span>)}
    console.log(valueString);


    let databaseInfo = {
        database: database,
        schema: schema,
        table: table
    }

    // let postParams = {...databaseInfo, ...values}
    databaseInfo.values = valueString;

    console.log(databaseInfo);

    /*
      REACT_TEST_TABLE
    */
    // const url = 'http://localhost:9000/insert/'
    // + database + '/' + schema + '/' + table + '/' + valueString;

    const url = 'http://localhost:9000/insert';

    axios.post(url, databaseInfo).then(response => {
      // returning the data here allows the caller to get it through another .then(...)
      console.log(response);
      if(response.status === 200){
        setInsertSuccess(true);
      }
      setInsertClicked(true);
    })
  }

  const getRowId = row => row.id;

  const commitChanges = ({ added, changed, deleted }) => {
    let changedRows;
    if (added) {
      //added is an array of all changes
      console.log(added[0])
      // added[0] is the new Object added
      insert(added[0]);

      const startingAddedId = rows.length > 0 ? rows[rows.length - 1].id + 1 : 0;
      changedRows = [
        ...rows,
        ...added.map((row, index) => ({
          id: startingAddedId + index,
          ...row,
        })),
      ];
    }
    if (changed) {

      //update all the rows
      changedRows = rows.map(row => (changed[row.id] ? { ...row, ...changed[row.id] } : row));

      //get only the edited row:
      let updatedRow;
      for (let i = 0;i < rows.length;i++){
        if(changed[rows[i].id]){
          updatedRow = rows[i].id;
          break;
        }
      }
      console.log(updatedRow);


    }
    if (deleted) {
      const deletedSet = new Set(deleted);
      changedRows = rows.filter(row => !deletedSet.has(row.id));
    }
    setRows(changedRows);

  };

  const ManualInsert = () => (
    <div style={insertDivStyle}>
          {/*-----------------------------------------------------------------
              DROP DOWN Insert
            -----------------------------------------------------------------*/}
          Insert Command: INSERT INTO
          <span>          </span>
          {/* -------------------Database Drapdown-----------------------*/}
           <div className="dropdown">
             <button className="dropbtn">
                {database? database : "Database"}
             </button>
             <div className="dropdown-content">
               {databases.map(db => (
                 <a
                 values={db}
                 href="#"
                 onClick={() => setDatabase(db)}
                 >
                   {db}
                 </a>
               ))}
             </div>
           </div>

           {/* -------------------Schema Dropdown-----------------------*/}
           <div className="dropdown">
             <button className="dropbtn">
                {schema? schema : "Schema"}
             </button>
             <div className="dropdown-content">
               {schemas.map(schema => (
                 <a
                 values={schema}
                 href="#"
                 onClick={() => setSchema(schema)}
                 >
                   {schema}
                 </a>
               ))}
             </div>
           </div>
           <span> </span>

            <input type="text"
                   name="tableName"
                   size="35"
                   values={insertTableName}
                   onChange={event => setInsertTableName(event.target.value)}
                   />

            <span> </span>
            VALUES
            <span> </span>

            <input type="text"
                   name="values"
                   size="35"
                   values={insertValues}
                   onChange={event => setInsertValues(event.target.value)}
                   />
            <span>          </span>
            <button onClick={() => insert(insertTableName,insertValues)}>Insert</button>
            {insertClicked &&
              <span>
                {insertSuccess
                ?
                <span style={successSignal}>Success</span>
                :
                <span style={errorSignal}>Error</span>}
              </span>
            }
    </div>
  )

  const TableDropdownMenu = () => (
    <div style={dropdownStyle}>
      <div className="dropdown">
        <button className="dropbtn">Tables </button>
        <div className="dropdown-content">
          {listOfTables.map(table => (
            <a
            values={table}
            href="#"
            onClick={() => getCustomTable(table)}
            >
              {table}
            </a>
          ))}
        </div>
      </div>
    </div>
  )

  const TableName = () => (
    <div>
      {/* TABLE NAME*/}
      {tableLoaded
        ?
        <div style={pStyle}>{table}</div>
        :
        <span></span>
      }
    </div>
  )

  const TableSearchBar = () => (
      <div>
        SEARCH
        <div className="dropdown">
          <button className="dropbtn">{columnID ? <span>{columnID}</span> : <span>Search Input</span>} </button>
          <div className="dropdown-content">
            {searchCriteria.map(criterion => (
              <a
              values={criterion}
              href="#"
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
               onChange={event => setSearchValue(event.target.value)}/>

        <button onClick={() => searchOneKey()}>Go Go Power ranger</button>
      </div>
  )

  const TableGrid = () => (
    <Grid
      rows={rows}
      columns={columns}
      getRowId={getRowId}
    >
      <EditingState
        onCommitChanges={commitChanges}
      />
      <Table />
      <TableHeaderRow />
      <TableEditRow />
      <TableEditColumn
        showAddCommand
        showEditCommand
        showDeleteCommand
      />
    </Grid>
  )

  return (
    <div className="App">

      <div style={introStyle}>POC UI</div>

      <TableDropdownMenu/>

      {tableLoading && <div>Loading...</div>}

      {tableLoaded &&
      <div className="card">
        <TableName/>

        <div>
          SEARCH
          <div className="dropdown">
            <button className="dropbtn">{columnID ? <span>{columnID}</span> : <span>Search Input</span>} </button>
            <div className="dropdown-content">
              {searchCriteria.map(criterion => (
                <a
                values={criterion}
                href="#"
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
                 onChange={event => setSearchValue(event.target.value)}/>

          <button onClick={() => searchOneKey()}>Go Go Power ranger</button>
        </div>

        <TableGrid/>

        <button>Next Really</button>
      </div>
      }

    </div>
  );
}

export default App;
