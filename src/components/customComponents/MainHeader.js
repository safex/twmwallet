import React from 'react';

import {Row, Col, Image} from 'react-bootstrap';

import {BiCog, BiPowerOff} from 'react-icons/bi'

import './ComponentCSS/MainHeader.css'

export default function MainHeader(props) {
    const renderMenuItem = (activeOnView, label, onClick) => {
        const isActive = props.view === activeOnView;
        return (<Col className={isActive ? "menu-link-active" : ""}>
        <p className="pointer" onClick={() => onClick()}>
            {label}
        </p>
    </Col>)
    }

    return (
        <Row id="header" className="main-header">
                <Col sm={2} className="main-header-logo">
                    <Image src={require("./../../img/white-logo.svg")}/>
                </Col>
            

                <Col sm={6} className="d-flex">
                    {renderMenuItem('home', 'Home', props.goHome)}
                    {renderMenuItem('tokens', 'Tokens', props.goToTokens)}                
                </Col>

                <Col sm={2} className="">
                    <BiCog tabIndex={4} size={40} className="m-3 pointer" onClick={props.goToSettings}/>

                    <BiPowerOff tabIndex={5} size={40} className="m-3 pointer" onClick={props.logout}/>
                </Col>
        </Row>
    )
}