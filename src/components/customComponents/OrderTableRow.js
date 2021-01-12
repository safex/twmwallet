import React from 'react';

import { Row } from 'react-bootstrap';

import './ComponentCSS/MerchantAccounts.css'
import './ComponentCSS/StakingTable.css'


import ReactTooltip from "react-tooltip";

export default class OrderTableRow extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            key: props.key,
            title: props.title,
            seller: props.seller,
            id: props.id,
            toEllipsis: props.toEllipsis,
            handleEditOfferForm: props.handleEditOfferForm,
            handleShowMessages: props.handleShowMessages,
            getOrders: props.getOrders,
            getMessages: props.getMessages,
        };
    }

    componentDidMount() {
        this.state.getMessages()
    }

    render() {
        return (
            <Row className="staking-table-row">
                 <h5 data-tip data-for='offerID'>
                    {this.state.toEllipsis(this.state.title, 25, 25)}
                </h5>
                <ReactTooltip 
                        className="entry-tooltip-container" 
                        id='offerID' 
                        effect='solid'
                        place="top"
                    >
                        <span>
                            {this.state.title}
                        </span>
                    </ReactTooltip>
            
                <p style={{width: '24rem'}}>
                    {
                        //
                    }
                    <button 
                        onClick={this.state.handleShowMessages} 
                        className="orders-button"
                    >
                        View
                    </button>
                </p>
            </Row>
                
        )
    }
}