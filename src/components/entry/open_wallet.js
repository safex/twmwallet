import React from 'react';
import {Row, Col, Container, Button, Form} from 'react-bootstrap';
import {open_wallet} from '../../utils/wallet_creation';

import WalletHome from '../wallet/home';
import {open_twm_file, save_twm_file} from "../../utils/twm_actions";

const crypto = window.require('crypto');

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
            network: 'stagenet',
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

        let the_password = e.target.password.value;

        if (this.state.new_path[0].includes('.keys')) {
            this.setState({new_path: this.state.new_path[0].substring(0, this.state.new_path[0].length - 5)});
        } else if (this.state.new_path[0].includes('.safex_account_keys')) {
            this.setState({new_path: this.state.new_path[0].substring(0, this.state.new_path[0].length - 19)});
        } else if (this.state.new_path[0].includes('.address.txt')) {
            this.setState({new_path: this.state.new_path[0].substring(0, this.state.new_path[0].length - 12)});
        } else if (this.state.new_path[0].includes('.twm')) {
            this.setState({new_path: this.state.new_path[0].substring(0, this.state.new_path[0].length - 4)});
        }

        //now check if you can load the .twm file if not you have to make it
        try {
            let daemon_string = `${this.state.daemon_host}:${this.state.daemon_port}`;
            let wallet = await open_wallet(this.state.new_path,
                e.target.password.value,
                0,
                this.state.network,
                daemon_string);
            console.log(wallet);
            localStorage.setItem('wallet', JSON.stringify(wallet));

            try {

                console.log(`the path ${this.state.new_path[0]}`);
                let twm_file = await open_twm_file(this.state.new_path[0] + '.twm', this.state.password);
                if (twm_file.success) {
                    //parse the json and pack it into the local storage for usages
                    console.log(`success`);
                    console.log(twm_file);
                    localStorage.setItem('twm_file', JSON.stringify(twm_file.contents));
                } else {
                    console.log(`error`);
                    console.log(twm_file);
                    throw `error`;
                }

            } catch (err) {
                console.error(err);
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
                    console.log(`password ${this.state.password}`)
                    console.log(JSON.stringify(twm_obj));

                    let twm_save = await save_twm_file(this.state.new_path[0] + '.twm', crypted, this.state.password, hash1.digest('hex'));

                    try {

                        let twm_file = await open_twm_file(this.state.new_path[0] + '.twm', this.state.password);
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
            }

            this.setState({wallet_made: true, wallet: wallet, password: the_password});
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
                            wallet={this.state.wallet}
                            daemon_host={this.state.daemon_host}
                            daemon_port={this.state.daemon_port}
                            password={this.state.password}
                        />
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
                                                                                                       onClick={this.change_path}>Change
                                            File</Button>
                                        </p>
                                    </div>) :
                                    (<div>

                                        <Form id="set_path" onSubmit={this.set_path}>
                                            <Button type="submit" variant="primary" size="lg" block>SELECT WALLET
                                                FILE</Button>
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
                                            <li>The default self hosted wallet setup would be:</li>
                                            <li className="mt-4">HOST: <b>127.0.0.1</b></li>
                                            <li className="mt-1">PORT: <b>17402</b></li>
                                            <li className="mt-2">The default is rpc.safex.org</li>

                                        </ul>
                                        <Form id="set_daemon" onSubmit={this.set_daemon_state}>
                                            <b>Safexd Host</b> <Form.Control className="mb-4" name="daemon_host"
                                                                             defaultValue="stagenetrpc.safex.org"
                                                                             placedholder="set the ip address of the safex blockchain"/>
                                            <b>Safexd Port</b> <Form.Control name="daemon_port" defaultValue="30393"
                                                                             placedholder="set the port of the safex blockchain"/>
                                            <Button className="mt-5" type="submit" variant="primary" size="lg" block>Set
                                                Connection</Button>
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
                                                <Button className="mt-5" type="submit" variant="primary" size="lg"
                                                        block>OPEN WALLET</Button>
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
