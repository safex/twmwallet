import React from 'react';

import { Row, Col, Form, Modal, Image } from 'react-bootstrap'

// Icon Imports
import {IconContext} from 'react-icons'
import { CgCloseR } from 'react-icons/cg'

import './ComponentCSS/MerchantAccounts.css'
import './ComponentCSS/StakingTable.css'

export default function MyOrders(props) {

    return (
        <div className="h-100">
            <Col 
                className="pt-3 staking-table-table"
                style={{maxHeight: 300}}
            >
                <Row className="staking-table-header no-gutters">
                    <p>Title</p>

                    <p>Price (SFX)</p>

                    <p>Quantity</p>

                    <p>Offer ID</p>

                    <p style={{width: '24rem'}}>Actions</p>
                </Row>
            
            {
                //Below should be replaced with prop which is array of OrderTableRow.js
                //eg. { props.rows }
            }
                <Row className="staking-table-row">
                    <p>TEST Title</p>
                
                    <p>TEST Price</p>
                
                    <p>TEST Quantity</p>
                
                    <p>TEST ID</p>
                
                    <p style={{width: '24rem'}}>
                        <button onClick={props.handleShowMessages} className="orders-button">View</button>
                    </p>
                </Row>
            </Col>
        </div>
    )
}