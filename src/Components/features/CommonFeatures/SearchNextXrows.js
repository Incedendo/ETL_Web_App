import React, { useState, useEffect, useContext } from 'react';
import { WorkspaceContext } from '../../context/WorkspaceContext';
import { AdminContext } from '../../context/AdminContext';
import { fieldTypesConfigs, ETLF_tables } from '../../context/FieldTypesConfig';
import { caseAdmin, caseOperator} from '../../context/privilege';
import '../../../css/searchNextXRows.scss';

const SearchNextXrows = ({ steps }) => {

    const {
        debug, username,
        table, selectAllCounts,

        lo, setLo,
        hi, setHi,
        selectAllStmtEveryX,

        axiosCallToGetTableRows,
    } = useContext(WorkspaceContext);

    const { isAdmin, isSteward } = useContext(AdminContext);    
    const [fetching, setFetching] = useState(false);

    const caseSteward = `CASE
        WHEN DS.EMAIL = UPPER(TRIM('` + username + `'))
        THEN 'READ/WRITE'
        ELSE 'READ ONLY'
    END AS PRIVILEGE`;

    let privilegeLogic = ``;

    useEffect(() => {
        debug && console.log(`StartingLo = ${lo}, StartingHi = ${hi}`);
    })

    useEffect(()=>{
        if(fetching){
            // debug && console.log(`Calling getNext20Rows with lo = ${lo}, hi = ${hi}`);
            getNext20();
        }
    }, [fetching]);

    const getPrevLoHi = () => {
        console.log(`steps back= ${steps}`);
        const temp = lo;
        setLo(temp-steps);
        setHi(temp-1);
        setFetching(true);
    }


    const getNextLoHi = () => {
        console.log(`steps up = ${steps}`);
        const temp = hi;
        setLo(temp+1);
        setHi(temp+steps);
        setFetching(true);
    }

    const getNext20 = () =>{
        debug && console.log(`Calling getNextXRows with lo = ${lo}, hi = ${hi}`);
        const uniqueKeysToSeparateRows = fieldTypesConfigs[table]['primaryKeys'];

        if(isAdmin){
            privilegeLogic = caseAdmin;
        }else if(isSteward){
            privilegeLogic = caseSteward;
        }else{
            privilegeLogic = caseOperator;
        }

        let getNextXRowsSQL = selectAllStmtEveryX + `
        WHERE RN >= ` + lo + ` AND RN <= ` + hi;

        console.log(getNextXRowsSQL);

        //DO NOT reset COUNTALLS
        axiosCallToGetTableRows( getNextXRowsSQL , uniqueKeysToSeparateRows );
        setFetching(false);
    }

    return(
        <div>
            {lo > 1 && <a className="button-link" onClick={getPrevLoHi}>(Prev {steps})</a>}
            <span>
                Showing: {lo} - {hi <= selectAllCounts ? hi : selectAllCounts}
            </span>
            {hi < selectAllCounts && <a className="button-link" onClick={getNextLoHi}>(Next {steps})</a>}
        </div>
    );
}

export default SearchNextXrows;