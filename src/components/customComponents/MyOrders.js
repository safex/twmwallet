import React from 'react';

import { Row, Col, Form, Modal, Image } from 'react-bootstrap'

// Icon Imports
import {IconContext} from 'react-icons'
import { CgCloseR } from 'react-icons/cg'

import './ComponentCSS/MerchantAccounts.css'
import './ComponentCSS/StakingTable.css'

export default class MyOrders extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            rows: props.rows,
            showMessages: props.showMessages,
            handleShowMessages: props.handleShowMessages,
            handleHideMessages: props.handleHideMessages,
            handleOrders: props.handleOrders,
            loadOrders: props.loadOrders,

        };
        //this.imagestore = this.imagestore.bind(this);
    }

    componentDidMount() {
        this.state.loadOrders()
    }

    render() {

        return (
            <div className="h-100">

                <IconContext.Provider value={{color: '#FEB056', size: '20px'}}>
                    <CgCloseR
                        className="ml-5"
                        onClick={this.state.handleOrders}
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
                
                    {this.state.rows}

                </Col>
            </div>
        )
    }
}