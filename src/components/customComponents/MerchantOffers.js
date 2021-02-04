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
                            <ReactTooltip
                                className="entry-tooltip-container"
                                id='offerID'
                                effect='solid'
                                place="top">
                        <span>
                            {listing.offerID}
                        </span>
                            </ReactTooltip>
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
                                        onClick={}
                                        className="orders-button">
                                        Open Messaging
                                    </button>
                                </p>
                            </Row>)
                        )}
                    </Col>
                </Row>)
            } else if (this.state.selected_order !== '') {
               /* <ReactModal
                    isOpen={this.state.showMessages}
                    closeTimeoutMS={500}
                    className="buyer-messages-modal"
                    onRequestClose={this.hideMessages}
                >
                    <Row>
                        <Col sm={10}>
                            <h1>
                                Merchant Messages for
                            </h1>

                            <h2>Order: { this.state.selectedMerchantOrder }</h2>

                        </Col>
                        <Col sm={2}>
                            <IconContext.Provider value={{color: '#FEB056', size: '30px'}}>
                                <CgCloseR
                                    className="mx-auto"
                                    onClick={this.hideMessages}
                                />
                            </IconContext.Provider>
                        </Col>
                    </Row>

                    <Row className="m-auto">
                        <Col style={{overflowY: 'auto', maxHeight: '50vh'}} sm={12}>
                            {message_render}
                        </Col>


                        <Col className="mx-auto my-5" sm={6}>
                            <form onSubmit={(e) => this.seller_reply_message(
                                e,
                                this.state.selected_user.username,
                                this.state.selectedMerchantOffer,
                                this.state.selectedMerchantOrder,
                                'http://stageapi.theworldmarketplace.com:17700',
                            )
                            }
                            >
                                <textarea style={{border: '2px solid #13D3FD', borderRadius: 10, padding: '.5rem', fontSize: '1.5rem' }} rows="6" cols="50" name="merchantMessageBox"></textarea>

                                <button className="my-3 search-button" type="submit">Send</button>
                            </form>
                        </Col>
                    </Row>
                </ReactModal>*/
            }
        }

        return (
            <div>
                {the_view}
            </div>
        )
    }
}