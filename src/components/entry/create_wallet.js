/*
safex.createWallet({
    'path': path.join(__dirname, 'test-wallet'),
    'password': '123',
    'network': 'mainnet',
    'daemonAddress': 'localhost:17402',
}).then((wallet) => console.log('New wallet succesfully created: ' + wallet.address()))
    .catch((e) => console.log('Failed to create new wallet: ' + e));*/
import React from 'react';
import {Row, Col, Container, Button, Form} from 'react-bootstrap';
import path from 'path';

const safex = window.require("safex-nodejs-libwallet");

let {dialog} = window.require("electron").remote;

export default class CreateWallet extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            daemon_host: 'rpc.safex.io',
            daemon_port: 17402,
            new_path: 'test-wallet',
            password: '123',
            safex_key: null,
            wallet: {},
            success: false
        };
    }

    async componentDidMount() {
        try {

            console.log(`set the state of the safex_key`);
            safex.createWallet({
                'path': path.join(__dirname, 'test-wallet'),
                'password': '123',
                'network': 'mainnet',
                'daemonAddress': 'rpc.safex.io:17402',
            }).then((wallet) => console.log('New wallet succesfully created: ' + wallet.address()))
                .catch((e) => console.log('Failed to create new wallet: ' + e));

        } catch (e) {
            console.log("no attribute of wallet found");
            this.props.history.push({pathname: '/'})
        }
    }

    set_path = (e) => {
        e.preventDefault();

        let sails_path = dialog.showSaveDialogSync();
        let new_path = sails_path;

        //check write permissions here,

        //alert if not permitted

        this.setState({new_path: new_path})
    };

    change_path = (e) => {
        e.preventDefault();
        this.setState({new_path: ''})
    };
    set_daemon_state = async (e) => {
        e.preventDefault();
        this.setState({daemon_host: e.target.daemon_host.value, daemon_port: parseInt(e.target.daemon_port.value)})
    };

    set_password = (e) => {
        e.preventDefault();
        if (e.target.password.value === e.target.repeat_password.value) {
            this.setState({password: e.target.password.value, repeat_password: e.target.repeat_password.value});
        } else {
            alert("passwords dont match");
        }
    };

    make_wallet = (e) => {
        e.preventDefault();
        try {
            safex.createWallet({
                'path': path.join(__dirname, 'test-wallet'),
                'password': '123',
                'network': 'mainnet',
                'daemonAddress': 'rpc.safex.io:17402',
            }).then((wallet) => console.log('New wallet succesfully created: ' + wallet.address()))
                .catch((e) => console.log('Failed to create new wallet: ' + e));

            // console.log(wallet);
            /*
                        try {
                            this.props.history.push({
                                pathname: '/wallet_home',
                                state: {
                                    wallet: wallet,
                                    safex_key: this.state.safex_key
                                }
                            });
                        } catch (e) {
                            console.error(e);
                            console.error("error on the packing the btc keys");
                        }
            */
            console.log("reached the end");

        } catch (e) {
            console.error(e);
            console.error("error on initial recovery");
        }
    };

    render() {
        return (
            <div>
                <Container>
                    <Row className="justify-content-md-center">
                        <Col>
                            <p>
                                Here you will establish your new wallet file.
                                When this procedure is finished you will still have the safexwallet.dat
                                in your home directory, as well as a marker that the safexwallet.dat was merged
                                into the new wallet file.
                            </p>
                        </Col>
                    </Row>
                    <Row className="justify-content-md-center">
                        <Col>

                            {this.state.new_path.length > 0 ? (

                                    <div>
                                        <p>
                                            this file will be saved to {this.state.new_path} <Button
                                            onClick={this.change_path}>change path?</Button>
                                        </p>
                                    </div>
                                ) :
                                (
                                    <div>
                                        <p>
                                            Set the path where to save your new wallet file
                                        </p>
                                        <Form id="set_path" onSubmit={this.set_path}>
                                            <Button type="submit" variant="primary" size="lg" block>Select File
                                                Path</Button>
                                        </Form>
                                    </div>
                                )
                            }

                        </Col>
                    </Row>


                    {this.state.new_path.length > 0 && this.state.daemon_host.length < 1 ? (
                        <Row>
                            <Col>
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
                        </Row>
                    ) : (
                        <div>
                        </div>
                    )

                    }

                    {this.state.new_path.length > 0 &&
                    this.state.daemon_host.length > 0 &&
                    this.state.password.length < 1 ?
                        (<div>
                            <Col>
                                <div>
                                    <Form id="set_password" onSubmit={this.set_password}>
                                        <Form.Control name="password" type="password"
                                                      placedholder="set the ip address of the safex blockchain"/>
                                        <Form.Control name="repeat_password" type="password"
                                                      placedholder="set the port of the safex blockchain"/>
                                        <Button type="submit" variant="primary" size="lg" block>set password</Button>
                                    </Form>
                                </div>
                            </Col>

                        </div>) :
                        (
                            <div>

                            </div>
                        )
                    }

                    {
                        this.state.new_path.length > 0 &&
                        this.state.daemon_host.length > 0 &&
                        this.state.password.length > 0 ?
                            (
                                <div>
                                    <Row className="justify-content-md-center">
                                        <Col>
                                            <Button onClick={this.make_wallet} variant="primary" size="lg" block>Make
                                                the New Wallet</Button>
                                        </Col>
                                    </Row>
                                </div>
                            ) :
                            (
                                <div>

                                </div>
                            )


                    }


                </Container>
            </div>
        );
    }
}
