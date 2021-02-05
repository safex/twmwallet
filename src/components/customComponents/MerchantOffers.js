import React from 'react';

import Loader from 'react-loader-spinner'

import ReactModal from 'react-modal';

import {Row, Col, Form, Modal, Image} from 'react-bootstrap'

// Icon Imports
import {AiOutlineInfoCircle} from 'react-icons/ai'
import {IconContext} from 'react-icons'
import {CgCloseR} from 'react-icons/cg'

import ReactTooltip from 'react-tooltip'

import './ComponentCSS/MerchantAccounts.css'
import './ComponentCSS/StakingTable.css'
import OfferTableRow from "./OfferTableRow";

let offer_rows = [];

export default class MerchantOffers extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            user_offers: props.userOffers,
            selected_offer: '',
            selected_order: ''
        };
    }

    select_the_offer = async (e, listing) => {
        e.preventDefault();
        let my_table = await this.props.loadOrders(listing.offerID, listing.seller, 'http://stageapi.theworldmarketplace.com:17700');
        console.log(my_table);
        this.setState({selected_offer: listing, selected_offer_orders: my_table});
    }

    select_the_order = async (e, order) => {
        e.preventDefault();
        console.log(order);
        let show_messages = await this.props.loadMessages(
            this.state.selected_offer.offerID,
            this.state.selected_offer.seller,
            'http://stageapi.theworldmarketplace.com:17700',
            order.order_id);
        console.log(show_messages);
        this.setState({selected_order: order, selected_messages: show_messages});
    }

    //top level if not selected offer, then show
    //also top level if not selected order, then show
    render() {
        let the_view;
        if (this.state.selected_offer === '') {
            the_view = (<Row className="w-100">
                <h1>Offers</h1>
                <Col className="pt-3 staking-table-table">
                    <Row className="staking-table-header no-gutters">
                        <p>Title</p>
                        <p>Price</p>
                        <p>Quantity</p>
                        <p>Seller</p>
                        <p>Offer ID</p>
                        <p>Actions</p>
                    </Row>
                    {this.state.user_offers.map((listing, key) => (
                        <Row key={key} className="staking-table-row">
                            <p style={{wordBreak: 'break-word'}}>{listing.title}</p>
                            <p>{listing.price / 10000000000}</p>
                            <p>{listing.quantity}</p>
                            <p data-tip data-for='offerID'>
                                {listing.offerID.slice(0, 8)}
                            </p>
                            <p>
                                <button onClick={() => this.state.getOrders(
                                    listing.offerID,
                                    listing.seller,
                                    'http://stageapi.theworldmarketplace.com:17700'
                                )} className="edit-button">
                                    Load
                                </button>
                                <button
                                    onClick={this.state.handleEditOfferForm}
                                    className="edit-button">
                                    Edit
                                </button>
                                <button
                                    onClick={(e) => this.select_the_offer(e, listing)}
                                    className="orders-button">
                                    Orders
                                </button>
                            </p>
                        </Row>)
                    )}
                </Col>
            </Row>)
        } else if (this.state.selected_offer !== '') {
            if (this.state.selected_order === '') {
                the_view = (<Row className="w-100">
                    <h1>{this.state.selected_offer.title} {this.state.selected_offer.offerID}</h1>
                    <Col className="pt-3 staking-table-table">
                        <Row className="staking-table-header no-gutters">
                            <p>Order ID</p>
                            <p>Quantity</p>
                            <p>Message Count</p>
                            <p></p>
                        </Row>
                        {this.state.selected_offer_orders.map((order, key) => (
                            <Row key={key} className="staking-table-row">
                                <p style={{wordBreak: 'break-word'}}>{order.order_id}</p>
                                <p>{order.quantity}</p>
                                <p>{order.msg_count}</p>
                                <p>
                                    <button
                                        onClick={(e) => this.select_the_order(e, order)}
                                        className="orders-button">
                                        Open Messaging
                                    </button>
                                </p>
                            </Row>)
                        )}
                    </Col>
                </Row>)
            } else if (this.state.selected_order !== '') {
                the_view = (<Row className="w-100">
                    <h1>{this.state.selected_offer.title} {this.state.selected_offer.offerID}</h1>
                    <Col className="pt-3 staking-table-table">
                        <Row className="staking-table-header no-gutters">
                            <p>Order ID</p>
                            <p>Quantity</p>
                            <p>Message Count</p>
                            <p></p>
                        </Row>
                        {this.state.selected_messages.map((message, key) => (
                            <Row key={key} className="staking-table-row">
                               <p>
                                   {JSON.stringify(message)}
                               </p>
                            </Row>)
                        )}
                    </Col>
                </Row>)
            }
        }

        return (
            <div>
                {the_view}
            </div>
        )
    }
}