import React from 'react';

import {Row, Col, Image} from 'react-bootstrap';

import {BiCog, BiPowerOff} from 'react-icons/bi'

import './ComponentCSS/MainHeader.css'

export default function MainHeader(props) {

    return (
        <Row id="header" className="main-header">
                <Col sm={2} className="main-header-logo">
                    <Image src={require("./../../img/white-logo.svg")}/>
                </Col>
            

                <Col sm={6} className="d-flex">
                    
                        <Col className={props.view === 'home' ? "menu-link-active" : ""}>
                            <p tabIndex={0} className="" href="javascript:void(0)" onClick={props.goHome}>
                                Home
                            </p>
                        </Col>
                        <Col tabIndex={1} className={props.view === 'market' ? "menu-link-active" : ""}>
                            <p className="" href="javascript:void(0)" onClick={props.goToMarket}>
                                Market
                            </p>
                        </Col>
                        <Col tabIndex={2} className={props.view === 'merchant' ? "menu-link-active" : ""}>
                            <p className="" href="javascript:void(0)" onClick={props.goToMerchant}>
                                Merchant
                            </p>
                        </Col>
                        <Col tabIndex={3} className={props.view === 'tokens' ? "menu-link-active" : ""}>
                            <p className="" href="javascript:void(0)" onClick={props.goToTokens}>
                                Tokens
                            </p>
                        </Col>
                    
                </Col>

                <Col sm={2} className="">
                    <BiCog tabIndex={4} size={40} className="m-3" onClick={props.goToSettings}/>

                    <BiPowerOff tabIndex={5} size={40} className="m-3" onClick={props.logout}/>
                </Col>
        </Row>
    )
}