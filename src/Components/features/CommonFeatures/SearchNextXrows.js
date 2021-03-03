import React, { useState, useEffect, useContext, useRef } from 'react';
import { WorkspaceContext } from '../../context/WorkspaceContext';
import { AdminContext } from '../../context/AdminContext';
import { fieldTypesConfigs } from '../../context/FieldTypesConfig';
import { caseAdmin, caseOperator} from '../../context/privilege';
import '../../../css/searchNextXRows.scss';

const SearchNextXrows = () => {

    const {
        debug, username,
        table, selectAllCounts,

        lo, setLo,
        hi, setHi,
        steps,
        selectAllStmtEveryX,

        axiosCallToGetTableRows,
    } = useContext(WorkspaceContext);

    const mounted = useRef(true);

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
        mounted.current = true;

        if(fetching){
            // debug && console.log(`Calling getNext20Rows with lo = ${lo}, hi = ${hi}`);
            getNext20();
        }

        return () => mounted.current = false;
    }, [fetching]);

    const getPrevLoHi = () => {
        console.log(`steps back= ${steps}`);
        const newHi = lo - 1 > 0 ? lo - 1 : 1
        setHi(newHi);

        const newLo = lo - steps >= 1 ? newLo : 1
        setLo(newLo);
        
        setFetching(true);
    }

    const getNextLoHi = () => {
        console.log(`steps up = ${steps}`);
        const newLo = hi + 1 < selectAllCounts ? hi + 1 : selectAllCounts
        setLo(newLo);

        const newHi = hi+steps < selectAllCounts ? hi+steps : selectAllCounts
        setHi(newHi);
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
        
        if(mounted.current){
            setFetching(false);
        }
    }

    return(
        <div>
            {lo > 1 && <a className="button-link" onClick={getPrevLoHi}>(Prev {steps})</a>}

            <span style={{marginLeft: '5px', marginRight: '5px'}}>
                Showing: {lo} - {hi <= selectAllCounts ? hi : selectAllCounts}
            </span>

            {hi < selectAllCounts && <a className="button-link" onClick={getNextLoHi}>(Next {steps})</a>}
        </div>
    );
}

export default SearchNextXrows;