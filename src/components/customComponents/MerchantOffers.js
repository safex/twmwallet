import React from 'react';

import './ComponentCSS/MerchantAccounts.css'
import './ComponentCSS/StakingTable.css'
import MessagesModal from './MessagesModal';

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

    backToOffers = () => {
        this.setState({selected_offer: '', selected_offer_orders: null})
    }

    showMessagesModal = async (e, order) => {
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
                e.target.messageBox.value,
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
            the_view = (<div className="w-100">
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
                                    onClick={() => this.props.handleShowEditOfferForm(listing)}
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
                the_view = (<div className="w-100">
                    <span style={{color: '#13D3FD'}} className="mb-2 pointer" onClick={() => this.backToOffers()}>← BACK TO OFFERS</span>
                    <div>
                    <label>Offer ID</label>
                    <span className="ml-3">{this.state.selected_offer.offerID}</span>
                    </div>

                    <div>
                    <label>Title</label>
                    <span className="ml-3 mb-3">{this.state.selected_offer.title}</span>
                    </div>

                    <span style={{fontSize: "1.5rem"}}>Orders</span>
                    <div style={{
                        height: '350px',
                        overflow: 'overlay'
                        }} 
                        className="d-flex flex-column">
                        <div className="d-flex align-items-center mb-3">
                            <label style={{width: '360px'}}>Order ID</label>
                            <label style={{width: '120px'}}>Quantity</label>
                            <label style={{width: '100px'}}>Message Count</label>
                            <label style={{width: '140px'}}>Actions</label>
                        </div>
                        {this.state.selected_offer_orders && this.state.selected_offer_orders.map((order, key) => (
                            <div key={key} className="d-flex align-items-center mb-3">
                                <div style={{width: '360px'}}>{order.order_id}</div>
                                <div style={{width: '120px'}}>{order.quantity}</div>
                                <div style={{width: '100px'}}>{order.msg_count}</div>
                                <div style={{width: '140px'}}>
                                    <button
                                        onClick={(e) => this.showMessagesModal(e, order)}
                                        className="orders-button">
                                        Open Messaging
                                    </button>
                                </div>
                            </div>)
                        )}
                    </div>
                </div>)
            } else if (this.state.selected_order !== '') {
                const merchangeMessages = this.state.selected_messages.map((msg, key) => {
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
                                <div className="d-flex align-items-center justify-content-between mt-3" key={msg}>
                                <span>
                                    {msg.position}
                                </span>
                                <span>{msg.message.n}</span>
                            </div>
                            );
                        } else if (msg.message.m.length > 0) {
                            console.log(`this is a direct message open ended`);
                            return (
                                <div className="d-flex align-items-center mt-3" key={msg}>
                                <span style={{color: '#0000004d'}}>
                                    {msg.position}
                                </span>
                                <span className={`message ${msg.from.startsWith('-----BEGIN') ? 'message--mine' : 'message--yours'}`}>{msg.message.m}</span>
                            </div>
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
                                            <div>
                                            <span>
                                                {msg.position}
                                            </span>
                                            <div class="d-flex flex-column"
                                            style={{
                                                backgroundColor: '#d3d3d345',
                                                padding: '10px',
                                                borderRadius: '10px'}}>
                                                <div class="d-flex">
                                                <label>First name:</label>
                                                <span className="ml-2">{parsed_so.fn}</span>
                                                </div>
                                                
                                                <div class="d-flex">
                                                <label>Last name:</label>
                                                <span className="ml-2">{parsed_so.ln}</span>
                                                </div>

                                                <div class="d-flex">
                                                <label>Email:</label>
                                                <span className="ml-2">{parsed_so.ea}</span>
                                                </div>

                                                <div class="d-flex">
                                                <label>Phone:</label>
                                                <span className="ml-2">{parsed_so.ph}</span>
                                                </div>
                                            <div>
                                                <label>Street Address:</label>
                                                <span className="ml-2">{parsed_so.a1}</span>
                                                </div>
                                                <div class="d-flex">
                                                <label>City:</label>
                                                <span className="ml-2">{parsed_so.city}</span>
                                                </div>
                                                <div class="d-flex">
                                                <label>State:</label>
                                                <span className="ml-2">{parsed_so.s}</span>
                                                </div>
                                                <div class="d-flex">
                                                <label>Area code:</label>
                                                <span className="ml-2">{parsed_so.z}</span>
                                                </div>
                                                <div class="d-flex">
                                                <label>Country:</label>
                                                <span className="ml-2">{parsed_so.c}</span>
                                                </div>
                                            </div>
                                        </div>
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
                the_view = (<div className="w-100">
                    <MessagesModal
                        isOpen={!!this.state.selected_order}
                        closeFn={() => this.setState({selected_order: '', selected_messages: null})}
                        sendFn={(e) => this.local_merchant_reply(e)}
                        refreshFn={e => this.showMessagesModal(e, this.state.selected_order)}
                        messages={merchangeMessages}
                        orderId={this.state.selected_order.order_id} />
                </div>)
            }
        }

        return (
            <div>
                {the_view}
            </div>
        )
    }
}