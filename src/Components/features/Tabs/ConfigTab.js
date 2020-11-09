import React, { useState, useEffect, useContext } from 'react';
import { WorkspaceContext } from '../../context/WorkspaceContext';
import WorkTab from './WorkTab';
import '../../../css/mymodal.scss';

const ConfigTab = () => {
    // console.log("calling Config Tab");
    return (
        <WorkTab />
    )
}

export default ConfigTab;