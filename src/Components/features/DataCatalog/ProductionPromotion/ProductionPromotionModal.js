import React, { useState, useEffect, useContext } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { AdminContext } from '../../../context/AdminContext';
import ProductionPromotionForm from './ProductionPromotionForm';
import '../../../../css/mymodal.scss';

const ProductionPromotionModal = () => {

    const {
        isAdmin, isSteward, isDomainOperator
    } = useContext(AdminContext);

    const [show, setShow] = useState(false);

    return (
        <div style={{ 'float': 'left' }}>
            <Button className="button-margin"
                variant="outline-primary"
                onClick={()=>setShow(true)}
                disabled={!isAdmin && !isSteward && !isDomainOperator}
            >
                Promote tables to Production
            </Button>

            <Modal
                show={show}
                animation={true}
                // scrollable={true}
                onHide={() => setShow(false)}
                dialogClassName="route-modal-width"
                size="lg"
                // aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title 
                        // id="example-custom-modal-styling-title"
                    >
                        Promote tables to Production
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <ProductionPromotionForm setShow={setShow}/>
                </Modal.Body>
            </Modal>
        </div>
    )

}

export default ProductionPromotionModal;