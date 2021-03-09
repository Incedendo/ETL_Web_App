import React, { useState, useContext, useEffect } from 'react';
import { WorkspaceContext } from '../../context/WorkspaceContext';
import CustomAutoCompleteComp from './CustomAutoCompleteComp';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import '../../../css/tableDropdownMenus.scss';

const databases = ["GR_DEV", "GR_PROD", "GR_UAT",
    "IR_DEV", "IR_UAT", "IR_PROD",
    "LIFE_DEV", "LIFE_PROD", "LIFE_UAT"
]

const TableDropdownMenu = () => {
    const [tablelist, setTablelist] = useState([]);
    const [schemalist, setSchemalist] = useState([]);
    const [loadingSchemaList, setLoadingSchemaList] = useState(false)
    const [loadingTableList, setLoadingTableList] = useState(false)

    const {
        debug,
        tableLoading,
        tableSearching,

        database, setDatabase,
        schema, setSchema,
        setTable,

        //API calls
        loadTableNamesInAdvance,
    } = useContext(WorkspaceContext);



    //only reload list of tables when DB changes.
    useEffect(() => {
        const schemalist_sqlstatement = "SELECT * FROM " + database + ".INFORMATION_SCHEMA.SCHEMATA;";
        loadTableNamesInAdvance(schemalist_sqlstatement, 'SCHEMA_NAME', setSchemalist, setLoadingSchemaList);
    }, [database]);

    //only reload list of tables when Schema changes.
    useEffect(() => {
        if (schema !== '') {
            const tablelist_sqlstatement = "SELECT * FROM " + database + ".INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = '"
                + schema + "';";
            debug && console.log('Load Table SQL Statement: ', tablelist_sqlstatement)
            loadTableNamesInAdvance(tablelist_sqlstatement, 'TABLE_NAME', setTablelist, setLoadingTableList);
        }
    }, [schema, schemalist]);

    useEffect(() => {
        setLoadingSchemaList(false);
    }, [schemalist])

    useEffect(() => {
        setLoadingTableList(false);
    }, [tablelist])

    const DropDown = ({ target, currentVal, menus, setState }) => {
        return (
            <div className="InlineDiv">
                <DropdownButton
                    id="dropdown-item-button"
                    title={!currentVal ? 'Select a ' + target : currentVal}
                    disabled={tableSearching || tableLoading}
                >
                    {menus.map(item => (
                        <Dropdown.Item as="button" key={item}
                            onSelect={() => {
                                if (item !== database || schemalist.length === 0) {
                                    setState(item)
                                }
                            }}
                        >
                            {item}
                        </Dropdown.Item>

                    )
                    )}
                </DropdownButton>
            </div>
        )
    }

    return (
        <div style={{ 'height': '90px' }}>
            <div className="InlineDiv db-div">
                <div className="label-text db-text">Database:</div>
                <DropDown target='Database' currentVal={database} menus={databases} setState={setDatabase} />
            </div>


            <div className="InlineDiv auto-complete-outerDiv">
                {database && loadingSchemaList &&
                    <div className="left-text auto-complete-div-margin">loading schema list...</div>}

                {database && !loadingSchemaList &&
                    <div className="auto-complete-div-margin">
                        <div className="label-text">Schema:</div>
                        <CustomAutoCompleteComp
                            list={schemalist}
                            setTarget={setSchema}
                            autoSuggestModalClassName="auto-suggest-box" />  
                    </div>}
            </div>

            <div className="InlineDiv auto-complete-outerDiv">
                {database && schema && loadingTableList &&
                    <div className="left-text auto-complete-div-margin">loading table list...</div>}

                {database && schema && !loadingTableList &&
                    <div className="auto-complete-div-margin">
                        <div className="label-text">Table:</div>
                        <CustomAutoCompleteComp
                            list={tablelist}
                            setTarget={setTable}
                            autoSuggestModalClassName="auto-suggest-box" />  
                    </div>}
            </div>

        </div>
    );
}

export default TableDropdownMenu;