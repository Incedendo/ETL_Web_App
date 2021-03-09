import React from 'react';

import AddAdminModal from '../Modals/AddAdminModal';
import IDAssignmentModal from '../Modals/IDAssignmentModal';

const AdminTabs = () => {

    console.log("!!! Loaded from the start w/o clicking on Admin tab");

    return(
        <div>
            <h4 style={{textAlign: 'left'}}>
                Admin can either <span style={{color: 'red'}}>add a new admin</span> or <span style={{color: 'red'}}>assign GroupID to Framework Developers</span>
            </h4>

            <AddAdminModal />

            <IDAssignmentModal/>
        </div>
    )
}

export default AdminTabs;