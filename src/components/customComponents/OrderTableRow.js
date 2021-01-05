import React from 'react';

import { Row } from 'react-bootstrap';

import './ComponentCSS/MerchantAccounts.css'
import './ComponentCSS/StakingTable.css'

export default function OrderTableRow(props) {

    return (
        <Row className="staking-table-row">
            <p>{props.title}</p>
        
            <p>{props.price}</p>
        
            <p>{props.quantity}</p>
        
            <p>{props.id}</p>
        
            <p style={{width: '24rem'}}>
                {
                    //
                }
                <button onClick={props.showMessages(props.messageIdentifier)} className="orders-button">View</button>
            </p>
        </Row>
               
    )
}