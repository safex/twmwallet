import React from 'react';
import {Button, Col, Container, Row} from 'react-bootstrap'

const os = window.require('os');
const fs = window.require('fs').promises;
const libPath = window.require('path');

const WALLET_FILENAME = 'safexwallet.dat';
const DEFAULT_WALLET_PATH = libPath.resolve(os.homedir(), WALLET_FILENAME);


async function read_legacy_wallet(wallet_path) {
    try {
        return await fs.readFile(wallet_path);
    } catch (err) {
        let error = {};
        error.e = err;
        error.error = "error at loading the wallet file";
        return error;
    }
}

export default class SelectEntry extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            legacy_wallet: '',
            legacy_detected: false
        };

    }

    //TODO: add a safexwallet.dat selector

    async componentDidMount() {

        try {
            let wallet = await read_legacy_wallet(DEFAULT_WALLET_PATH);

            //if there is an error loading the file, perhaps it doesn't exist
            if (wallet.e) {
                console.log("legacy wallet was not found");
            } else {
                this.setState({legacy_wallet: wallet, legacy_detected: true});
            }

        } catch (err) {
            console.error(err);
            console.error("error at reading legacy wallet");
        }

    }

    open_existing = (e) => {
        e.preventDefault();
        this.props.history.push({pathname: '/open_wallet'});
    };

    create_new = (e) => {
        e.preventDefault();
        this.props.history.push({pathname: '/create_wallet'});
    };

    restore_keys = (e) => {
        e.preventDefault();
        this.props.history.push({pathname: '/recover_keys'});
    };

    seed_phrase = (e) => {
        e.preventDefault();
        this.props.history.push({pathname: '/recover_seed'});
    };

    restore_legacy = (e) => {
        e.preventDefault();
        this.props.history.push({pathname: '/legacy_password', state: {legacy_wallet: this.state.wallet}});
    };
    bypass = (e) => {
        e.preventDefault();
        this.props.history.push({pathname: '/wallet_home', state: {legacy_wallet: this.state.wallet}});
    };

    render() {
        return (<div>
            <Container>
                <Row className="justify-content-md-center">
                    <Col>
                        <Button onClick={this.open_existing} variant="primary" size="lg" block>
                            Open Existing
                        </Button>
                    </Col>

                </Row>
                <Row className="justify-content-md-center">
                    <Col>
                        <Button onClick={this.create_new} variant="primary" size="lg" block>
                            Create New
                        </Button>
                    </Col>

                </Row>

                <Row className="justify-content-md-center">
                    <Col><Button onClick={this.restore_keys} variant="primary" size="lg" block>
                        Recover From Keys
                    </Button>
                    </Col>
                </Row>

                <Row className="justify-content-md-center">
                    <Col>
                        <Button onClick={this.seed_phrase} variant="primary" size="lg" block>
                            Recover From Seed Phrase
                        </Button>
                    </Col>
                </Row>

                {this.state.legacy_detected ? (
                    <Row className="justify-content-md-center">
                        <Col>
                            <Button onClick={this.restore_legacy} variant="primary" size="lg" block>
                                Load from a Legacy Wallet
                            </Button>
                        </Col>
                    </Row>) : (<div></div>)
                }
            </Container>
        </div>);
    }
}
