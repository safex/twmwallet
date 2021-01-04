import React from 'react';

import { Row } from 'react-bootstrap';

import './ComponentCSS/MerchantAccounts.css'
import './ComponentCSS/StakingTable.css'

import ReactTooltip from "react-tooltip";

export default function OfferTableRow(props) {

    return (
        <Row key={props.key} className="staking-table-row">
            <p>{props.title}</p>
        
            <p>{props.price}</p>
        
            <p>{props.quantity}</p>

            <p>{props.seller}</p>
        
            <p data-tip data-for='offerID'>
                {props.toEllipsis(props.id, 5, 5)}
                <ReactTooltip 
                    className="entry-tooltip-container" 
                    id='offerID' 
                    effect='solid'
                    place="top"
                >
                    <span>
                        {props.id}
                    </span>
                </ReactTooltip>
            </p>
        
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