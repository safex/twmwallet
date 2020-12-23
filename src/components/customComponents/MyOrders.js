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
            
            { props.showMessages ?
                <div className="h-100">
                    <h1>{props.messages}</h1>
                </div>
            :
                <Col className="pt-3 staking-table-table">
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
                        <p>Title</p>
                    
                        <p>Price</p>
                    
                        <p>Quantity</p>
                    
                        <p>ID</p>
                    
                        <p style={{width: '24rem'}}>
                            <button onClick={props.displayMessages} className="orders-button">View</button>
                        </p>
                    </Row>
                </Col>
            }
        </div>
    )
}