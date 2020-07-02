import React from 'react';
import {Row, Col, Container, Button, Form} from 'react-bootstrap';
import path from 'path';
import {create_wallet} from '../../utils/wallet_creation';

import WalletHome from "../wallet/home";
import {open_twm_file, save_twm_file} from "../../utils/twm_actions";

const crypto = window.require('crypto');

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
            network: 'stagenet',
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
        } catch (err) {
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
            try {

                let twm_obj = {};

                twm_obj.version = 2;
                twm_obj.api = {};
                twm_obj.api.urls = {};/*
                    twm_obj.api.urls.theworldmarketplace = {};
                    twm_obj.api.urls.theworldmarketplace.url = 'api.theworldmarketplace.com';*/
                twm_obj.accounts = {};
                twm_obj.settings = {};

                //for each account make one, and within an account you have urls and keys  the top lvel api urls is for top level non account actions
                var accs = wallet.getSafexAccounts();
                for (const acc of accs) {
                    console.log(acc);
                    twm_obj.accounts[acc.username] = {};
                    twm_obj.accounts[acc.username].username = acc.username;
                    twm_obj.accounts[acc.username].data = acc.data;
                    twm_obj.accounts[acc.username].safex_public_key = acc.publicKey;
                    twm_obj.accounts[acc.username].safex_private_key = acc.privateKey;
                    twm_obj.accounts[acc.username].urls = {};
                    /*
                                            twm_obj.accounts[acc.username].urls.theworldmarketplace = {};
                                            twm_obj.accounts[acc.username].urls.theworldmarketplace.url = 'api.theworldmarketplace.com';
                    */
                }

                const algorithm = 'aes-256-ctr';
                const cipher = crypto.createCipher(algorithm, this.state.password);
                let crypted = cipher.update(JSON.stringify(twm_obj), 'utf8', 'hex');
                crypted += cipher.final('hex');

                const hash1 = crypto.createHash('sha256');
                hash1.update(JSON.stringify(twm_obj));
                console.log(`password ${this.state.password}`);
                console.log(JSON.stringify(twm_obj));

                let twm_save = await save_twm_file(this.state.new_path + '.twm', crypted, this.state.password, hash1.digest('hex'));

                try {

                    let twm_file = await open_twm_file(this.state.new_path + '.twm', this.state.password);
                    console.log(twm_file);

                    localStorage.setItem('twm_file', JSON.stringify(twm_file.contents));
                } catch (err) {
                    console.error(err);
                    console.error(`error opening twm file after save to verify`);
                }
                console.log(twm_save);

            } catch (err) {
                console.error(err);
                console.error(`error at initial save of the twm file`);
            }
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
            <div>
                {this.state.wallet_made ?
                    (<div>
                        <WalletHome
                            wallet={this.state.wallet}
                            daemon_host={this.state.daemon_host}
                            daemon_port={this.state.daemon_port}
                            password={this.state.password}
                        />
                    </div>) :
                    (<Container>
                        <button onClick={this.exit_home}>exit home</button>
                        <Row className="justify-content-md-center">
                            <Col sm={6}>
                                <p>
                                    This path creates a new set of keys and a Safex Wallet.
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
                            (<div></div>) :
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
                                            <Form.Control name="daemon_host" defaultValue="stagenetrpc.safex.org"
                                                          placedholder="set the ip address of the safex blockchain"/>
                                            <Form.Control name="daemon_port" defaultValue="30393"
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
                                        <p>
                                            this file will be saved to {this.state.new_path} <Button
                                            onClick={this.change_path}>change path?</Button>
                                        </p>
                                    </div>
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