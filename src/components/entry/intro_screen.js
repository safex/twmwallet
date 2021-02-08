import React from 'react';
import {Container, Row, Image} from 'react-bootstrap'

const {app} = window.require("electron").remote;
const os = window.require('os');
const fs = window.require('fs').promises;
const libPath = window.require('path');
const crypto = window.require('crypto');

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

export default class IntroScreen extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            legacy_wallet: '',
            legacy_detected: false
        };
    }

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
    }//


    open_select = (e) => {
        e.preventDefault();
        this.props.history.push({pathname: '/select_entry'});
    };

    render() {
        return (
            <div className="width100 height100 d-flex flex-column text-center intro-background-image">
                <Container fluid className="height100 flex-column d-flex justify-content-center">
                    <Image onClick={() => app.quit()} className="entry-off-button pointer" src={require("./../../img/off_black.svg")}/>

                    <Row className="row justify-content-md justify-content-center p-3 intro-safex-logo">
                        <Image className="w-50 intro-safex-logo " src={require("./../../img/safex-home-multi.svg")}/>
                    </Row>

                    <button onClick={this.open_select} className="custom-button-entry my-5 intro-safex-logo">
                        Get Started
                    </button>
                </Container>  
            </div>
        );
    }
}
