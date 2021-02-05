import React, { useState, useEffect, useContext } from 'react';
import { WorkspaceContext } from '../../context/WorkspaceContext';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

import AddAdminModal from '../Modals/AddAdminModal';
import IDAssignmentModal from '../Modals/IDAssignmentModal';

import IDAssignmentForm from './IDAssignmentForm';
import AddAdminForm from './AddAdminForm';

const AdminTabs = () => {
    const {
        debug
    } = useContext(WorkspaceContext);

    return(
        <div>
            <h4 style={{textAlign: 'left'}}>
                Admin can either <span style={{color: 'red'}}>add a new admin</span> or <span style={{color: 'red'}}>assign GroupID to Framework Developers</span>
            </h4>

            <AddAdminModal />

            <IDAssignmentModal/>

            <Tabs defaultActiveKey="" transition={false} id="noanim-tab-example"
                onSelect={(eventKey)=>{
                    if (eventKey ==="Add Admin"){
                        debug && console.log("Add Admin");
                    } else if (eventKey === "Assign Group ID"){
                        debug && console.log("Assign Group ID");
                    }
                }}
            >
                <Tab eventKey = "Add Admin" title = "Add Admin" >
                    <h4>Add new Admin</h4>
                    <AddAdminForm />
                </Tab>
                <Tab eventKey="Assign Group ID" title="Assign Group ID" >
                    <h4>Assign Group IDs to User</h4>
                    <IDAssignmentForm />
                </Tab>
                
            </Tabs>
        </div>
    )
}

export default AdminTabs;