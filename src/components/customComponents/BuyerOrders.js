import React from 'react';

import { Row, Col } from 'react-bootstrap'

// Icon Imports
import { IconContext } from 'react-icons'
import { CgCloseR } from 'react-icons/cg'

import './ComponentCSS/MerchantAccounts.css'
import './ComponentCSS/StakingTable.css'

let urls=[];

export default class BuyerOrders extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            urls: props.urls,
            handleOrders: props.handleOrders,
            getOffers: props.getOffers, 
            offers: props.offers,
            getOrders: props.getOrders,
            selectedBuyerOffer: props.selectedBuyerOffer,
            selectedBuyerOrder: props.selectedBuyerOrder,
            selectedBuyerUrl: props.selectedBuyerUrl,
            getMessages: props.getMessages,
            orders: props.orders,
            handleMessages: props.handleMessages,
            handleChange: props.handleChange,
        };
    }

    componentDidMount() {

        urls = this.state.urls.map((url, key) => {
            return (
                <option value={url} key={key}>{url}</option>
            )
        })
        
    }

    handleUpdate = (e) => {
        this.state.handleChange(e)

        let name = e.target.name
        let value = e.target.value  
        this.setState({[name]: value})

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
        
                    <form onSubmit={this.state.getOffers}>
                        <h1>Select URL</h1>
                          
                        <select value={this.state.url} name="url" onChange={this.state.handleChange}>
                            <option>Please Select</option>
                            <option value={'http://stageapi.theworldmarketplace.com:17700'}>http://stageapi.theworldmarketplace.com:17700</option>
                            {urls}                           
                        </select>
                        <button type="submit">Get Offers</button>
                    </form>

                    <form onSubmit={this.state.getOrders}>
                        <h1>Select Offer</h1>
                        <select value={this.state.offer} name="offer" onChange={this.state.handleChange}>
                            <option>Please Select</option>
                            {this.state.offers}
                        </select>
                        <input name="url" value="http://stageapi.theworldmarketplace.com:17700"/>
                        <button type="submit">Get Orders</button>
                    </form>

                    <form onSubmit={this.state.getMessages}>
                        <h1>Select Order</h1>
                        <select value={this.state.order} name="order" onChange={this.state.handleChange}>
                            <option>Please Select</option>
                            {this.state.orders}
                        </select>
                        <input name="url" value="http://stageapi.theworldmarketplace.com:17700"/>
                        <input name="offer" value={this.state.selectedBuyerOffer}/>
                        
                        <button type="submit">Get Messages</button>
                    </form>

                    <button type="button" onClick={this.state.handleMessages}>Show Messages</button>
                    
                </Col>
            </div>
        )
    }
}