import React from 'react';
import {Row, Col, Container, Button, Form} from 'react-bootstrap';
import path from 'path';
import {create_wallet} from '../../utils/wallet_creation';
import { FaBackward } from 'react-icons/fa'

import WalletHome from "../wallet/home";

const safex = window.require("safex-nodejs-libwallet");

let {dialog} = window.require("electron").remote;

export default class CreateWallet extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            daemon_host: '',
            daemon_port: 0,
            new_path: '',
            password: '',
            safex_key: null,
            success: false,
            network: 'mainnet',
            testnet: false,
            wallet: null,
            wallet_made: false
        };
        this.wallet_meta = null;
    }

    async componentDidMount() {

    }

    set_path = (e) => {
        e.preventDefault();

        let sails_path = dialog.showSaveDialogSync();
        let new_path = sails_path;

        try {
            if (new_path.length > 0) {
                this.setState({new_path: new_path});
            }
        } catch(err) {
            console.log("cancelled, no path set");
        }
    };

    change_path = (e) => {
        e.preventDefault();
        this.setState({new_path: ''})
    };
    set_daemon_state = (e) => {
        e.preventDefault();
        this.setState({daemon_host: e.target.daemon_host.value, daemon_port: parseInt(e.target.daemon_port.value)})
    };

    change_daemon = (e) => {
        e.preventDefault();
        this.setState({daemon_host: '', daemon_port: 0});
    };

    set_password = (e) => {
        e.preventDefault();
        if (e.target.password.value === e.target.repeat_password.value) {
            this.setState({password: e.target.password.value});
        } else {
            alert("passwords dont match");
        }
    };

    change_password = (e) => {
        e.preventDefault();
        this.setState({password: ''});
    };

    make_wallet = async (e) => {
        e.preventDefault();
        try {
            let daemon_string = `${this.state.daemon_host}:${this.state.daemon_port}`;
            let wallet = await create_wallet(this.state.new_path, this.state.password, 0, this.state.network, daemon_string);
            console.log(wallet);
            wallet.setSeedLanguage("English");
            this.setState({wallet_made: true, wallet: wallet});
        } catch (err) {
            console.error(err);
            console.error("error on initial recovery");
        }
    };

    set_to_testnet = (e) => {
        e.preventDefault();
        const target = e.target;
        if (target.checked === true) {
            this.setState({
                testnet: true,
                network: 'testnet'
            });
        } else {
            this.setState({
                testnet: false,
                network: 'mainnet'
            });
        }
    };

    show_password = (e) => {
        e.preventDefault();
        alert(this.state.password);
    };

    exit_home = (e) => {
        e.preventDefault();
        this.props.history.push({pathname: '/'});
    };

    render() {
        return (
            <Container fluid className="safex_blue d-flex flex-column justify-content-center ">
                {this.state.wallet_made ?
                    (<div>
                        <WalletHome
                            wallet={this.state.wallet}
                            daemon_host={this.state.daemon_host}
                            daemon_port={this.state.daemon_port}
                        />
                    </div>) :
                    (<Container fluid className="font-size-small b-r25 grey-back d-flex flex-column safex_blue white-text" >
                        <Button className="m-2 align-self-start btn-warning" onClick={this.exit_home}><FaBackward className="mr-2"/>Go Back</Button>
                        
                        <Row className="align-items-center mb-5 justify-content-center">   
                            <h1>Create New Wallet</h1>
                        </Row>
                        
                        <Col sm={8} className="d-flex justify-content-center align-self-center flex-column text-center" >
                            
                            
                            <p>
                                This path creates a new set of keys and a Safex Wallet.
                            </p>
                            <p className="border border-danger b-r25">
                                If you are participating in the testnet, tick this box
                                <input
                                    name="isTestnet"
                                    type="checkbox"
                                    checked={this.state.testnet}
                                    onChange={this.set_to_testnet}
                                    className="ml-2"
                                />
                            </p>
                        
                       

                        {this.state.new_path.length > 0 ?
                            (<div></div>) :
                            (
                                    <div className="mt-2 border border-warning  b-r25">
                                        <p>
                                            Set the path where to save your new wallet file
                                        </p>
                                        <Form className="mt-2 mb-2" id="set_path" onSubmit={this.set_path}>
                                            <Button type="submit" variant="primary" size="lg">Select File
                                                Path</Button>
                                        </Form>
                                    </div>
                                )
                        }
                        
                        {this.state.new_path.length > 0 && this.state.daemon_host.length < 1 ?
                            (
                                    <Col className="mb-2 mt-2 border border-warning b-r25">
                                        <Form  id="set_daemon" className="auto_margin_50" onSubmit={this.set_daemon_state}>
                                            <Form.Control className="mt-2 mb-2"  name="daemon_host" defaultValue="rpc.safex.org"
                                                          placedholder="set the ip address of the safex blockchain"/>
                                            <Form.Control className="mt-2 mb-2"  name="daemon_port" defaultValue="17402"
                                                          placedholder="set the port of the safex blockchain"/>
                                            <Button className="mb-2" type="submit" variant="primary" size="lg">Set
                                                Connection</Button>
                                        </Form>
                                    </Col>
                               ) :
                            (
                                <Col className="d-flex flex-column mb-2 mt-2 border border-warning b-r25">
                                    <p className="mt-2 mb-2">
                                        You will be connected
                                        to <b>{this.state.daemon_host}:{this.state.daemon_port}</b> for
                                        blockchain synchronization
                                        <br/>
                                    </p>
                                        <Button
                                            className="align-self-center mb-2 mt-2"
                                            onClick={this.change_daemon}>Change Safex Network Connection
                                        </Button>
                                    
                                </Col>
                            )
                        }

                        {this.state.new_path.length > 0 &&
                        this.state.daemon_host.length > 0 &&
                        this.state.password.length < 1 ?
                            
                                   
                            (<Col className="mb-2 mt-2 border border-warning b-r25 ">
                                <Form id="set_password" className="auto_margin_50" onSubmit={this.set_password}>
                                    <Form.Control name="password" className="mt-2 mb-2" type="password"
                                                    placedholder="Set the ip address of the Safex blockchain"/>
                                    <Form.Control name="repeat_password" className="mt-2 mb-2" type="password"
                                                    placedholder="Set the port of the Safex blockchain"/>
                                    <Button type="submit" variant="primary" className="mb-2" size="lg" block>Set
                                        Password</Button>
                                </Form>
                            </Col>
                        
                            ) :
                            (
                                <Col className="d-flex flex-column mb-5 border border-warning b-r25">
                                    <p className="mt-2 mb-2">
                                        Your chosen password is: {[...Array(this.state.password.length)].map(() =>
                                        <span>♦</span>)}
                                    </p>
                                    <Row className="align-self-center mt-2 mb-2">
                                        <Button className="mt-2 mr-2"
                                            onClick={this.show_password}>Show Password</Button>
                                        <Button className="mt-2"
                                            onClick={this.change_password}>Change Password</Button>
                                    </Row>
                                </Col>
                            )
                        }

                        {this.state.new_path.length > 0 &&
                        this.state.daemon_host.length > 0 &&
                        this.state.password.length > 0 ?
                            (   <Col className="mt-5">
                                    <Col className="p-2 justify-content-between align-items-baseline border border-warning b-r25">
                                        <p>
                                            This file will be saved to: <b>{this.state.new_path}</b>
                                        </p>
                                        <Button onClick={this.change_path}>
                                            Change Path
                                        </Button>
                                    </Col>
                                    
                                    <div className="mt-5 mb-5">
                                        <Button onClick={this.make_wallet} variant="primary" size="lg">
                                            Create New Wallet
                                        </Button>
                                    </div>

                                </Col>    
                                ) :
                            (<div>
                            </div>)
                        }
                        </Col>
                    </Container>)
                }
            </Container>
        );
    }
}