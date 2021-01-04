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
        <Row >
            
            <h1>Offers</h1>
            
            <Col className="pt-3 staking-table-table">
                <Row className="staking-table-header no-gutters">
                    <p>Title</p>

                    <p>Price (SFX)</p>

                    <p>Quantity</p>

                    <p>Offer ID</p>

                    <p>Actions</p>
                </Row>
                {props.tableOfOffers}

            </Col>

        </Row>
    )
}