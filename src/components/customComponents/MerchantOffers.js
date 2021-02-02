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

export default class MyOrders extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            user_offers: props.userOffers
        };
    }

    render() {
        return (
            <Row className="w-100">

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
                        <Row
                            key={key}
                            className="staking-table-row"
                        >
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
                                place="top"
                            >
                        <span>
                            {listing.offerID}
                        </span>
                            </ReactTooltip>
                            <p>
                                <button
                                    onClick={() => this.state.getOrders(
                                        listing.offerID,
                                        listing.seller,
                                        'http://stageapi.theworldmarketplace.com:17700'
                                    )
                                    }
                                    className="edit-button"
                                >
                                    Load
                                </button>

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
                        </Row>)
                    )
                    }

                </Col>

            </Row>
        )
    }

}