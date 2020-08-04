import React from 'react';

import {Row, Col, Container, Button, Table, Form, Image, Modal} from 'react-bootstrap';

import {MDBDataTable} from 'mdbreact'

import {withRouter} from 'react-router-dom';

import {normalize_8decimals} from '../../utils/wallet_creation';

import {
    send_cash,
    send_tokens,
    stake_tokens,
    unstake_tokens,
    commit_txn,
    purchase_offer,
    edit_offer
} from "../../utils/wallet_actions";

import {get_staked_tokens, get_interest_map} from '../../utils/safexd_calls';

// Icon Imports
import {FaCogs, FaSearch, FaInfoCircle} from 'react-icons/fa'
import {GiExitDoor} from 'react-icons/gi'
import {GrCubes} from 'react-icons/gr'
import {IconContext} from 'react-icons'

import copy from "copy-to-clipboard"
import ReactTooltip from "react-tooltip";

import {open_twm_file, save_twm_file} from "../../utils/twm_actions";

const openpgp = window.require('openpgp');

var nacl = window.require('tweetnacl');

var wallet;


class WalletHome extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            interface_view: 'home',
            address: '',
            wallet_path: '',
            cash: 0,
            tokens: 0,
            synced: false,
            wallet_height: 0,
            blockchain_height: 0,
            daemon_host: '',
            daemon_port: 0,
            usernames: [],
            connection_status: 'Connecting to the Safex Blockchain Network...',
            timer: '',
            first_refresh: false,
            show_keys: false,
            twm_offers: [],
            non_offers: [],
            selected_user: {}, //merchant element
            show_new_offer_form: false,
            show_new_account_form: false,
            show_purchase_form: false,
            show_edit_offer_form: false,
            blockchain_tokens_staked: 0,
            blockchain_interest_history: [],
            blockchain_current_interest: {},
            twm_file: {},
            show_purchase_offer: {title: '', quantity: 0, offerID: '', seller: ''},
            show_edit_offer: {},
            new_account_image: ""
        };
    }

    async componentDidMount() {
        try {
            console.log(this.props.wallet);
            wallet = this.props.wallet;
            let twm_ls = localStorage.getItem('twm_file');
            console.log(twm_ls);


            let twm_file = JSON.parse(twm_ls);

            const crypto = window.require('crypto');

            const storage_hash = crypto.createHash('sha256');
            storage_hash.update(twm_ls);

            let s_hash = storage_hash.digest('hex');


            const parse_hash = crypto.createHash('sha256');
            parse_hash.update(JSON.stringify(twm_file));

            let p_hash = parse_hash.digest('hex');

            if (p_hash === s_hash) {
                this.setState({twm_file: twm_file});


            } else {
                alert(`have an issue with the twm file!`);
            }
            this.setState({
                wallet_height: wallet.blockchainHeight(),
                blockchain_height: wallet.daemonBlockchainHeight(),
                daemon_host: this.props.daemon_host,
                daemon_port: this.props.daemon_port
            });

            try {
                let gst_obj = {};
                gst_obj.interval = 0;
                gst_obj.daemon_host = this.props.daemon_host;
                gst_obj.daemon_port = this.props.daemon_port;
                let gst = await get_staked_tokens(gst_obj);
                try {
                    let height = wallet.daemonBlockchainHeight();
                    console.log(height);
                    if (height === 0) {
                        height = 95000;
                    }
                    let previous_interval = (height - (height % 100)) / 100;
                    let gim_obj = {};
                    gim_obj.begin_interval = previous_interval - 3;
                    gim_obj.end_interval = previous_interval + 1;
                    gim_obj.daemon_host = this.props.daemon_host;
                    gim_obj.daemon_port = this.props.daemon_port;

                    console.log(`gim object`);
                    console.log(gim_obj);
                    let gim = await get_interest_map(gim_obj);

                    this.setState({
                        blockchain_tokens_staked: gst.pairs[0].amount / 10000000000,
                        blockchain_interest_history: gim.interest_per_interval.slice(0, 4),
                        blockchain_current_interest: gim.interest_per_interval[4]
                    });
                } catch (err) {
                    console.error(err);
                    console.error(`error at getting the period interest`);
                }
            } catch (err) {
                console.error(err);
                console.error(`error at getting the staked tokens from the blockchain`);
            }
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
            this.setState({usernames: accs, selected_user: {index: 0, username: accs[0].username}});
        } catch (err) {
            console.error(err);
            console.log("errors on startup");
        }
    };

    refresh_action = async () => {
        let m_wallet = wallet;
        console.log("refreshing rn");
        try {
            let gst_obj = {};
            gst_obj.interval = 0;
            gst_obj.daemon_host = this.state.daemon_host;
            gst_obj.daemon_port = this.state.daemon_port;
            let gst = await get_staked_tokens(gst_obj);
            try {
                let height = wallet.daemonBlockchainHeight();
                console.log(height);
                let previous_interval = (height - (height % 100)) / 100;
                let gim_obj = {};
                gim_obj.begin_interval = previous_interval - 3;
                gim_obj.end_interval = previous_interval + 1;
                gim_obj.daemon_host = this.state.daemon_host;
                gim_obj.daemon_port = this.state.daemon_port;

                console.log(`gim object`);
                console.log(gim_obj);
                let gim = await get_interest_map(gim_obj);

                this.setState({
                    blockchain_tokens_staked: gst.pairs[0].amount / 10000000000,
                    blockchain_interest_history: gim.interest_per_interval.slice(0, 4),
                    blockchain_current_interest: gim.interest_per_interval[4]
                });
            } catch (err) {
                console.error(err);
                console.error(`error at getting the period interest`);
            }
        } catch (err) {
            console.error(err);
            console.error(`error at getting the staked tokens from the blockchain`);
        }
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
            }).catch((err) => {
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
            });
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
        let confirmed = window.confirm("Are you sure you want to continue? " +
            "This will halt the wallet operation while the rescan is in progress.");
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

    remove_account = async (user) => {
        try {
            let removed = wallet.removeSafexAccount(user);
            if (removed) {
                console.log(`successfully removed ${user}`);
            } else {
                console.error(`error at trying to remove ${user}`);
            }
        } catch (err) {
            console.error(err);
            console.error(`error at trying to remove an account`);
        }
    };

    register_account = async (e) => {
        e.preventDefault();
        if (this.state.tokens >= 5000 && this.state.first_refresh === true) {
            try {
                let vees = e.target;

                console.log(vees);

                let d_obj = {};
                d_obj.twm_version = 1;
                if (vees.avatar.value.length > 0) {
                    d_obj.avatar = vees.avatar.value;
                }
                if (vees.twitter.value.length > 0) {
                    d_obj.twitter = vees.twitter.value;
                }
                if (vees.facebook.value.length > 0) {
                    d_obj.facebook = vees.facebook.value;
                }
                if (vees.linkedin.value.length > 0) {
                    d_obj.linkedin = vees.linkedin.value;
                }
                if (vees.email.value.length > 0) {
                    d_obj.email_address = vees.email.value;
                }
                if (vees.biography.value.length > 0) {
                    d_obj.biography = vees.biography.value;
                }
                if (vees.website.value.length > 0) {
                    d_obj.website = vees.website.value;
                }
                if (vees.location.value.length > 0) {
                    d_obj.location = vees.location.value;
                }
                let account = wallet.createSafexAccount(e.target.username.value, JSON.stringify(d_obj));
                console.log(account);
                console.log(`account registered`);

                var accs = wallet.getSafexAccounts();

                console.log(accs);
                console.log(`accounts`);
                let mixins = e.target.mixins.value - 1;
                if (account) {
                    console.log(`let's register it`);
                    console.log(account);
                    console.log(accs);


                    let this_account;

                    for (const acc of accs) {
                        if (acc.username === e.target.username.value) {
                            this_account = acc;
                        }
                    }

                    console.log(`this_account`);
                    console.log(this_account);
                    console.log(`this_account`);

                    let confirm_registration = wallet.createAdvancedTransaction({
                        tx_type: '6',
                        safex_username: e.target.username.value,
                        mixin: mixins
                    }).then((tx) => {
                        console.log(tx);
                        let confirmed_fee = window.confirm(`The fee to send this transaction will be:  ${tx.fee() / 10000000000} SFX Safex Cash`);
                        let fee = tx.fee();
                        let txid = tx.transactionsIds();
                        if (confirmed_fee) {
                            tx.commit().then(async (commit) => {

                                let twm_file = this.state.twm_file;
                                console.log(twm_file.accounts);
                                console.log(`before`);

                                twm_file.accounts[this_account.username] = {};
                                twm_file.accounts[this_account.username].username = this_account.username;
                                twm_file.accounts[this_account.username].data = this_account.data;
                                twm_file.accounts[this_account.username].safex_public_key = this_account.publicKey;
                                twm_file.accounts[this_account.username].safex_private_key = this_account.privateKey;
                                twm_file.accounts[this_account.username].urls = {};

                                console.log(`before`);
                                console.log(twm_file.accounts);
                                console.log(`after`);

                                try {
                                    const algorithm = 'aes-256-ctr';
                                    const cipher = crypto.createCipher(algorithm, this.state.password);
                                    let crypted = cipher.update(JSON.stringify(twm_file), 'utf8', 'hex');
                                    crypted += cipher.final('hex');

                                    const hash1 = crypto.createHash('sha256');
                                    hash1.update(JSON.stringify(twm_file));
                                    console.log(`password ${this.state.password}`);
                                    console.log(JSON.stringify(twm_file));

                                    let twm_save = await save_twm_file(this.state.new_path + '.twm', crypted, this.state.password, hash1.digest('hex'));

                                    try {

                                        let open_twm_file = await open_twm_file(this.state.new_path + '.twm', this.state.password);
                                        console.log(open_twm_file);

                                        localStorage.setItem('twm_file', JSON.stringify(open_twm_file.contents));
                                    } catch (err) {
                                        console.error(err);
                                        console.error(`error opening twm file after save to verify`);
                                    }
                                    console.log(twm_save);

                                } catch (err) {
                                    console.error(err);
                                    console.error(`error at initial save of the twm file`);
                                }


                                console.log(commit);
                                console.log("committed transaction");
                                copy(`https://stagenet1.safex.org/search?value=${txid}`)
                                alert(`Transaction successfully submitted. 
                                    Transaction ID: ${txid}
                                    5000 SFT will be locked for 500 blocks.
                                    Fee: ${fee / 10000000000} SFX.
                                    A link to this transaction on the blockchain has been copied to the clipboard.`);
                                
                                localStorage.setItem('twm_file', twm_file);

                                this.setState({twm_file: twm_file, show_new_account_form: false, new_account_image: ""});
                                

                            }).catch((err) => {
                                console.error(err);
                                console.error(`error at the committing of the account registration transaction`);
                                alert(`There was an error at committing the transaction to the blockchain`);
                            })
                        } else {
                            alert(`Your transaction was cancelled, no account registration was completed.`);
                        }
                    }).catch((err) => {
                        console.error(err);
                        alert(`Error when committing the transaction. It is likely that has not gone through.`)
                    })
                } else {
                    alert(`Not enough tokens`);
                }

            } catch (err) {
                console.error(err);
                console.error("error at the register account function");
            }
        } else {
            alert(`Please wait until the wallet has fully loaded before performing registration actions`)
        }
    };

    //basic send transactions
    token_send = async (e) => {
        e.preventDefault();
        e.persist();
        try {
            let mixins = e.target.mixins.value - 1;
            if (mixins >= 0) {
                let confirmed = window.confirm(`are you sure you want to send ${e.target.amount.value} SFT Safex Tokens, to ${e.target.destination.value}`);
                console.log(confirmed);
                if (confirmed) {
                    try {
                        let token_txn = await send_tokens(wallet, e.target.destination.value, e.target.amount.value, mixins);
                        let confirmed_fee = window.confirm(`The fee to send this transaction will be:  ${token_txn.fee() / 10000000000} SFX Safex Cash`);
                        let fee = token_txn.fee();
                        let txid = token_txn.transactionsIds();
                        let amount = e.target.amount.value;
                        if (confirmed_fee) {
                            try {
                                let committed_txn = await commit_txn(token_txn);
                                console.log(committed_txn);
                                console.log(token_txn);
                                alert(`token transaction successfully submitted 
                                        transaction id: ${txid}
                                        amount: ${amount} SFT
                                        fee: ${fee / 10000000000} SFX`);
                            } catch (err) {
                                console.error(err);
                                console.error(`error when trying to commit the token transaction to the blockchain`);
                                alert(`error when trying to commit the token transaction to the blockchain`);
                            }
                        } else {
                            console.log("token transaction cancelled");
                        }
                    } catch (err) {
                        console.error(err);
                        console.error(`error at the token transaction formation it was not commited`);
                        alert(`error at the token transaction formation it was not commited`);
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
                    try {
                        let cash_txn = await send_cash(wallet, e.target.destination.value, e.target.amount.value, mixins);
                        console.log(cash_txn);
                        let confirmed_fee = window.confirm(`The fee to send this transaction will be:  ${cash_txn.fee() / 10000000000} SFX Safex Cash`);
                        let fee = cash_txn.fee();
                        let txid = cash_txn.transactionsIds();
                        let amount = e.target.amount.value;
                        if (confirmed_fee) {
                            try {

                                let committed_txn = await commit_txn(cash_txn);
                                console.log(committed_txn);
                                console.log(cash_txn);
                                alert(`cash transaction successfully submitted 
                                        transaction id: ${txid}
                                        amount: ${amount}
                                        fee: ${fee / 10000000000}`);
                            } catch (err) {
                                console.error(err);
                                console.error(`error at commiting the cash transaction to the blockchain network`);
                                alert(`error at commiting the cash transaction to the blockchain network`);
                            }
                        } else {
                            alert(`the cash transaction was cancelled`)
                        }
                    } catch (err) {
                        console.error(err);
                        console.error(`error at the cash transaction formation it was not commited`);
                        alert(`error at the cash transaction formation it was not commited`);
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

    handleChange = (event) => {
        this.setState({[event.target.name]: event.target.value});
    }

    //view shifting
    go_home = () => {
        this.setState({interface_view: 'home'});
    };

    //open market view from navigation
    show_market = () => {
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

        this.setState({
            twm_offers: twm_offers,
            non_offers: non_offers,
            interface_view: 'market'
        });
    };

    //open merchant management view from navigation
    show_merchant = () => {

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

        this.setState({
            twm_offers: twm_offers,
            non_offers: non_offers,
            interface_view: 'merchant'
        });
    };

    //open staking view from navigation
    show_tokens = () => {
        this.setState({interface_view: 'tokens'})
    };

    //open settings view from navigation
    show_settings = () => {
        this.setState({interface_view: 'settings'})
    };

    logout = () => {
        wallet.close(true)
            .then(() => {
                console.log("wallet closed")
                this.props.history.push({pathname: '/'});
            })
            .catch((e) => {
                console.log("unable to close wallet: " + e)
            });
    };

    //close modal of private keys
    handleClose = () => {
        this.setState({show_keys: false});
    };

    //show modal of private keys
    handleShow = () => {
        this.setState({show_keys: true});
    };

    //close modal of New Offer
    handleCloseNewOfferForm = () => {
        this.setState({show_new_offer_form: false});
    };

    //show modal of New Offer
    handleShowNewOfferForm = () => {
        this.setState({show_new_offer_form: true});
    };

    //close modal of new account
    handleCloseNewAccountForm = () => {
        this.setState({show_new_account_form: false});
    };

    //close modal of Purchase Form
    handleClosePurchaseForm = () => {
        this.setState({show_purchase_form: false});
        
    };

    //show modal of Purchase Form
    handleShowPurchaseForm = (listing) => {
        this.setState({show_purchase_form: true, show_purchase_offer: listing});
    };

    //show modal of new account
    handleShowNewAccountForm = () => {
        this.setState({show_new_account_form: true});
    };

    //show modal of Edit Offer Form
    handleShowEditOfferForm = (listing) => {
        this.setState({show_edit_offer_form: true, show_edit_offer: listing});
    };

    //close modal of Edit Offer Form
    handleCloseEditOfferForm = () => {
        this.setState({show_edit_offer_form: false});
    };

    //merchant
    load_offers = (username, index) => {
        this.setState({selected_user: {username: username, index: index}});
        console.log(username);
        console.log(index);
    };

    list_new_offer = (e) => {
        e.preventDefault();
        e.persist();
        console.log(`let's list the offer it`);
        let vees = e.target;

        let o_obj = {};
        o_obj.twm_version = 1;


        if (vees.description.value.length > 0) {
            o_obj.description = vees.description.value;
        }
        if (vees.main_image.value.length > 0) {
            o_obj.main_image = vees.main_image.value;
        }
        if (vees.sku.value.length > 0) {
            o_obj.sku = vees.sku.value;
        }
        if (vees.barcode.value.length > 0) {
            o_obj.barcode = vees.barcode.value;
        }
        if (vees.weight.value.length > 0) {
            o_obj.weight = vees.weight.value;
        }
        if (vees.country.value.length > 0) {
            o_obj.country = vees.country.value;
        }
        if (vees.message_type.value.length > 0) {
            o_obj.message_type = vees.message_type.value;
        }
        if (vees.physical.value.length > 0) {
            o_obj.physical = vees.physical.value;
        }

        try {
            let mixins = e.target.mixins.value - 1;
            let new_offer_transaction = wallet.createAdvancedTransaction({
                tx_type: '8',
                safex_username: e.target.username.value,
                safex_offer_title: e.target.title.value,
                safex_offer_price: e.target.price.value * 10000000000,
                safex_offer_quantity: e.target.quantity.value,
                safex_offer_description: JSON.stringify(o_obj),
                safex_offer_price_peg_used: 0,
                mixin: mixins
            }).then((tx) => {
                console.log(tx);
                let confirmed_fee = window.confirm(`The fee to send this transaction will be:  ${tx.fee() / 10000000000} SFX Safex Cash`);
                let fee = tx.fee();
                let txid = tx.transactionsIds();
                if (confirmed_fee) {
                    tx.commit().then(async (commit) => {
                        console.log(commit);
                        console.log("committed transaction");
                        alert(`transaction successfully submitted 
                        transaction id: ${txid}
                        fee: ${fee / 10000000000}`);

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
        } catch (err) {
            console.error(err);
            console.error("error at listing the offer");
        }
    };

    make_token_stake = async (e) => {
        e.preventDefault();
        e.persist();
        try {
            let mixins = e.target.mixins.value - 1;
            if (mixins >= 0) {
                let confirmed = window.confirm(`are you sure you want to stake ${e.target.amount.value} SFT Safex Tokens?`);
                console.log(confirmed);
                if (confirmed) {
                    try {
                        let stake_txn = await stake_tokens(wallet, e.target.amount.value, mixins);
                        let confirmed_fee = window.confirm(`The fee to send this transaction will be:  ${stake_txn.fee() / 10000000000} SFX Safex Cash`);
                        let fee = stake_txn.fee();
                        let txid = stake_txn.transactionsIds();
                        let amount = e.target.amount.value;
                        if (confirmed_fee) {
                            try {
                                let committed_txn = await commit_txn(stake_txn);
                                console.log(committed_txn);
                                console.log(stake_txn);
                                alert(`token staking transaction successfully submitted 
                                        transaction id: ${txid}
                                        amount: ${amount} SFT
                                        fee: ${fee / 10000000000} SFX`);
                            } catch (err) {
                                console.error(err);
                                console.error(`error when trying to commit the token staking transaction to the blockchain`);
                                alert(`error when trying to commit the token staking transaction to the blockchain`);
                            }
                        } else {
                            console.log("token staking transaction cancelled");
                        }
                    } catch (err) {
                        console.error(err);
                        console.error(`error at the token staking transaction formation it was not commited`);
                        alert(`error at the token staking transaction formation it was not commited`);
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

    make_token_unstake = async (e) => {
        e.preventDefault();
        e.persist();
        try {
            let mixins = e.target.mixins.value - 1;
            if (mixins >= 0) {
                let confirmed = window.confirm(`are you sure you want to stake ${e.target.amount.value} SFT Safex Tokens?`);
                console.log(confirmed);
                if (confirmed) {
                    try {
                        let unstake_txn = await unstake_tokens(wallet, e.target.amount.value, mixins);
                        let confirmed_fee = window.confirm(`The fee to send this transaction will be:  ${unstake_txn.fee() / 10000000000} SFX Safex Cash`);
                        let fee = unstake_txn.fee();
                        let txid = unstake_txn.transactionsIds();
                        let amount = e.target.amount.value;
                        if (confirmed_fee) {
                            try {
                                let committed_txn = await commit_txn(unstake_txn);
                                console.log(committed_txn);
                                console.log(unstake_txn);
                                alert(`token unstake transaction committed  
                                        transaction id: ${txid}
                                        amount: ${amount} SFT
                                        fee: ${fee / 10000000000} SFX`);
                            } catch (err) {
                                console.error(err);
                                console.error(`error when trying to commit the token unstaking transaction to the blockchain`);
                                alert(`error when trying to commit the token unstaking transaction to the blockchain`);
                            }
                        } else {
                            console.log("token staking transaction cancelled");
                        }
                    } catch (err) {
                        console.error(err);
                        console.error(`error at the token unstaking transaction formation it was not commited`);
                        alert(`error at the token unstaking transaction formation it was not commited`);
                    }
                }
            }
        } catch (err) {
            console.error(err);
            if (err.toString().startsWith('not enough outputs')) {
                alert(`choose fewer mixins`);
            }
            console.error(`error at the token unstake transaction`);
        }
    };


    register_twmapi = async (user, twm_api_url = 'http://127.0.0.1:17700 ') => {
        console.log(user);

        //here we contact the api and check if this user is already registered or not.
        //if it is, let's download the data.
        //if it isn't let's generate for this user the pgp keys and pack them sign them and register with the api.

        //edit twm file and save
        let twm_file = this.state.twm_file;
        console.log(twm_file);

        if (twm_file.accounts.hasOwnProperty(user.username)) {


            console.log(twm_file);


            //set the object

            //modify local storage
            //modify state
            //save
            //verify


            console.log(`it has`);
        }
        try {
            var options = {
                userIds: [{name: user.username}], // multiple user IDs
                numBits: 4096,                                            // RSA key size
                passphrase: this.state.password         // protects the private key
            };
            const key = await openpgp.generateKey(options);
            let keys = nacl.sign.keyPair.fromSecretKey(Buffer.from(this.state.usernames[0].privateKey));
            console.log(keys);

            console.log(key);
            console.log(this.state.usernames[0].privateKey);
            console.log(this.state.usernames[0].publicKey);

            console.log(String.fromCharCode.apply(null, keys.secretKey));
        } catch (err) {
            console.error(err);
        }
    };

    to_ellipsis = (text, firstHalf, secondHalf) => {
        const text_to_ellipse = text

        const ellipse = `${text_to_ellipse.substring(0, firstHalf)}.....${text_to_ellipse.substring(text_to_ellipse.length - secondHalf, text_to_ellipse.length)}`

        return (
            ellipse
        )
    };

    purchase_item = async (e, listing) => {
        e.preventDefault();
        console.log(listing);
        console.log(e.target.quantity.value);
        console.log(`mixins`);
        console.log(e.target.mixins.value);
        

        let total_cost = e.target.quantity.value * (listing.price / 10000000000);

        let alert_bool = false;
        let alert_text = ``;

        if (e.target.quantity.value < 1) {
            alert_text += ` quantity can not be 0 or negative :)`;
            alert_bool = true;
        }
        if (e.target.quantity.value > listing.quantity) {
            alert_text += ` not enough quantity available: you wanted ${e.target.quantity.value} there are ${listing.quantity} available`;
            alert_bool = true;
        }
        if (total_cost > this.state.cash) {
            alert_text += ` not enough SFX available for this purchase: total cost: ${total_cost} SFX, your balance: ${this.state.cash.toLocaleString()} SFX`;
            alert_bool = true;
        }

        if (alert_bool) {
            alert(alert_text);
        } else {
            try {
                let mixins = e.target.mixins.value - 1;
                if (mixins >= 0) {

                    let amount = e.target.quantity.value;
                    let confirmed = window.confirm(`Are you sure you want to purchase ${e.target.quantity.value} X ${listing.title} for a total of ${total_cost} SFX?`);
                    console.log(confirmed);
                    if (confirmed) {
                        try {
                            let purchase_txn = await purchase_offer(
                                wallet,
                                total_cost,
                                listing.offerID,
                                e.target.quantity.value,
                                mixins
                            );
                            let confirmed_fee = window.confirm(`The fee to send this transaction will be:  ${purchase_txn.fee() / 10000000000}SFX`);
                            let fee = purchase_txn.fee();
                            let txid = purchase_txn.transactionsIds();
                            console.log(purchase_txn);
                            if (confirmed_fee) {
                                try {
                                    let committed_txn = await commit_txn(purchase_txn);
                                    console.log(committed_txn);
                                    console.log(purchase_txn);
                                    copy(`https://stagenet1.safex.org/search?value=${txid}`)
                                    this.setState({show_purchase_form: false})
                                    alert(`
                                        Purchase transaction committed.
                                        Transaction ID: ${txid}
                                        amount: ${amount} X ${listing.title}
                                        Price: ${total_cost} SFX
                                        Fee: ${fee / 10000000000} SFX
                                        A link to this transaction on the Safex Block Explorer has been copied to your clipboard 
                                        https://stagenet1.safex.org/search?value=${txid} 
                                        `);
                                } catch (err) {
                                    console.error(err);
                                    console.error(`error when trying to commit the purchase transaction to the blockchain`);
                                    alert(`error when trying to commit the purchase transaction to the blockchain`);
                                }
                            } else {
                                console.log("purchase transaction cancelled");
                            }
                        } catch (err) {
                            console.error(err);
                            console.error(`error at the purchase transaction formation it was not commited`);
                            alert(`error at the purchase transaction formation it was not commited`);
                        }
                    }
                }
            } catch (err) {
                console.error(err);
                if (err.toString().startsWith('not enough outputs')) {
                    alert(`Choose fewer mixins`);
                }
                console.error(`Error at the purchase transaction`);
            }
        }
    };

    copyAddressToClipboard = () => {
        copy(this.state.address);
        alert('Copied address!');
    };

    make_edit_offer = async (e) => {
        e.preventDefault();
        e.persist();
        console.log(`let's list the offer it`);
        let vees = e.target;

        console.log(vees.offerid.value);

        let o_obj = {};
        o_obj.twm_version = 1;

        if (vees.description.value.length > 0) {
            o_obj.description = vees.description.value;
        }
        if (vees.main_image.value.length > 0) {
            o_obj.main_image = vees.main_image.value;
        }
        if (vees.sku.value.length > 0) {
            o_obj.sku = vees.sku.value;
        }
        if (vees.barcode.value.length > 0) {
            o_obj.barcode = vees.barcode.value;
        }
        if (vees.weight.value.length > 0) {
            o_obj.weight = vees.weight.value;
        }
        if (vees.country.value.length > 0) {
            o_obj.country = vees.country.value;
        }
        if (vees.message_type.value.length > 0) {
            o_obj.message_type = vees.message_type.value;
        }
        if (vees.physical.value.length > 0) {
            o_obj.physical = vees.physical.value;
        }
        let active = 0;
        if (vees.active.value === 'True' || vees.active.value === 'true') {
            active = 1;
        }
        try {
            let mixins = vees.mixins.value - 1;
            if (mixins >= 0) {
                let confirmed = window.confirm(`are you sure you want to edit ${vees.title.value} offer id:  ${vees.offerid.value}?`);
                console.log(confirmed);
                console.log(vees.offerid.value);
                console.log(vees.username.value);
                console.log(vees.offerid.value);
                if (confirmed) {
                    let edit_txn = await edit_offer(
                        wallet,
                        vees.offerid.value,
                        vees.username.value,
                        vees.title.value,
                        vees.price.value,
                        vees.quantity.value,
                        JSON.stringify(o_obj),
                        active,
                        mixins
                    );
                    let confirmed_fee = window.confirm(`The fee to send this transaction will be:  ${edit_txn.fee() / 10000000000} SFX Safex Cash`);
                    let fee = edit_txn.fee();
                    let txid = edit_txn.transactionsIds();
                    if (confirmed_fee) {
                        try {
                            let committed_edit_txn = await commit_txn(edit_txn);
                            console.log(committed_edit_txn);
                            console.log(edit_txn);
                            alert(`edit offer committed 
                                        transaction id: ${txid}
                                        for offerid: ${vees.offerid.value}
                                        titled: ${vees.title.value}
                                        fee: ${fee / 10000000000} SFX`);
                        } catch (err) {
                            console.error(err);
                            console.error(`error at committing the edit offer transaction for ${vees.offerid.value}`);
                        }
                    } else {
                        alert(`your transaction was cancelled, no edit for the offer was completed`);
                    }
                }
            }
        } catch (err) {
            console.error(err);
            console.error(`error at creating the edit offer transaction`);
        }
    };

    render() {
        const twmwallet = () => {
            switch (this.state.interface_view) {

                case "home": {
                    return (
                        <Row lg className="justify-content-around">

                            


                                <div className="cash-box p-2 font-size-small">

                                    <h3> Send Safex </h3>

                                    <hr class="border border-light w-100"></hr>

                                    <ul>
                                        <Col>
                                            <li id="wallet-balance">{this.state.cash.toLocaleString()} SFX </li>

                                            {this.state.pending_cash > 0 ?
                                                (<li className="border border-warning p-1"> {this.state.pending_cash.toLocaleString()} SFX Pending</li>) : ''}
                                        </Col>
                                        {/*
                                        this.state.pending_cash > 0 ?
                                            (<li>{this.state.cash + this.state.pending_cash} NET</li>) : ''
                                            */}
                                    </ul>

                                    <hr class="border border-light w-100"></hr>

                                    <Form id="send_cash" onSubmit={this.cash_send}>
                                        Destination Address 
                                        <Form.Control name="destination"
                                            defaultValue="Safex5..."
                                            placedholder="the destination address"/>

                                        Amount (SFX)
                                        <Form.Control name="amount" defaultValue="0"
                                                                  placedholder="the amount to send"/>
                                        <Form.Group>
                                            <Form.Label>
                                                Mixins
                                                <IconContext.Provider className="ml-5"  value={{color: 'white', size: '20px'}}>
                                                    <FaInfoCircle 
                                                    data-tip data-for='apiInfo' 
                                                    className="blockchain-icon ml-8 white-text"/>
                                                    
                                                    <ReactTooltip className="ml-5" id='apiInfo' type='info' effect='solid'>
                                                        <span>
                                                            Mixins are transactions that have also been sent on the Safex blockchain. <br/>
                                                            They are combined with yours for private transactions.<br/>
                                                            Changing this from the default could hurt your privacy.<br/>
                                                        </span>
                                                    </ReactTooltip>
                                                </IconContext.Provider>
                                            </Form.Label>
                                            
                                            <Form.Control 
                                                name="mixins" 
                                                as="select"
                                                defaultValue="7"
                                            >
                                                <option>1</option>
                                                <option>2</option>
                                                <option>3</option>
                                                <option>4</option>
                                                <option>5</option>
                                                <option>6</option>
                                                <option>7</option>
                                            </Form.Control>

                                        </Form.Group>

                                        <Button className="mt-2 safex-cash-green" type="submit" size="lg" block>
                                            Send Safex
                                        </Button>
                                    </Form>

                                </div>

                            


                            <Col className="accounts" sm={8}>
                                <div className="account-list border border-light justify-content-center">
                                    <h2 className="text-center m-2">If you are reading this,</h2> 
                                    <h2 className="text-center m-2">You are part of the few chosen to help free humanity.</h2> 
                                    <h1 className="text-center m-2">Together we can make history.</h1>
                                </div>


                            </Col>
                        </Row>
                    );
                }
                case "market":
                    
                    var twm_listings_table = this.state.twm_offers.map((listing, key) => {
                        console.log(key);
                        try {
                            return <tr className="white-text" key={key}>
                                <td>{listing.title}</td>
                                <td>{listing.price / 10000000000}</td>
                                <td>{listing.quantity}</td>
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
                           
                                var data = {};
                                data.description = '';
                                data.main_image = '';
                                data.sku = '';
                                data.barcode = '';
                                data.weight = '';
                                data.country = '';
                                data.message_type = '';
                                data.physical = '';
                                data.twm_version = '';
                                try {
                                    let parsed_data = JSON.parse(listing.description);
                                    console.log(parsed_data);
                                    if (parsed_data.twm_version === 1) {
                                        data.twm_version = 1
                                        if (parsed_data.hasOwnProperty('main_image')) {
                                            data.main_image = parsed_data.main_image;
                                        }
                                        if (parsed_data.hasOwnProperty('description')) {
                                            data.description = parsed_data.description;
                                        }
                                        if (parsed_data.hasOwnProperty('sku')) {
                                            data.sku = parsed_data.sku;
                                        }
                                        if (parsed_data.hasOwnProperty('barcode')) {
                                            data.barcode = parsed_data.barcode;
                                        }
                                        if (parsed_data.hasOwnProperty('weight')) {
                                            data.weight = parsed_data.weight;
                                        }
                                        if (parsed_data.hasOwnProperty('country')) {
                                            data.country = parsed_data.country;
                                        }
                                        if (parsed_data.hasOwnProperty('message_type')) {
                                            data.message_type = parsed_data.message_type;
                                        }
                                        if (parsed_data.hasOwnProperty('physical')) {
                                            data.physical = parsed_data.physical;
                                        }
                                    }
                                } catch (err) {
                                    console.error(err);
                                }

                        try {
                            return <tr key={key}>
                                <td 
                                    onClick={() => this.handleShowPurchaseForm(listing)}
                                    className="title-row" data-tip data-for={`offerTitle${key}`}
                                >
                                    <h4>{listing.title}</h4>
                                    <ReactTooltip className="offer-tooltip" id={`offerTitle${key}`} type='light' effect='float'>
                                        
                                        {data.twm_version === 1 ? 
                                            <div className="d-flex flex-row justify-content-around p-3">
                                                <div className="d-flex flex-column justify-content-center">
                                                    <Image className="border border-dark" src={data.main_image}></Image>
                                                    
                                                </div>

                                                <div className="d-flex p-3 flex-column justify-content-center"> 
                                                    <h3>{listing.title}</h3>

                                                    <hr class="border border-dark w-100"></hr>

                                                    <ul>
                                                        <li>Price: {listing.price  / 10000000000} SFX</li>
                                                        <li>Seller: {listing.seller}</li>
                                                    </ul>  

                                                    <hr class="border border-dark w-100"></hr>

                                                    <p>{this.to_ellipsis(data.description, 500, 0)}</p>
                                                    
                                                </div>
                                                
                                            </div>
                                            :
                                            <div>
                                                <Image src={require("./../../img/sails-logo.png")}></Image>
                                                <h3>{listing.title}</h3>
                                            </div>
                                        }    
                                            <hr class="border border-primary w-100"></hr>  
                                            <p className="my-3">{listing.offerID}</p>
                                    </ReactTooltip>

                                </td>
                                <td className="quantity-row">{listing.price / 10000000000}</td>
                                <td className="quantity-row">{listing.quantity}</td>
                                <td className="quantity-row">{listing.seller}</td>
                                <td className="title-row" data-tip data-for={`offerID${key}`}>
                                    {this.to_ellipsis(listing.offerID, 10, 10)}
                                    <ReactTooltip id={`offerID${key}`} type='light' effect='solid'>
                                        <span>{listing.offerID}</span>
                                    </ReactTooltip>
                                </td>
                                <td className="quantity-row"><select className="light-blue-back" id="quantity">
                                    <option value="1">1</option>
                                </select></td>
                                <td className="quantity-row">
                                   
                                        <Button size="lg" variant="success" 
                                                onClick={() => this.handleShowPurchaseForm(listing)}>
                                            BUY
                                        </Button>

                                        <Modal className="new-account-form" animation={false}
                                               show={this.state.show_purchase_form}
                                               onHide={this.handleClosePurchaseForm}>
                                            <Modal.Header closeButton>
                                                <Modal.Title>
                                                    Purchase {this.state.show_purchase_offer.title}
                                                </Modal.Title>
                                            </Modal.Header>
                                            <Modal.Body>

                                                <Form id="purchase_item"
                                                      onSubmit={(e) => this.purchase_item(e, this.state.show_purchase_offer)}>
                                                    <ul>

                                                        <li>{this.state.show_purchase_offer.title}</li>
                                                        <li>{this.state.show_purchase_offer.price / 10000000000}</li>
                                                        <li>{this.state.show_purchase_offer.seller}</li>
                                                        <li>{this.to_ellipsis(this.state.show_purchase_offer.offerID,0,0)}</li>
                                                    </ul>

                                                    {this.state.show_purchase_offer.quantity} available <Form.Control
                                                    className="light-blue-back"
                                                    id="quantity"
                                                    name="quantity"/>
                                                    Send Message <Form.Control name="message"/>
                                                    <Form.Group>
                                                        <Form.Label>
                                                            Mixins
                                                            <IconContext.Provider  value={{color: 'black', size: '20px'}}>
                                                                <FaInfoCircle data-tip data-for='apiInfo' className="blockchain-icon mx-4"/>
                                                                
                                                                <ReactTooltip id='apiInfo' type='info' effect='solid'>
                                                                    <span>
                                                                        Mixins are transactions that have also been sent on the Safex blockchain. <br/>
                                                                        They are combined with yours for private transactions.<br/>
                                                                        Changing this from the default could hurt your privacy.<br/>
                                                                    </span>
                                                                </ReactTooltip>
                                                            </IconContext.Provider>
                                                        </Form.Label>
                                                        <Form.Control 
                                                            name="mixins" 
                                                            as="select"
                                                            defaultValue="7"
                                                        >
                                                            <option>1</option>
                                                            <option>2</option>
                                                            <option>3</option>
                                                            <option>4</option>
                                                            <option>5</option>
                                                            <option>6</option>
                                                            <option>7</option>
                                                        </Form.Control>
                                                    </Form.Group>

                                                    <Button size="lg" className="mt-2" type="submit" variant="success">Confirm Payment</Button>
                                                </Form>
                                            </Modal.Body>
                                            <Modal.Footer className="align-self-start">

                                                <Button size="lg" variant="danger" onClick={this.handleClosePurchaseForm}>
                                                    Close
                                                </Button>
                                            </Modal.Footer>
                                        </Modal>
                                    
                                </td>
                                <td className="quantity-row">
                                    <Button size="lg" variant="info">CONTACT</Button>
                                </td>
                            </tr>

                        } catch (err) {
                            console.error(`failed to properly parse the user data formatting`);
                            console.error(err);
                        }
                    } catch (err) {
                        console.error(err);
                    }

                    });
                    return (
                        <div className="overflow-y">
                            <Container 
                                fluid
                                id="header"
                                className="no-gutters mt-5 p-2 border border-light b-r10 black-back h-25 sticky"
                                style={{height: "200px"}}
                            >

                        <Row className="justify-content-between align-items-center">

                            <Col sm={2} className="p-1 align-self-center b-r10 light-blue-back">

                                <div className="d-flex flex-row justify-content-center align-items-end">
                                    <IconContext.Provider value={{color: 'white', size: '20px'}}>
                                        <div className="white-text">
                                            <GrCubes className="blockchain-icon m-1 white-text"/>
                                        </div>
                                    </IconContext.Provider>
                                    <p className="mb-2"><b>{this.state.blockchain_height.toLocaleString()}</b></p>
                                </div>

                                {this.state.wallet_height < this.state.blockchain_height ?
                                    (<p className="mb-2">
                                        {this.state.wallet_height} / {this.state.blockchain_height}
                                    </p>) : ''}
                                <p className="mb-2 text-align-center">{this.state.connection_status}</p>

                            </Col>

                            {/*<div className="menu-logo">
                                <Image className=" align-content-center"
                                    src={require("./../../img/sails-logo.png")}/>
                                </div>*/}

                            <Col sm={6} className="menu">
                                <ul className="menu__list">
                                    <li className={this.state.interface_view === 'home'  ? "menu-link-active" : "menu__list-item"} >
                                        <a className="menu__link" href="javascript:void(0)" 
                                        onClick={this.go_home}>Home</a>
                                    </li>
                                    <li className={this.state.interface_view === 'market' ? "menu__list-item menu-link-active" : "menu__list-item"}>
                                        <a className="menu__link" href="javascript:void(0)"
                                        onClick={this.show_market}>Market</a>
                                    </li>
                                    <li className={this.state.interface_view === 'merchant' ? "menu__list-item menu-link-active" : "menu__list-item"}>
                                        <a className="menu__link" href="javascript:void(0)"
                                        onClick={this.show_merchant}>Merchant</a>
                                    </li>
                                    <li className={this.state.interface_view === 'tokens' ? "menu__list-item menu-link-active" : "menu__list-item"}>
                                        <a className="menu__link" href="javascript:void(0)"
                                        onClick={this.show_tokens}>Tokens</a>
                                    </li>


                                </ul>

                            </Col>
                            <div className="d-flex flex-column">
                                <a className="menu__link" href="javascript:void(0)"
                                onClick={this.show_settings}><FaCogs size={20} className="m-3"/></a>


                                <a className="menu__link" href="javascript:void(0)"
                                onClick={this.logout}><GiExitDoor className="m-3"/></a>
                            </div>
                        </Row>


                        <Row
                            className="no-gutters p-2 justify-content-between align-items-center b-r10 white-text">
                            <Col id="balances" sm={3}>
                                <li>
                                    SFX: {this.state.cash.toLocaleString()} {this.state.pending_cash > 0 ? `(${this.state.pending_cash.toLocaleString()} SFX Pending)` : ''}
                                </li>
                                <li className="">
                                    SFT: {this.state.tokens.toLocaleString()} {this.state.pending_tokens > 0 ? `(${this.state.pending_tokens.toLocaleString()} SFT Pending)` : ''}
                                </li>
                            </Col>
                            <Col className="text-align-center" sm={8}>
                                <p>SFX + SFT Public Address:<br/>
                                    <br/>
                                    <b>{this.state.address}</b>                            
                                </p>
                                <Row className="justify-content-center">
                                    
                                    <div id="header-buttons" className="d-flex flex-row" sm={1}>

                                    {this.state.synced === false ? (
                                        <Button variant="warning" onClick={this.check}>
                                            Check
                                        </Button>) : ''}

                                        <Button variant="danger" onClick={this.rescan}>
                                            Hard Rescan
                                        </Button>

                                        <Button variant="primary" onClick={this.handleShow}>
                                            Show Keys
                                        </Button>

                                        <Modal 
                                            className="width100 black-text" 
                                            animation={false}
                                            show={this.state.show_keys}
                                            onHide={this.handleClose}
                                        >
                                            <Modal.Header closeButton>
                                                <Modal.Title>Your Private Keys</Modal.Title>
                                            </Modal.Header>
                                            <Modal.Body>
                                                <ul>
                                                    <li>
                                                        <b>Address:</b> <br/> {this.props.wallet.address()}
                                                    </li>
                                                    <li>
                                                        <b>Secret Spend Key:</b>
                                                        <br/> {this.props.wallet.secretSpendKey()}
                                                    </li>
                                                    <li>
                                                        <b>Secret View Key:</b>
                                                        <br/> {this.props.wallet.secretViewKey()}
                                                    </li>
                                                    <li>
                                                        <b>Mnemonic Seed:</b>
                                                        <br/> {this.props.wallet.seed().toUpperCase()}
                                                    </li>
                                                </ul>
                                            </Modal.Body>
                                            <Modal.Footer>
                                                <Button variant="secondary" onClick={this.handleClose}>
                                                    Close
                                                </Button>
                                            </Modal.Footer>
                                        </Modal>
                                        <Button className="ml-3" onClick={this.copyAddressToClipboard}>
                                            Copy Address
                                        </Button>
                                    </div>
                                </Row>
                            </Col>
                            
                        </Row>
                    </Container>
                            <Row>
                                <Col className="market-table white-text overflow-y" md={12}>
                                    <div
                                        className="
                                        search-box d-flex flex-column
                                        align-items-center border
                                        border-white safex-blue
                                        "
                                    >

                                        <div class="row width100 border-bottom border-white" id="search">
                                            <form className="width100 no-gutters p-2 d-flex justify-content-center" id="search-form" action=""
                                                  method="" enctype="multipart/form-data">
                                                <div class="form-group col-sm-9 mr-5">
                                                    <input class="form-control" type="text"
                                                           placeholder="eg. api.theworldmarketplace.com"/>
                                                </div>
                                                <div class="form-group col-sm-2">
                                                    <button class="btn btn-primary mx-3">
                                                        Set Market API 
                                                    </button>
                                                    <IconContext.Provider  value={{color: 'white', size: '20px'}}>
                                                        
                                                            <FaInfoCircle data-tip data-for='apiInfo' className="blockchain-icon mx-4 white-text"/>
                                                        
                                                        <ReactTooltip id='apiInfo' type='light' effect='solid'>
                                                            <span>This is info about setting a market API. Lorem Ipsum.</span>
                                                        </ReactTooltip>
                                                    </IconContext.Provider>
                                                    
                                                    
                                                </div>
                                            </form>
                                        </div>
                                        <div class="row" id="search">
                                            <form className="no-gutters p-2" id="search-form" action=""
                                                  
                                                  enctype="multipart/form-data">
                                                <div class="form-group col-sm-9">
                                                    <input class="form-control" type="text" placeholder="Search"/>
                                                </div>
                                                <div class="form-group col-sm-3">
                                                    <button onClick={() => (alert("We are wokring on getting this feature up and running as soon as possible. Please be patient!"))} class="btn btn-block btn-primary">Search
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                        <div class="row" id="filter">
                                            <form>
                                                <div class="form-group col-sm-3 col-xs-6">
                                                    <select data-filter="category"
                                                            class="filter-make filter form-control">
                                                        <option value="">Category</option>
                                                        <option value="">Any</option>
                                                        <option value="">Category</option>
                                                        <option value="">Books</option>
                                                        <option value="">Clothes</option>
                                                        <option value="">Digital</option>
                                                        <option value="">Toys</option>
                                                    </select>
                                                </div>
                                                <div class="form-group col-sm-3 col-xs-6">
                                                    <select data-filter="location"
                                                            class="filter-model filter form-control">
                                                        <option value="">Location</option>
                                                        <option value="">Any</option>
                                                        <option value="">Africa</option>
                                                        <option value="">Asia</option>
                                                        <option value="">Africa</option>
                                                        <option value="">Europe</option>
                                                        <option value="">North America</option>
                                                        <option value="">South America</option>
                                                    </select>
                                                </div>
                                                <div class="form-group col-sm-3 col-xs-6">
                                                    <select data-filter="price"
                                                            class="filter-type filter form-control">
                                                        <option value="">Price Range</option>
                                                        <option value="">$0 - $24.99</option>
                                                        <option value="">$25 - $49.99</option>
                                                        <option value="">$50 - $199.99</option>
                                                        <option value="">$200 - $499.99</option>
                                                        <option value="">$500 - $999.99</option>
                                                        <option value="">$1000+</option>
                                                    </select>
                                                </div>
                                                <div class="form-group col-sm-3 col-xs-6">
                                                    <select data-filter="sort"
                                                            class="filter-price filter form-control">
                                                        <option value="">Sort by...</option>
                                                        <option value="">$$$ Asc</option>
                                                        <option value="">$$$ Dec</option>
                                                        <option value="">Rating Asc</option>
                                                        <option value="">Rating Dec</option>
                                                    </select>
                                                </div>
                                            </form>
                                        </div>
                                        <thead className="opaque-black text-align-center">

                                        <tr>
                                            <th className="title-row">Title</th>
                                            <th className="quantity-row">Price (SFX)</th>
                                            <th className="quantity-row">Quantity</th>
                                            <th className="quantity-row">Seller</th>
                                            <th className="title-row">Offer ID</th>
                                            <th className="actions-row">Actions</th>
                                            
                                        </tr>
                                        </thead>

                                    </div>

                                    {this.state.twm_offers.length > 1 ? (
                                        <Table color="white" className="white-text border border-white b-r10">
                                            <thead>
                                            <tr>
                                                <th>Title</th>
                                                <th>Price (SFX)</th>
                                                <th>Quantity</th>
                                                <th>Seller</th>
                                                <th>Offer ID</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {twm_listings_table}
                                            </tbody>
                                        </Table>) : (<div></div>)}

                                    <Table>
                                        

                                        <tbody>
                                        {non_listings_table}
                                        </tbody>
                                    </Table>
                                </Col>
                            </Row>
                        </div>
                    );
                case "merchant": {
                    var twm_listings_table = this.state.twm_offers.map((listing, key) => {
                        console.log(key);
                        try {
                            if (listing.seller === this.state.selected_user.username) {
                                return <tr key={key}>
                                    <td>{listing.title}</td>
                                    <td>{listing.price / 10000000000}</td>
                                    <td>{listing.quantity}</td>
                                    <td>{listing.seller}</td>
                                    <td>{listing.offerID}</td>
                                </tr>
                            }
                        } catch (err) {
                            console.error(`failed to properly parse the user data formatting`);
                            console.error(err);
                        }

                    });

                    var non_listings_table = this.state.non_offers.map((listing, key) => {
                        console.log(listing);

                        try {
                            if (listing.seller === this.state.selected_user.username) {
                                var data = {};
                                data.description = '';
                                data.main_image = '';
                                data.sku = '';
                                data.barcode = '';
                                data.weight = '';
                                data.country = '';
                                data.message_type = '';
                                data.physical = '';
                                try {
                                    let parsed_data = JSON.parse(listing.description);
                                    console.log(parsed_data);
                                    if (parsed_data.twm_version === 1) {
                                        if (parsed_data.hasOwnProperty('main_image')) {
                                            data.main_image = parsed_data.main_image;
                                        }
                                        if (parsed_data.hasOwnProperty('description')) {
                                            data.description = parsed_data.description;
                                        }
                                        if (parsed_data.hasOwnProperty('sku')) {
                                            data.sku = parsed_data.sku;
                                        }
                                        if (parsed_data.hasOwnProperty('barcode')) {
                                            data.barcode = parsed_data.barcode;
                                        }
                                        if (parsed_data.hasOwnProperty('weight')) {
                                            data.weight = parsed_data.weight;
                                        }
                                        if (parsed_data.hasOwnProperty('country')) {
                                            data.country = parsed_data.country;
                                        }
                                        if (parsed_data.hasOwnProperty('message_type')) {
                                            data.message_type = parsed_data.message_type;
                                        }
                                        if (parsed_data.hasOwnProperty('physical')) {
                                            data.physical = parsed_data.physical;
                                        }
                                    }
                                } catch (err) {
                                    console.error(err);
                                }
                                return <tr key={key}>
                                    <td className="title-row text-align-center"><h4>{listing.title}</h4></td>
                                    <td className="quantity-row text-align-center">{listing.price / 10000000000}</td>
                                    <td className="quantity-row text-align-center">{listing.quantity}</td>
                                    <td className="quantity-row text-align-center">{listing.seller}</td>
                                    <td className="actions-row text-align-center">{listing.offerID}</td>
                                    <td className="title-row text-align-center">
                                        <Col className="align-self-center" md={2}>
                                            <Button 
                                                size="lg" 
                                                variant="success"
                                                onClick={() => this.handleShowEditOfferForm()}>
                                            EDIT
                                            </Button>
                                            
                                            <Modal 
                                                className="new-account-form" 
                                                animation={false}
                                                show={this.state.show_edit_offer_form}
                                                onHide={this.handleCloseEditOfferForm}
                                            >
                                                <Modal.Header closeButton>
                                                    <Modal.Title>Edit Offer {this.state.show_edit_offer.title}</Modal.Title>
                                                </Modal.Header>
                                                
                                                <Modal.Body>
                                                    <Form id="edit_offer"
                                                        onSubmit={(e) => this.make_edit_offer(e, this.state.show_edit_offer)}>

                                                        Offer ID <Form.Control name="offerid"
                                                                            value={this.state.show_edit_offer.offerID}/>
                                                        Username <Form.Control name="username"
                                                                            value={this.state.show_edit_offer.seller}/>
                                                        Image URL <Form.Control name="main_image"
                                                                                        defaultValue={data.main_image}/>
                                                        Title <Form.Control name="title"
                                                                            defaultValue={this.state.show_edit_offer.title}/>
                                                        Description <Form.Control maxLength="2000" as="textarea"
                                                                                name="description"
                                                                                defaultValue={data.description}/>
                                                        Price (SFX) <Form.Control name="price"
                                                                                defaultValue={this.state.show_edit_offer.price / 10000000000}/>
                                                        Available Quantity <Form.Control name="quantity"
                                                                                        defaultValue={this.state.show_edit_offer.quantity}/>
                                                        SKU <Form.Control name="sku" 
                                                                        defaultValue={data.sku}/>
                                                        Barcode (ISBN, UPC, GTIN, etc) <Form.Control name="barcode" 
                                                                                                    defaultValue={data.barcode}/>

                                                        Message Type <Form.Control name="message_type"
                                                                                defaultValue={data.message_type}/>
                                                        Weight <Form.Control name="weight" defaultValue={data.weight}/>
                                                        Physical Item? <Form.Control name="physical"
                                                                                    defaultValue={data.physical}/>
                                                        Country of Origin <Form.Control name="country"
                                                                                        defaultValue={data.country}
                                                                                        placedholder="your location"/>
                                                        Set Active <Form.Control name="active"
                                                                                defaultValue={this.state.show_edit_offer.active}/>
                                                        <Form.Group>
                                                            <Form.Label>
                                                                Mixins
                                                                <IconContext.Provider  value={{color: 'white', size: '20px'}}>
                                                                    <FaInfoCircle data-tip data-for='apiInfo' className="blockchain-icon mx-4 white-text"/>
                                                                    
                                                                    <ReactTooltip id='apiInfo' type='info' effect='solid'>
                                                                        <span>
                                                                            Mixins are transactions that have also been sent on the Safex blockchain. <br/>
                                                                            They are combined with yours for private transactions.<br/>
                                                                            Changing this from the default could hurt your privacy.<br/>
                                                                        </span>
                                                                    </ReactTooltip>
                                                                </IconContext.Provider>
                                                            </Form.Label>
                                                        
                                                            <Form.Control 
                                                                name="mixins" 
                                                                as="select"
                                                                defaultValue="7"
                                                            >
                                                                <option>1</option>
                                                                <option>2</option>
                                                                <option>3</option>
                                                                <option>4</option>
                                                                <option>5</option>
                                                                <option>6</option>
                                                                <option>7</option>
                                                            </Form.Control>
                                                        </Form.Group>

                                                        <Button block size="lg" type="submit" variant="success">Submit Edit</Button>
                                                    </Form>
                                                </Modal.Body>
                                                <Modal.Footer className="align-self-start">
                                                    <Button size="lg" variant="danger" onClick={this.handleCloseEditOfferForm}>
                                                        Close
                                                    </Button>
                                                </Modal.Footer>
                                            </Modal>
                                        </Col>
                                    </td>
                                </tr>
                            }
                        } catch (err) {
                            console.error(`failed to properly parse the user data formatting`);
                            console.error(err);
                        }
                    });
                    var accounts_table = this.state.usernames.map((user, key) => {
                        console.log(user);
                        console.log(key);
                        let avatar = '';
                        try {
                            if (user.data.length > 0) {
                                console.log(`user data is longer than my friend`)
                                let usee_d = JSON.parse(user.data);

                                if (usee_d.twm_version === 1) {
                                    avatar = usee_d.avatar;
                                } else {
                                    console.error(`the parsed data is not twm_version 1 compatible`);
                                }
                            }
                        } catch (err) {
                            console.error(`there is no user data to parse it is not properly formatted`);
                        }
                        return (
                            <Row
                                className={
                                    this.state.selected_user.username === user.username ?

                                        "border border-white no-gutters account-element opaque-black"

                                        : "border border-dark no-gutters account-element"}
                                key={key}
                                onClick={() => this.load_offers(user.username, key)}
                            >

                                <Col>

                                    <Image
                                        width={50} 
                                        height={50} 
                                        src={avatar} 
                                        roundedCircle
                                        className="border border-white grey-back"
                                    />
                                </Col>
                                <Col>
                                    <h2>{user.username}</h2>

                                </Col>
                                {user.status == 0 ? (

                                    <Button variant="danger"
                                            onClick={() => this.remove_account(user.username, key)}>
                                        Remove
                                    </Button>

                                ) : ''}
                            </Row>
                        )
                    });
                    try {
                        var selected = this.state.usernames[this.state.selected_user.index];
                        var data = {};
                        data.avatar = '';
                        if (selected) {
                            try {
                                let selected_data = JSON.parse(selected.data);

                                console.log(selected);

                                data = selected_data;
                            } catch (err) {
                                console.error(err);
                                console.error(`error at parsing the data of the selected user ${selected.username}`);
                            }
                        } else {
                            console.log(`no user selected`);
                        }
                    } catch (err) {
                        console.error(err);
                        console.error(`likely selected user somehow doesn't exist`);
                    }
                    try {
                        return (
                            <Row>
                                <Col>

                                    <Row className="no-gutters p-3 justify-content-between grey-back b-r10">

                                        <Col md={5} className="account-list no-gutters p-3">

                                            {accounts_table}
                                        </Col>
                                        {selected !== void (0) ? (
                                            <Col md={3}
                                                 className="no-gutters d-flex flex-column align-items-center b-r10 merchant-profile-view text-align-center"
                                            >
                                                <Row>
                                                    <ul>
                                                        <li>
                                                            <Image 
                                                                className="border border-white grey-back" 
                                                                width={100} 
                                                                height={100} 
                                                                src={data.avatar}
                                                                roundedCircle
                                                            />
                                                        </li>
                                                        <h2>{selected.username}</h2>

                                                    </ul>
                                                </Row>
                                                <Col id="account-edit-buttons" className=" d-flex flex-column">
                                                    <Button>Edit</Button>
                                                    <Button onClick={() => this.register_twmapi(selected)}>
                                                        Register API
                                                    </Button>
                                                    <Button>Remove</Button>
                                                </Col>
                                            </Col>
                                        ) : ''}

                                        <Col className="align-self-center" md={2}>
                                            <Button block size="lg" variant="success"
                                                    onClick={this.handleShowNewAccountForm}>
                                                New Account
                                            </Button>

                                            <Modal 
                                                animation={false}
                                                show={this.state.show_new_account_form}
                                                onHide={this.handleCloseNewAccountForm}
                                            >
                                                <Modal.Header closeButton>
                                                    <Modal.Title>Create New Account</Modal.Title>
                                                </Modal.Header>
                                                
                                                <Modal.Body>
                                                    <Form id="create_account" onSubmit={this.register_account}>
                                                        <Form.Row>
                                                            <Col md="8">
                                                                <Form.Group as={Col}>
                                                                    <Form.Label>Username</Form.Label>
                                                                    <Form.Control name="username" placedholder="enter your desired username"/>
                                                                </Form.Group>
                                                                
                                                                <Form.Group as={Col}>
                                                                    <Form.Label>Avatar URL</Form.Label>
                                                                    <Form.Control 
                                                                        onChange={this.handleChange}
                                                                        value={this.state.new_account_image} 
                                                                        name="new_account_image" 
                                                                        placedholder="enter the url of your avatar"
                                                                    />
                                                                </Form.Group>
                                                            </Col>

                                                            <Col md="4">
                                                                <Image 
                                                                    className="border border-white grey-back" 
                                                                    width={150} 
                                                                    height={150} 
                                                                    src={this.state.new_account_image}
                                                                    roundedCircle
                                                                />
                                                            </Col>
                                                        </Form.Row>

                                                        <Form.Row>
                                                            <Col>
                                                                <Form.Group as={Col}>
                                                                    <Form.Label>Biography</Form.Label>
                                                                    <Form.Control 
                                                                        maxLength="500" 
                                                                        as="textarea" 
                                                                        name="biography"
                                                                        placedholder="type up your biography"
                                                                        style={{maxHeight: 150}}
                                                                    />
                                                                </Form.Group>
                                                                
                                                                
                                                                    <Form.Group as={Col}>
                                                                        <Form.Label>Location</Form.Label>
                                                                        <Form.Control 
                                                                            name="location" 
                                                                            defaultValue="Earth"
                                                                            placedholder="your location"
                                                                        />
                                                                    </Form.Group> 
                                                                    
                                                                    <Form.Group as={Col}>

                                                                        <Form.Label>Email</Form.Label>
                                                                        <Form.Control 
                                                                            name="email"
                                                                            defaultValue="xyz@example.com"
                                                                            placedholder="your location"
                                                                        />
                                                                    </Form.Group>

                                                                <Form.Group>
                                                                    <Form.Group  md="6" as={Col}>
                                                                        <Form.Label>Twitter Link</Form.Label>
                                                                        <Form.Control 
                                                                            name="twitter"
                                                                            defaultValue="twitter.com"
                                                                            placedholder="enter the link to your twitter handle"
                                                                        />
                                                                
                                                                    </Form.Group>
                                                                
                                                                    <Form.Group  md="6" as={Col}>
                                                                        <Form.Label>Facebook Link</Form.Label>
                                                                        <Form.Control 
                                                                            name="facebook"
                                                                            defaultValue="facebook.com"
                                                                            placedholder="enter the to of your facebook page"
                                                                        />

                                                                    </Form.Group>
                                                                
                                                                    <Form.Group md="6" as={Col}>
                                                                        <Form.Label>LinkedIn Link</Form.Label>
                                                                        <Form.Control 
                                                                            name="linkedin"
                                                                            defaultValue="linkedin.com"
                                                                            placedholder="enter the link to your linkedin handle"
                                                                        />
                                                                    </Form.Group>
                                                                
                                                                    <Form.Group md="6" as={Col}>

                                                                        <Form.Label>Website</Form.Label>
                                                                        <Form.Control 
                                                                            name="website" 
                                                                            defaultValue="safex.org"
                                                                            placedholder="if you have your own website: paste your link here"
                                                                        />
                                                                    </Form.Group>

                                                                </Form.Group>
                                                               

                                                                <Form.Group as={Col}>

                                                                    <Form.Label>Mixins</Form.Label>
                                                                    <IconContext.Provider  value={{color: 'white', size: '20px'}}>
                                                                        <FaInfoCircle data-tip data-for='apiInfo' className="blockchain-icon mx-4 white-text"/>
                                                                        
                                                                        <ReactTooltip id='apiInfo' type='info' effect='solid'>
                                                                            <span>
                                                                                Mixins are transactions that have also been sent on the Safex blockchain. <br/>
                                                                                They are combined with yours for private transactions.<br/>
                                                                                Changing this from the default could hurt your privacy.<br/>
                                                                            </span>
                                                                        </ReactTooltip>
                                                                    </IconContext.Provider>
                                                                
                                                            
                                                                    <Form.Control 
                                                                        name="mixins" 
                                                                        as="select"
                                                                        defaultValue="7"
                                                                    >
                                                                        <option>1</option>
                                                                        <option>2</option>
                                                                        <option>3</option>
                                                                        <option>4</option>
                                                                        <option>5</option>
                                                                        <option>6</option>
                                                                        <option>7</option>
                                                                    </Form.Control>
                                                                    
                                                                </Form.Group>
                                                            </Col>

                                                            
                                                        </Form.Row>
                                                   
                                                        <Button 
                                                            block 
                                                            size="lg" 
                                                            variant="success" 
                                                            type="submit"
                                                            className="my-5"
                                                        >
                                                            
                                                        Create Account
                                                        </Button>
                                                    </Form>
                                                </Modal.Body>
                                                <Modal.Footer className="align-self-start">

                                                    <Button variant="danger" onClick={this.handleCloseNewAccountForm}>
                                                        Close
                                                    </Button>
                                                </Modal.Footer>
                                            </Modal>
                                        </Col>
                                    </Row>

                                    <Col lg className="merchant-product-view b-r10 px-3 pb-5 opaque-black no-gutters mt-5">
                                        {selected !== void (0) ? (
                                            <div className="pt-5 align-items-center sticky safex-cash-green d-flex flex-column">
                                                <div>
                                                    <Button 
                                                        className="mb-5" 
                                                        size="lg" 
                                                        variant="success"
                                                        onClick={this.handleShowNewOfferForm}>
                                                    New Offer
                                                    </Button>
                                                </div>

                                                <Modal animation={false}
                                                       show={this.state.show_new_offer_form}
                                                       onHide={this.handleCloseNewOfferForm}>
                                                    <Modal.Header closeButton>
                                                        <Modal.Title>Create New Offer</Modal.Title>
                                                    </Modal.Header>
                                                    <Modal.Body>

                                                        <Form id="list_new_offer" onSubmit={this.list_new_offer}>
                                                            <Form.Group controlId="formBasicEmail">
                                                                <Form.Label>Username</Form.Label>
                                                                
                                                                <Form.Control name="username" value={selected.username}/>
                                                            </Form.Group>

                                                            <Form.Group controlId="formBasicEmail">
                                                                <Form.Label>Title</Form.Label>
                                                                
                                                                <Form.Control name="title"/>
                                                            </Form.Group>

                                                            <Form.Group controlId="formBasicEmail">
                                                                <Form.Label>Image URL</Form.Label>
                                                                
                                                                <Form.Control name="main_image"/>
                                                            </Form.Group>

                                                            <Form.Group controlId="formBasicEmail">
                                                                <Form.Label>Description</Form.Label>
                                                                
                                                                <Form.Control maxLength="2000" as="textarea" name="description"/>
                                                            </Form.Group>

                                                            <Form.Group controlId="formBasicEmail">
                                                                <Form.Label>Price (SFX)</Form.Label>
                                                                
                                                                <Form.Control name="price"/>
                                                            </Form.Group>

                                                            <Form.Group controlId="formBasicEmail">
                                                                <Form.Label>Available Quantity</Form.Label>
                                                                
                                                                <Form.Control name="quantity"/>
                                                            </Form.Group>

                                                            <Form.Group controlId="formBasicEmail">
                                                                <Form.Label>SKU</Form.Label>
                                                                
                                                                <Form.Control name="sku"/>
                                                            </Form.Group>
                                                            
                                                            <Form.Group controlId="formBasicEmail">
                                                                <Form.Label>Barcode (ISBN, UPC, GTIN, etc)</Form.Label>
                                                                
                                                                <Form.Control name="barcode"/>
                                                            </Form.Group>

                                                            <Form.Group controlId="formBasicEmail">
                                                                <Form.Label>Message Type </Form.Label>
                                                                
                                                                <Form.Control name="message_type"/>
                                                            </Form.Group>

                                                            <Form.Group controlId="formBasicEmail">
                                                                <Form.Label>Weight</Form.Label>
                                                                
                                                                <Form.Control name="weight"/>
                                                            </Form.Group>

                                                            <Form.Group controlId="formBasicEmail">
                                                                <Form.Label>Physical Item?</Form.Label>
                                                                
                                                                <Form.Control name="physical" value="true"/>
                                                            </Form.Group>

                                                            <Form.Group controlId="formBasicEmail">
                                                                <Form.Label>Country of Origin</Form.Label>
                                                                
                                                                <Form.Control name="country" defaultValue="Earth" placedholder="your location"/>
                                                            </Form.Group>
                                                             
                                                            <Form.Group>
                                                                <Form.Label>
                                                                    Mixins
                                                                    <IconContext.Provider  value={{color: 'white', size: '20px'}}>
                                                                        <FaInfoCircle data-tip data-for='apiInfo' className="blockchain-icon mx-4 white-text"/>
                                                                        
                                                                        <ReactTooltip id='apiInfo' type='info' effect='solid'>
                                                                            <span>
                                                                                Mixins are transactions that have also been sent on the Safex blockchain. <br/>
                                                                                They are combined with yours for private transactions.<br/>
                                                                                Changing this from the default could hurt your privacy.<br/>
                                                                            </span>
                                                                        </ReactTooltip>
                                                                    </IconContext.Provider>
                                                                </Form.Label>
                                                                
                                                                <Form.Control 
                                                                    name="mixins" 
                                                                    as="select"
                                                                    defaultValue="7"
                                                                >
                                                                    <option>1</option>
                                                                    <option>2</option>
                                                                    <option>3</option>
                                                                    <option>4</option>
                                                                    <option>5</option>
                                                                    <option>6</option>
                                                                    <option>7</option>
                                                                </Form.Control>
                                                            </Form.Group>
                                                            <Button block size="lg" variant="success" type="submit">
                                                                List Offer
                                                            </Button>
                                                        </Form>
                                                    </Modal.Body>
                                                    <Modal.Footer className="align-self-start">
                                                        <Button size="lg" variant="danger" onClick={this.handleCloseNewOfferForm}>
                                                            Close
                                                        </Button>
                                                    </Modal.Footer>
                                                </Modal>
                                                <thead className="w-100 opaque-black text-align-center">

                                                    <tr>
                                                        <th className="title-row">Title</th>
                                                        <th className="quantity-row">Price (SFX)</th>
                                                        <th className="quantity-row">Quantity</th>
                                                        <th className="quantity-row">Seller</th>
                                                        <th className="actions-row">Offer ID</th>
                                                        <th className="title-row">Actions</th>
                                                        
                                                    </tr>
                                                </thead>
                                            </div>) : ''}

                                        <Row className="no-gutters">
                                            {this.state.twm_offers.length > 1 ? (
                                                    <Table color="white" className="white-text border border-white b-r10">
                                                        <thead>
                                                        <tr>
                                                            <th>Title</th>
                                                            <th>Price (SFX)</th>
                                                            <th>Quantity</th>
                                                            <th>Seller</th>
                                                            <th>Offer ID</th>
                                                        </tr>
                                                        </thead>
                                                        <tbody>
                                                        {twm_listings_table}
                                                        </tbody>
                                                    </Table>)
                                                : (<div></div>)}

                                            <Table>
                                                <thead>
                                              
                                                </thead>
                                                <tbody>
                                                    {non_listings_table}
                                                </tbody>
                                            </Table>
                                        </Row>
                                    </Col>
                                </Col>
                            </Row>);
                    } catch (err) {
                        console.log(err);
                        alert(err);
                        return (<div><p>Error loading</p></div>);
                    }
                }
                case "tokens": {
                    let staked_tokens = wallet.stakedTokenBalance() / 10000000000;
                    let unlocked_tokens = wallet.unlockedStakedTokenBalance() / 10000000000;
                    let pending_stake = (staked_tokens - unlocked_tokens);
                    let interval = [0, 0, 0, 0];
                    let interest = [0, 0, 0, 0];

                    try {
                        for (const [i, bit] of this.state.blockchain_interest_history.entries()) {
                            console.log(`bit ${bit}`);
                            interval[i] = bit.interval * 100;
                            interest[i] = bit.cash_per_token / 10000000000;
                        }
                    } catch (err) {
                        console.error(err);
                        console.error(`error at the interval loading of stacking`);
                    }
                    return (
                        <div className="wallet no-gutters flex-column border-bottom border-white b-r10 oflow-y-scroll">

                            <h1 className="text-center m-2"> Token Management </h1>

                            <hr class="border border-light w-100"></hr>

                            <div className="d-flex justify-content-around" >

                                <div className="token-box p-2 font-size-small">
                                    <h3> Send Tokens </h3>

                                    <hr class="border border-light w-100"></hr>

                                    <ul>
                                        <Col>
                                            <li id="wallet-balance">{this.state.tokens.toLocaleString()} SFT</li>
                                            {this.state.pending_tokens > 0 ?
                                            (<li className="border border-warning p-1">{this.state.pending_tokens.toLocaleString()} SFT Pending</li>) : ''}
                                        </Col>
                                            {/*
                                            this.state.pending_tokens > 0 ?
                                                ( <li>{this.state.tokens.toLocaleString() + this.state.pending_tokens.toLocaleString()} NET</li>) : ''
                                            */}
                                    </ul>

                                    <hr class="border border-light w-100"></hr>

                                    <Form id="send_token" onSubmit={this.token_send}>
                                        Destination Address <Form.Control name="destination"
                                                                        defaultValue="Safex5..."
                                                                        placedholder="the destination address"/>
                                        Amount (SFT)<Form.Control name="amount" defaultValue="0"
                                                                placedholder="the amount to send"/>
                                        <Form.Group>
                                            <Form.Label>
                                                Mixins
                                                <IconContext.Provider  value={{color: 'white', size: '20px'}}>
                                                    <FaInfoCircle data-tip data-for='mixinTokenSendInfo' className="blockchain-icon ml-8 white-text"/>
                                                    
                                                    <ReactTooltip id='mixinTokenSendInfo' type='info' effect='solid'>
                                                        <span>
                                                            Mixins are transactions that have also been sent on the Safex blockchain.<br/> 
                                                            They are combined with yours for private transactions.<br/>
                                                            Changing this from the default could hurt your privacy.<br/>
                                                        </span><br/>
                                                    </ReactTooltip>
                                                </IconContext.Provider>
                                            </Form.Label>
                                            <Form.Control 
                                                name="mixins" 
                                                as="select"
                                                defaultValue="7"
                                            >
                                                <option>1</option>
                                                <option>2</option>
                                                <option>3</option>
                                                <option>4</option>
                                                <option>5</option>
                                                <option>6</option>
                                                <option>7</option>
                                            </Form.Control>
                                        </Form.Group>
                                        <Button className="mt-2" type="submit" variant="warning" size="lg" block>
                                            Send Tokens
                                        </Button>
                                    </Form>
                                </div>

                                <div className="vl"></div>

                                <Col sm={8} className="no-gutters pt-3 b-r10 opaque-black">
                                    
                                    <div className="staking-table mt-2 border rounded border-white grey-back">
                                        <h2 className="text-center "> Stakes </h2>

                                        <Table color="white"
                                            className="white-text border border-white b-r10 light-blue-back ">
                                            <thead className="opaque-black">
                                            <tr>
                                                <th>TXID</th>
                                                <th>Amount (SFT)</th>
                                                <th>Interest (SFX)</th>
                                                <th>Block</th>

                                            </tr>
                                            </thead>
                                            <tbody>

                                            </tbody>
                                        </Table>
                                    </div>

                                    <div className="staking-box border border-light rounded  my-3">

                                    <div className="token-box grey-back p-2 font-size-small">

                                        <h3 className="text-center m-2"> Stake Tokens </h3>

                                        <Form id="stake_tokens" onSubmit={this.make_token_stake}>
                                            Amount (SFT)<Form.Control name="amount" defaultValue="0"
                                                                    placedholder="The amount to stake"/>
                                            <Form.Group>
                                                <Form.Label>
                                                    Mixins
                                                    <IconContext.Provider  value={{color: 'white', size: '20px'}}>
                                                        <FaInfoCircle data-tip data-for='apiInfo' className="blockchain-icon ml-8 white-text"/>
                                                        
                                                        <ReactTooltip id='apiInfo' type='info' effect='solid'>
                                                            <span>
                                                                Mixins are transactions that have also been sent on the Safex blockchain. <br/>
                                                                They are combined with yours for private transactions. <br/>
                                                                Changing this from the default could hurt your privacy. <br/>
                                                            </span>
                                                        </ReactTooltip>
                                                    </IconContext.Provider>
                                                </Form.Label>
                                                <Form.Control 
                                                name="mixins" 
                                                as="select"
                                                defaultValue="7"
                                                >
                                                    <option>1</option>
                                                    <option>2</option>
                                                    <option>3</option>
                                                    <option>4</option>
                                                    <option>5</option>
                                                    <option>6</option>
                                                    <option>7</option>
                                                </Form.Control>
                                            </Form.Group>
                                            <Button className="mt-2" type="submit" variant="warning" size="lg" block>
                                                Stake Tokens
                                            </Button>
                                        </Form>
                                    </div>
                                    <div className="height-fit-content align-self-center b-r10 opaque-black">
                                        <Table className="border border-light">
                                            <thead>
                                            <tr>
                                                <th>Status</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            <tr>
                                                <td>
                                                    <li>{this.state.cash.toLocaleString()} SFX</li>
                                                    {this.state.pending_cash > 0 ?
                                                        (<li>{this.state.pending_cash.toLocaleString()} SFX Pending</li>) : ''}
                                                    {/*
                                                    this.state.pending_cash > 0 ?
                                                        (
                                                            <li>{this.state.cash.toLocaleString() + this.state.pending_cash.toLocaleString()} NET</li>) : ''
                                                        */}
                                                </td>
                                            </tr>

                                            <tr>
                                                <td>
                                                    <li>{this.state.tokens.toLocaleString()} SFT</li>
                                                    {this.state.pending_tokens > 0 ?
                                                        (<li>{this.state.pending_tokens.toLocaleString()} SFT Pending</li>) : ''}
                                                    {this.state.pending_tokens > 0 ?
                                                        (
                                                            <li>{this.state.tokens.toLocaleString() + this.state.pending_tokens.toLocaleString()} NET</li>) : ''}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <li>Total Staked Tokens: {this.state.blockchain_tokens_staked.toLocaleString()}</li>
                                                </td>
                                            </tr>

                                            <tr>
                                                <td>
                                                    <li>Your Total Staked Tokens: {unlocked_tokens.toLocaleString()} {pending_stake > 0 ? (
                                                        <span>| {pending_stake.toLocaleString()} Pending</span>) : ''}</li>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <li>Current Block: {this.state.blockchain_height.toLocaleString()}</li>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <li>Next Payout: {100 - (this.state.blockchain_height % 100)} Blocks
                                                    </li>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <li>
                                                        Interest
                                                        Accrued: {this.state.blockchain_current_interest.cash_per_token / 10000000000} SFX
                                                        per token
                                                    </li>
                                                </td>
                                            </tr>
                                            </tbody>
                                            <tfoot>
                                            <tr>
                                                <td>
                                                    <li>Block Interval {interval[0] * 10} : {interest[0]} SFX per token</li>
                                                </td>
                                            </tr>
                                            </tfoot>
                                        </Table>
                                    </div>

                                    <div className="token-box p-2 grey-back font-size-small">

                                        <h3 className="text-center m-2"> Unstake Tokens </h3>

                                        <select className="opaque-black" id="stakes">
                                            <option value="">Choose Stake ID</option>
                                        </select>

                                        <Form id="unstake_tokens" onSubmit={this.make_token_unstake}>

                                            Amount (SFT) (MAX: {unlocked_tokens.toLocaleString()})<Form.Control name="amount"
                                                                                            defaultValue="0"
                                                                                            placedholder="the amount to send"/>
                                            <Form.Group>
                                                <Form.Label>
                                                    Mixins
                                                    <IconContext.Provider  value={{color: 'white', size: '20px'}}>
                                                        <FaInfoCircle data-tip data-for='apiInfo' className="blockchain-icon ml-8 white-text"/>
                                                        
                                                        <ReactTooltip id='apiInfo' type='info' effect='solid'>
                                                            <span>
                                                                Mixins are transactions that have also been sent on the Safex blockchain. <br/>
                                                                They are combined with yours for private transactions. <br/>
                                                                Changing this from the default could hurt your privacy. <br/>
                                                            </span>
                                                        </ReactTooltip>
                                                    </IconContext.Provider>
                                                </Form.Label>
                                                <Form.Control 
                                                name="mixins" 
                                                as="select"
                                                defaultValue="7"
                                                >
                                                    <option>1</option>
                                                    <option>2</option>
                                                    <option>3</option>
                                                    <option>4</option>
                                                    <option>5</option>
                                                    <option>6</option>
                                                    <option>7</option>
                                                </Form.Control>
                                            </Form.Group>
                                            <Button className="mt-2" type="submit" variant="danger" size="lg" block>
                                                Unstake and Collect
                                            </Button>
                                        </Form>

                                    </div>
                                </div>

                                </Col>

                            </div>    

                        </div>
                    );
                }
                case "settings":
                    return (
                        <div></div>
                    );

                default:
                    return <h1>Major Error</h1>
            }
        };

        return (
            <Container className="height100 justify-content-between whtie-text" fluid>
                {this.state.interface_view === "market" ? "" :
                    <Container 
                        fluid
                        id="header"
                        className="no-gutters my-5 p-2 border border-light b-r10 opaque-black"
                    >

                        <Row className="justify-content-between align-items-center">

                            <Col sm={2} className="p-1 align-self-center b-r10 white-text light-blue-back">

                                <div className="d-flex flex-row justify-content-center align-items-end">
                                    <IconContext.Provider value={{color: 'white', size: '20px'}}>
                                        <div className="white-text">
                                            <GrCubes className="blockchain-icon m-1 white-text"/>
                                        </div>
                                    </IconContext.Provider>
                                    <p className="mb-2"><b>{this.state.blockchain_height.toLocaleString()}</b></p>
                                </div>

                                {this.state.wallet_height < this.state.blockchain_height ?
                                    (<p className="mb-2">
                                        {this.state.wallet_height} / {this.state.blockchain_height}
                                    </p>) : ''}
                                <p className="mb-2 text-align-center">{this.state.connection_status}</p>

                            </Col>

                            {/*<div className="menu-logo">
                                <Image className=" align-content-center"
                                    src={require("./../../img/sails-logo.png")}/>
                                </div>*/}

                            <Col sm={6} className="menu">
                                <ul className="menu__list">
                                    <li className={this.state.interface_view === 'home'  ? "menu-link-active" : "menu__list-item"} >
                                        <a className="menu__link" href="javascript:void(0)" 
                                        onClick={this.go_home}>Home</a>
                                    </li>
                                    <li className={this.state.interface_view === 'market' ? "menu__list-item menu-link-active" : "menu__list-item"}>
                                        <a className="menu__link" href="javascript:void(0)"
                                        onClick={this.show_market}>Market</a>
                                    </li>
                                    <li className={this.state.interface_view === 'merchant' ? "menu__list-item menu-link-active" : "menu__list-item"}>
                                        <a className="menu__link" href="javascript:void(0)"
                                        onClick={this.show_merchant}>Merchant</a>
                                    </li>
                                    <li className={this.state.interface_view === 'tokens' ? "menu__list-item menu-link-active" : "menu__list-item"}>
                                        <a className="menu__link" href="javascript:void(0)"
                                        onClick={this.show_tokens}>Tokens</a>
                                    </li>


                                </ul>

                            </Col>
                            <div className="d-flex flex-column">
                                <a className="menu__link" href="javascript:void(0)"
                                onClick={this.show_settings}><FaCogs size={20} className="m-3"/></a>


                                <a className="menu__link" href="javascript:void(0)"
                                onClick={this.logout}><GiExitDoor className="m-3"/></a>
                            </div>
                        </Row>


                        <Row
                            className="no-gutters p-2 justify-content-between align-items-center b-r10 white-text">
                            <Col id="balances" sm={3}>
                                <li>
                                    SFX: {this.state.cash.toLocaleString()} {this.state.pending_cash > 0 ? `(${this.state.pending_cash.toLocaleString()} SFX Pending)` : ''}
                                </li>
                                <li className="">
                                    SFT: {this.state.tokens.toLocaleString()} {this.state.pending_tokens > 0 ? `(${this.state.pending_tokens.toLocaleString()} SFT Pending)` : ''}
                                </li>
                            </Col>
                            <Col className="text-align-center" sm={8}>
                                <p>SFX + SFT Public Address:<br/>
                                    <br/>
                                    <b>{this.state.address}</b>                            
                                </p>
                                <Row className="justify-content-center">
                                    
                                    <div id="header-buttons" className="d-flex flex-row" sm={1}>

                                    {this.state.synced === false ? (
                                        <Button variant="warning" onClick={this.check}>
                                            Check
                                        </Button>) : ''}

                                        <Button variant="danger" onClick={this.rescan}>
                                            Hard Rescan
                                        </Button>

                                        <Button variant="primary" onClick={this.handleShow}>
                                            Show Keys
                                        </Button>

                                        <Modal 
                                            className="width100 black-text" 
                                            animation={false}
                                            show={this.state.show_keys}
                                            onHide={this.handleClose}
                                        >
                                            <Modal.Header closeButton>
                                                <Modal.Title>Your Private Keys</Modal.Title>
                                            </Modal.Header>
                                            <Modal.Body>
                                                <ul>
                                                    <li>
                                                        <b>Address:</b> <br/> {this.props.wallet.address()}
                                                    </li>
                                                    <li>
                                                        <b>Secret Spend Key:</b>
                                                        <br/> {this.props.wallet.secretSpendKey()}
                                                    </li>
                                                    <li>
                                                        <b>Secret View Key:</b>
                                                        <br/> {this.props.wallet.secretViewKey()}
                                                    </li>
                                                    <li>
                                                        <b>Mnemonic Seed:</b>
                                                        <br/> {this.props.wallet.seed().toUpperCase()}
                                                    </li>
                                                </ul>
                                            </Modal.Body>
                                            <Modal.Footer>
                                                <Button variant="secondary" onClick={this.handleClose}>
                                                    Close
                                                </Button>
                                            </Modal.Footer>
                                        </Modal>
                                        <Button className="ml-3" onClick={this.copyAddressToClipboard}>
                                            Copy Address
                                        </Button>
                                    </div>
                                </Row>
                            </Col>
                            
                        </Row>
                    </Container>
                }
                 
                    
                

                {twmwallet()}

            </Container>
        );
    }
}

export default withRouter(WalletHome);