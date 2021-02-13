import React from 'react';

import {Row, Col, Image, } from 'react-bootstrap';

import ReactTooltip from "react-tooltip";

// Icon Imports
import { AiOutlineInfoCircle } from 'react-icons/ai'

import { IconContext } from 'react-icons'

import './ComponentCSS/MerchantTabs.css'

export default function MerchantTabs(props) {

    return (
            <div className="merchant-tabs-box">
                <div onClick={props.handleNewAccountForm} className="merchant-tab pointer">
                    <Image
                    onClick={props.handleNewAccountForm} 
                        width={75}
                        height={75}
                        src={props.newAccountImage}
                        roundedCircle
                    />

                    <h1 onClick={props.handleNewAccountForm} >Make a New Account</h1>
                    
                </div>
                
                <div onClick={props.showAccounts} className="merchant-tab pointer">
                    <Image
                        width={75}
                        height={75}
                        src={props.accountsImage}
                        roundedCircle
                    />

                    <h1>See Your Accounts</h1>
                    
                </div>
                
                <div onClick={props.handleNewOfferForm} className="merchant-tab pointer">
                    <Image
                        width={75}
                        height={75}
                        src={props.newOfferImage}
                        roundedCircle
                    />

                    <h1>Make a New Offer</h1>
                    
                </div>
                
                <div onClick={props.showOffers} className="merchant-tab pointer">
                    <Image
                        width={75}
                        height={75}
                        src={props.offersImage}
                        roundedCircle
                    />

                    <h1>See Your Offers</h1>
                    
                </div>
                
            </div>

    )
}