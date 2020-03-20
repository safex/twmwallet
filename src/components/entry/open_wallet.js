import React from 'react';
import {Row, Col, Container, Button, Form} from 'react-bootstrap';
import path from 'path';
import {open_wallet} from '../../utils/wallet_creation';

import WalletHome from '../wallet/home';

const safex = window.require("safex-nodejs-libwallet");

let {dialog} = window.require("electron").remote;

export default class OpenWallet extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            daemon_host: '',
            daemon_port: 0,
            password: '',
            new_path: '',
            wallet: null,
            network: 'mainnet',
            testnet: false,
            wallet_made: false
        };
    }

    async componentDidMount() {

    }

    set_path = (e) => {
        e.preventDefault();

        let sails_path = dialog.showOpenDialogSync();
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
        console.log(this.state.new_path);
        this.setState({daemon_host: e.target.daemon_host.value, daemon_port: parseInt(e.target.daemon_port.value)})
        console.log(e.target.daemon_host.value);
    };

    change_daemon = (e) => {
        e.preventDefault();
        this.setState({daemon_host: '', daemon_port: 0});
    };

    open_wallet = async (e) => {
        e.preventDefault();
        try {
            let daemon_string = `${this.state.daemon_host}:${this.state.daemon_port}`;
            let wallet = await open_wallet(this.state.new_path,
                e.target.password.value,
                0,
                this.state.network,
                daemon_string);
            console.log(wallet);
            localStorage.setItem('wallet', JSON.stringify(wallet));
            this.setState({wallet_made: true, wallet: wallet, password: "entered"});
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
                            wallet={this.state.wallet}/>
                    </div>) :
                    (<Container>
                        <button onClick={this.exit_home}>exit home</button>
                        <Row className="justify-content-md-center">
                            <Col sm={6}>
                                <p>
                                    With this option you can open an existing Safex Wallet by setting the path
                                    to the .keys file or the data file with the .keys file in the same directory
                                    entering your password, and then being able to access your safex cash and tokens.
                                </p>
                                <p>
                                    if you are participating in the test net work, tick this box
                                    <input
                                        name="isTestnet"
                                        type="checkbox"
                                        checked={this.state.testnet}
                                        onChange={this.set_to_testnet}/>
                                </p>
                            </Col>
                        </Row>
                        <Row className="justify-content-md-center">
                            <Col sm={6}>

                                {this.state.new_path.length > 0 ?
                                    (<div>
                                        <p>
                                            this is the wallet you wish to open: {this.state.new_path} <Button
                                            onClick={this.change_path}>change path?</Button>
                                        </p>
                                    </div>) :
                                    (<div>
                                        <p>
                                            Indicate the path to your wallet file
                                        </p>
                                        <Form id="set_path" onSubmit={this.set_path}>
                                            <Button type="submit" variant="primary" size="lg" block>Select File
                                                Path</Button>
                                        </Form>
                                    </div>)
                                }

                            </Col>
                        </Row>

                        {this.state.new_path.length > 0 &&
                        this.state.daemon_host.length < 1 ?
                            (<Row className="justify-content-md-center">
                                <Col sm={6}>
                                    <div>
                                        <p>
                                            This is the connection url to the safex blockchain network.
                                            You can use the default provided by the safex development team
                                            or replace the default values with your own.
                                        </p>
                                        <p>
                                            A usual self hosted wallet set up would be
                                            host: 127.0.0.1
                                            port: 17402
                                            The default is rpc.safex.org provided by the Safex Foundation
                                        </p>
                                        <Form id="set_daemon" onSubmit={this.set_daemon_state}>
                                            Safexd Host <Form.Control name="daemon_host" defaultValue="rpc.safex.org"
                                                                      placedholder="set the ip address of the safex blockchain"/>
                                            Safexd Port <Form.Control name="daemon_port" defaultValue="17402"
                                                                      placedholder="set the port of the safex blockchain"/>
                                            <Button type="submit" variant="primary" size="lg" block>set
                                                connection</Button>
                                        </Form>
                                    </div>
                                </Col>
                            </Row>) :
                            (<div>
                            </div>)

                        }

                        {this.state.new_path.length > 0 &&
                        this.state.daemon_host.length > 0 &&
                        this.state.password.length < 1 ?
                            (<div>
                                <Row className="justify-content-md-center">
                                    <Col sm={6}>
                                        <div>
                                            <Form id="set_password" onSubmit={this.open_wallet}>
                                                <Form.Control name="password" type="password"
                                                              placedholder="enter your password and open your wallet"/>
                                                <Button type="submit" variant="primary" size="lg" block>open your
                                                    wallet</Button>
                                            </Form>
                                        </div>
                                    </Col>
                                </Row>
                            </div>) :
                            (<div>
                            </div>)
                        }

                        {this.state.new_path.length > 0 &&
                        this.state.daemon_host.length > 0 &&
                        this.state.password.length > 0 ?
                            (<div>
                                <Row className="justify-content-md-center">
                                    <Col sm={6}>
                                        <p>opening your wallet...</p>
                                    </Col>
                                </Row>
                            </div>) :
                            (<div>
                            </div>)
                        }
                    </Container>)}
            </div>);
    }
}
