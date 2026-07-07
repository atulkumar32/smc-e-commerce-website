import React, { useState, useEffect } from 'react';

const ShipmentData = () => {
    const [shipments, setShipments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchShipments();
    }, []);

    const fetchShipments = async () => {
        try {
            // Replace with your actual API endpoint
            const res = await fetch('http://localhost/smc/admin/api/getShipments.php');
            const data = await res.json();
            setShipments(data.data || []);
        } catch (error) {
            console.error("Error fetching shipments:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredShipments = shipments.filter(shipment =>
        shipment.order_id?.toLowerCase().includes(search.toLowerCase()) ||
        shipment.customer_name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="shipment-data">
            <div className="controls">
                <input
                    type="text"
                    placeholder="Search by Order ID or Customer..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="search-input"
                />
                <button onClick={fetchShipments} className="refresh-btn">Refresh</button>
            </div>

            {loading ? (
                <p>Loading shipments...</p>
            ) : (
                <table className="shipment-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Tracking ID</th>
                            <th>Status</th>
                            <th>Shipping Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredShipments.length > 0 ? (
                            filteredShipments.map((shipment) => (
                                <tr key={shipment.id}>
                                    <td>{shipment.order_id}</td>
                                    <td>{shipment.customer_name}</td>
                                    <td>{shipment.tracking_id || '—'}</td>
                                    <td>
                                        <span className={`status ${shipment.shipment_status}`}>
                                            {shipment.shipment_status || 'Pending'}
                                        </span>
                                    </td>
                                    <td>{shipment.shipping_date || '—'}</td>
                                    <td>
                                        <button className="view-btn">View</button>
                                        <button className="update-btn">Update</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center' }}>
                                    No shipments found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default ShipmentData;