import React from 'react';
import {Row, Col, Container, Button, Form} from 'react-bootstrap';
import path from 'path';
import {create_wallet} from '../../utils/wallet_creation';


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
            wallet: {},
            success: false,
            network: 'mainnet'
        };
    }

    async componentDidMount() {

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

    make_wallet = async(e) => {
        e.preventDefault();
        try {
            let daemon_string = `${this.state.daemon_host}:${this.state.daemon_port}`;
            let wallet = await create_wallet(this.state.new_path, this.state.password, this.state.network, daemon_string);
            console.log(wallet);
            this.props.history.push({
                pathname: '/wallet_home'
            })
        } catch (err) {
            console.error(err);
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
