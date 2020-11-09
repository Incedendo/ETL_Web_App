import React, { useEffect, useContext } from 'react';

import { WorkspaceContext } from '../../context/WorkspaceContext';
import WorkTab from './WorkTab';

import '../../../css/mymodal.scss';

const JobTab = () => {
    // console.log("calling JobTab");
    return (
        <WorkTab />
    )
}

export default JobTab;