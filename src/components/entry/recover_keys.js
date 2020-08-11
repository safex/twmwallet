import React from 'react';
import {Row, Col, Container, Button, Form} from 'react-bootstrap';
import {recover_from_keys_util} from '../../utils/wallet_creation';
import {FaBackward} from 'react-icons/fa'

import WalletHome from "../wallet/home";

const safex = window.require("safex-nodejs-libwallet");

let {dialog} = window.require("electron").remote;

export default class RecoverKeys extends React.Component {
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
            wallet_made: false,
            public_address: '',
            viewkey: '',
            spendkey: ''
        };
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

    make_wallet_result = async(error, wallet) => {
        if (error) {

        } else {
            this.setState({wallet_made: true, wallet: wallet});
        }
    };

    make_wallet = async (e) => {
        e.preventDefault();
        try {
            let daemon_string = `${this.state.daemon_host}:${this.state.daemon_port}`;
            recover_from_keys_util(
                this.state.new_path,
                this.state.password,
                0,
                this.state.network,
                daemon_string,
                this.state.public_address,
                this.state.viewkey,
                this.state.spendkey, this.make_wallet_result);
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

    set_keys = (e) => {
        e.preventDefault();
        let items = e.target;
        try {
            if (safex.addressValid(items.public_address.value, this.state.network) &&
                items.viewkey.value.length > 63 &&
                items.spendkey.value.length > 63) {
                this.setState({
                    viewkey: items.viewkey.value,
                    spendkey: items.spendkey.value,
                    public_address: items.public_address.value
                })
            } else {
                alert("not a valid safex address");
            }

        } catch (err) {
            console.error(err);
            console.error("error at setting the keys");
        }
    };

    reset_keys = (e) => {
        this.setState({
            public_address: '',
            viewkey: '',
            spendkey: ''
        })
    };

    exit_home = (e) => {
        e.preventDefault();
        this.props.history.push({pathname: '/'});
    };

    render() {
        return (
            <Container  className="height100 d-flex flex-column justify-content-center ">
                {this.state.wallet_made ?
                    (<div>
                        <WalletHome
                            wallet={this.state.wallet}
                            daemon_host={this.state.daemon_host}
                            daemon_port={this.state.daemon_port}
                            password={this.state.password}
                        />
                    </div>) :
                    (<Container  className="font-size-small b-r25 grey-back d-flex flex-column white-text" >
                        <div className="auto_margin_50 d-flex flex-column">
                        <Button className="m-2 align-self-start btn-warning" onClick={this.exit_home}><FaBackward className="mr-2"/>Go Back</Button>
                        
                        <Row className="align-items-center mb-5 justify-content-center">   
                            <h1>Recover From Keys</h1>
                        </Row>
                        
                        <Col sm={8} className="d-flex justify-content-center align-self-center flex-column text-center" >
                            
                            
                            <p>
                                This pathway will allow you to restore a wallet from your <b>Safex Public Address</b> 
                                , <b>Private View</b> and <b>Spend Key</b>.
                            </p>
                            <p >
                                Testnet
                                <input
                                    name="isTestnet"
                                    type="checkbox"
                                    checked={this.state.testnet}
                                    onChange={this.set_to_testnet}
                                    className="ml-2"
                                />
                            </p>
                            
                       

                        {this.state.public_address.length > 0 ?
                            (<div></div>) :
                            (<div className="mt-5 mb-5">
                                <p>
                                    Enter your <b>Public Address</b>, <b>Private Spend Key</b> and <b>Private View Key</b>
                                </p>
                                <Col className="mb-2 mt-2 p-5 border  b-r25">
                                    <Form id="set_keys" onSubmit={this.set_keys}>
                                        Public Address <Form.Control 
                                                            className="mb-3"
                                                            name="public_address"
                                                            defaultValue="Safex5..."
                                                            placedholder="set the ip address of the safex blockchain"/>
                                        Spend Key <Form.Control className="mb-3" name="spendkey" defaultValue="..."
                                                                placedholder="set the port of the safex blockchain"/>
                                        View Key <Form.Control className="mb-5" name="viewkey" defaultValue="..."
                                                                placedholder="set the port of the safex blockchain"/>
                                        <Button type="submit" variant="primary" size="lg" block>Set
                                            Keys</Button>
                                    </Form>
                                </Col>
                            </div>
                            )
                        }

                        {this.state.public_address.length > 0 &&
                        this.state.new_path.length < 1 ?
                            (
                                <Col sm={8}>
                                    <p>
                                        Set the path where to save your new wallet file
                                    </p>
                                    <Form id="set_path" onSubmit={this.set_path}>
                                        <Button type="submit" variant="primary" size="lg" block>Select File
                                            Path</Button>
                                    </Form>
                                </Col>
                            ) :
                            (<div></div>)
                        }

                        {this.state.new_path.length > 0 &&
                        this.state.public_address.length > 0 &&
                        this.state.password.length < 1 ?
                            
                            (<Form id="set_password" onSubmit={this.set_password}>
                                <Form.Control className="mt-5 mb-5" name="password" type="password"
                                                placedholder="Enter your password"/>
                                <Form.Control name="repeat_password" type="password"
                                                placedholder="Repeat your password"/>
                                <Button className="mt-5 mb-5" type="submit" variant="primary" size="lg" block>Set
                                    Password</Button>
                            </Form>
                            ) :            
                            (<div></div>)
                        }

                        {this.state.new_path.length > 0 &&
                        this.state.public_address.length > 0 &&
                        this.state.password.length > 0 &&
                        this.state.daemon_host.length < 1 ?
                            
                            (<Form id="set_daemon" onSubmit={this.set_daemon_state}>
                                <Form.Control className="mt-5 mb-5" name="daemon_host" defaultValue="127.0.0.1"
                                                placedholder="set the ip address of the safex blockchain"/>
                                <Form.Control name="daemon_port" defaultValue="17402"
                                                placedholder="set the port of the safex blockchain"/>
                                <Button className="mt-5 mb-5" type="submit" variant="primary" size="lg" block>
                                    Set Connection
                                </Button>
                            </Form>
                            ) :
                            (<div></div>)
                        }

                        {this.state.new_path.length > 0 &&
                        this.state.daemon_host.length > 0 &&
                        this.state.password.length > 0 &&
                        this.state.public_address.length > 0 ?
                            (
                                <Col className="d-flex justify-content-center align-self-center flex-column text-center">
                                    
                                            <Col>
                                                <ul>
                                                    <li>Public Address: {this.state.public_address}</li>
                                                    <li>View Key: Hidden for security</li>
                                                    <li>Spend Key: Hidden for security</li>
                                                </ul>

                                                <Button className="btn-danger" onClick={this.reset_keys}>Change Keys</Button>
                                            </Col>
                                            <Col>
                                                <p>This file will be saved to: {this.state.new_path}</p>
                                                
                                                <Button onClick={this.change_path}>Change Path</Button>
                                            </Col>
                                            <Col>
                                                <p>
                                                    Your chosen password is: {[...Array(this.state.password.length)].map(() =>
                                                    <span>♦</span>)}
                                                    <br/>
                                                    <Button className="mt-2 mr-2"
                                                        onClick={this.show_password}>Show Password</Button>
                                                    <Button className="mt-2"
                                                        onClick={this.change_password}>Change Password</Button>
                                                </p>
                                            </Col>
                                            <div>
                                                <p>
                                                    You will be connected
                                                    to <b>{this.state.daemon_host}:{this.state.daemon_port}</b> for
                                                    blockchain synchronization.
                                                    <br/>
                                                </p>
                                                    <Button
                                                        className="mb-2 mt-2"
                                                        onClick={this.change_daemon}>Change Safex Network Connection
                                                    </Button>
                                                
                                            </div>

                                            <div className="mt-5 mb-5">
                                                <Button onClick={this.make_wallet} variant="primary" size="lg">
                                                    Restore Wallet
                                                </Button>
                                            </div>
                                </Col>
                            ) :
                            (<div></div>)
                        }
                        </Col>
                    </div>
                    </Container>)
                }
            </Container>
        );
    }
}