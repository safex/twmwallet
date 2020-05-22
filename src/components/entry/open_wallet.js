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
            alert(err);
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
                    (<Container className="justify-content-center">
                        <Button className="m-5 btn-secondary" onClick={this.exit_home}>Go Back</Button>
                        <Row className="justify-content-md-center alert-box">
                            <Col sm={6}>
                                <p>
                                    Open an existing Safex wallet by selecting the .keys file and
                                    entering your password.
                                </p>
                                <div className="mt-4">
                                <p className="border-warning">
                                    If you are participating in the testnet, tick this box
                                    <input
                                        name="isTestnet"
                                        type="checkbox"
                                        checked={this.state.testnet}
                                        onChange={this.set_to_testnet}
                                        className="ml-2"
                                    />
                                </p>
                                </div>
                            </Col>
                        </Row>
                        <Row className="justify-content-md-center">
                            <Col sm={6}>

                                {this.state.new_path.length > 0 ?
                                    (<div>
                                        <p>
                                            Selected Wallet File: <b>{this.state.new_path}</b> <Button className="ml-2"
                                            onClick={this.change_path}>Change File</Button>
                                        </p>
                                    </div>) :
                                    (<div>
                                       
                                        <Form id="set_path" onSubmit={this.set_path}>
                                            <Button type="submit" variant="primary" size="lg" block>SELECT WALLET FILE</Button>
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
                                            This is the URL used to connect to the Safex blockchain.
                                            You can use the default provided by the Safex Foundation
                                            or replace it with your own full node.
                                        </p>
                                        <ul className="mb-4">
                                            <li >The default self hosted wallet setup would be:</li>
                                            <li className="mt-4">HOST: <b>127.0.0.1</b></li>
                                            <li className="mt-1">PORT: <b>17402</b></li>
                                            <li className="mt-2">The default is rpc.safex.org</li>

                                        </ul>
                                        <Form id="set_daemon" onSubmit={this.set_daemon_state}>
                                            <b>Safexd Host</b> <Form.Control className="mb-4" name="daemon_host" defaultValue="testnetrpc.safex.org"
                                                                      placedholder="set the ip address of the safex blockchain"/>
                                            <b>Safexd Port</b> <Form.Control  name="daemon_port" defaultValue="29393"
                                                                      placedholder="set the port of the safex blockchain"/>
                                            <Button className="mt-5" type="submit" variant="primary" size="lg" block>Set Connection</Button>
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
                                                Enter Your Password: <Form.Control name="password" type="password"
                                                              placedholder="enter your password and open your wallet"/>
                                                <Button className="mt-5" type="submit" variant="primary" size="lg" block>OPEN WALLET</Button>
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
