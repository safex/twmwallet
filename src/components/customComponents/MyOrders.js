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

            <IconContext.Provider value={{color: '#FEB056', size: '20px'}}>
                <CgCloseR
                    className="ml-5"
                    onClick={props.handleOrders}
                />
            </IconContext.Provider>

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
                {props.rows}
            </Col>
        </div>
    )
}