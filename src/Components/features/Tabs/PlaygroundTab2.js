import React, {
    useState,
    useEffect,
    useContext
} from 'react';
import axios from 'axios';
import { WorkspaceContext } from '../../context/WorkspaceContext';

const PlaygroundTab2 = ({ loading }) => {

    const [activated, setActivated] = useState(false);

    useEffect(()=>{
        if(loading){
            setActivated(true);
        }else{
            setActivated(false);
        }
    }, [loading])

    return(
        <div>
            Child Component
            {activated ? <div>Child component is activated</div> : <div>Child component is sleeping</div>}
        </div>
    )
}

export default PlaygroundTab2;