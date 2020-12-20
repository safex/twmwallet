import React from 'react';
import {Button, Col, Container, Row, Image, Tabs, Tab, Alert, Collapse} from 'react-bootstrap'
import { FaHistory, FaAlignLeft, FaKey, FaFolderPlus, FaFolderOpen } from 'react-icons/fa'


import {open_wallet_util} from "../../utils/wallet_creation";
import {purchase_offer} from "../../utils/wallet_actions";

import {save_twm_file, open_twm_file} from "../../utils/twm_actions";
import copy from "copy-to-clipboard";
const os = window.require('os');
const fs = window.require('fs').promises;
const libPath = window.require('path');
const crypto = window.require('crypto');
var walley;
const WALLET_FILENAME = 'safexwallet.dat';
const DEFAULT_WALLET_PATH = libPath.resolve(os.homedir(), WALLET_FILENAME);


async function read_legacy_wallet(wallet_path) {
    try {
        return await fs.readFile(wallet_path);
    } catch (err) {
        let error = {};
        error.e = err;
        error.error = "error at loading the wallet file";
        return error;
    }
}

export default class SelectEntry extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            legacy_wallet: '',
            legacy_detected: false,
            showLegacyAlert: false
        };
    }

    async componentDidMount() {
        try {
            localStorage.clear();
            let wallet = await read_legacy_wallet(DEFAULT_WALLET_PATH);

            //if there is an error loading the file, perhaps it doesn't exist
            if (wallet.e) {
                console.log("legacy wallet was not found");
            } else {
                this.setState({legacy_wallet: wallet, legacy_detected: true});
            }
        } catch (err) {
            console.error(err);
            console.error("error at reading legacy wallet");
        }
    };



    back = (e) => {
        e.preventDefault();
        this.props.history.push({pathname: '/'});
    };

    open_existing = (e) => {
        e.preventDefault();
        this.props.history.push({pathname: '/open_wallet'});
    };

    create_new = (e) => {
        e.preventDefault();
        this.props.history.push({pathname: '/create_wallet'});
    };

    restore_keys = (e) => {
        e.preventDefault();
        this.props.history.push({pathname: '/recover_keys'});
    };

    seed_phrase = (e) => {
        e.preventDefault();
        this.props.history.push({pathname: '/recover_seed'});
    };

    restore_legacy = (e) => {
        e.preventDefault();
        this.props.history.push({pathname: '/', state: {legacy_wallet: this.state.legacy_wallet}});
    };

    render() {
        return (
            <div className="width100 height100 d-flex flex-column text-center">
                
                <Container fluid className="height100 flex-column d-flex justify-content-center">

                    <Image className="plant" src={require("./../../img/plant.svg")}/>
                    <Image className="plant2" src={require("./../../img/corner-plant.svg")}/>
                    <Image className="entry-scene" src={require("./../../img/entry-scene.svg")}/>
                    <Image onClick={this.back} className="entry-off-button" src={require("./../../img/off.svg")}/>
                    

                    <Row className="rowjustify-content-md-center justify-content-center p-3">
                        <Image className="w-25" src={require("./../../img/safex-home-multi.svg")}/>
                    </Row>

                    <Col className="my-5">
                        <Col className="my-2 p-3">
                            <button onClick={this.open_existing} className="custom-button-entry">Open Existing Wallet</button>
                        </Col>

                        <Col className="my-2 p-3">
                            <button onClick={this.create_new} className="custom-button-entry">Create New Wallet</button>
                        </Col>

                        <Col className="my-2 p-3">
                            <button onClick={this.restore_keys} className="custom-button-entry">Recover Wallet From Keys</button>
                        </Col>

                        <Col className="my-2 p-3">
                            <button onClick={this.seed_phrase} className="custom-button-entry">Recover Wallet From Seed Phrase</button>
                        </Col>

                        {this.state.legacy_detected ? 
                        (
                            <Col className="my-5 p-3">
                                <button className="custom-button-entry orange-border" onClick={() => this.setState({showLegacyAlert: !this.state.showLegacyAlert})}>Open Legacy Wallet</button>
                                <Collapse in={this.state.showLegacyAlert}>
                                <Alert 
                                    variant="info" 
                                    transition={false}
                                    className="mt-3 w-50 mx-auto entry-back-text"    
                                >
                                    <Alert.Heading>We are working on this feature. Thank you for your patience!</Alert.Heading>
                                   
                                </Alert>
                                </Collapse>
                            </Col>
                        ) 
                        : 
                            (<div></div>)
                        }
                        
                    </Col>
                    
                    <Row  className="w-100 entry-footer">
                        <p>THE WORLD MARKETPLACE</p>
                    </Row>
                </Container>  
            </div>);
    }
}
