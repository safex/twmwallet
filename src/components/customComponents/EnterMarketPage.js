import React from 'react';

import {Container, Image} from 'react-bootstrap';

export default function EnterMarketPage(props) {
    
        return (
            <Container fluid className="height100 d-flex flex-column justify-content-center align-items-center">
                <Image className="entry-mini-logo" src={require("./../../img/safex-multi-small.svg")}/>
                <Image onClick={props.exit} className="entry-off-button" src={require("./../../img/off.svg")}/>
                <Image className="entry-scene" src={require("./../../img/loading-scene.svg")}/>
                <Image className="plant3" src={require("./../../img/plant2.svg")}/>
                <p>Welcome to </p>
                <p>Safex </p>
                <p>World </p>
                <p>Marketplace</p>

                <button 
                    className="mx-auto custom-button-entry orange-border mt5" 
                    onClick = {() => props.setLoading}
                >
                    Enter
                </button>
            </Container>
        );
    }