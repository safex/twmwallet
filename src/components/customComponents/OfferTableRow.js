import React from 'react';

import { Row } from 'react-bootstrap';

import './ComponentCSS/MerchantAccounts.css'
import './ComponentCSS/StakingTable.css'

import ReactTooltip from "react-tooltip";

export default class OfferTableRow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            key: props.key,
            title: props.title,
            price: props.price,
            quantity: props.quantity,
            seller: props.seller,
            id: props.id,
            toEllipsis: props.toEllipsis,
            handleEditOfferForm: props.handleEditOfferForm,
            handleShowOrders: props.handleShowOrders,
            getOrders: props.getOrders

        };
        //this.imagestore = this.imagestore.bind(this);
    }

    componentDidMount() {
        this.state.getOrders(this.state.id, this.state.seller, 'http://stageapi.theworldmarketplace.com:17700')
    }

    render() {
        return (
            <Row 
                    key={this.state.key} 
                className="staking-table-row"
            >
                <p>{this.state.title}</p>
            
                <p>{this.state.price}</p>
            
                <p>{this.state.quantity}</p>

                <p>{this.state.seller}</p>
            
                <p data-tip data-for='offerID'>
                    {this.state.toEllipsis(this.state.id, 5, 5)}
                    .
                    .
                </p>
                    <ReactTooltip 
                        className="entry-tooltip-container" 
                        id='offerID' 
                        effect='solid'
                        place="top"
                    >
                        <span>
                            {this.state.id}
                        </span>
                    </ReactTooltip>
                <p>
                    <button 
                        onClick={this.state.handleEditOfferForm} 
                        className="edit-button"
                    >
                        Edit
                    </button>
                    
                    <button 
                        onClick={this.state.handleShowOrders} 
                        className="orders-button"
                    >
                        Orders
                    </button>
                </p>
            </Row>
                
        )
    }
}