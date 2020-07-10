import React from 'react';
import crypto from 'crypto';
import {Row, Col, Container, Button, Form} from 'react-bootstrap';

//This component loads the legacy safexwallet.dat file
export default class LegacyPassword extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    async componentDidMount() {
        try {
            localStorage.setItem('encrypted_wallet', this.props.location.state.legacy_wallet.toString());
            this.setState({legacy_wallet: this.props.location.state.legacy_wallet});
            console.log(`setting encrypted_wallet localStorage path with the encrypted wallet also setting state`);

        } catch (e) {
            console.log("no attribute of wallet found");
            this.props.history.push({pathname: '/'})
        }
    }

    returnSelect = () => {
        this.props.history.push({pathname: '/', state: {exit_legacy: true}})
    };

    submitLogin = (e) => {
        e.preventDefault();
        let password = e.target.password.value;
        const algorithm = 'aes-256-ctr';

        const decipher = crypto.createDecipher(algorithm, password);
        let dec = decipher.update(localStorage.getItem('encrypted_wallet'), 'hex', 'utf8');
        dec += decipher.final('utf8');


        let parsedWallet;
        try {
            parsedWallet = JSON.parse(dec);
        }
        catch (e) {
            alert(`Invalid password or corrupted wallet data`);
            console.log(`Invalid password or corrupted wallet data`);
        }

        if (!parsedWallet || parsedWallet['version'] !== '1') {
            // We got correct decrypt, but wallet is in some unsupported format
            alert(`Invalid wallet format (expected v1)`);
            console.log(`Invalid wallet format (expected v1)`);
        } else {
            this.props.history.push({pathname: '/legacy_keys', state: {parsed_wallet: parsedWallet}})
        }
    };

    exit_home = (e) => {
        e.preventDefault();
        this.props.history.push({pathname: '/'});
    };

    render() {
        return (
           
                <Container className="d-flex">
                    <div className="entry-form">
                    
                        

                            <div className="align-self-start">
                                <Button variant="danger" onClick={this.exit_home}>Home</Button>
                            </div>

                            <p>
                                It appears that you have a wallet from the legacy wallets from where you migrated from
                                Safe Exchange Coin and Bitcoin to the Safex Token and the Safex Blockchain.
                            </p>
                            <p>
                                In the following process any Safex keys you have from the legacy wallet will be displayed
                                in a list from which you can choose one (1) at a time create a new wallet file.
                            </p>
                            <p>
                                This new wallet file will enable you to interact with Safex Cash and Tokens that you may
                                have obtained through the migration.
                            </p>
                            <p>
                                You can also exit this process and use the wallet along the other paths
                                by clicking here:
                            </p>
                            <div><button type="button" class="btn btn-warning">Exit</button></div>
                            <p>
                                Otherwise enter the password to your legacy wallet, the wallet you used before
                                to access your list of Safex keys and start using the Safex Blockchain.
                            </p>
                        
                    
                    
                        <div>
                            <form onSubmit={this.submitLogin}>
                                <Form.Control name="password" type="password" placedholder="Password"/>
                                <Button type="submit" variant="primary" size="lg" block>Login</Button>
                            </form>
                        </div>
                    </div>                
                </Container>
            
        );
    }
}
