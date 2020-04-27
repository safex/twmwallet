import React from 'react';

import Navigation from './Navigation';

import {Row, Col, Container, Button, Table, Form, Image, Modal} from 'react-bootstrap';

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
            usernames: [],
            connection_status: 'Connecting to the Safex Blockchain Network...',
            timer: '',
            first_refresh: false,
            show: false,
            marketplace_view: false,
            twm_offers: [],
            non_offers: []
        };
    }

    async componentDidMount() {
        try {
            console.log(this.props.wallet);
            wallet = this.props.wallet;

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


            var accs = wallet.getSafexAccounts();


            console.log(accs);
            console.log(`accounts`);
            this.setState({usernames: accs});
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

                var accs = wallet.getSafexAccounts();

                this.setState({
                    address: m_wallet.address(),
                    pending_cash: normalize_8decimals(
                        Math.abs(m_wallet.balance() - m_wallet.unlockedBalance())
                    ),
                    synced: m_wallet.synchronized() ? true : false,
                    wallet_height: wallet.blockchainHeight(),
                    blockchain_height: wallet.daemonBlockchainHeight(),
                    cash: normalize_8decimals(m_wallet.unlockedBalance()),
                    pending_tokens: normalize_8decimals(m_wallet.tokenBalance() - m_wallet.unlockedTokenBalance()),
                    tokens: normalize_8decimals(m_wallet.unlockedTokenBalance()),
                    first_refresh: true,
                    usernames: accs
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

    handleClose = () => {
        this.setState({show: false})
    };

    handleShow = () => {
        this.setState({show: true});
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
                        try {

                            let committed_txn = await commit_txn(token_txn);
                            console.log(committed_txn);
                            console.log(token_txn);
                            alert(`transaction successfully submitted 
                        transaction id: ${txid}
                        amount: ${amount} SFT
                        fee: ${fee / 10000000000} SFX`);
                        } catch (err) {
                            console.error(err);
                            console.error(`error when trying to commit the transaction to the blockchain`);
                            alert(`error when trying to commit the transaction to the blockchain`);
                        }
                    } else {
                        console.log("transaction cancelled");
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

    show_marketplace = () => {
        var offrs = wallet.listSafexOffers(true);
        let non_offers = [];
        let twm_offers = [];

        for (var i in offrs) {/*
            console.log("Safex offer " + i + " title: " + offrs[i].title);
            console.log("Safex offer description: " + offrs[i].description);
            console.log("Safex offer quantity: " + offrs[i].quantity);
            console.log("Safex offer price: " + offrs[i].price);
            console.log("Safex offer minSfxPrice: " + offrs[i].minSfxPrice);
            console.log("Safex offer pricePegUsed: " + offrs[i].pricePegUsed);
            console.log("Safex offer pricePegID: " + offrs[i].pricePegID);
            console.log("Safex offer seller: " + offrs[i].seller);
            console.log("Safex offer active: " + offrs[i].active);
            console.log("Safex offer offerID: " + offrs[i].offerID);
            console.log("Safex offer currency: " + offrs[i].currency);
*/
            try {
                let offer_description = JSON.parse(offrs[i].description);
                if (offer_description.version > 0) {
                    offrs[i].descprition = offer_description;
                    twm_offers.push(offrs[i]);

                } else {
                    non_offers.push(offrs[i]);
                    console.log("not a twm structured offer");
                }

            } catch (err) {
                console.error(`error at parsing json from description`);
                console.error(err);
                non_offers.push(offrs[i]);
            }
        }


        this.setState({twm_offers: twm_offers, non_offers: non_offers, marketplace_view: !this.state.marketplace_view});
    };

    register_account = async (e) => {
        e.preventDefault();
        if (this.state.tokens >= 5000 && this.state.first_refresh === true) {
            try {
                let vees = e.target;

                console.log(vees);

                let d_obj = {};
                if (vees.avatar.value.length > 0) {
                    d_obj.avatar = vees.avatar.value;
                }
                if (vees.twitter.value.length > 0) {
                    d_obj.twitter = vees.twitter.value;
                }
                if (vees.facebook.value.length > 0) {
                    d_obj.facebook = vees.facebook.value;
                }
                if (vees.biography.value.length > 0) {
                    d_obj.biography = vees.biography.value;
                }
                if (vees.website.value.length > 0) {
                    d_obj.website = vees.website.value;
                }
                if (vees.website.value.length > 0) {
                    d_obj.website = vees.website.value;
                }
                if (vees.location.value.length > 0) {
                    d_obj.location = vees.location.value;
                }
                console.log(JSON.stringify(d_obj));
                let account = wallet.createSafexAccount(e.target.username.value, JSON.stringify(d_obj));
                console.log(account);
                console.log(`account registered`);

                var accs = wallet.getSafexAccounts();

                console.log(accs);
                console.log(`accounts`);
                if (account) {
                    console.log(`let's register it`);

                    let confirm_registration = wallet.createAdvancedTransaction({
                        tx_type: '6',
                        safex_username: e.target.username.value
                    }).then((tx) => {
                        console.log(tx);
                        let confirmed_fee = window.confirm(`the fee to send this transaction will be:  ${tx.fee() / 10000000000} SFX Safex Cash`);
                        let fee = tx.fee();
                        let txid = tx.transactionsIds();
                        if (confirmed_fee) {
                            tx.commit().then((commit) => {
                                console.log(commit);
                                console.log("committed transaction");
                                alert(`transaction successfully submitted 
                        transaction id: ${txid}
                        tokens locked for 500 blocks: 5000 SFT
                        fee: ${fee / 10000000000}`);

                                this.setState({usernames: accs});

                            }).catch((err) => {
                                console.error(err);
                                console.error(`error at the committing of the account registration transaction`);
                                alert(`there was an error at committing the transaction to the blockchain`);
                            })
                        } else {
                            alert(`your transaction was cancelled, no account registration was completed`);
                        }

                    }).catch((err) => {
                        console.error(err);
                        alert(`error when committing the transaction: likely has not gone through`)
                    })
                } else {
                    alert(`not enough tokens`);
                }

            } catch (err) {
                console.error(err);
                console.error("error at the register account function");
            }
        } else {
            alert(`please wait until the wallet has fully loaded before performing registration actions`)
        }
    };

    render() {
        var accounts_table = this.state.usernames.map((user, key) => {
            console.log(user);
            console.log(key);
            try {
                let usee_d = JSON.parse(user.data);

                return <Row className="account_element" key={key}>
                    <Col sm={4}>
                        <Image width={100} height={100} src={usee_d.avatar} roundedCircle/>
                    </Col>
                    <Col sm={8}>
                        <ul>
                            <li>{user.username}</li>
                            <li>{usee_d.location}</li>
                            <li>{usee_d.biography}</li>
                            <li>{usee_d.website}</li>
                            <li>{usee_d.twitter}</li>
                        </ul>
                    </Col>
                </Row>

            } catch (err) {
                console.error(`failed to properly parse the user data formatting`);
                console.error(err);
            }

        });

        var twm_listings_table = this.state.twm_offers.map((listing, key) => {
            console.log(key);
            try {
                return <tr key={key}>
                    <td>{listing.title}</td>
                    <td>{listing.quantity}</td>
                    <td>{listing.price}</td>
                    <td>{listing.seller}</td>
                    <td>{listing.offerID}</td>
                </tr>

            } catch (err) {
                console.error(`failed to properly parse the user data formatting`);
                console.error(err);
            }

        });

        var non_listings_table = this.state.non_offers.map((listing, key) => {
            console.log(key);
            try {
                return <tr key={key}>
                    <td>{listing.title}</td>
                    <td>{listing.quantity}</td>
                    <td>{listing.price / 10000000000}</td>
                    <td>{listing.seller}</td>
                    <td>{listing.offerID}</td>
                    <td><select id="quantity">
                        <option value="1">1</option>
                    </select></td>
                    <td>
                        <button>buy</button>
                    </td>
                    <td>
                        <button>contact</button>
                    </td>
                </tr>

            } catch (err) {
                console.error(`failed to properly parse the user data formatting`);
                console.error(err);
            }

        });

        return (
            <div style={{position: 'relative'}}>
                <Container>
                    <Row>
                        <Navigation wallet={this.props.wallet}/>
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
                                    <button type="confirm" onClick={this.show_marketplace}>open marketplace</button>
                                </li>
                                <li><Button variant="primary" onClick={this.handleShow}>
                                    Show keys
                                </Button>

                                    <Modal animation={false} show={this.state.show} onHide={this.handleClose}>
                                        <Modal.Header closeButton>
                                            <Modal.Title>Your Private Keys</Modal.Title>
                                        </Modal.Header>
                                        <Modal.Body>
                                            <ul>
                                                <li>
                                                    address {this.props.wallet.address()}
                                                </li>
                                                <li>
                                                    secret spend key <br/> {this.props.wallet.secretSpendKey()}
                                                </li>
                                                <li>
                                                    secret view key <br/> {this.props.wallet.secretViewKey()}
                                                </li>
                                                <li>
                                                    mnemonic seed <br/> {this.props.wallet.seed()}
                                                </li>
                                            </ul>
                                        </Modal.Body>
                                        <Modal.Footer>
                                            <Button variant="secondary" onClick={this.handleClose}>
                                                Close
                                            </Button>
                                        </Modal.Footer>
                                    </Modal>
                                </li>
                                {this.state.synced === false ?
                                    (<li>
                                        <button onClick={this.check}>check</button>
                                    </li>) :
                                    ''}
                            </ul>
                        </Col>
                    </Row>

                    {this.state.marketplace_view ? (<div>
                        <Row>
                            <Col md={12}>
                                {this.state.twm_offers.length > 1 ? (<Table>
                                    <thead>
                                    <th>title</th>
                                    <th>quantity</th>
                                    <th>price (SFX)</th>
                                    <th>seller</th>
                                    <th>offer id</th>
                                    </thead>
                                    <tbody>
                                    {twm_listings_table}
                                    </tbody>
                                </Table>) : (<div></div>)}


                                <Table>
                                    <thead>
                                    <th>title</th>
                                    <th>quantity</th>
                                    <th>price (SFX)</th>
                                    <th>seller</th>
                                    <th>offer id</th>
                                    <th>actions</th>
                                    </thead>

                                    <tbody>
                                    {non_listings_table}
                                    </tbody>
                                </Table>
                            </Col>
                        </Row>
                    </div>) : (<div>
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

                                <Col className="account_list" md={8}>
                                    Your accounts:
                                    {accounts_table}

                                </Col>
                                <Col md={4}>
                                    <Form id="create_account" onSubmit={this.register_account}>
                                        username <Form.Control name="username"
                                                               placedholder="enter your desired username"/>
                                        avatar url <Form.Control name="avatar"
                                                                 placedholder="enter the url of your avatar"/>
                                        twitter link <Form.Control name="twitter" defaultValue="twitter.com"
                                                                   placedholder="enter the link to your twitter handle"/>
                                        facebook link <Form.Control name="facebook" defaultValue="facebook.com"
                                                                    placedholder="enter the to of your facebook page"/>
                                        biography <Form.Control as="textarea" name="biography"
                                                                placedholder="type up your biography"/>
                                        website <Form.Control name="website" defaultValue="safex.org"
                                                              placedholder="if you have your own website: paste your link here"/>
                                        location <Form.Control name="location" defaultValue="Earth"
                                                               placedholder="your location"/>
                                        <button type="submit">create account</button>
                                        mixins <Form.Control name="mixins" defaultValue="7"
                                                             placedholder="your location"/>
                                    </Form>
                                </Col>
                            </Col>
                        </Row>
                    </div>)}
                </Container>
            </div>
        );
    }
}
