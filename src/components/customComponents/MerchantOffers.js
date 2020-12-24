import React from 'react';

import Loader from 'react-loader-spinner'

import ReactModal from 'react-modal';

import { Row, Col, Form, Modal, Image } from 'react-bootstrap'

// Icon Imports
import { AiOutlineInfoCircle } from 'react-icons/ai'
import {IconContext} from 'react-icons'
import { CgCloseR } from 'react-icons/cg'

import ReactTooltip from 'react-tooltip'

import './ComponentCSS/MerchantAccounts.css'
import './ComponentCSS/StakingTable.css'

export default function MerchantOffers(props) {

    return (
        <Row className="merchant-accounts-box">
            
            <h1>Offers</h1>
            
            <Col className="pt-3 staking-table-table">
                <Row className="staking-table-header no-gutters">
                    <p>Title</p>

                    <p>Price (SFX)</p>

                    <p>Quantity</p>

                    <p>Offer ID</p>

                    <p>Actions</p>
                </Row>
            
            {
                //Below should be replaced with prop which is array of OfferTableRow.js
                //eg. { offerTableRows }
            }
                <Row className="staking-table-row">
                    <p>erse...4e43</p>
                
                    <p>7-12-2020</p>
                
                    <p>42,000</p>
                
                    <p>42.69</p>
                
                    <p>
                        <button className="edit-button">Edit</button>
                        <button onClick={props.handleOrders} className="orders-button">Orders</button>
                    </p>
                </Row>
            </Col>

        </Row>
    )
}