import React from 'react';
import {Row, Col, OverlayTrigger, Container, Button, Form} from 'react-bootstrap';
import path from 'path';
import {open_wallet} from '../../utils/wallet_creation';
import {FaBackward} from 'react-icons/fa';
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
            <Container fluid className="mb-5 d-flex flex-column justify-content-center safex_blue">
                {this.state.wallet_made ?
                    (<Container fluid className="height100 justify-content-between">
                        <WalletHome
                            wallet={this.state.wallet}/>
                    </Container>) :
                    (<Container fluid className="font-size-small b-r25 grey-back d-flex flex-column safex_blue white-text" >
                    <Button className="m-2 align-self-start btn-warning" onClick={this.exit_home}><FaBackward className="mr-2"/>Go Back</Button>
                    
                    <Row className="align-items-center mb-5 justify-content-center">   
                        <h1>Open Wallet</h1>
                    </Row>
                    
                        <Col sm={8} className="d-flex justify-content-center align-self-center flex-column text-center" >
                            <p>
                                Open an existing Safex wallet by selecting the .keys file and
                                entering your password.
                            </p>
                            
                            <div className="mt-4">
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
                            </div>
                        
                            {this.state.new_path.length > 0 ?
                                (<Col className="mb-2 mt-2 border border-warning b-r25">
                                    <p className="mt-2">
                                        Selected Wallet File: <b>{this.state.new_path}</b> 
                                    </p>
                                    <Button className="mt-2 mb-2" onClick={this.change_path}>
                                        Change File
                                    </Button>
                                    
                                </Col>) :
                                (<div>
                                    
                                    <Form id="set_path" onSubmit={this.set_path}>
                                        <Button className="mt-5 mb-5" type="submit" variant="primary" size="lg" block>Select Wallet File</Button>
                                    </Form>
                                </div>)
                            }

                        </Col>
                        
                        {this.state.new_path.length > 0 &&
                        this.state.daemon_host.length < 1 ?
                            (
                                <Col sm={8} className="d-flex justify-content-center align-self-center flex-column ">
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
                                            <Button className="mt-5 mb-5" type="submit" variant="primary" size="lg" block>Set Connection</Button>
                                        </Form>
                                    </div>
                                </Col>
                            ) :
                            (<div>
                            </div>)

                        }

                        {this.state.new_path.length > 0 &&
                        this.state.daemon_host.length > 0 &&
                        this.state.password.length < 1 ?
                            
                            (<Col className="mt-2">
                                <Form id="set_password" className="auto_margin_50" onSubmit={this.open_wallet}>
                                    Enter Your Password: <Form.Control name="password" type="password"
                                                    placedholder="enter your password and open your wallet"/>
                                    <Button className="mt-2 mb-5" type="submit" variant="primary" size="lg" block>Open Wallet</Button>
                                </Form>
                            </Col>) :
                            (<div>
                            </div>)
                        }

                        {this.state.new_path.length > 0 &&
                        this.state.daemon_host.length > 0 &&
                        this.state.password.length > 0 ?
                            (<div>
                                <Row className="justify-content-md-center">
                                    <Col sm={6}>
                                        <p>Opening your wallet...</p>
                                    </Col>
                                </Row>
                            </div>) :
                            (<div>
                            </div>)
                        }
                    </Container>)}
            </Container>);
    }
}
