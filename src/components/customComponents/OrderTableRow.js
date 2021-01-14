import React from 'react';

import { Row } from 'react-bootstrap';

import './ComponentCSS/MerchantAccounts.css'
import './ComponentCSS/StakingTable.css'


import ReactTooltip from "react-tooltip";

export default class OrderTableRow extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            finalKey: props.myKey,
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
        
    }

    render() {
        return (
            <Row key={this.state.finalKey} className="staking-table-row">
                
                 <h5 data-tip data-for='offerID'>
                    {this.state.toEllipsis(this.state.title, 20, 20)}
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

                    <p>{this.state.finalKey}</p>
            
                <p style={{width: '12rem'}}>
                    <button 
                        onClick={() =>
                            this.state.getMessages(
                                this.state.id,
                                this.state.seller,
                                'http://stageapi.theworldmarketplace.com:17700',
                                this.state.title
                            )
                        } 
                        className="orders-button"
                    >
                        Load
                    </button>

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