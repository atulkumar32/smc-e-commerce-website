import React from 'react';
import ShipmentData from './ShipmentData';
import './index.scss';

const Shipment = () => {
    return (
        <div className="shipment-container">
            <div className="shipment-header">
                <h2>Shipment Management</h2>
                <p>Track and manage all shipments</p>
            </div>
            
            <ShipmentData />
        </div>
    );
};

export default Shipment;