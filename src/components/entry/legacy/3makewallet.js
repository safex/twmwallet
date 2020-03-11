import React from 'react';
import {Row, Col, Container, Button} from 'react-bootstrap';
import Form from "react-bootstrap/esm/Form";

import {recover_from_keys} from "../../../utils/wallet_creation";

const safex = window.require("safex-nodejs-libwallet");

let {dialog} = window.require("electron").remote;

export default class ConvertLegacy extends React.Component {
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
        try {
            console.log(this.props.location.state.safex_key);

            this.setState({
                safex_key: this.props.location.state.safex_key
            });
            console.log(`set the state of the safex_key`);

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

    make_wallet = async (e) => {
        e.preventDefault();
        try {
            let r_obj = {};
            r_obj.address = this.state.safex_key.public_addr;
            r_obj.spendkey = this.state.safex_key.spend.sec;
            r_obj.viewkey = this.state.safex_key.view.sec;
            r_obj.path = this.state.new_path;
            r_obj.password = this.state.password;
            r_obj.daemon_host = this.state.daemon_host;
            r_obj.daemon_port = this.state.daemon_port;
            r_obj.network = this.state.network;
            console.log(r_obj);



            try {
                let wallet = await recover_from_keys(
                    r_obj.path,
                    r_obj.password,
                    r_obj.network,
                    r_obj.daemon_port,
                    0,
                    r_obj.address,
                    r_obj.viewkey,
                    r_obj.spendkey);

                console.log(wallet);
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
                                        <form id="set_path" onSubmit={this.set_path}>
                                            <Button type="submit" variant="primary" size="lg" block>Select File
                                                Path</Button>
                                        </form>
                                    </div>
                                )
                            }

                        </Col>
                    </Row>


                    {this.state.new_path.length > 0 && this.state.daemon_host.length < 1 ? (
                        <Row>
                            <Col>
                                <div>
                                    <form id="set_daemon" onSubmit={this.set_daemon_state}>
                                        <Form.Control name="daemon_host" defaultValue="127.0.0.1"
                                                      placedholder="set the ip address of the safex blockchain"/>
                                        <Form.Control name="daemon_port" defaultValue="17402"
                                                      placedholder="set the port of the safex blockchain"/>
                                        <Button type="submit" variant="primary" size="lg" block>set
                                            connection</Button>
                                    </form>
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
                                    <form id="set_password" onSubmit={this.set_password}>
                                        <Form.Control name="password" type="password"
                                                      placedholder="set the ip address of the safex blockchain"/>
                                        <Form.Control name="repeat_password" type="password"
                                                      placedholder="set the port of the safex blockchain"/>
                                        <Button type="submit" variant="primary" size="lg" block>set password</Button>
                                    </form>
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
