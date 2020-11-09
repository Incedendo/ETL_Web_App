import React, { useState, useEffect, useContext }  from 'react';
import {
    ToggleButtonGroup,
    ToggleButton} from 'react-bootstrap';
import { WorkspaceContext } from '../../context/WorkspaceContext';

const Edit_Insert_Delete_ToggleComp = () => {

    const { insertMode,
        editMode, setEditMode,
        setEnabledEdit,
        setInsertMode,
        setDeleteMode,
        setEditingStateColumnExtensions
    } = useContext(WorkspaceContext);

    const handleChange = (val) => {
        if( val === 'insert'){
            setInsertMode(true)

            setEditMode(false)
            setEnabledEdit(false)
            setDeleteMode(false)
            
            setEditingStateColumnExtensions([{ columnName: 'PRIVILEGE', editingEnabled: false }]);
        }else if( val === 'update'){
            setEditMode(true)
            setEnabledEdit(true)

            setInsertMode(false)
            setDeleteMode(false)
            
        } else if (val === 'delete') {
            setDeleteMode(true)
            
            setEditMode(false)
            setInsertMode(false)
            setEnabledEdit(false)
        }
    }

    useEffect(() => {
        console.log('switching Edit Mode')  
    }, [editMode])

    useEffect(() => {
        console.log('switching Insert Mode')
    }, [insertMode])

    return(
        <div className="">
            <ToggleButtonGroup toggle type="radio" name="radio" className="mt-3" onChange={handleChange}>
                <ToggleButton value={'insert'} >Insert</ToggleButton>
                <ToggleButton value={'update'} > Update </ToggleButton>
                <ToggleButton value={'delete'} > Delete </ToggleButton>
            </ToggleButtonGroup>
        </div>
    )
} 

export default Edit_Insert_Delete_ToggleComp;