import React, { useState, useEffect, useContext }  from 'react';
import {
    ToggleButtonGroup,
    ToggleButton} from 'react-bootstrap';
import { WorkspaceContext } from '../../context/WorkspaceContext';

const Edit_Delete_ToggleComp = () => {

    const { 
        editMode, setEditMode,
        setEnabledEdit,
        setDeleteMode,
        setEditingStateColumnExtensions
    } = useContext(WorkspaceContext);

    const handleChange = (val) => {
        if( val === 'update'){
            setEditMode(true)
            setEnabledEdit(true)
            setDeleteMode(false)
            
        } else if (val === 'delete') {
            setDeleteMode(true)
            setEditMode(false)
            setEnabledEdit(false)
        }
    }
    
    useEffect(() => {
        console.log('switching Edit Mode')
    }, [editMode])

    return(
        <div className="">
            <ToggleButtonGroup toggle type="radio" name="radio" className="mt-3" onChange={handleChange}>
                <ToggleButton value={'update'} > Update </ToggleButton>
                <ToggleButton value={'delete'} > Delete </ToggleButton>
            </ToggleButtonGroup>
        </div>
    )
} 

export default Edit_Delete_ToggleComp;