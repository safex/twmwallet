import React from 'react';

import { Row } from 'react-bootstrap';

import './ComponentCSS/MerchantAccounts.css'
import './ComponentCSS/StakingTable.css'

export default function OfferTableRow(props) {

    return (
        <Row key={props.key} className="staking-table-row">
            <p>{props.title}</p>
        
            <p>{props.price}</p>
        
            <p>{props.quantity}</p>

            <p>{props.seller}</p>
        
            <p>{props.id}</p>
        
            <p>
                <button 
                    onClick={props.handleEditOfferForm} 
                    className="edit-button"
                >
                    Edit
                </button>
                
                <button 
                    onClick={props.handleShowOrders} 
                    className="orders-button"
                >
                    Orders
                </button>
            </p>
        </Row>
               
    )
}