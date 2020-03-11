import React from 'react';
import {Row, Col, Container, Button, Form} from 'react-bootstrap';
import path from 'path';
import {create_wallet} from '../../utils/wallet_creation';

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

        this.setState({new_path: new_path})
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
            let wallet = await create_wallet(this.state.new_path, this.state.password, this.state.network, daemon_string);
            console.log(wallet);
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
    }

    render() {
        return (
            <div>
                {this.state.wallet_made ?
                    (<div>
                        <WalletHome
                            wallet={this.state.wallet}/>
                    </div>) :
                    (<Container>
                        <Row className="justify-content-md-center">
                            <Col sm={6}>
                                <p>
                                    Here you will establish your new wallet file.
                                    When this procedure is finished you will still have the safexwallet.dat
                                    in your home directory, as well as a marker that the safexwallet.dat was merged
                                    into the new wallet file.
                                </p>
                                <p>
                                    <input
                                        name="isTestnet"
                                        type="checkbox"
                                        checked={this.state.testnet}
                                        onChange={this.set_to_testnet}/>
                                </p>
                            </Col>
                        </Row>

                        {this.state.new_path.length > 0 ?
                            (<Row className="justify-content-md-center">
                                <Col sm={6}>
                                    <div>
                                        <p>
                                            this file will be saved to {this.state.new_path} <Button
                                            onClick={this.change_path}>change path?</Button>
                                        </p>
                                    </div>
                                </Col>
                            </Row>) :
                            (<Row className="justify-content-md-center">
                                <Col sm={6}>
                                    <div>
                                        <p>
                                            Set the path where to save your new wallet file
                                        </p>
                                        <Form id="set_path" onSubmit={this.set_path}>
                                            <Button type="submit" variant="primary" size="lg" block>Select File
                                                Path</Button>
                                        </Form>
                                    </div>
                                </Col>
                            </Row>)
                        }

                        {this.state.new_path.length > 0 && this.state.daemon_host.length < 1 ?
                            (<Row className="justify-content-md-center">
                                <Col sm={6}>
                                    <div>
                                        <Form id="set_daemon" onSubmit={this.set_daemon_state}>
                                            <Form.Control name="daemon_host" defaultValue="127.0.0.1"
                                                          placedholder="set the ip address of the safex blockchain"/>
                                            <Form.Control name="daemon_port" defaultValue="17402"
                                                          placedholder="set the port of the safex blockchain"/>
                                            <Button type="submit" variant="primary" size="lg" block>set
                                                connection</Button>
                                        </Form>
                                    </div>
                                </Col>
                            </Row>) :
                            (<Row className="justify-content-md-center">
                                <Col sm={6}>
                                    <div>
                                        <p>
                                            you will be connected
                                            to {this.state.daemon_host}:{this.state.daemon_port} for
                                            blockchain synchronization<Button
                                            onClick={this.change_daemon}>change safex network connection?</Button>
                                        </p>
                                    </div>
                                </Col>
                            </Row>)
                        }

                        {this.state.new_path.length > 0 &&
                        this.state.daemon_host.length > 0 &&
                        this.state.password.length < 1 ?
                            (<Row className="justify-content-md-center">
                                <Col sm={6}>
                                    <div>
                                        <div>
                                            <Form id="set_password" onSubmit={this.set_password}>
                                                <Form.Control name="password" type="password"
                                                              placedholder="set the ip address of the safex blockchain"/>
                                                <Form.Control name="repeat_password" type="password"
                                                              placedholder="set the port of the safex blockchain"/>
                                                <Button type="submit" variant="primary" size="lg" block>set
                                                    password</Button>
                                            </Form>
                                        </div>

                                    </div>
                                </Col>
                            </Row>) :
                            (<Row className="justify-content-md-center">
                                <Col sm={6}>
                                    <div>
                                        <p>
                                            your chosen password is : {[...Array(this.state.password.length)].map(() =>
                                            <span>♦</span>)}

                                            <Button
                                                onClick={this.show_password}>show password</Button>
                                            <Button
                                                onClick={this.change_password}>change password</Button>
                                        </p>
                                    </div>
                                </Col>
                            </Row>)
                        }

                        {this.state.new_path.length > 0 &&
                        this.state.daemon_host.length > 0 &&
                        this.state.password.length > 0 ?
                            (<Row className="justify-content-md-center">
                                <Col sm={6}>
                                    <div>
                                        <Button onClick={this.make_wallet} variant="primary" size="lg" block>Make
                                            the New Wallet</Button>
                                    </div>
                                </Col>
                            </Row>) :
                            (<div>
                            </div>)
                        }

                    </Container>)
                }
            </div>
        );
    }
}