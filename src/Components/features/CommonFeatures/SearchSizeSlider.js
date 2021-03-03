import React, { useState, useEffect, useContext } from 'react';
import { WorkspaceContext } from '../../context/WorkspaceContext';
import Slider from 'react-input-slider';

const SearchSizeSlider = () => {

    const {
        steps, setSteps
    } = useContext(WorkspaceContext);

    const [localSteps, setLocalSteps] = useState({ x: steps });
    const [doneDragging, setDone] = useState(false);

    useEffect(()=>{
        if(doneDragging){
            console.log("done dragging, step = ", localSteps.x);

            setSteps(localSteps.x);
            setDone(false);
        }

    }, [doneDragging])

    return (
        <div style={{marginLeft: '20px', float: 'right'}}>
          <span style={{marginRight: '15px'}}>{'Maximum Search Results: ' + localSteps.x}</span>
          <Slider
            axis="x"
            xstep={1}
            xmin={10}
            xmax={100}
            x={localSteps.x}
            onChange={({ x }) => {
                const val = parseInt(x);
                setLocalSteps({ x: val });
                // setSteps(val);
            }}
            onDragEnd={({ x })=>{
                
                setDone(true);
            }}
          />
        </div>
      );
}

export default SearchSizeSlider;