import React, { useState, useEffect } from 'react';

const PlaygroundTab = () => {
    const [state, setState ] = useState({
        name: 'kiet',
        age: 25,
    });

    useEffect(()=>{
        console.log(state);
    }, [state]);

    function changeState(){
        setState({...state, ['job']: 'TAP'})
    }

    function incrementAge(){
        setState({...state, 'age': state.age+1});
    }

    return(
        <div>
            Welcome to Playground 
            <button onClick={changeState}> Test </button>
            <button onClick={incrementAge}> Grow Up </button>
        </div>
    )
}

export default PlaygroundTab;