import React from 'react';

import { Row, Col } from 'react-bootstrap'

// Icon Imports
import { IconContext } from 'react-icons'
import { CgCloseR } from 'react-icons/cg'

import './ComponentCSS/MerchantAccounts.css'
import './ComponentCSS/StakingTable.css'

export default class BuyerOrders extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            rows: props.rows,
            handleOrders: props.handleOrders,
        };
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
                        <p>Order ID</p>

                        <p></p>

                        <p></p>

                        <p></p>

                        <p style={{width: '12rem'}}>Actions</p>
                    </Row>


                    <button className="my-5 " onClick={''}>
                        Load Offers
                    </button>
                

                    {this.state.rows}

                </Col>
            </div>
        )
    }
}