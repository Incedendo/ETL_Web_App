import React, { useContext } from 'react';
import { WorkspaceContext } from '../../context/WorkspaceContext';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';

const EditPrimaryKeysComp = () => {

    const {
        setPrimaryKeys,
        primaryKeys,
        setRemainingPrimaryKeys,
        remainingPrimaryKeys,
    } = useContext(WorkspaceContext);

    const updatePrimaryKeys = (addKey, tobeAddedArr, tobeRemoveddArr, criterion, removeFromCurrentArr) => {
        addKey([...tobeAddedArr, criterion])

        let updatedArr = [...tobeRemoveddArr]
        updatedArr.splice(updatedArr.indexOf(criterion), 1)
        removeFromCurrentArr(updatedArr)
    }

    return (
        <div className="inlineDiv">
            <div key={1} className="primaryKeysInlineDiv">
                <DropdownButton
                    id="dropdown-item-button"
                    title='Add'
                >
                    {remainingPrimaryKeys.map(item => (
                        <Dropdown.Item as="button" key={item}
                            onClick={() => {
                                updatePrimaryKeys(setPrimaryKeys, primaryKeys, remainingPrimaryKeys, item, setRemainingPrimaryKeys)
                            }}
                        >
                            {item}
                        </Dropdown.Item>
                    )
                    )}
                </DropdownButton>
            </div>

            <div key={2} className="primaryKeysInlineDiv">
                <DropdownButton
                    id="dropdown-item-button"
                    title='Remove'
                >
                    {primaryKeys.map(item => (
                        <Dropdown.Item as="button" key={item}
                            onClick={() => {
                                updatePrimaryKeys(setRemainingPrimaryKeys, remainingPrimaryKeys, primaryKeys, item, setPrimaryKeys)
                            }}
                        >
                            {item}
                        </Dropdown.Item>
                    )
                    )}
                </DropdownButton>
            </div>
        </div>
    )
}

export default EditPrimaryKeysComp;