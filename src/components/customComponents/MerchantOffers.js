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
    };

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
    };

    local_merchant_reply = async (e) => {
        e.preventDefault();
        try {
            await this.props.merchantReply(e,
                this.state.selected_offer.seller,
                this.state.selected_offer.offerID,
                this.state.selected_order.order_id,
                e.target.message_box.value,
                'http://stageapi.theworldmarketplace.com:17700');
            try {
                let show_messages = await this.props.loadMessages(
                    this.state.selected_offer.offerID,
                    this.state.selected_offer.seller,
                    'http://stageapi.theworldmarketplace.com:17700',
                    this.state.selected_order.order_id);
                console.log(show_messages);
                this.setState({selected_messages: show_messages});
            } catch(err) {
                console.error(err);
            }
        } catch(err) {
            console.error(err);
            console.error(`error at sending the message`);
            alert(`error at sending the message`);
            alert(err);
        }
    };

    //top level if not selected offer, then show
    //also top level if not selected order, then show
    render() {
        let the_view;
        if (this.state.selected_offer === '') {
            the_view = (<div>
                <h2>Offers</h2>
                <div>
                        <label style={{width: '200px'}}>Title</label>
                        <label style={{width: '120px'}}>Price</label>
                        <label style={{width: '100px'}}>Quantity</label>
                        <label style={{width: '120px'}}>Offer ID</label>
                        <label style={{width: '100px'}}>Actions</label>
                    {this.state.user_offers.map((listing, key) => (
                        <div className="d-flex mb-2 align-items-center">
                            <div style={{width: '200px'}}>{listing.title}</div>
                            <div style={{width: '120px'}}>{listing.price / 10000000000}</div>
                            <div style={{width: '100px'}}>{listing.quantity}</div>
                            <div style={{width: '120px'}} data-tip data-for='offerID'>
                                {listing.offerID.slice(0, 8)}
                            </div>
                            <div style={{width: '100px'}}>
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
                            </div>
                        </div>
                        )
                    )}
                </div>
            </div>)
        } else if (this.state.selected_offer !== '') {
            if (this.state.selected_order === '') {
                the_view = (<div>
                    <div>
                    <label>Offer ID</label>
                    <span className="ml-3">{this.state.selected_offer.offerID}</span>
                    </div>

                    <div>
                    <label>Title</label>
                    <span className="ml-3 mb-3">{this.state.selected_offer.title}</span>
                    </div>

                    <span style={{fontSize: "1.5rem"}}>Orders</span>
                    <div className="d-flex flex-column">
                        <div className="d-flex align-items-center mb-3">
                            <label style={{width: '360px'}}>Order ID</label>
                            <label style={{width: '120px'}}>Quantity</label>
                            <label style={{width: '100px'}}>Message Count</label>
                            <label style={{width: '150px'}}>Actions</label>
                        </div>
                        {this.state.selected_offer_orders.map((order, key) => (
                            <div key={key} className="d-flex align-items-center mb-3">
                                <div style={{width: '360px'}}>{order.order_id}</div>
                                <div style={{width: '120px'}}>{order.quantity}</div>
                                <div style={{width: '100px'}}>{order.msg_count}</div>
                                <div style={{width: '150px'}}>
                                    <button
                                        onClick={(e) => this.select_the_order(e, order)}
                                        className="orders-button">
                                        Open Messaging
                                    </button>
                                </div>
                            </div>)
                        )}
                    </div>
                </div>)
            } else if (this.state.selected_order !== '') {
                let inner_view = this.state.selected_messages.map((msg, key) => {
                    console.log(`messages rendered`);
                    console.log(msg);
                    console.log(key);
                    try {
                        console.log(msg.message);
                        if (typeof msg.message == 'string') {
                            msg.message = JSON.parse(msg.message);
                        }
                        if (msg.message.n.length > 0) {
                            console.log(`nft address supplied!`);
                            return (
                                <Row style={{justifyContent: 'space-around'}} key={key}>
                                    <h1 style={{
                                        border: '2px solid #13D3FD',
                                        borderRadius: 10,
                                        padding: '.5rem',
                                        margin: '1rem'
                                    }}>
                                        {msg.position}
                                    </h1>
                                    <h3 className="mx-auto">{msg.message.n}</h3>
                                </Row>
                            );
                        } else if (msg.message.m.length > 0) {
                            console.log(`this is a direct message open ended`);
                            return (
                                <Row className="my-3 w-75 text-break p-1"
                                     style={msg.message.m === 'seller' ?
                                         {
                                             justifyContent: 'space-around',
                                             alignItems: 'center',
                                             backgroundColor: '#13D3FD',
                                             color: 'white',
                                             marginRight: 'auto',
                                             borderRadius: 25,
                                         }
                                         :
                                         {
                                             justifyContent: 'space-around',
                                             alignItems: 'center',
                                             marginLeft: 'auto',
                                             borderRadius: 25,
                                             border: '2px solid #13D3FD'
                                         }
                                     }
                                     key={key}>
                                    <h1
                                        style={msg.message.m === 'seller' ?
                                            {
                                                border: '2px solid #13D3FD',
                                                borderRadius: 10,
                                                padding: '.5rem',
                                                margin: '1rem'
                                            }
                                            :
                                            {
                                                border: '2px solid white',
                                                borderRadius: 10,
                                                padding: '.5rem',
                                                margin: '1rem'
                                            }
                                        }>
                                        {msg.position}
                                    </h1>
                                    <h3 style={{maxWidth: '50vh'}} className="mx-auto">{msg.message.m}</h3>
                                </Row>
                            );
                        } else if (msg.message.hasOwnProperty('so')) {
                            console.log(msg.message.so);
                            console.log(`found shipping object`);
                            let parsed_so;
                            if (typeof msg.message.so == 'string') {
                                console.log(`so is a string`);

                                parsed_so = JSON.parse(msg.message.so);
                                console.log(parsed_so);
                            } else {
                                parsed_so = msg.message.so;
                            }
                            if (parsed_so.fn.length > 2) {
                                console.log(`there is a shipping object supplied!`);
                                try {
                                    console.log(`parsed the so`);
                                    return (
                                        <div key={key}>
                                            <Row style={{justifyContent: 'space-around'}}>
                                                <h1 style={{
                                                    border: '2px solid #13D3FD',
                                                    borderRadius: 10,
                                                    padding: '.5rem',
                                                    margin: '1rem'
                                                }}>
                                                    {msg.position}
                                                </h1>
                                                <Col>
                                                    <h2><i> <u>First Name:</u></i> <b></b>{parsed_so.fn}<b/></h2>
                                                    <h2><i> <u>Last Name:</u></i> <b></b>{parsed_so.ln}<b/></h2>
                                                    <h2><i>Email:</i> <b></b>{parsed_so.ea}<b/></h2>
                                                    <h2><i>Phone:</i> <b></b>{parsed_so.ph}<b/></h2>
                                                </Col>
                                                <Col>
                                                    <h2><i> <u>Street Address:</u></i> <b></b>{parsed_so.a1}<b/></h2>
                                                    <h2><i> <u>City:</u></i> <b></b>{parsed_so.city}<b/></h2>
                                                    <h2><i> <u>State:</u></i> <b></b>{parsed_so.s}<b/></h2>
                                                    <h2><i> <u>Area Code:</u></i> <b></b>{parsed_so.z}<b/></h2>
                                                    <h2><i> <u>Country:</u></i> <b></b>{parsed_so.c}<b/></h2>
                                                </Col>
                                            </Row>
                                        </div>
                                    );
                                } catch (err) {
                                    console.error(err);
                                    console.error(`error at parsing the shipping object`);
                                }
                            }
                        }
                        return (
                            <div key={key}>
                                {msg.position}
                                {msg.msg}
                            </div>
                        );
                    } catch (err) {
                        console.error(err);
                        console.error(`error parsing message contents`)
                    }

                });
                the_view = (<Row className="w-100">
                    <h1>{this.state.selected_offer.title} {this.state.selected_offer.offerID}</h1>
                        <Row className="staking-table-header no-gutters">
                        </Row>
                        {
                            inner_view
                        }
                        <Row className="staking-table-header no-gutters">
                            <form onSubmit={(e) => this.local_merchant_reply(e)}>

                                <textarea style={{border: '2px solid #13D3FD', borderRadius: 10, padding: '.5rem', fontSize: '1.5rem' }} rows="6" cols="50" name="message_box"></textarea>

                                <button className="my-3 search-button" type="submit">Send</button>
                            </form>
                    </Row>
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