import React, { useState, useEffect } from 'react';
import PlaygroundTab2 from './PlaygroundTab2';

const PlaygroundTab = () => {
    const [state, setState ] = useState({
        name: 'kiet',
        age: 25,
    });

    const [loading, setLoading] = useState(false);

    useEffect(()=>{
        console.log(loading);
    }, [loading]);

    function changeState(){
        setState({...state, ['job']: 'TAP'})
    }

    function incrementAge(){
        setState({...state, 'age': state.age+1});
    }

    return(
        <div>
            <h4>Welcome to Playground</h4> 
            {/* <button onClick={changeState}> Test </button>
            <button onClick={incrementAge}> Grow Up </button> */}

            <button 
                onClick={()=>{
                    setLoading(loading => !loading);
                }}
            > 
                {loading ? "Deactivate" : "Activate"} 
            </button>

            <PlaygroundTab2 loading={loading}/>
        </div>
    )
}

export default PlaygroundTab;