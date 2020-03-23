import React from 'react';

import Navigation from './Navigation';

import {Row, Col, Container, Button, Table, Form} from 'react-bootstrap';

import {normalize_8decimals} from '../../utils/wallet_creation';

import {send_cash, send_tokens, commit_txn} from "../../utils/wallet_actions";

var wallet;

var lastHeight = 0;

export default class WalletHome extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            address: '',
            wallet_path: '',
            safex_key: null,
            cash: 0,
            tokens: 0,
            refresh_timer: 0,
            refresh_interval: '',
            syncing: false,
            synced: false,
            wallet_height: 0,
            blockchain_height: 0,
            username: '',
            connection_status: 'Connecting to the Safex Blockchain Network...',
            timer: '',
        };
    }

    async componentDidMount() {
        try {
            console.log(this.props.wallet);
            wallet = this.props.wallet;
            //var r = wallet.createSafexAccount("test", "Test account");
            this.setState({
                wallet_height: wallet.blockchainHeight(),
                blockchain_height: wallet.daemonBlockchainHeight()
            });

            if (wallet.connected() !== 'disconnected') {
                this.setState({connection_status: 'Connected to the Safex Blockchain Network'});

            } else {
                this.setState({connection_status: 'Unable to connect to the Safex Blockchain Network'});
            }
            if (wallet.synchronized()) {
                this.setState({synced: true});
            } else {
                const timer = setInterval(() => {
                    if (wallet.synchronized()) {
                        clearInterval(this.state.timer);
                    } else {
                        this.check();
                    }
                }, 1000);
                this.setState({timer: timer});
                this.setState({synced: false});
            }
            wallet.on('newBlock', function (height) {
                console.log("blockchain updated, height: " + height);
                this.setState({
                    blockchain_height: height
                });
            });
            wallet.on('refreshed', () => {
                console.log();
                this.refresh_action();
            });
            console.log(wallet.synchronized());

            this.setState({loading: false, address: wallet.address(), wallet: wallet});
        } catch (err) {
            console.error(err);
            console.log("errors on startup");
        }
    };

    refresh_action = () => {
        let m_wallet = wallet;
        console.log("refreshing rn");
        try {
            m_wallet.store().then(() => {
                console.log("wallet stored refresh");
                this.setState({
                    address: m_wallet.address(),
                    pending_cash: normalize_8decimals(
                        Math.abs(m_wallet.balance() - m_wallet.unlockedBalance())
                    ),
                    wallet_height: wallet.blockchainHeight(),
                    blockchain_height: wallet.daemonBlockchainHeight(),
                    cash: normalize_8decimals(m_wallet.unlockedBalance()),
                    pending_tokens: normalize_8decimals(m_wallet.tokenBalance() - m_wallet.unlockedTokenBalance()),
                    tokens: normalize_8decimals(m_wallet.unlockedTokenBalance())
                });
            })
                .catch((err) => {
                    console.log("unable to store wallet refresh: " + err);
                    console.error(err);
                });

        } catch (err) {
            console.error(err);
            console.error("error getting height");
        }
    };

    check = () => {
        console.log(`wallet cash balance ${wallet.balance()}`);
        console.log(`wallet daemon blockchain height ${wallet.daemonBlockchainHeight()}`);
        console.log(`wallet synchronized status: ${wallet.synchronized()}`);
        console.log(`wallet height: ${wallet.blockchainHeight()}`);
        console.log(wallet.address());
        console.log(wallet.secretSpendKey());
        console.log(wallet.secretViewKey());
        if (wallet.connected() !== 'disconnected') {
            console.log(wallet.connected());
            console.log("wallet connected");
            //m_wallet.on('refreshed', this.refresh_action());
            this.props.wallet.on('newBlock', (height) => {
                console.log(height)
            })
            this.setState({connection_status: 'Connected to the Safex Blockchain Network'});
        } else {
            this.setState({connection_status: 'Unable to connect to the Safex Blockchain Network'});
        }
        if (wallet.synchronized()) {
            console.log("wallet synchronized");
            this.setState({
                synced: true,
                cash: normalize_8decimals(wallet.unlockedBalance()),
                blockchain_height: wallet.daemonBlockchainHeight(),
                wallet_height: wallet.blockchainHeight()
            });
        } else {
            this.setState({
                synced: false,
                blockchain_height: wallet.daemonBlockchainHeight(),
                wallet_height: wallet.blockchainHeight()
            });
        }
    };

    send_tokens = (e) => {
        e.preventDefault();
    };

    refresh = (e) => {
        e.preventDefault();
        wallet.startRefresh();
        console.log("ended wallet sync");
    };

    rescan = (e) => {
        let confirmed = window.confirm("are you sure you want to continue, " +
            "this will halt the wallet operation while the rescan is in progress");
        console.log(confirmed);
        if (confirmed) {
            wallet.off();
            wallet.rescanBlockchain();
            wallet.store().then(() => {
                console.log("wallet stored")
            }).catch((err) => {
                console.log("unable to store wallet: " + err)
            });

            wallet.on('refreshed', () => {
                console.log();
                this.refresh_action();
            });
        }
    };

    token_send = async (e) => {
        e.preventDefault();
        e.persist();
        try {
            let mixins = e.target.mixins.value - 1;
            if (mixins >= 0) {
                let confirmed = window.confirm(`are you sure you want to send ${e.target.amount.value} SFT Safex Tokens, ` +
                    `to ${e.target.destination.value}`);
                console.log(confirmed);
                if (confirmed) {
                    let token_txn = await send_tokens(wallet, e.target.destination.value, e.target.amount.value, mixins);
                    let confirmed_fee = window.confirm(`the fee to send this transaction will be:  ${token_txn.fee() / 10000000000} SFX Safex Cash`);
                    let fee = token_txn.fee();
                    let txid = token_txn.transactionsIds();
                    let amount = e.target.amount.value;
                    if (confirmed_fee) {
                        let commited_txn = await commit_txn(token_txn);
                        console.log(token_txn);
                        alert(`transaction successfully submitted 
                        transaction id: ${txid}
                        amount: ${amount}
                        fee: ${fee / 10000000000}`);
                    }
                }
            }

        } catch (err) {
            console.error(err);
            if (err.toString().startsWith('not enough outputs')) {
                alert(`choose fewer mixins`);
            }
            console.error(`error at the token transaction`);
        }
    };

    cash_send = async (e) => {
        e.preventDefault();
        e.persist();
        try {
            let mixins = e.target.mixins.value - 1;
            if (mixins >= 0) {
                let confirmed = window.confirm(`are you sure you want to send ${e.target.amount.value} SFX Safex Cash, ` +
                    `to ${e.target.destination.value}`);
                console.log(confirmed);
                if (confirmed) {
                    let cash_txn = await send_cash(wallet, e.target.destination.value, e.target.amount.value, mixins);
                    let confirmed_fee = window.confirm(`the fee to send this transaction will be:  ${cash_txn.fee() / 10000000000} SFX Safex Cash`);
                    let fee = cash_txn.fee();
                    let txid = cash_txn.transactionsIds();
                    let amount = e.target.amount.value;
                    if (confirmed_fee) {
                        let committed_txn = await commit_txn(cash_txn);
                        console.log(committed_txn);
                        console.log(cash_txn);
                        alert(`transaction successfully submitted 
                        transaction id: ${txid}
                        amount: ${amount}
                        fee: ${fee / 10000000000}`);
                    }
                }
            }
        } catch (err) {
            console.error(err);
            if (err.toString().startsWith('not enough outputs')) {
                alert(`choose fewer mixins`);
            }
            console.error(`error at the cash transaction`);
        }
    };

    render() {
        return (
            <div style={{position: 'relative'}}>
                <Container>
                    <Row>
                        <Navigation wallet={this.state.wallet} hello={"hello"}/>
                    </Row>

                    <Row>
                        <Col sm={8}>
                            <ul>
                                <li>
                                    Public Address: Receive SFT and SFX here (share this to get paid)
                                </li>
                                <li>
                                    {this.state.address}
                                </li>
                            </ul>
                        </Col>
                        <Col>
                            <ul>
                                <li>Blockchain Height: {this.state.blockchain_height}</li>
                                {this.state.wallet_height < this.state.blockchain_height ?
                                    (<li>
                                        {this.state.wallet_height} / {this.state.blockchain_height}
                                    </li>) : ''}
                                <li>{this.state.connection_status}</li>
                                <li>
                                    <button onClick={this.rescan}>hard rescan</button>
                                </li>
                                {this.state.synced === false ?
                                    (<li>
                                        <button onClick={this.check}>check</button>
                                    </li>) :
                                    ''}
                            </ul>
                        </Col>

                    </Row>

                    <Row>
                        <Col md={4}>
                            <Row className="wallet">
                                <Col>
                                    <div>

                                        <ul>
                                            <li>{this.state.cash} SFX</li>
                                            {this.state.pending_cash > 0 ?
                                                (<li>{this.state.pending_cash} Pending</li>) : ''}
                                            {this.state.pending_cash > 0 ?
                                                (<li>{this.state.cash + this.state.pending_cash} NET</li>) : ''}
                                        </ul>
                                        <p>
                                            Safex Cash
                                        </p>
                                    </div>
                                </Col>
                                <Col>
                                    <ul>
                                        <li>

                                            <Button onClick={this.show_cash_send}>Send Cash</Button>
                                        </li>
                                        <li>
                                            <Form id="send_cash" onSubmit={this.cash_send}>
                                                destination address <Form.Control name="destination"
                                                                                  defaultValue="Safex5..."
                                                                                  placedholder="the destination address"/>
                                                amount (cash)<Form.Control name="amount" defaultValue="0"
                                                                           placedholder="the amount to send"/>
                                                mixin ring size <Form.Control name="mixins" defaultValue="7"
                                                                              placedholder="choose the number of mixins"/>
                                                <Button type="submit" variant="primary" size="lg" block>send the
                                                    cash</Button>
                                            </Form>
                                        </li>
                                    </ul>
                                </Col>
                            </Row>

                            <Row className="wallet">
                                <Col>
                                    <div>
                                        <ul>
                                            <li>{this.state.tokens} SFT</li>
                                            {this.state.pending_tokens > 0 ?
                                                (<li>{this.state.pending_tokens} Pending</li>) : ''}
                                            {this.state.pending_tokens > 0 ?
                                                (<li>{this.state.tokens + this.state.pending_tokens} NET</li>) : ''}
                                        </ul>
                                        <p>
                                            Safex Token
                                        </p>
                                    </div>
                                </Col>
                                <Col>
                                    <ul>
                                        <li>

                                            <Button onClick={this.show_token_send}>Send Tokens</Button>
                                        </li>
                                        <li>
                                            <Form id="send_token" onSubmit={this.token_send}>
                                                destination address <Form.Control name="destination"
                                                                                  defaultValue="Safex5..."
                                                                                  placedholder="the destination address"/>
                                                amount (tokens)<Form.Control name="amount" defaultValue="0"
                                                                             placedholder="the amount to send"/>
                                                mixin ring size <Form.Control name="mixins" defaultValue="7"
                                                                              placedholder="choose the number of mixins"/>
                                                <Button type="submit" variant="primary" size="lg" block>send the
                                                    tokens</Button>
                                            </Form>
                                        </li>
                                    </ul>
                                </Col>
                            </Row>
                        </Col>

                        <Col className="wallet" md={8}>

                            Marketplace
                            {this.state.username.length < 1 ?
                                (<h3>
                                    Username
                                </h3>) :
                                (<h3>{this.state.username}</h3>)
                            }
                        </Col>
                    </Row>
                </Container>
            </div>
        );
    }
}
