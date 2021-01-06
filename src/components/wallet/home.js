import React from 'react';

import {Row, Col, Container, Button, Table, Form, Image, Modal} from 'react-bootstrap';

import {withRouter} from 'react-router-dom';

import Settings from './Settings';

import {normalize_8decimals} from '../../utils/wallet_creation';

import {
    send_cash,
    send_tokens,
    stake_tokens,
    unstake_tokens,
    purchase_offer,
    edit_offer,
    create_offer,
    create_account,
    edit_account
} from "../../utils/wallet_actions";

import keccak256 from 'keccak256';


import {get_staked_tokens, get_interest_map} from '../../utils/safexd_calls';

// Icon Imports
import { FaInfoCircle, FaCopy} from 'react-icons/fa'
import {IconContext} from 'react-icons'
import { CgCloseR } from 'react-icons/cg'

import copy from "copy-to-clipboard"
import ReactTooltip from "react-tooltip";
import ReactModal from 'react-modal';
import Loader from 'react-loader-spinner'
import Fade from 'react-reveal/Fade';

import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"

// Custom Components
import MainHeader from '../customComponents/MainHeader';
import SendSafex from '../customComponents/SendSafex';
import HomeInfo from '../customComponents/HomeInfo';
import HomeCarousel from '../customComponents/HomeCarousel';
import AccountInfo from '../customComponents/AccountInfo';
import Stake from '../customComponents/Stake';
import StakeInfo from '../customComponents/StakeInfo';
import StakingTable from '../customComponents/StakingTable';
import MerchantAccounts from '../customComponents/MerchantAccounts';
import MerchantTabs from '../customComponents/MerchantTabs';
import MerchantOffers from '../customComponents/MerchantOffers';
import MyOrders from '../customComponents/MyOrders';
import OrderTableRow from '../customComponents/OrderTableRow';
import OfferTableRow from '../customComponents/OfferTableRow';

import {
    open_twm_file,
    save_twm_file,
    register_api,
    get_offers_url,
    get_seller_pubkey,
    dispatch_purchase_message,
    merchant_get_messages
} from "../../utils/twm_actions";

import zlib from 'zlib';



const sfxjs = window.require('safex-addressjs');


var wallet;

let offerRows;
let finalMessage = [];

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
            keyRequest: false,
            twm_offers: [],
            non_offers: [],
            api_offers: [],
            api_url: 'http://stageapi.theworldmarketplace.com:17700',
            offer_loading_flag: '',
            selected_user: {}, //merchant element
            show_new_offer_form: false,
            show_new_account_form: false,
            show_purchase_form: false,
            show_edit_offer_form: false,
            show_edit_account_form: false,
            show_purchase_confirm_modal: false,
            blockchain_tokens_staked: 0,
            blockchain_interest_history: [],
            blockchain_current_interest: {},
            twm_file: {},
            show_purchase_offer: {title: '', quantity: 0, offerID: '', seller: ''},
            show_purchase_offer_data: {main_image: false},
            show_edit_offer: {},
            show_orders: false,
            showMyOrders: false,
            new_account_image: require('./../../img/NewAccountPanda.svg'),
            newAccountImage: require('./../../img/NewAccountPanda.svg'),
            accountsImage: require('./../../img/accountsImage.svg'),
            newOfferImage: require('./../../img/newOfferImage.svg'),
            offersImage: require('./../../img/offersImage.svg'),
            merchantTabs: 'accounts',
            showLoader: false,
            nft_switch: false,
            shipping_switch: false,
            open_message_switch: false,
            showMessages: false,
            currentMessage: {},
            offersLoaded: false,
        };
    }

    async componentWillUnmount() {

        wallet.store(this.wallet_store_callback);
        localStorage.removeItem('twm_file');
        localStorage.removeItem('encrypted_wallet');
        localStorage.removeItem('wallet');
    };

    async componentDidMount() {
        try {
            console.log(this.props.wallet);
            wallet = this.props.wallet;
            try {
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
            } catch(err) {
                console.error(err);
                console.error(`error at mounting with the twm file`);
            }

            let txnhistory = wallet.history();

            txnhistory.sort(function(a, b) {
                return parseFloat(b.timestamp) - parseFloat(a.timestamp);
            });

            this.setState({
                wallet_height: wallet.blockchainHeight(),
                blockchain_height: wallet.daemonBlockchainHeight(),
                daemon_host: this.props.daemon_host,
                daemon_port: this.props.daemon_port,
                password: this.props.password,
                new_path: this.props.wallet_path,
                txnhistory: txnhistory
            });

            try {
                console.log(`interest mapping`);
                console.log(wallet.getMyInterest());
                console.log(`interest mapping`);
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
                        //this.check();
                    }
                }, 1000);
                this.setState({timer: timer});
                this.setState({synced: false});
            }
            wallet.on('newBlock', (height) => {
                console.log("blockchain updated, height: " + height);
                this.refresh_action();
                this.setState({
                    wallet_height: height
                });
            });
            wallet.on('refreshed', () => {
                this.refresh_action();
            });
            console.log(wallet.synchronized());

            this.setState({loading: false, address: wallet.address(), wallet: wallet});

            var accs = wallet.getSafexAccounts();

            console.log(accs);
            console.log(`accounts`);
            //this.setState({usernames: accs, selected_user: {index: 0, username: accs[0].username}});
        } catch (err) {
            console.error(err);
            console.log("errors on startup");
        }
    };

    refresh_history = async() => {
        let txnhistory = wallet.history();

        txnhistory.sort(function(a, b) {
            return parseFloat(b.timestamp) - parseFloat(a.timestamp);
        });
        this.setState({txnhistory: txnhistory});
    }

    refresh_action = async () => {
        let m_wallet = wallet;
        console.log("refreshing rn");
        try {
            let gst_obj = {};
            gst_obj.interval = 0;
            gst_obj.daemon_host = this.state.daemon_host;
            gst_obj.daemon_port = this.state.daemon_port;
            //let gst = await get_staked_tokens(gst_obj);
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
                console.log(`refresh get`);
                console.log(wallet.getRefreshFromBlockHeight())
                //let gim = await get_interest_map(gim_obj);

                /* this.setState({
                     blockchain_tokens_staked: gst.pairs[0].amount / 10000000000,
                     blockchain_interest_history: gim.interest_per_interval.slice(0, 4),
                     blockchain_current_interest: gim.interest_per_interval[4]
                 });*/
                var accs = wallet.getSafexAccounts();

                this.setState({
                    address: wallet.address(),
                    pending_cash: normalize_8decimals(
                        Math.abs(wallet.balance() - wallet.unlockedBalance())
                    ),
                    synced: wallet.synchronized() ? true : false,
                    wallet_height: wallet.blockchainHeight(),
                    blockchain_height: height,
                    cash: normalize_8decimals(wallet.unlockedBalance()),
                    pending_tokens: normalize_8decimals(wallet.tokenBalance() - wallet.unlockedTokenBalance()),
                    tokens: normalize_8decimals(wallet.unlockedTokenBalance()),
                    first_refresh: true,
                    usernames: accs
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
            //m_wallet.store(this.wallet_store_callback);


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
            wallet.rescanBlockchainAsync();
           /* wallet.on('refreshed', () => {
                console.log();
                this.refresh_action();
            });*/
        }
    };

    wallet_store_callback = async (error, store) => {
        if (error) {
            console.error(error);
            console.error(`error at storing the wallet`);
            //alert(`error at storing the wallet`);
            //alert(error);
        } else {
            console.log("wallet stored callback");

        }
    };

    remove_account = async (e, user) => {


        e.preventDefault();
        let confirm = window.confirm(`Are you sure you want to remove ${user}? 
        You should only do this if you think that the transaction to register the account did not go through. 
        Keep in mind this is IRREVERSABLE!`)
        if (confirm) {
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
        }


    };

    register_account = async (e) => {
        e.preventDefault();

        if (this.state.tokens >= 300 && this.state.first_refresh === true) {
            try {
                let vees = e.target;

                console.log(vees);

                let d_obj = {};
                d_obj.twm_version = 1;
                if (vees.new_account_image.value.length > 0) {
                    d_obj.avatar = vees.new_account_image.value;
                } else {
                    d_obj.avatar = this.state.newAccountsImage;
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
                    this.setState({create_account_txn_account: this_account});

                    let create_acc = await this.create_account_async(wallet, e.target.username.value, mixins);
                    let confirmed_fee = window.confirm(`the network fee to register this account ${this.state.create_account_txn_account.username} will be:  ${create_acc.fee() / 10000000000} SFX Safex Cash`);
                    let fee = create_acc.fee();
                    let txid = create_acc.transactionsIds();
                    if (confirmed_fee) {

                        this.setState({create_account_txn_id: txid, create_account_txn_fee: fee});
                        console.log(this.state.create_account_txn_id);
                        console.log(this.state.create_account_txn_fee);
                        console.log(`before the crash`);
                        let commit_create = await this.commit_create_account_async(create_acc);
                        console.log(commit_create);

                    } else {
                        alert(`your transaction was cancelled, no account registration was completed`);
                    }

                } else {
                    alert(`Not enough tokens for making an account`);
                }

            } catch (err) {
                console.error(err);
                console.error("error at the register account function");
            }
        } else {
            alert(`please wait until the wallet has fully loaded before performing registration actions`)
        }
    };
    create_account_async = async (wallet, username, mixins) => {
        return new Promise((resolve, reject) => {
            try {
                create_account(wallet, username, mixins, (err, res) => {
                    if (err) {

                        console.error(err);
                        console.error(`error at the register first callback`);
                        alert(`error at the register first callback`);
                        alert(err);
                        reject(err);
                    } else {
                        resolve(res);
                    }
                });
            } catch (err) {
                reject(err);
            }
        });
    };

    commit_create_account_async = async (txn) => {
        return new Promise((resolve, reject) => {
            try {
                txn.commit(async (err, res) => {
                    if (err) {

                        console.error(err);
                        console.error(`error at the create account commit callback`);
                        alert(`error at the create account commit callback`);
                        alert(err);
                        reject(err);
                    } else {
                        let twm_file = this.state.twm_file;
                        console.log(twm_file.accounts);
                        console.log(`before`);
                        let this_account = this.state.create_account_txn_account;

                        twm_file.accounts[this_account.username] = {};
                        twm_file.accounts[this_account.username].username = this.state.create_account_txn_account.username;
                        twm_file.accounts[this_account.username].data = this.state.create_account_txn_account.data;
                        twm_file.accounts[this_account.username].safex_public_key = this.state.create_account_txn_account.publicKey;
                        twm_file.accounts[this_account.username].safex_private_key = this.state.create_account_txn_account.privateKey;
                        twm_file.accounts[this_account.username].urls = {};

                        console.log(`before`);
                        console.log(twm_file.accounts);
                        console.log(`after`);

                        try {

                            const crypto = window.require('crypto');
                            const algorithm = 'aes-256-ctr';
                            console.log(this.state.password);
                            const cipher = crypto.createCipher(algorithm, this.state.password.toString());
                            let crypted = cipher.update(JSON.stringify(twm_file), 'utf8', 'hex');
                            crypted += cipher.final('hex');

                            const hash1 = crypto.createHash('sha256');
                            hash1.update(JSON.stringify(twm_file));
                            console.log(`password ${this.state.password}`);
                            console.log(JSON.stringify(twm_file));

                            let twm_save = await save_twm_file(this.state.new_path + '.twm', crypted, this.state.password, hash1.digest('hex'));

                            try {

                                let opened_twm_file = await open_twm_file(this.state.new_path + '.twm', this.state.password);
                                console.log(opened_twm_file);

                                localStorage.setItem('twm_file', JSON.stringify(opened_twm_file.contents));

                                console.log("committed transaction");


                                alert(`Transaction successfully submitted. 
                        Transaction ID: ${this.state.create_account_txn_id}
                        1000 Safex Tokens will be locked for 22,000 blocks
                        Fee: ${this.state.create_account_txn_fee / 10000000000} SFX`);
                                localStorage.setItem('twm_file', twm_file);

                                this.setState({twm_file: twm_file});



                            } catch (err) {
                                console.error(err);
                                console.error(`error opening twm file after save to verify`);
                                alert(`error at saving to the twm file during account creation verification stage`);
                            }
                            console.log(twm_save);

                        } catch (err) {
                            console.error(err);
                            console.error(`error at initial save of the twm file`);
                            alert(`error at saving to the twm file during account creation initialization stage`);
                        }
                        resolve(res);
                    }
                });
            } catch (err) {
                reject(err);
            }
        });
    };


    make_account_edit = async (e) => {
        e.persist();
        e.preventDefault();
        try {

            let d_obj = {};
            d_obj.twm_version = 1;
            if (e.target.new_account_image.value.length > 0) {
                d_obj.avatar = e.target.new_account_image.value;
            }
            if (e.target.twitter.value.length > 0) {
                d_obj.twitter = e.target.twitter.value;
            }
            if (e.target.facebook.value.length > 0) {
                d_obj.facebook = e.target.facebook.value;
            }
            if (e.target.linkedin.value.length > 0) {
                d_obj.linkedin = e.target.linkedin.value;
            }
            if (e.target.email.value.length > 0) {
                d_obj.email_address = e.target.email.value;
            }
            if (e.target.biography.value.length > 0) {
                d_obj.biography = e.target.biography.value;
            }
            if (e.target.website.value.length > 0) {
                d_obj.website = e.target.website.value;
            }
            if (e.target.location.value.length > 0) {
                d_obj.location = e.target.location.value;
            }
           /* let account = wallet.createSafexAccount(e.target.username.value, JSON.stringify(d_obj));
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
                this.setState({create_account_txn_account: this_account});

                let create_acc = await this.create_account_async(wallet, e.target.username.value, mixins);
                let confirmed_fee = window.confirm(`the network fee to register this account ${this.state.create_account_txn_account.username} will be:  ${create_acc.fee() / 10000000000} SFX Safex Cash`);
                let fee = create_acc.fee();
                let txid = create_acc.transactionsIds();
                if (confirmed_fee) {

                    this.setState({create_account_txn_id: txid, create_account_txn_fee: fee});
                    console.log(this.state.create_account_txn_id);
                    console.log(this.state.create_account_txn_fee);
                    console.log(`before the crash`);
                    let commit_create = await this.commit_create_account_async(create_acc);
                    console.log(commit_create);

                } else {
                    alert(`your transaction was cancelled, no account registration was completed`);
                }

            } else {
                alert(`Not enough tokens for making an account`);
            }
*/
        } catch (err) {
            console.error(err);
            console.error("error at the register account function");
        }

    };

    edit_account_first_callback = async (error, edit_account_txn) => {
        if (error) {
            console.error(error);
            console.error(`error at edit account first callback`);
        } else {

        }
    };

    handleChange = (event) => {
        if (event.target.name === 'main_image') {
            this.setState({new_offer_image: event.target.value});
        } else {
            this.setState({[event.target.name]: event.target.value});
        }
    };


    //basic send transactions
    token_send = async (e) => {
        e.preventDefault();
        e.persist();
        try {
            let mixins = e.target.mixins.value - 1;
            if (mixins >= 0) {
                let confirmed = window.confirm(`Are you sure you want to send ${e.target.amount.value} SFT (Safex Tokens), to ${e.target.destination.value}`);
                console.log(confirmed);
                if (confirmed) {
                    try {
                        this.setState({
                            token_txn_amount: e.target.amount.value,
                            token_txn_destination: e.target.destination.value.trim()
                        });

                        let token_send = await this.send_tokens_async(wallet, e.target.destination.value.trim(), e.target.amount.value, mixins);
                        try {
                            let confirmed_fee = window.confirm(`the fee to send this token transaction will be:  ${token_send.fee() / 10000000000} SFX Safex Cash
             sending ${this.state.token_txn_amount} SFT to ${this.state.token_txn_destination}`);
                            let fee = token_send.fee();
                            let txid = token_send.transactionsIds();
                            let amount = this.state.token_txn_amount;
                            if (confirmed_fee) {
                                try {
                                    this.setState({token_txn_id: txid, token_txn_fee: fee});
                                    let commit_tokens = await this.commit_token_send_txn_async(token_send);
                                    console.log(`token sent`);
                                } catch (err) {
                                    console.error(err);
                                    console.error(`error when trying to commit the token transaction to the blockchain`);
                                    alert(`Error when trying to commit the token transaction to the blockchain`);
                                }
                            } else {
                                console.log(`token transaction cancelled`);
                            }
                        } catch (err) {
                            console.error(err);
                            console.error(`error at stepping into confirming the transaction`)
                        }
                    } catch (err) {
                        console.error(err);
                        console.error(`error at the token transaction formation it was not committed`);
                        alert(`Error at the token transaction formation it was not committed`);
                    }
                }
            }
        } catch (err) {
            console.error(err);
            if (err.toString().startsWith('not enough outputs')) {
                alert(`Choose fewer mixins`);
            }
            console.error(`error at the token transaction`);
        }
    };

    send_tokens_async = async (wallet, destination, amount, mixins) => {
        return new Promise((resolve, reject) => {
            try {
                send_tokens(wallet, destination, amount, mixins, (err, res) => {
                    if (err) {
                        console.error(err);
                        console.error(`error at the token transaction send`);
                        alert(`Error at the token transaction send`);
                        alert(err);
                        reject(err);
                    } else {
                        resolve(res);
                    }
                });
            } catch (err) {
                reject(err);
            }
        });
    };

    commit_token_send_txn_async = (txn) => {
        return new Promise((resolve, reject) => {
            try {
                txn.commit((err, res) => {
                    if (err) {
                        console.error(err);
                        console.error(`error when trying to commit the token transaction to the blockchain`);
                        alert(`error when trying to commit the token transaction to the blockchain`);
                        alert(err);
                        reject(err);
                    } else {
                        alert(`Token transaction successfully submitted 
                                        Transaction id: ${this.state.token_txn_id}
                                        Amount: ${this.state.token_txn_amount} SFT
                                        Fee: ${this.state.token_txn_fee / 10000000000} SFX`);
                        resolve(res);
                    }
                });
            } catch (err) {
                reject(err);
            }
        });
    };

    cash_send = async (e) => {
        e.preventDefault();
        e.persist();
        try {
            let mixins = e.target.mixins.value - 1;
            if (mixins >= 0) {
                let confirmed = window.confirm(`Are you sure you want to send ${e.target.amount.value} SFX (Safex Cash), ` +
                    `to ${e.target.destination.value}`);
                console.log(confirmed);
                if (confirmed) {
                    try {
                        this.setState({
                            cash_txn_amount: e.target.amount.value,
                            cash_txn_destination: e.target.destination.value.trim()
                        });
                        let s_cash = await this.send_cash_async(wallet, e.target.destination.value.trim(), e.target.amount.value, mixins);
                        console.log(s_cash);
                        let confirmed_fee = window.confirm(`The fee to send this transaction will be:  ${s_cash.fee() / 10000000000} SFX (Safex Cash) 
            sending ${this.state.cash_txn_amount} SFX to ${this.state.cash_txn_destination}`);
                        let fee = s_cash.fee();
                        let txid = s_cash.transactionsIds();
                        if (confirmed_fee) {
                            try {
                                this.setState({cash_txn_fee: fee, cash_txn_id: txid});
                                let final = await this.commit_cash_send_txn_async(s_cash);
                                console.log(final);
                                console.log(`final`);
                            } catch (err) {
                                console.error(err);
                                console.error(`Error at committing the cash transaction to the blockchain network.`);
                                alert(`Error at committing the cash transaction to the blockchain network.`);
                            }
                        } else {
                            alert(`The cash transaction was cancelled.`)
                        }
                    } catch (err) {
                        console.error(err);
                        console.error(`Error at the cash transaction formation it was not committed`);
                        alert(`Error at the cash transaction formation it was not committed`);
                    }
                }
            }
        } catch (err) {
            console.error(err);
            if (err.toString().startsWith('ot enough outputs')) {
                alert(`Choose fewer mixins`);
            }
            console.error(`error at the cash transaction`);
        }
    };

    //SFXszkSYo4oH3iURSzYMxfaZkU8GFd3JHSRgoSrqkDUMMHNsv3iP6gGCAAerXJpUwtE18coAdnDY9WCWRkv27p5tKYcQgyrMxJT
    send_cash_async = async (wallet, destination, amount, mixins) => {
        return new Promise((resolve, reject) => {
            try {
                send_cash(wallet, destination, amount, mixins, (err, res) => {
                    if (err) {
                        console.error(err);
                        console.error(`error at the cash send transaction`);
                        alert(`error at the the cash send transaction`);
                        alert(err);
                        reject(err);
                    } else {
                        resolve(res);
                    }
                });
            } catch (err) {
                reject(err);
            }
        });
    };

    commit_cash_send_txn_async = (txn) => {
        return new Promise((resolve, reject) => {
            try {
                txn.commit((err, res) => {
                    if (err) {
                        console.error(err);
                        console.error(`error at committing the cash transaction`);
                        alert(`error at the cash transaction`);
                        alert(err);
                        reject(err);
                    } else {
                        alert(`cash transaction successfully submitted 
                                        transaction id: ${this.state.cash_txn_id}
                                        amount: ${this.state.cash_txn_amount}
                                        fee: ${this.state.cash_txn_fee / 10000000000}`);
                        resolve(res);
                    }
                });
            } catch (err) {
                reject(err);
            }
        });
    };

    load_offers_from_api = async (e) => {
        e.preventDefault();

        //call the api here and load up the offers into the api_offers array.
        try {
            console.log(this.state.api_url);
            let loaded_offers = await get_offers_url(this.state.api_url);
            console.log(loaded_offers);
            this.setState({
                twm_url_offers: loaded_offers.offers,
                offer_loading_flag: 'twmurl'
            })

        } catch(err) {
            console.error(err);
        }


    };

    load_offers_from_blockchain = async (e) => {
        this.show_loading();

        setTimeout(() => {

            var offrs = wallet.listSafexOffers(true);
            let twm_offers = [];

            for (var i in offrs) {
                try {
                    let offer_description = JSON.parse(offrs[i].description);
                    if (offer_description.twm_version > 0) {
                        offrs[i].descprition = offer_description;
                        offrs[i].price = offrs[i].price / 10000000000;
                        twm_offers.push(offrs[i]);

                    }

                } catch (err) {
                    console.error(`error at parsing json from description`);
                    console.error(err);
                }
            }

            console.log(twm_offers);
            this.setState({
                twm_offers: twm_offers,
                interface_view: 'market',
                offer_loading_flag: 'blockchaintwmoffers',
                offersLoaded: true,

            });
        }, 500);
    };


    handle_change_api_fetch_url = (e) => {

        e.preventDefault();
        this.setState({api_url: e.target.value});
    };


    //view shifting
    go_home = () => {
        this.setState({interface_view: 'home', keyRequest: false});

    };

    //Show loading screen
    show_loading = () => {
        this.setState({interface_view: 'loading', keyRequest: false})
    };

    //open market view from navigation
    show_market = () => {
        this.show_loading();

        setTimeout(() => {

            this.setState({
                interface_view: 'market',
                keyRequest: false
            });
        }, 500);
    };

    //open merchant management view from navigation
    show_merchant = () => {

        this.show_loading()

        this.setState({keyRequest: false})

        setTimeout(() => {

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
        }, 500);
    };

    //open staking view from navigation
    show_tokens = () => {
        this.setState({interface_view: 'tokens', keyRequest: false})
    };

    //open settings view from navigation
    show_settings = () => {
        this.setState({interface_view: 'settings', keyRequest: false})
    };

    logout = () => {
        wallet.close(true, this.logout_callback);
    };

    logout_callback = async (error, out) => {
        if (error) {
            console.error(error);
            console.error(`error at logging out`);
            alert(`Error logging out`);
            alert(error);
        } else {
            alert(`Until next time :)`);
            console.log("wallet closed");
            this.props.history.push({pathname: '/'});
        }
    };

    //show modal of private keys
    handleKeys = () => {
        this.setState({show_keys: !this.state.show_keys});
        if (this.state.show_keys === false) {
            this.setState({keyRequest: true})
        }
    };

    //close modal of New Offer
    handleCloseNewOfferForm = () => {
        this.setState({show_new_offer_form: false});
    };

    //show modal of New Offer
    handleShowNewOfferForm = () => {
        this.setState({show_new_offer_form: true, nft_switch: false, shipping_switch: false, open_message_switch: false});
    };

    //close modal of Purchase Form
    handleClosePurchaseForm = () => {
        this.setState({show_purchase_form: false});

    };

    //show modal of Purchase Form
    handleShowPurchaseForm = (listing, data) => {
        //here we need to fetch the pub keys of the seller.
        this.setState({show_purchase_form: true, show_purchase_offer: listing, show_purchase_offer_data: data});
    };

    // Show order confirmed modal

     handleConfirmationModal = () => {
        this.setState({show_purchase_confirm_modal: !this.state.show_purchase_confirm_modal});
    };

    //show modal of new account
    handleNewAccountForm = () => {
        this.setState({show_new_account_form: !this.state.show_new_account_form});
    };

    //show modal of Edit Account Form
    handleEditAccountForm = (account) => {
        this.setState({show_edit_account_form: !this.state.show_edit_account_form, show_edit_account: account});
    };

    //close modal of Edit Account Form
    handleCloseEditAccountForm = () => {
        this.setState({show_edit_account_form: false});
    };

    //show modal of Edit Offer Form
    handleShowEditOfferForm = (listing) => {

        let nft_state = false;
        let shipping_state = false;
        let open_message_state = false;
        try {
            let p_data = JSON.parse(listing.description);
            console.log(p_data);
            if (p_data.hasOwnProperty('nft')) {
                nft_state = p_data.nft;
                console.log(nft_state);
            }
            if (p_data.hasOwnProperty('open_message')) {
                open_message_state = p_data.open_message;
            }
            if (p_data.hasOwnProperty('shipping')) {
                shipping_state = p_data.shipping;
            }
            console.log(p_data.hasOwnProperty('nft'));
        } catch(err) {
            console.error(err);
            console.error(`error at the loading of listing data`);
        }
        console.log(listing.description);

        this.setState({
            show_edit_offer_form: true,
            show_edit_offer: listing,
            nft_switch: nft_state,
            open_message_switch: open_message_state,
            shipping_switch: shipping_state
        });
    };

    //close modal of Edit Offer Form
    handleCloseEditOfferForm = () => {
        this.setState({show_edit_offer_form: false});
    };

    //merchant
    load_offers = (username, index) => {
        this.setState({selected_user: {username: username, index: index}});
        this.fetch_messages_seller(username, 'http://stageapi.theworldmarketplace.com:17700');
        console.log(username);
        console.log(index);
    };

    list_new_offer = async (e) => {
        e.preventDefault();
        e.persist();
        console.log(`let's list the offer it`);
        let vees = e.target;

        let o_obj = {};
        o_obj.twm_version = 1;

        if (vees.description.value.length > 0) {
            o_obj.description = vees.description.value;
        }
        if (vees.new_account_image.value.length > 0) {
            o_obj.main_image = vees.new_account_image.value;
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
        if (vees.physical.value.length > 0) {
            o_obj.physical = vees.physical.value;
        }

        o_obj.shipping = this.state.shipping_switch;
        o_obj.nft = this.state.nft_switch;
        o_obj.open_message = this.state.open_message_switch;

        try {
            let mixins = e.target.mixins.value - 1;
            this.setState({create_offer_txn_title: e.target.title.value});
            let create_offer_tx = await this.list_offer_async(wallet,
                e.target.username.value,
                e.target.title.value,
                e.target.price.value,
                e.target.quantity.value,
                JSON.stringify(o_obj),
                mixins);
            console.log(create_offer_tx);
            let confirmed_fee = window.confirm(`The fee will be:  ${create_offer_tx.fee() / 10000000000} SFX
            to list ${this.state.create_offer_txn_title.toUpperCase()}. Clicking OK will confirm this transaction`);
            let fee = create_offer_tx.fee();
            let txid = create_offer_tx.transactionsIds();
            if (confirmed_fee) {
                this.setState({create_offer_txn_fee: fee, create_offer_txn_id: txid});
                try {
                    let commit_create_offer = await this.commit_list_offer_txn_async(create_offer_tx);
                    alert(`your new offer ${this.state.create_offer_txn_title} has been successfully committed`);
                } catch (error) {
                    console.error(error);
                    console.error(`error at committing the offer listing`);
                    alert(`there was an error committing the new offer`);
                }
            } else {
                alert(`Your transaction was cancelled, the listing for ${this.state.create_offer_txn_title.toUpperCase()} was cancelled`);
                this.setState({create_offer_txn_title: '', create_offer_txn_id: '', create_offer_txn_fee: 0})
            }
        } catch (err) {
            console.error(err);
            console.error("Error at listing the offer.");
        }
    };


    change_shipping_switch = () => {
        this.setState({shipping_switch: !this.state.shipping_switch});
    };

    change_nft_switch = () => {
        this.setState({nft_switch: !this.state.nft_switch});
    };
    
    change_open_message_switch = () => {
        this.setState({open_message_switch: !this.state.open_message_switch});
    };

    list_offer_async = async (wallet, username, title, price, quantity, data, mixins) => {
        return new Promise((resolve, reject) => {
            try {
                create_offer(wallet, username, title, price, quantity, data, mixins, (err, res) => {
                    if (err) {
                        console.error(err);
                        console.error(`Error at first callback create new offer transaction`);
                        alert(`Error at first call back create new offer transaction`);
                        alert(err);
                        reject(err);
                    } else {
                        resolve(res);
                    }
                });
            } catch (err) {
                reject(err);
            }
        });
    };

    commit_list_offer_txn_async = (txn) => {
        return new Promise((resolve, reject) => {
            try {
                txn.commit((err, res) => {
                    if (err) {
                        this.setState({create_offer_txn_title: '', create_offer_txn_id: '', create_offer_txn_fee: 0})
                        console.error(err);
                        console.error(`Error at commit callback create new offer transaction`);
                        alert(`Error at commit call back create new offer transaction`);
                        alert(err);
                        reject(err);
                    } else {
                        console.log("committed create offer transaction");
                        alert(`Transaction listing ${this.state.create_offer_txn_title.toUpperCase()} successfully submitted.  
                        Transaction ID: ${this.state.create_offer_txn_id}
                        Fee: ${this.state.create_offer_txn_fee / 10000000000} SFX`);

                        this.handleCloseNewOfferForm();
                        resolve(res);
                    }
                });
            } catch (err) {
                reject(err);
            }
        });
    };

    make_token_stake = async (e) => {
        e.preventDefault();
        e.persist();
        console.log(e.target);
        try {
            let mixins = e.target.mixins.value - 1;
            if (mixins >= 0) {
                let confirmed = window.confirm(`Are you sure you want to stake ${e.target.amount.value} SFT Safex Tokens?`);
                console.log(confirmed);
                if (confirmed) {
                    try {
                        this.setState({stake_txn_amount: e.target.amount.value});

                        let staked_token = await this.token_stake_async(wallet, e.target.amount.value, mixins);
                        let confirmed_fee = window.confirm(`The network fee to stake ${this.state.stake_txn_amount} SFT will be:  ${staked_token.fee() / 10000000000} SFX (Safex Cash)`);
                        let fee = staked_token.fee();
                        let txid = staked_token.transactionsIds();
                        this.setState({stake_txn_id: txid, stake_txn_fee: fee});
                        if (confirmed_fee) {
                            try {
                                let commit_stake = await this.commit_token_stake_txn_async(staked_token);

                            } catch (err) {
                                console.error(err);
                                console.error(`error at the token stake committing`);
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

    token_stake_async = async (wallet, amount, mixins) => {
        return new Promise((resolve, reject) => {
            try {
                stake_tokens(wallet, amount, mixins, (err, res) => {
                    if (err) {
                        console.error(err);
                        console.error(`error at first call back stake token txn`);
                        alert(`error at the first call back stake token txn`);
                        alert(err);
                        reject(err);
                    } else {
                        resolve(res);
                    }
                });
            } catch (err) {
                reject(err);
            }
        });
    };

    commit_token_stake_txn_async = (txn) => {
        return new Promise((resolve, reject) => {
            try {
                txn.commit((err, res) => {
                    if (err) {
                        console.error(err);
                        console.error(`error at committing the stake token transaction`);
                        alert(`error at committing the stake token transaction`);
                        alert(err);
                        reject(err);
                    } else {
                        alert(`token staking transaction successfully submitted 
                                        transaction id: ${this.state.stake_txn_id}
                                        staking ${this.state.stake_txn_amount} SFT
                                        fee: ${this.state.stake_txn_fee / 10000000000} SFX`);

                        this.setState({stake_txn_id: '', stake_txn_fee: 0, stake_txn_amount: 0});
                        resolve(res);
                    }
                });
            } catch (err) {
                reject(err);
            }
        });
    };

    make_token_unstake = async (e) => {
        e.preventDefault();
        e.persist();
        try {
            let mixins = e.target.mixins.value - 1;
            if (mixins >= 0) {
                let confirmed = window.confirm(`Are you sure you want to stake ${e.target.amount.value} SFT Safex Tokens?`);
                console.log(confirmed);
                if (confirmed) {
                    try {
                        this.setState({unstake_txn_amount: e.target.amount.value});
                        let unstaked = await this.token_unstake_async(wallet, e.target.amount.value, mixins);
                        let confirmed_fee = window.confirm(`The network fee to unstake ${this.state.unstake_txn_amount} SFT will be:  ${unstaked.fee() / 10000000000} SFX Safex Cash`);
                        let fee = unstaked.fee();
                        let txid = unstaked.transactionsIds();
                        if (confirmed_fee) {
                            try {
                                this.setState({unstake_txn_id: txid, unstake_txn_fee: fee});
                                let commit_unstake = await this.commit_token_unstake_txn_async(unstaked);

                                console.log(`unstake committed`);

                            } catch (err) {
                                console.error(err);
                                console.error(`Error when trying to commit the token unstaking transaction to the blockchain`);
                                alert(`Error when trying to commit the token unstaking transaction to the blockchain`);
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
            if (err.toString().startsWith('not enoughR outputs')) {
                alert(`choose fewer mixins`);
            }
            console.error(`error at the token unstake transaction`);
        }
    };

    token_unstake_async = async (wallet, amount, mixins) => {
        return new Promise((resolve, reject) => {
            try {
                unstake_tokens(wallet, amount, mixins, (err, res) => {
                    if (err) {
                        console.error(err);
                        console.error(`error at the unstake first callback`);
                        alert(`error at the unstake first callback`);
                        alert(err);
                        reject(err);
                    } else {
                        resolve(res);
                    }
                });
            } catch (err) {
                reject(err);
            }
        });
    };

    commit_token_unstake_txn_async = (txn) => {
        return new Promise((resolve, reject) => {
            try {
                txn.commit((err, res) => {
                    if (err) {
                        console.error(err);
                        console.error(`error at the unstake commit callback`);
                        alert(`error at the unstake commit callback`);
                        alert(err);
                        reject(err);
                    } else {
                        alert(`token unstake transaction committed  
                                        transaction id: ${this.state.unstake_txn_id}
                                        amount: ${this.state.unstake_txn_amount} SFT
                                        fee: ${this.state.unstake_txn_fee / 10000000000} SFX`);
                        resolve(res);
                    }
                });
            } catch (err) {
                reject(err);
            }
        });
    };

    register_twmapi = async (user, twm_api_url = 'http://stageapi.theworldmarketplace.com:17700') => {
        console.log(user);

        //here we contact the api and check if this user is already registered or not.
        //if it is, let's download the data.
        //if it isn't let's generate for this user the pgp keys and pack them sign them and register with the api.

        //edit twm file and save

        try {
            let twm_file = this.state.twm_file;

            if (this.state.twm_file.accounts.hasOwnProperty(user.username)) {
                console.log(twm_file);

                //set the object

                //modify local storage
                //modify state
                //save
                //verify
                console.log(`it has`);
                if (twm_file.accounts[user.username].urls.hasOwnProperty(twm_api_url)) {
                    alert(`this account is already registered with the api`);
                } else {
                    try {
                        const crypto  = window.require('crypto');

                        const { privateKey, publicKey } = await crypto.generateKeyPairSync('rsa', {
                            modulusLength: 4096,
                            publicKeyEncoding: {
                                type: 'pkcs1',
                                format: 'pem'
                            },
                            privateKeyEncoding: {
                                type: 'pkcs8',
                                format: 'pem',
                            }
                        });
                        console.log(publicKey);
                        console.log(privateKey);

                        console.log(`RSA PUB KEY`);

                        let r_obj = {};
                        r_obj.rsa_pub_key = publicKey;
                        r_obj.username = user.username;
                        r_obj.message = 'registerAPI';

                        let signature = sfxjs.sign_message(user.privateKey, JSON.stringify(r_obj), user.publicKey);

                        let f_obj = {};
                        f_obj.username = user.username;
                        f_obj.message = JSON.stringify(r_obj);
                        f_obj.signature = signature;
                        f_obj.pub_key = user.publicKey;
                        let r_obj_string = JSON.stringify(r_obj);
                        console.log(`string length ${r_obj_string.length}`);
                        console.log(r_obj_string);
                        f_obj.msg_hash = sfxjs.cn_fast_hash_safex(r_obj_string, r_obj_string.length);

                        try {
                            let register_msgg = await register_api(twm_api_url, f_obj);
                            console.log(register_msgg)
                            let pgp_obj = {};
                            pgp_obj.pub_key = publicKey;
                            pgp_obj.sec_key = privateKey;
                            twm_file.accounts[user.username].urls[twm_api_url] = {};
                            twm_file.accounts[user.username].urls[twm_api_url].pgp_key = pgp_obj;
                            twm_file.accounts[user.username].urls[twm_api_url].messages = {};

                            const algorithm = 'aes-256-ctr';
                            const cipher = crypto.createCipher(algorithm, this.state.password);
                            let crypted = cipher.update(JSON.stringify(twm_file), 'utf8', 'hex');
                            crypted += cipher.final('hex');

                            const hash1 = crypto.createHash('sha256');
                            hash1.update(JSON.stringify(twm_file));
                            console.log(`password ${this.state.password}`);
                            console.log(JSON.stringify(twm_file));

                            let twm_save = await save_twm_file(this.state.new_path + '.twm', crypted, this.state.password, hash1.digest('hex'));

                            console.log(twm_save);
                            try {

                                let twm_file2 = await open_twm_file(this.state.new_path + '.twm', this.state.password);
                                console.log(twm_file2);


                                localStorage.setItem('twm_file', JSON.stringify(twm_file2.contents));
                                this.setState({twm_file: twm_file2.contents});
                                alert(`you have successfully registered to ${twm_api_url}`);
                            } catch (err) {
                                this.setState({loading: false})
                                console.error(err);
                                console.error(`error opening twm file after save to verify`);
                            }
                            console.log(twm_save);

                            //need to update and save to the twm wallet

                        } catch(err) {
                            console.error(err);
                            console.error(`error at the register_api function`);
                        }

                    } catch (err) {
                        console.error(err);
                    }
                }
            }
        } catch(err) {
            console.error(err);
            console.error(`error at the twm_file at register api`);
        }
    };

    to_ellipsis = (text, firstHalf, secondHalf) => {
        const ellipse = `${text.substring(0, firstHalf)}.....${text.substring(text.length - secondHalf, text.length)}`

        return (ellipse)
    };

    hexStringToByte = (str) => {
        if (!str) {
            return new Uint8Array();
        }

        var a = [];
        for (var i = 0, len = str.length; i < len; i+=2) {
            a.push(parseInt(str.substr(i,2),16));
        }

        return new Uint8Array(a);
    }

    fetch_messages_seller = async (username, twm_api_url = 'http://127.0.0.1:17700') => {
        try {
            //here fetch the messages from the seller

            //form a message, sign it http://stageapi.theworldmarketplace.com:17700

            console.log(this.state.twm_file);
            if (this.state.twm_file.accounts.hasOwnProperty(username)) {
                if (this.state.twm_file.accounts[username].urls.hasOwnProperty(twm_api_url)) {
                    console.log(`it has the twmapi in it's file for the fetch messages_seller`);
                    let date = new Date(new Date().toUTCString());
                    console.log(date);
                    console.log(date.toString());

                    const crypto  = window.require('crypto');
                    let our_key = crypto.createPrivateKey(this.state.twm_file.accounts[username].urls[twm_api_url].pgp_key.sec_key)
                    console.log(our_key);
                    let date_msg = Buffer.from(date.toString());
                    console.log(date_msg);

                    let msg_hex = this.byteToHexString(date_msg);
                   const signature = crypto.sign("sha256", date_msg, {
                        key: our_key,
                        padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
                    });
                   console.log(signature);
                    let verified_sig = crypto.verify(
                        "sha256",
                        date_msg,
                        {
                            key: our_key,
                            padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
                        },
                        signature
                    );
                    console.log(`is verified :::  ${verified_sig}`);
                    let req_payload = {};
                    req_payload.signature = this.byteToHexString(signature);
                    req_payload.username = username;
                    req_payload.msg = date.toString();
                    req_payload.msg_hex = msg_hex;

                    let req_msgs = await merchant_get_messages(req_payload, twm_api_url);
                    console.log(req_msgs.to);
                    console.log(req_msgs.from);


                    for (const order in req_msgs.to) {
                        console.log(req_msgs.to[order]);
                        for (const msg of req_msgs.to[order]) {

                            console.log(msg);
                            console.log(msg.message);
                            try {
                                const decryptedData = crypto.privateDecrypt(
                                    {
                                        key: our_key,
                                        // In order to decrypt the data, we need to specify the
                                        // same hashing function and padding scheme that we used to
                                        // encrypt the data in the previous step
                                        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                                        oaepHash: "sha256",
                                    },
                                    this.hexStringToByte(msg.message)
                                );

                                console.log(decryptedData.toString());
                                let decomped = zlib.inflateSync(Buffer.from(decryptedData));
                                console.log(decomped.toString());

                                finalMessage.push(<h1>{decomped}</h1>)  
                            } catch(err) {
                                console.error(err);
                            }
                        }
                    }
                }
            }
        } catch(err) {
            console.error(err);
            console.error(`error at the fetch_messages_seller`);
        }


    };

    byteToHexString = (uint8arr) => {
        if (!uint8arr) {
            return '';
        }

        var hexStr = '';
        for (var i = 0; i < uint8arr.length; i++) {
            var hex = (uint8arr[i] & 0xff).toString(16);
            hex = (hex.length === 1) ? '0' + hex : hex;
            hexStr += hex;
        }

        return hexStr.toUpperCase();
    }

    purchase_item = async (e, listing) => {
        e.preventDefault();
        e.persist();
        console.log(this.state.show_purchase_offer);

        let quant = e.target.quantity.value;

        var va = e.target;
        let mixins = e.target.mixins.value - 1;
        if (e.target.quantity.value > 0) {

            console.log(listing);
            console.log(e.target.quantity.value);
            console.log(`mixins`);
            console.log(e.target.mixins.value);
            console.log(listing.username);

            let total_cost = quant * (listing.price);
            console.log(`TOTAL COST!!!!!!!!`);
            console.log(total_cost);
            console.log(listing.price);
            console.log(quant);
            console.log(this.state.cash);
            console.log(`listing quant ${listing.quantity}`)

            let alert_bool = false;
            let alert_text = ``;

            if (quant < 1) {
                alert_text += ` quantity can not be 0 or negative :)`;
                alert_bool = true;
            }
            if (quant % 1 !== 0) {
                alert_text += ` quantity must be a whole number :)`;
                alert_bool = true;
            }
            if (Number.parseInt(quant) > listing.quantity) {
                alert_text += ` not enough quantity available: you wanted ${quant} but there are only ${listing.quantity} available`;
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
                    if (mixins >= 0) {
                        let confirmed;

                        //basically first validate the messaging will work out before submitting the transaction.
                        //remember this the TWM API in play if these elements are in play.
                        let confirm_message = '';
                        let open_message = '';
                        let nft_address = '';
                        let shipping = {};

                        confirm_message = `Are you sure you want to purchase ${quant} X ${listing.title} for a total of ${total_cost} SFX?`;

                        confirmed = window.confirm(confirm_message);


                        console.log(confirmed);
                        if (confirmed) {
                            try {
                                console.log(quant);
                                console.log(listing.title);
                                console.log(listing.offer_id);
                                console.log(listing.price);
                                console.log(total_cost);
                                console.log(mixins);
                                this.setState({
                                    purchase_txn_quantity: quant,
                                    purchase_txn_title: listing.title,
                                    purchase_txn_offerid: listing.offer_id,
                                    purchase_txn_price: listing.price,
                                    purchase_txn_total_cost: total_cost,
                                    showLoader: true

                                });

                                let purchase_txn = await this.purchase_offer_async(
                                    wallet,
                                    total_cost,
                                    listing.offer_id,
                                    quant,
                                    mixins
                                );

                                let confirmed_fee = window.confirm(`The fee to send this transaction will be:  ${purchase_txn.fee() / 10000000000}SFX`);
                                let fee = purchase_txn.fee();
                                let txid = purchase_txn.transactionsIds();
                                if (confirmed_fee) {
                                    try {


                                        this.setState({purchase_txn_id: txid, purchase_txn_fee: fee});

                                        if (this.state.offer_loading_flag === 'twmurl') {

                                            try {


                                                if (listing.nft === true) {

                                                    confirm_message += ` sent to eth address ${e.target.eth_address.value}`;
                                                    nft_address = va.eth_address.value;
                                                }
                                                if (listing.shipping === true) {
                                                    //complete confirm message for all fields

                                                    if (va.first_name.value.length > 0) {
                                                        shipping.fn = e.target.first_name.value;
                                                    } else {
                                                        //figure out how to break out of this channel
                                                    }
                                                    if (va.last_name.value.length > 0) {
                                                        shipping.ln = e.target.last_name.value;
                                                    } else {
                                                        //figure out how to break out of this channel
                                                    }
                                                    if (va.address1.value.length > 0) {
                                                        shipping.a1 = e.target.address1.value;
                                                    } else {
                                                        //figure out how to break out of this channel
                                                    }
                                                    if (va.address2.value.length > 0) {
                                                        shipping.a2 = e.target.address2.value;
                                                    } else {
                                                        //figure out how to break out of this channel
                                                    }
                                                    if (va.city.value.length > 0) {
                                                        shipping.city = e.target.city.value;
                                                    } else {
                                                        //figure out how to break out of this channel
                                                    }
                                                    if (va.state.value.length > 0) {
                                                        shipping.s = e.target.state.value;
                                                    } else {
                                                        //figure out how to break out of this channel
                                                    }
                                                    if (va.zipcode.value.length > 0) {
                                                        shipping.z = e.target.zipcode.value;
                                                    } else {
                                                        //figure out how to break out of this channel
                                                    }
                                                    if (va.country.value.length > 0) {
                                                        shipping.c = e.target.country.value;
                                                    } else {
                                                        //figure out how to break out of this channel
                                                    }
                                                    if (va.email_address.value.length > 0) {
                                                        shipping.ea = e.target.email_address.value;
                                                    } else {
                                                        //figure out how to break out of this channel
                                                    }
                                                    if (va.phone_number.value.length > 0) {
                                                        shipping.ph = e.target.phone_number.value;
                                                    } else {
                                                        //figure out how to break out of this channel
                                                    }

                                                    confirm_message += ` delivered physical property to ${e.target.first_name.value}`;
                                                }
                                                if (listing.open_message === true) {
                                                    let o_m = e.target.open_message.value;
                                                    if (o_m.length > 0 && o_m < 400) {

                                                        confirm_message += ` ${e.target.open_message.value}`;
                                                        open_message = e.target.open_message.value;

                                                    } else {
                                                        //too many characters
                                                    }
                                                }

                                                let twm_confirm = window.confirm(confirm_message);

                                                if (twm_confirm) {
                                                    let twm_file = this.state.twm_file;

                                                    let seller_pubkey = await get_seller_pubkey(listing.username, this.state.api_url);

                                                    console.log(seller_pubkey);

                                                    const crypto  = window.require('crypto');

                                                    const { privateKey, publicKey } = await crypto.generateKeyPairSync('rsa', {
                                                        modulusLength: 4096,
                                                        publicKeyEncoding: {
                                                            type: 'pkcs1',
                                                            format: 'pem'
                                                        },
                                                        privateKeyEncoding: {
                                                            type: 'pkcs8',
                                                            format: 'pem',
                                                        }
                                                    });

                                                    let api_file_url_offer_id;

                                                    if (twm_file.api.urls.hasOwnProperty(this.state.api_url)) {
                                                        if (twm_file.api.urls[this.state.api_url].hasOwnProperty(listing.offer_id)) {
                                                            //generate a new pgp key

                                                            let api_file_url = twm_file.api.urls[this.state.api_url];
                                                            api_file_url_offer_id = api_file_url[listing.offer_id];

                                                        } else {
                                                            let api_file_url = twm_file.api.urls[this.state.api_url];
                                                            api_file_url[listing.offer_id] = {};
                                                            api_file_url_offer_id = api_file_url[listing.offer_id];
                                                        }
                                                    } else {
                                                        //if the api was never yet before saved
                                                        twm_file.api.urls[this.state.api_url] = {};
                                                        let api_file_url = twm_file.api.urls[this.state.api_url];
                                                        api_file_url[listing.offer_id] = {};
                                                        api_file_url_offer_id = api_file_url[listing.offer_id];

                                                    }

                                                    let order_id_string = publicKey + listing.offer_id + this.state.blockchain_height;
                                                    let order_id_hash = keccak256(order_id_string).toString('hex');
                                                    api_file_url_offer_id[order_id_hash] = {};

                                                    let message_header_obj = {};
                                                    message_header_obj.sender_pgp_pub_key = publicKey;
                                                    message_header_obj.to = listing.username;
                                                    message_header_obj.from = publicKey;
                                                    message_header_obj.order_id = order_id_hash;
                                                    message_header_obj.purchase_proof = txid;
                                                    message_header_obj.bc_height = this.state.blockchain_height;

                                                    let pre_sign_message_obj = {};
                                                    pre_sign_message_obj.s = ''; //subject
                                                    pre_sign_message_obj.o = listing.offer_id; //offer_id
                                                    pre_sign_message_obj.m = open_message; //open_message contents
                                                    pre_sign_message_obj.n = nft_address; //nft address
                                                    pre_sign_message_obj.so = JSON.stringify(shipping); //shipping object

                                                    message_header_obj.message_hash = keccak256(JSON.stringify(pre_sign_message_obj)).toString('hex');

                                                    message_header_obj.message_signature = '';

                                                    let pres_sign_string = JSON.stringify(pre_sign_message_obj);

                                                    const signature = crypto.sign("sha256", Buffer.from(pres_sign_string), {
                                                        key: privateKey,
                                                        padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
                                                    });

                                                    message_header_obj.message_signature = signature;

                                                    let compressed_message_obj = zlib.deflateSync(Buffer.from(JSON.stringify(pre_sign_message_obj)));

                                                    console.log(": " + compressed_message_obj.length + " characters, " +
                                                        Buffer.byteLength((compressed_message_obj), 'utf8') + " bytes");

                                                    let found_key = crypto.createPublicKey(seller_pubkey.user.pgp_key);

                                                    let encrypted_message = crypto.publicEncrypt(
                                                        {
                                                            key: found_key,
                                                            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                                                            oaepHash: "sha256",
                                                        },
                                                        compressed_message_obj
                                                    );

                                                    let hex_enc_msg = this.byteToHexString(encrypted_message);

                                                    const enc_signature = crypto.sign("sha256", Buffer.from(encrypted_message), {
                                                        key: privateKey,
                                                        padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
                                                    });

                                                    let hex_enc_sig = this.byteToHexString(enc_signature);

                                                    message_header_obj.encrypted_message_signature = hex_enc_sig;

                                                    message_header_obj.encrypted_message = hex_enc_msg;

                                                    let tdispatched = await dispatch_purchase_message(message_header_obj, this.state.api_url);

                                                    console.log(tdispatched);

                                                    message_header_obj.message = pre_sign_message_obj;

                                                    let purchase_obj = {};
                                                    purchase_obj.api_url = this.state.api_url;
                                                    purchase_obj.offer_id = listing.offer_id;
                                                    purchase_obj.title = listing.title;
                                                    purchase_obj.price = listing.price;
                                                    purchase_obj.quantity = quant;
                                                    purchase_obj.bc_height = message_header_obj.bc_height;
                                                    api_file_url_offer_id[order_id_hash].pgp_keys = {private_key: privateKey, public_key: publicKey};
                                                    api_file_url_offer_id[order_id_hash].messages = [];
                                                    api_file_url_offer_id[order_id_hash].purchase_obj = purchase_obj;
                                                    api_file_url_offer_id[order_id_hash].messages.push(message_header_obj);

                                                    console.log(twm_file);
                                                   try {

                                                        const crypto = window.require('crypto');
                                                        const algorithm = 'aes-256-ctr';
                                                        console.log(this.state.password);
                                                        const cipher = crypto.createCipher(algorithm, this.state.password.toString());
                                                        let crypted = cipher.update(JSON.stringify(twm_file), 'utf8', 'hex');
                                                        crypted += cipher.final('hex');

                                                        const hash1 = crypto.createHash('sha256');
                                                        hash1.update(JSON.stringify(twm_file));
                                                        console.log(`password ${this.state.password}`);
                                                        console.log(JSON.stringify(twm_file));

                                                        let twm_save = await save_twm_file(this.state.new_path + '.twm', crypted, this.state.password, hash1.digest('hex'));

                                                        try {
                                                            let opened_twm_file = await open_twm_file(this.state.new_path + '.twm', this.state.password);
                                                            console.log(opened_twm_file);

                                                            localStorage.setItem('twm_file', twm_file);

                                                            this.setState({twm_file: twm_file});

                                                        } catch (err) {
                                                            this.setState({showLoader: false});
                                                            console.error(err);
                                                            console.error(`error opening twm file after save to verify`);
                                                            alert(`Error at saving to the twm file during account creation verification stage`);
                                                        }
                                                        console.log(twm_save);

                                                    } catch (err) {
                                                        this.setState({showLoader: false});
                                                        console.error(err);
                                                        console.error(`error at initial save of the twm file`);
                                                        alert(`Error at saving to the twm file during account creation initialization stage`);
                                                    }
                                                    //api_file_url_offer_id[order_id_hash].messages
                                                    //send it to the server
                                                    //save it to the twm_file
                                                    console.log(`payments from twm_url`);
                                                    alert(`what`);

                                                    let commit_purchase = this.commit_purchase_offer_async(purchase_txn);

                                                    console.log(`purchase transaction committed`);
                                                    alert(`The purchase has been submitted`);
                                                }
                                        } catch (err) {
                                            this.setState({showLoader: false});
                                                alert(`Error at getting the sellers public key from the api server`);
                                                console.error(err);
                                                console.error(`error at getting the sellers public key from the api server`);
                                            }
                                        } else {
                                            let commit_purchase = this.commit_purchase_offer_async(purchase_txn);

                                            console.log(`purchase transaction committed`);
                                        }
                                    } catch (err) {
                                        this.setState({showLoader: false});
                                        console.error(err);
                                        console.error(`error when trying to commit the purchase transaction to the blockchain`);
                                        alert(`error when trying to commit the purchase transaction to the blockchain`);
                                    }
                                } else {
                                    this.setState({showLoader: false});
                                    console.log("purchase transaction cancelled");
                                }
                            } catch (err) {
                                this.setState({showLoader: false});
                                console.error(err);
                                console.error(`error at the purchase transaction formation it was not commited`);
                                alert(`error at the purchase transaction formation it was not commited`);
                            }
                        }
                        this.setState({showLoader: false});
                    }
                } catch (err) {
                    this.setState({showLoader: false});
                    console.error(err);
                    if (err.toString().startsWith('not enough outputs')) {
                        alert(`Choose fewer mixins`);
                    }
                    console.error(`Error at the purchase transaction`);
                }
            }
        } else {
            alert(`You can not have 0 quantity for purchase.`);
        }


    };

    purchase_offer_async = async (wallet, the_cost, offer_id, quantity, mixins) => {
        return new Promise((resolve, reject) => {
            try {
                purchase_offer(wallet, the_cost, offer_id, quantity, mixins, (err, res) => {
                    if (err) {
                        this.setState({showLoader: false});
                        console.error(err);
                        console.error(`error at the first call back purchase txn`);
                        alert(`error at the first call back purchase txn`);
                        alert(err);
                        reject(err);
                    } else {
                        resolve(res);
                    }
                });
            } catch (err) {
                this.setState({showLoader: false});
                reject(err);
            }
        });
    };

    commit_purchase_offer_async = (txn) => {
        return new Promise((resolve, reject) => {
            try {
                txn.commit((err, res) => {
                    if (err) {
                        this.setState({showLoader: false});
                        console.error(err);
                        console.error(`error at the purchase commit callback`);
                        alert(`error at the purchase commit callback`);
                        alert(err);
                        reject(err);
                    } else {
                        this.setState({showLoader: false, show_purchase_confirm_modal: true});
                        
                        alert(
                            `Purchase transaction committed.
                            Transaction ID: ${this.state.purchase_txn_id}
                            Amount: ${this.state.purchase_txn_quantity} X ${this.state.purchase_txn_title}
                            Price: ${this.state.purchase_txn_price} SFX
                            Network Fee: ${this.state.purchase_txn_fee / 10000000000} SFX
                            A link to this transaction on the Safex Block Explorer has been copied to your clipboard
                            https://stagenet3.safex.org/search?value=${this.state.purchase_txn_id}`
                        );

                        this.handleClosePurchaseForm();
                        resolve(res);
                    }
                });
            } catch (err) {
                this.setState({showLoader: false});
                reject(err);
            }
        });
    };

    make_edit_offer = async (e) => {
        e.preventDefault();
        e.persist();
        console.log(`let's list the offer it`);
        let va = e.target;

        console.log(va.offerid.value);

        let o_obj = {};
        o_obj.twm_version = 1;

        if (va.description.value.length > 0) {
            o_obj.description = va.description.value;
        }
        if (va.main_image.value.length > 0) {
            o_obj.main_image = va.main_image.value;
        }
        if (va.sku.value.length > 0) {
            o_obj.sku = va.sku.value;
        }
        if (va.barcode.value.length > 0) {
            o_obj.barcode = va.barcode.value;
        }
        if (va.weight.value.length > 0) {
            o_obj.weight = va.weight.value;
        }
        if (va.country.value.length > 0) {
            o_obj.country = va.country.value;
        }
        if (va.physical.value.length > 0) {
            o_obj.physical = va.physical.value;
        }
        let active = 0;
        if (va.active.value === 'True' || va.active.value === 'true') {
            active = 1;
        }

        o_obj.shipping = this.state.shipping_switch;
        o_obj.nft = this.state.nft_switch;
        o_obj.open_message = this.state.open_message_switch;

        try {
            let mixins = va.mixins.value - 1;
            if (mixins >= 0) {
                let confirmed = window.confirm(`Are you sure you want to edit ${va.title.value} - Offer ID:  ${va.offerid.value}?`);
                console.log(confirmed);
                if (confirmed) {
                    this.setState({edit_offer_txn_offerid: va.offerid.value, edit_offer_txn_title: va.title.value});
                    let edit_txn = await this.edit_offer_async(
                        wallet,
                        va.offerid.value,
                        va.username.value,
                        va.title.value,
                        va.price.value,
                        va.quantity.value,
                        JSON.stringify(o_obj),
                        active,
                        mixins
                    );

                    let confirmed_fee = window.confirm(`The network fee to edit ${this.state.edit_offer_txn_title} will be:  ${edit_txn.fee() / 10000000000} SFX`);
                    let fee = edit_txn.fee();
                    let txid = edit_txn.transactionsIds();
                    if (confirmed_fee) {
                        try {
                            this.setState({edit_offer_txn_id: txid, edit_offer_txn_fee: fee});
                            let commit_edit = await this.commit_edit_offer_txn_async(edit_txn);
                        } catch (err) {
                            console.error(err);
                            console.error(`Error at committing the edit offer transaction for ${this.state.edit_offer_txn_offerid}`);
                        }
                    } else {
                        alert(`Your transaction was cancelled, no edit for the offer was completed`);
                    }
                    this.setState({new_offer_image: '', show_edit_offer_form: false})
                }
            }
        } catch (err) {
            console.error(err);
            console.error(`Error at creating the edit offer transaction`);
        }
    };


    edit_offer_async = async (wallet, offerid, username, title, price, quantity, data, active, mixins) => {
        return new Promise((resolve, reject) => {
            try {
                edit_offer(wallet, offerid, username, title, price, quantity, data, active, mixins, (err, res) => {
                    if (err) {
                        console.error(err);
                        console.error(`Error at first callback edit offer transaction`);
                        alert(`Error at first call back edit offer transaction`);
                        alert(err);
                        reject(err);
                    } else {
                        resolve(res);
                    }
                });
            } catch (err) {
                reject(err);
            }
        });
    };

    commit_edit_offer_txn_async = (txn) => {
        return new Promise((resolve, reject) => {
            try {
                txn.commit((err, res) => {
                    if (err) {
                        console.error(err);
                        console.error(`Error at commit callback edit offer transaction`);
                        alert(`Error at commit call back edit offer transaction`);
                        alert(err);
                        reject(err);
                    } else {
                        alert(`Edit offer committed 
                    Transaction ID: ${this.state.edit_offer_txn_id}
                    For Offer ID: ${this.state.edit_offer_txn_offerid}
                    Title: ${this.state.edit_offer_txn_title}
                    Fee: ${this.state.edit_offer_txn_fee / 10000000000} SFX`);
                        this.setState({
                            edit_offer_txn_id: '',
                            edit_offer_txn_fee: 0,
                            edit_offer_txn_title: '',
                            edit_offer_txn_offerid: ''
                        });
                        resolve(res);
                    }
                });
            } catch (err) {
                reject(err);
            }
        });
    };

    handleShowMessages = (messageObject) => {
        this.setState({showMessages: true, showMyOrders: true, currentMessage: messageObject})
    }

    hideMessages = () => {
        this.setState({showMessages: false, currentMessage: {}})
    }


    handleMyOrders = () => {
        this.setState({showMyOrders: !this.state.showMyOrders})
    };



    call_non_listings_table = () => offerRows = this.state.non_offers.map((listing, key) => {
                               
                        
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
                return (
                    <OfferTableRow
                        key={key}
                        title={listing.title}
                        price={listing.price / 10000000000}
                        quantity={listing.quantity}
                        seller={listing.seller}
                        id={listing.offerID}
                        handleEditOfferForm={() => this.handleShowEditOfferForm(listing)}
                        handleShowOrders={this.handleMyOrders}
                        toEllipsis={this.to_ellipsis}
                    />
                )

            }
        } catch (err) {
            console.error(`failed to properly parse the user data formatting`);
            console.error(err);
        }
        
    });

    render() {

        const twmwallet = () => {
            switch (this.state.interface_view) {

                case "home": {
                    return (
                        <div className="home-main-div">
                            <Col sm={4} className="no-padding d-flex flex-column align-items-center justify-content-between">
                                <HomeInfo
                                    blockHeight={this.state.blockchain_height}
                                    connection={this.state.connection_status}
                                    firstRefresh={this.state.first_refresh}
                                    cashBalance={this.state.cash}
                                    tokenBalance={this.state.tokens}
                                    pendingCash={this.state.pending_cash}
                                    pendingTokens={this.state.pending_tokens}
                                    walletHeight={this.state.wallet_height}
                                />

                                <SendSafex 
                                    title="SEND SAFEX"
                                    style="cash"
                                    send={this.cash_send}
                                    id="send_cash"
                                />
                            </Col>

                            <Col sm={7} className="no-padding d-flex flex-column  justify-content-between">
                                <AccountInfo
                                    rescan={this.rescan}
                                    handleShow={this.handleKeys}
                                    show={this.state.show_keys}
                                    handleKeyRequest={() => {this.setState({keyRequest: !this.state.keyRequest})}}
                                    keyRequest={this.state.keyRequest}
                                    address={this.props.wallet.address()}
                                    spendKey={this.props.wallet.secretSpendKey()}
                                    viewKey={this.props.wallet.secretViewKey()}
                                    seed={this.props.wallet.seed()}
                                    toEllipsis={this.to_ellipsis}
                                />

                                <HomeCarousel/> 
                            </Col>
                        </div>
                    );
                }
                
                case "market":
                    var table_of_listings;
                    if (this.state.offer_loading_flag === 'all') {
                        table_of_listings = this.state.non_offers.map((listing, key) => {
                            console.log(key);
                            listing.offer_id = listing.offerID;
                            listing.price = listing.price  / 10000000000;
                            try {
                                return (
                                    <Row className="staking-table-row" key={key}>
                                        <p>{listing.title}</p>
                                        <p>{listing.price}</p>
                                        <p>{listing.quantity}</p>
                                        <p>{listing.seller}</p>
                                        <p>{listing.offerID}</p>
                                    </Row>
                                )

                            } catch (err) {
                                console.error(`failed to properly parse the user data formatting`);
                                console.error(err);
                            }

                        });


                    } else if (this.state.offer_loading_flag === 'blockchaintwmoffers') {
                        table_of_listings = this.state.twm_offers.map((listing, key) => {

                            try {
                                var data = {};
                                listing.offer_id = listing.offerID;
                                data.description = listing.description;
                                data.main_image = '';
                                data.sku = '';
                                data.barcode = '';
                                data.weight = '';
                                data.country = '';
                                data.message_type = '';
                                data.physical = '';
                                data.shipping = false;
                                data.nft = false;
                                data.open_message = false;

                                try {
                                    let parsed_data = JSON.parse(listing.description);
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
                                        if (parsed_data.hasOwnProperty('shipping')) {
                                            data.shipping = parsed_data.shipping;
                                        }
                                        if (parsed_data.hasOwnProperty('nft')) {
                                            data.nft = parsed_data.nft;
                                        }
                                        if (parsed_data.hasOwnProperty('open_message')) {
                                            data.open_message = parsed_data.open_message;
                                        }
                                    }
                                } catch (err) {
                                    console.error(err);
                                }
                                try {
                                    return (
                                        <Row className="staking-table-row" key={key}>
                                            <p data-tip data-for={`offerTitle${key}`}>
                                                {listing.title}
                                            </p>

                                            <p>{listing.price}</p>

                                            <p>{listing.quantity}</p>

                                            <p>{listing.seller}</p>

                                            <p data-tip data-for={`offerID${key}`}>
                                                {this.to_ellipsis(listing.offer_id, 5, 5)}

                                                <ReactTooltip id={`offerID${key}`} type='light' effect='solid'>
                                                    <span>{listing.offer_id}</span>
                                                </ReactTooltip>
                                            </p>

                                            <p style={{width: '24rem'}}>
                                           
                                                {listing.quantity <= 0 ?
                                                    (<button disabled>
                                                        SOLD OUT
                                                    </button>)
                                                    :
                                                    (<button onClick={() => this.handleShowPurchaseForm(listing, data)}>
                                                        BUY
                                                    </button>)
                                                }

                                                <button className="ml-2">CHAT</button>
                                            </p>
                                        </Row>
                                    )
                                } catch (err) {
                                    console.error(`failed to properly parse the user data formatting`);
                                    console.error(err);
                                }
                            } catch (err) {
                                console.error(err);
                            }

                        });
                    } else if (this.state.offer_loading_flag === 'twmurl') {
                        table_of_listings = this.state.twm_url_offers.map((listing, key) => {
                            listing.offerID = listing.offer_id;

                            try {
                                var data = {};
                                data.description = listing.description;
                                data.main_image = listing.main_image;
                                data.sku = '';
                                data.barcode = '';
                                data.weight = '';
                                data.country = '';
                                data.message_type = '';
                                data.physical = '';
                                data.shipping = listing.shipping;
                                data.nft = listing.nft;
                                data.open_message = listing.open_message;


                                try {
                                    return (
                                        <Row className="staking-table-row" key={key}>
                                            <p data-tip data-for={`offerTitle${key}`}>
                                                {listing.title}
                                            </p>

                                            <p>{listing.price}</p>

                                            <p>{listing.quantity}</p>

                                            <p>{listing.username}</p>

                                            <p data-tip data-for={`offerID${key}`}>
                                                {this.to_ellipsis(listing.offer_id, 5, 5)}

                                                <ReactTooltip id={`offerID${key}`} type='light' effect='solid'>
                                                    <span>{listing.offer_id}</span>
                                                </ReactTooltip>
                                            </p>

                                            <p style={{width: '24rem'}}>
                                            
                                                {listing.quantity <= 0 ?
                                                    (<button className="search-button" disabled>
                                                        SOLD OUT
                                                    </button>)
                                                    :
                                                    (<button className="search-button" onClick={() => this.handleShowPurchaseForm(listing, data)}>
                                                        BUY
                                                    </button>)
                                                }

                                                <button className="ml-2 search-button">CHAT</button>
                                            </p>
                                        </Row>
                                    )

                                } catch (err) {
                                    console.error(`failed to properly parse the user data formatting`);
                                    console.error(err);
                                }
                            } catch (err) {
                                console.error(err);
                            }

                        });
                    }

                    var tableOfOrders;
                        tableOfOrders = this.state.twm_offers.map((order, key) => {
                            console.log(key);
                            try {
                                return (
                                    <OrderTableRow 
                                        key={key}
                                        title={'placeholder'}
                                        price={'placeholder'}
                                        quantity={'placeholder'}
                                        id={'placeholder'}
                                        showMessages={this.showMessages}
                                        messageObject={'placeholder'}
                                    />
                                        
                                )

                            } catch (err) {
                                console.error(`failed to properly parse the user data formatting`);
                                console.error(err);
                            }

                        });

                    return (
                        <div className="">

                            {this.state.show_purchase_form ?
                                <ReactModal 
                                isOpen={this.state.show_purchase_form}
                                closeTimeoutMS={500}
                                className="keys-modal"
                                onRequestClose={this.handleClosePurchaseForm}

                                style={{
                                    overlay: {
                                    position: 'fixed',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    backgroundColor: 'rgba(255, 255, 255, 0.75)'
                                    },
                                    content: {
                                    position: 'absolute',
                                    top: '40px',
                                    left: '40px',
                                    right: '40px',
                                    bottom: '40px',
                                    overflow: 'auto',
                                    }
                                }}
                            >  
                                <h1>PURCHASE {this.state.show_purchase_offer.title.toUpperCase()}</h1>
                                

                                <Form id="purchase_item"
                                        onSubmit={(e) => this.purchase_item(e, this.state.show_purchase_offer)}>

                                        <div className="d-flex flex-column justify-content-around p-3">
                                            <Image className="border border-dark"
                                                    src={this.state.show_purchase_offer_data.main_image}></Image>

                                            <div className="p-5 d-flex flex-column justify-content-center"></div>
                                                <hr className="border border-dark w-100"></hr>
                                                    <h2>Price: {this.state.show_purchase_offer.price} SFX</h2>
                                                    <h2>Seller: {this.state.show_purchase_offer.seller}</h2>
                                                    <h2 data-tip data-for='offerID'>
                                                        Offer
                                                        ID: {this.to_ellipsis(this.state.show_purchase_offer.offer_id, 10, 10)}
                                                        <ReactTooltip id='offerID' type='light' effect='solid'>
                                                            {this.state.show_purchase_offer.offer_id}
                                                        </ReactTooltip>
                                                        <FaCopy
                                                            className="ml-4"
                                                            data-tip data-for='copyIDInfo'
                                                            onClick={() => copy(this.state.show_purchase_offer.offer_id)}
                                                        />

                                                        <ReactTooltip id='copyIDInfo' type='info'
                                                                        effect='solid'>
                                                                    <span>
                                                                        Copy Offer ID
                                                                    </span>
                                                        </ReactTooltip>
                                                    </h2>
                                                <hr className="border border-primary w-100"></hr>
                                                <div className="h-25 oflow-y-auto">
                                                    <p>{this.state.show_purchase_offer_data.description.toUpperCase()}</p>
                                                </div>

                                        <Form.Group as={Row}>
                                            <Form.Label column sm={3}>
                                                {this.state.show_purchase_offer.quantity} available
                                            </Form.Label>
                                            <Col sm={9}>
                                                <Form.Control
                                                    className="light-blue-back"
                                                    id="quantity"
                                                    name="quantity"
                                                    max={this.state.show_purchase_offer.quantity}
                                                />
                                            </Col>
                                        </Form.Group>
                                        {this.state.show_purchase_offer_data.nft ? 
                                            (<Form.Group as={Row}>   
                                                <Form.Label column sm={4}>
                                                    NFT Ethereum Address
                                                </Form.Label>
                                                <Col sm={6}>
                                                    <Form.Control name="eth_address" rows="3"/>
                                                </Col>
                                            </Form.Group>) 
                                        : 
                                            ''}
                                        {this.state.show_purchase_offer_data.shipping ? 
                                        (<div>
                                            <Form.Group name="names" as={Row}>
                                        
                                            <Form.Label column sm={4}>
                                                First Name
                                            </Form.Label>
                                            <Col sm={6}>
                                                <Form.Control name="first_name" rows="3"/>
                                            </Col>
                                       
                                            <Form.Label column sm={4}>
                                                Last Name
                                            </Form.Label>
                                            <Col sm={6}>
                                                <Form.Control name="last_name" rows="3"/>
                                            </Col>
                                            
                                        
                                            
                                        </Form.Group>
                                            <Form.Group name="streets" as={Row}>
                                                <Form.Label column sm={4}>
                                                Address Line 1
                                                </Form.Label>
                                                <Col sm={6}>
                                                    <Form.Control name="address1" rows="3"/>
                                                </Col>
                                                <Form.Label column sm={4}>
                                                    Address Line 2
                                                </Form.Label>
                                                <Col sm={6}>
                                                    <Form.Control name="address2" rows="3"/>
                                                </Col>
                                            </Form.Group>
                                            <Form.Group name="place" as={Row}>
                                                <Form.Label column sm={4}>
                                                    City
                                                </Form.Label>
                                                <Col sm={6}>
                                                    <Form.Control name="city" rows="3"/>
                                                </Col>
                                                <Form.Label column sm={4}>
                                                    State/County
                                                </Form.Label>
                                                <Col sm={6}>
                                                    <Form.Control name="state" rows="3"/>
                                                </Col>
                                            </Form.Group>
                                            <Form.Group name="countrycodes" as={Row}>
                                                <Form.Label column sm={4}>
                                                    Zip/Area Code
                                                </Form.Label>
                                                <Col sm={6}>
                                                    <Form.Control name="zipcode" rows="3"/>
                                                </Col>
                                                <Form.Label column sm={4}>
                                                    Country
                                                </Form.Label>
                                                <Col sm={6}>
                                                    <Form.Control name="country" rows="3"/>
                                                </Col>
                                            </Form.Group>
                                            <Form.Group as={Row}>
                                                <Form.Label column sm={4}>
                                                    Email
                                                </Form.Label>
                                                <Col sm={6}>
                                                    <Form.Control name="email_address" rows="3"/>
                                                </Col>
                                                <Form.Label column sm={4}>
                                                    Phone
                                                </Form.Label>
                                                <Col sm={6}>
                                                    <Form.Control name="phone_number" rows="3"/>
                                                </Col>
                                            </Form.Group></div>) : ''}
                                        {this.state.show_purchase_offer_data.open_message ? 
                                            <Form.Group as={Row}>
                                                <Form.Label column sm={4}>
                                                    NFT Ethereum Address
                                                </Form.Label>
                                                <Col sm={6}>
                                                    <Form.Control name="message" rows="3"/>
                                                </Col>
                                            </Form.Group> 
                                        : 
                                            ''
                                        }
                                        </div>
                                    


                                    <Form.Group as={Row} className="w-50">
                                        <Form.Label column sm={3}>
                                            Mixins
                                            <IconContext.Provider value={{color: 'black', size: '20px'}}>
                                                <FaInfoCircle data-tip data-for='apiInfo'
                                                                className="blockchain-icon mx-4"/>

                                                <ReactTooltip id='apiInfo' type='info' effect='solid'>
                                                            <span>
                                                                Mixins are transactions that have also been sent on the Safex blockchain. <br/>
                                                                They are combined with yours for private transactions.<br/>
                                                                Changing this from the default could hurt your privacy.<br/>
                                                            </span>
                                                </ReactTooltip>
                                            </IconContext.Provider>
                                        </Form.Label>
                                        <Col sm={9}>
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
                                        </Col>
                                    </Form.Group>

                                    {this.state.showLoader ?
                                        <Loader
                                            className="justify-content-center align-content-center"
                                            type="Bars"
                                            color="#00BFFF"
                                            height={50}
                                            width={50}
                                        />
                                        :
                                        <button>
                                            Buy
                                        </button>
                                    }
                                </Form>

                                <Button className="close-button" onClick={this.handleClosePurchaseForm}>
                                    Close
                                </Button>
                            </ReactModal>
                                    :
                                    ''
                                    } 

                            <Modal className="purchase-offer-modal text-align-center" animation={false}
                                    centered
                                    show={this.state.show_purchase_confirm_modal}
                                    onHide={this.handleConfirmationModal}>
                                <Modal.Header closeButton>
                                    <Modal.Title>
                                        Purchase Confirmed: {this.state.show_purchase_offer.title.toUpperCase()}
                                    </Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                        <ul>
                                            <li>Purchase transaction committed.</li>
                                            <li>Transaction ID: {this.state.purchase_txn_id}</li>
                                            <li>Amount: {this.state.purchase_txn_quantity} X {this.state.purchase_txn_title}</li>
                                            <li>Price: {this.state.purchase_txn_price} SFX</li>
                                            <li>
                                                Network Fee: {this.state.purchase_txn_fee / 10000000000} SFX
                                                <IconContext.Provider  value={{color: 'black', size: '20px'}}>
                                                    <FaCopy
                                                        className="ml-4"
                                                        data-tip data-for='copyIDInfo1'
                                                        onClick={() => copy(this.state.purchase_txn_id)}
                                                    />

                                                    <ReactTooltip id='copyIDInfo1' type='info' effect='solid'>
                                                        <span>
                                                            Copy Offer ID
                                                        </span>
                                                    </ReactTooltip>
                                                </IconContext.Provider>
                                            </li>
                                        </ul>
                                </Modal.Body>

                            </Modal>
                        
                            <Col sm={4} className="no-padding d-flex flex-column align-items-center justify-content-between">
                                <HomeInfo
                                    blockHeight={this.state.blockchain_height}
                                    connection={this.state.connection_status}
                                    firstRefresh={this.state.first_refresh}
                                    cashBalance={this.state.cash}
                                    tokenBalance={this.state.tokens}
                                    pendingCash={this.state.pending_cash}
                                    pendingTokens={this.state.pending_tokens}
                                    walletHeight={this.state.wallet_height}
                                />
                            </Col>

                            <Col sm={7} className="no-padding d-flex flex-column  justify-content-between">
                                <AccountInfo
                                    rescan={this.rescan}
                                    handleShow={this.handleKeys}
                                    show={this.state.show_keys}
                                    handleKeyRequest={() => {this.setState({keyRequest: !this.state.keyRequest})}}
                                    keyRequest={this.state.keyRequest}
                                    address={this.props.wallet.address()}
                                    spendKey={this.props.wallet.secretSpendKey()}
                                    viewKey={this.props.wallet.secretViewKey()}
                                    seed={this.props.wallet.seed()}
                                    toEllipsis={this.to_ellipsis}
                                />
                            </Col>

                            <Col sm={12}>
                                <div
                                    className="search-box d-flex flex-column align-items-center"
                                >
                                    { !this.state.showMyOrders ?
                                        <div className="row width100 border-bottom border-white" id="search">
                                            <form 
                                                className="w-100 no-gutters p-2 align-items-baseline d-flex justify-content-center"
                                                id="search-form" action=""
                                                method=""
                                            >
                                                <div className="col-sm-6">
                                                    <input className="w-100" type="text"
                                                            onChange={this.handle_change_api_fetch_url} placeholder="eg. api.theworldmarketplace.com"/>
                                                </div>

                                                <div className="col-sm-4 justify-content-around d-flex">
                                                    <button onClick={this.load_offers_from_api} className="search-button">
                                                        Set Market API
                                                    </button>

                                                    <button onClick={this.load_offers_from_blockchain} className="search-button">
                                                        Load From Blockchain
                                                    </button>

                                                    <IconContext.Provider value={{color: '#13d3fd', size: '20px'}}>

                                                        <FaInfoCircle data-tip data-for='apiInfo'
                                                                        className=""/>

                                                        <ReactTooltip id='apiInfo' type='light' effect='solid'>
                                                            <span>This is info about setting a market API. Lorem Ipsum.</span>
                                                        </ReactTooltip>
                                                    </IconContext.Provider>
                                                </div>
                                            </form>
                                        </div>
                                    :
                                        ''
                                    }

                                    <Row className="w-100 justify-content-center">
                                        
                                    { !this.state.showMyOrders ?
                                        <Col sm={6}>
                                            <div className="row" id="search">
                                                <form className="w-75 no-gutters p-2" id="search-form"

                                                        enctype="multipart/form-data">
                                                    <div className="form-group col-sm-9">
                                                        <input className="" type="text" placeholder="Search"/>
                                                    </div>
                                                    <div className="form-group col-sm-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => (alert("We are wokring on getting this feature up and running as soon as possible. Thank you for your patience!"))}
                                                            className="search-button"
                                                        >
                                                            Search
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                            
                                            <div className="row" id="filter">
                                                <form>
                                                    <select data-filter="category"
                                                            className="">
                                                        <option value="">Category</option>
                                                        <option value="">Any</option>
                                                        <option value="">Books</option>
                                                        <option value="">Clothes</option>
                                                        <option value="">Digital</option>
                                                        <option value="">Toys</option>
                                                    </select>
                                                
                                                    <select data-filter="location"
                                                            className="">
                                                        <option value="">Location</option>
                                                        <option value="">Any</option>
                                                        <option value="">Africa</option>
                                                        <option value="">Asia</option>
                                                        <option value="">Australia</option>
                                                        <option value="">Europe</option>
                                                        <option value="">North America</option>
                                                        <option value="">South America</option>
                                                    </select>
                                                    
                                                    <select data-filter="price"
                                                            className="">
                                                        <option value="">Price Range</option>
                                                        <option value="">SFX 0 - SFX 24.99</option>
                                                        <option value="">SFX 25 - SFX 49.99</option>
                                                        <option value="">SFX 50 - SFX 199.99</option>
                                                        <option value="">SFX 200 - SFX 499.99</option>
                                                        <option value="">SFX 500 - SFX 999.99</option>
                                                        <option value="">SFX 1000+</option>
                                                    </select>
                                                    
                                                    <select data-filter="sort"
                                                            className="">
                                                        <option value="">Sort by...</option>
                                                        <option value="">SFX Asc</option>
                                                        <option value="">SFX Dec</option>
                                                    </select>
                                                </form>
                                            </div>
                                        </Col>
                                    :
                                        ''
                                    }
                                    
                                        <Col className="d-flex" sm={2}>
                                            <button onClick={this.handleMyOrders} className="search-button">
                                                {this.state.showMyOrders ? 'Close' : 'My Orders'}
                                            </button>
                                        </Col>
                                       
                                        { this.state.showMyOrders ?
                                            <Col sm={12}>
                                                <Row>
                                                    <Col sm={10}>
                                                        <h1>My Orders</h1>
                                                    </Col>

                                                    <Col sm={2}>
                                                        <IconContext.Provider value={{color: '#FEB056', size: '30px'}}>
                                                            <CgCloseR
                                                                className="mx-auto"
                                                                onClick={this.handleMyOrders}
                                                            />
                                                        </IconContext.Provider>
                                                    </Col>
                                                </Row>
                                            
                                                
                                                <Row className="h-100">
                                                    <Col className="h-100" sm={12}>
                                                        <MyOrders
                                                            rows={tableOfOrders}
                                                            showMessages={this.state.showMessages}
                                                            handleShowMessages={this.handleShowMessages}
                                                            handleHideMessages={this.handleHideMessages}
                                                        />
                                                    </Col>
                                                </Row>
                                            </Col>
                                        :
                                            ''
                                        }
                                    </Row>

                                    <Row className="staking-table-row">
                                        <p>Title</p>
                                        <p>Price (SFX)</p>
                                        <p>Quantity</p>
                                        <p>Seller</p>
                                        <p>Offer ID</p>
                                        <p style={{width: '24rem'}}>Actions</p>
                                    </Row>
                                </div>
                            </Col>

                            <Col className="market-table white-text overflow-y" md={12}>
                                {table_of_listings}
                            </Col>
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


                    var accounts_table = this.state.usernames.map((user, key) => {
                        let avatar = '';
                        try {
                            if (user.data.length > 0) {
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
                                        "no-gutters account-element selected-account"
                                    : 
                                        "no-gutters account-element"
                                }
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

                                {user.status == 0 ? 
                                    <button 
                                        className="merchant-mini-buttons"
                                        onClick={(e) => this.remove_account(e, user.username, key)}
                                    >
                                        Remove
                                    </button>

                                : 
                                    ''
                                }
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
                            selected = {};
                            selected.username = '';
                        }
                    } catch (err) {
                        console.error(err);
                        console.error(`likely selected user somehow doesn't exist`);
                    }
                    try {
                        return (
                            <div className="home-main-div">
                                <Col sm={4} className="no-padding d-flex flex-column align-items-center justify-content-between">
                                    <HomeInfo
                                        blockHeight={this.state.blockchain_height}
                                        connection={this.state.connection_status}
                                        firstRefresh={this.state.first_refresh}
                                        cashBalance={this.state.cash}
                                        tokenBalance={this.state.tokens}
                                        pendingCash={this.state.pending_cash}
                                        pendingTokens={this.state.pending_tokens}
                                        walletHeight={this.state.wallet_height}
                                    />

                                    <MerchantTabs
                                        newAccountImage={this.state.newAccountImage}
                                        handleNewAccountForm={this.handleNewAccountForm}
                                        handleChange={this.handleChange}

                                        handleNewOfferForm={this.handleShowNewOfferForm}
                                        closeNewOfferForm={this.handleCloseEditOfferForm}
                                        accountsImage={this.state.accountsImage}
                                        showAccounts={() => this.setState({merchantTabs: 'accounts'})}

                                        newOfferImage={this.state.newOfferImage}

                                        offersImage={this.state.offersImage}
                                        showOffers={() => this.setState({merchantTabs: 'offers'})}
                                    />
                                </Col>

                                <Col sm={7} className="no-padding d-flex flex-column  justify-content-between">
                                    <AccountInfo
                                        rescan={this.rescan}
                                        handleShow={this.handleKeys}
                                        show={this.state.show_keys}
                                        handleKeyRequest={() => {this.setState({keyRequest: !this.state.keyRequest})}}
                                        keyRequest={this.state.keyRequest}
                                        address={this.props.wallet.address()}
                                        spendKey={this.props.wallet.secretSpendKey()}
                                        viewKey={this.props.wallet.secretViewKey()}
                                        seed={this.props.wallet.seed()}
                                        toEllipsis={this.to_ellipsis}
                                    />
                                    
                                    {this.state.merchantTabs === "accounts" ?

                                        <MerchantAccounts
                                            handleChange={this.handleChange}
                                            handleNewAccountForm={this.handleNewAccountForm}
                                            showNewAccountForm={this.state.show_new_account_form}
                                            handleEditAccountForm={this.handleEditAccountForm}
                                            showEditAccountForm={this.state.show_edit_account_form}
                                            submitEdit={this.edit_account_top}
                                            registerApi={this.register_twmapi}
                                            newAccountImage={this.state.new_account_image}
                                            registerAccount={this.register_account}
                                            accounts={accounts_table}
                                            merchantTabs={this.state.merchantTabs}
                                            data={data}
                                            selected={selected}
                                        />  
                                    :
                                        <Row className="merchant-accounts-box">
                                            {this.state.showMyOrders ? 
                                                <Row className="h-100">
                                                    <div style={{width: 800}} className="h-100" sm={12}>
                                                        <MyOrders
                                                            rows={tableOfOrders}
                                                            showMessages={this.state.showMessages}
                                                            handleShowMessages={this.handleShowMessages}
                                                            handleHideMessages={this.handleHideMessages}
                                                            handleOrders={this.handleMyOrders}
                                                        />
                                                    </div>
                                                </Row>
                                                
                                            :
                                                <MerchantOffers
                                                    handleOrders={this.handleMyOrders}
                                                    offerRows={offerRows}
                                                    loadOffers={this.call_non_listings_table}
                                                />
                                            }

                                        </Row >
                                    }

                                    <ReactModal
                                        closeTimeoutMS={500}
                                        isOpen={this.state.show_new_offer_form}
                                        onRequestClose={this.handleCloseNewOfferForm}
                                        className="new-account-modal"

                                        style={{
                                            overlay: {
                                            position: 'fixed',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            backgroundColor: 'rgba(255, 255, 255, 0.75)'
                                            },
                                            content: {
                                            position: 'absolute',
                                            top: '40px',
                                            left: '40px',
                                            right: '40px',
                                            bottom: '40px',
                                            overflow: 'auto',
                                            }
                                        }}
                                    >
                                            <h1>Create New Offer</h1>
                                    

                                            <Form
                                                id="list_new_offer"
                                                onSubmit={this.list_new_offer}
                                            >
                                                <Row className="no-gutters justify-content-between w-100">
                                                    <Col md="8">
                                                        <Form.Group as={Col}>
                                                            <Form.Label>Username</Form.Label>

                                                            <Form.Control
                                                                disabled
                                                                name="username"
                                                                value={selected.username}
                                                            />
                                                        </Form.Group>

                                                        <Form.Group  as={Col}>
                                                            <Form.Label>Image URL</Form.Label>

                                                            <Form.Control
                                                                name="new_account_image"
                                                                defaultValue={data.main_image}
                                                                onChange={this.handleChange}
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
                                                </Row>

                                                <Row  md="8">
                                                    <Form.Group md="6" as={Col}>
                                                        <Form.Label>Title</Form.Label>

                                                        <Form.Control name="title"
                                                                        defaultValue={this.state.show_edit_offer.title}/>
                                                    </Form.Group>

                                                    <Form.Group md="6" as={Col}>
                                                        <Form.Label>Description</Form.Label>

                                                        <Form.Control maxLength="2000" as="textarea"
                                                                            name="description"
                                                                            defaultValue={data.description}/>
                                                    </Form.Group>

                                                    <Form.Group  md="6" as={Col}>
                                                        <Form.Label>Price (SFX)</Form.Label>

                                                        <Form.Control
                                                            name="price"
                                                            defaultValue={1}
                                                        />
                                                    </Form.Group>

                                                    <Form.Group  md="6" as={Col}>
                                                        <Form.Label>Available Quantity</Form.Label>

                                                        <Form.Control
                                                            name="quantity"
                                                            defaultValue={1}
                                                        />
                                                    </Form.Group>

                                                    <Form.Group  md="6" as={Col}>
                                                        <Form.Label>SKU</Form.Label>

                                                        <Form.Control
                                                            name="sku"
                                                            defaultValue={data.sku}
                                                        />
                                                    </Form.Group>

                                                    <Form.Group  md="6" as={Col}>
                                                        <Form.Label>Barcode (ISBN, UPC, GTIN, etc)</Form.Label>

                                                        <Form.Control
                                                            name="barcode"
                                                            defaultValue={data.barcode}
                                                        />
                                                    </Form.Group>

                                                    <Form.Group  md="6" as={Col}>
                                                        <Form.Label>Weight</Form.Label>

                                                        <Form.Control
                                                            name="weight"
                                                            defaultValue={data.weight}
                                                        />
                                                    </Form.Group>

                                                    <Form.Group  md="6" as={Col}>
                                                        <Form.Label>Physical Item?</Form.Label>

                                                        <Form.Control
                                                            name="physical"
                                                            defaultValue="true"
                                                        />
                                                    </Form.Group>

                                                    <Form.Group md="6" as={Col}>
                                                        <Form.Label>Message Types</Form.Label>

                                                        <Form.Control
                                                            name="shipping_type"
                                                            defaultValue="Shipping"
                                                        />
                                                    </Form.Group>

                                                    <Form.Group md="6" as={Col}>
                                                        <Form.Label>Country of Origin</Form.Label>

                                                        <Form.Control
                                                            name="country"
                                                            defaultValue={data.country}
                                                            placedholder="your location"
                                                        />
                                                    </Form.Group>
                                                </Row>

                                                <Row className="w-100 justify-content-around my-3">
                                                    <Form.Check
                                                        label="Shipping"
                                                        checked={this.state.shipping_switch}
                                                        onChange={this.change_shipping_switch} 
                                                        type="switch" 
                                                        id="shipping-switch" 
                                                        name="shipping" 
                                                    />

                                                    <Form.Check
                                                        label="NFT"
                                                        checked={this.state.nft_switch}
                                                        onChange={this.change_nft_switch} 
                                                        type="switch" 
                                                        id="nft-switch" 
                                                        name="nft" 
                                                    />
                                                    
                                                    <Form.Check
                                                        label="Open Messages"
                                                        checked={this.state.open_message_switch}
                                                        onChange={this.change_open_message_switch} 
                                                        type="switch" 
                                                        id="open-switch" 
                                                        name="open_message" 
                                                    />
                                                </Row>


                                                <Form.Group as={Col}>
                                                    <Form.Label>
                                                        Mixins
                                                        <IconContext.Provider  value={{color: 'black', size: '20px'}}>
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

                                                <button className="my-5" type="submit">
                                                    List Offer
                                                </button>
                                            </Form>
                                        
                                            <Button 
                                                className="close-button"
                                                onClick={this.handleCloseNewOfferForm}
                                            >
                                                Close
                                            </Button>
                                        </ReactModal>

                                    <ReactModal
                                        closeTimeoutMS={500}
                                        isOpen={this.state.show_new_account_form}
                                        onRequestClose={this.handleCloseEditOfferForm}
                                        className="new-account-modal"

                                        style={{
                                            overlay: {
                                            position: 'fixed',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            backgroundColor: 'rgba(255, 255, 255, 0.75)'
                                            },
                                            content: {
                                            position: 'absolute',
                                            top: '40px',
                                            left: '40px',
                                            right: '40px',
                                            bottom: '40px',
                                            overflow: 'auto',
                                            }
                                        }}
                                    >
                                        
                                        <h1>Make New Account</h1>
                                
                                        <Form id="create_account" onSubmit={this.register_account}>
                                            <Row className="no-gutters justify-content-between w-100">
                                                <Col md="8">
                                                    <Form.Group as={Col}>
                                                        <Form.Label>Username</Form.Label>

                                                        <Form.Control 
                                                            name="username"
                                                            placedholder="enter your desired username"
                                                        />
                                                    </Form.Group>

                                                    <Form.Group as={Col}>
                                                        <Form.Label>Avatar URL</Form.Label>
                                                        <Form.Control
                                                            onChange={this.handleChange}
                                                            value={this.state.new_account_image}
                                                            name="new_account_image"
                                                        />
                                                    </Form.Group>
                                                </Col>

                                                <Col md="4">
                                                    <Image
                                                        width={125}
                                                        height={125}
                                                        src={this.state.new_account_image}
                                                        roundedCircle
                                                    />
                                                </Col>
                                            </Row>

                                            <Row>
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
                                                        <Form.Group md="6" as={Col}>
                                                            <Form.Label>Twitter Link</Form.Label>
                                                            <Form.Control
                                                                name="twitter"
                                                                defaultValue="twitter.com"
                                                                placedholder="enter the link to your twitter handle"
                                                            />

                                                        </Form.Group>

                                                        <Form.Group md="6" as={Col}>
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
                                                        <IconContext.Provider
                                                            value={{color: 'white', size: '20px'}}>
                                                            <FaInfoCircle data-tip data-for='apiInfo'
                                                                            className="blockchain-icon mx-4 white-text"/>

                                                            <ReactTooltip id='apiInfo' type='info'
                                                                            effect='solid'>
                                                                <span>
                                                                    Mixins are transactions that have also been sent on the Safex blockchain. <br/>
                                                                    They are combined with yours for private transactions.<br/>
                                                                    Changing props from the default could hurt your privacy.<br/>
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


                                            </Row>

                                            <button
                                                block
                                                size="lg"
                                                variant="success"
                                                type="submit"
                                                className="my-5"
                                            >

                                                Create Account
                                            </button>
                                            
                                            
                                        </Form>

                                        <button 
                                            className="close-button"
                                            onClick={this.handleNewAccountForm}
                                        >
                                            Close
                                        </button>
                                    </ReactModal>


                                    <ReactModal
                                            isOpen={this.state.showMessages}
                                            closeTimeoutMS={500}
                                            className="keys-modal"
                                            onRequestClose={this.hideMessages}
                                        >   
                                            <Row>
                                                <Col sm={10}>
                                                    <h1>
                                                        Messages
                                                    </h1>


                                                </Col>
                                                <Col sm={2}>
                                                    <IconContext.Provider value={{color: '#FEB056', size: '30px'}}>
                                                        <CgCloseR
                                                            className="mx-auto"
                                                            onClick={this.hideMessages}
                                                        />
                                                    </IconContext.Provider>
                                                </Col>
                                            </Row>
                                            
                                            <Row className="m-auto">
                                                <Col sm={12}>
                                                    {finalMessage}
                                                </Col>
                                            </Row>
                                        </ReactModal>  
                                
                                    
                                    <ReactModal
                                        closeTimeoutMS={500}
                                        isOpen={this.state.show_edit_offer_form}
                                        onRequestClose={this.handleCloseEditOfferForm}
                                        className="new-account-modal"

                                        style={{
                                            overlay: {
                                            position: 'fixed',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            backgroundColor: 'rgba(255, 255, 255, 0.75)'
                                            },
                                            content: {
                                            position: 'absolute',
                                            top: '40px',
                                            left: '40px',
                                            right: '40px',
                                            bottom: '40px',
                                            overflow: 'auto',
                                            }
                                        }}
                                    >
                                            
                                        <h1>Edit Offer {this.state.show_edit_offer.title}</h1>

                                        <Form
                                            id="edit_offer"
                                            onSubmit={(e) => this.make_edit_offer(e, this.state.show_edit_offer)}
                                        >
                                            <Form.Row>
                                                <Col md="8">
                                                    <Form.Group as={Col}>
                                                        <Form.Label>Offer ID</Form.Label>

                                                        <Form.Control
                                                            disabled
                                                            name="offerid"
                                                            value={this.state.show_edit_offer.offerID}
                                                        />
                                                    </Form.Group>

                                                    <Form.Group as={Col}>
                                                        <Form.Label>Username</Form.Label>

                                                        <Form.Control
                                                            disabled
                                                            name="username"
                                                            value={this.state.show_edit_offer.seller}
                                                        />
                                                    </Form.Group>
                                                    <Form.Group as={Col}>
                                                        <Form.Label>Image URL</Form.Label>

                                                        <Form.Control
                                                            name="main_image"
                                                            defaultValue={data.main_image}
                                                            onChange={this.handleChange}
                                                        />
                                                    </Form.Group>
                                                </Col>

                                                <Col md="4">
                                                    <Image
                                                        className="border border-white grey-back"
                                                        width={150}
                                                        height={150}
                                                        src={this.state.new_offer_image ? this.state.new_offer_image : data.main_image}
                                                        roundedCircle
                                                    />
                                                </Col>
                                            </Form.Row>

                                            <Form.Row md="8">
                                                <Form.Group as={Col}>
                                                    <Form.Label>Title</Form.Label>

                                                    <Form.Control name="title"
                                                                    defaultValue={this.state.show_edit_offer.title}/>
                                                </Form.Group>

                                                <Form.Group as={Col}>
                                                    <Form.Label>Description</Form.Label>

                                                    <Form.Control maxLength="2000" as="textarea"
                                                                    name="description"
                                                                    defaultValue={data.description}/>
                                                </Form.Group>
                                            </Form.Row>

                                            <Form.Row>

                                                <Form.Group md="6" as={Col}>
                                                    <Form.Label>Price (SFX)</Form.Label>

                                                    <Form.Control
                                                        name="price"
                                                        defaultValue={this.state.show_edit_offer.price / 10000000000}
                                                    />
                                                </Form.Group>

                                                <Form.Group md="6" as={Col}>
                                                    <Form.Label>Available Quantity</Form.Label>

                                                    <Form.Control
                                                        name="quantity"
                                                        defaultValue={this.state.show_edit_offer.quantity}
                                                    />
                                                </Form.Group>

                                                <Form.Group md="6" as={Col}>
                                                    <Form.Label>SKU</Form.Label>

                                                    <Form.Control
                                                        name="sku"
                                                        defaultValue={data.sku}
                                                    />
                                                </Form.Group>

                                                <Form.Group md="6" as={Col}>
                                                    <Form.Label>Barcode (ISBN, UPC, GTIN, etc)</Form.Label>

                                                    <Form.Control
                                                        name="barcode"
                                                        defaultValue={data.barcode}
                                                    />
                                                </Form.Group>

                                                <Form.Group md="6" as={Col}>
                                                    <Form.Label>Weight</Form.Label>

                                                    <Form.Control
                                                        name="weight"
                                                        defaultValue={data.weight}
                                                    />
                                                </Form.Group>

                                                <Form.Group md="6" as={Col}>
                                                    <Form.Label>Physical Item?</Form.Label>

                                                    <Form.Control
                                                        name="physical"
                                                        defaultValue={data.physical}
                                                    />
                                                </Form.Group>


                                            </Form.Row>

                                            <Form.Row>

                                                <Form.Group md="6" as={Col}>
                                                    <Form.Label>Country of Origin</Form.Label>

                                                    <Form.Control
                                                        name="country"
                                                        defaultValue={data.country}
                                                        placedholder="your location"
                                                    />
                                                </Form.Group>

                                                <Row className="w-100 justify-content-around my-3">
                                                    <Form.Check
                                                        label="Shipping"
                                                        checked={this.state.shipping_switch}
                                                        onChange={this.change_shipping_switch} 
                                                        type="switch" 
                                                        id="shipping-switch" 
                                                        name="shipping" 
                                                    />

                                                    <Form.Check
                                                        label="NFT"
                                                        checked={this.state.nft_switch}
                                                        onChange={this.change_nft_switch} 
                                                        type="switch" 
                                                        id="nft-switch" 
                                                        name="nft" 
                                                    />
                                                    
                                                    <Form.Check
                                                        label="Open Messages"
                                                        checked={this.state.open_message_switch}
                                                        onChange={this.change_open_message_switch} 
                                                        type="switch" 
                                                        id="open-switch" 
                                                        name="open_message" 
                                                    />
                                                </Row>
                                            </Form.Row>


                                            <Form.Row>
                                                <Form.Group md="4" as={Col}>
                                                    <Form.Label>Set Active?</Form.Label>

                                                    <Form.Control
                                                        name="active"
                                                        defaultValue={this.state.show_edit_offer.active}
                                                    />
                                                </Form.Group>

                                                <Form.Group md="8" as={Col}>
                                                    <Form.Label>
                                                        Mixins
                                                        <IconContext.Provider
                                                            value={{color: 'black', size: '20px'}}>
                                                            <FaInfoCircle data-tip data-for='apiInfo'
                                                                            className="blockchain-icon mx-4 white-text"/>

                                                            <ReactTooltip id='apiInfo' type='info'
                                                                            effect='solid'>
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
                                            </Form.Row>


                                            <button type="submit">
                                                Submit Edit
                                            </button>
                                        </Form>

                                        <button 
                                            className="close-button my-5" 
                                            onClick={this.handleCloseEditOfferForm}
                                        >
                                            Close
                                        </button>
                                    </ReactModal>
                                
                                </Col>
                            </div>);

                    } catch (err) {
                        console.log(err);
                        alert(err);
                        return (<p>Error loading</p>);
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
                        <div className="home-main-div">
                            <Col sm={3} className="no-padding d-flex flex-column justify-content-around align-items-center">
                                <HomeInfo
                                    blockHeight={this.state.blockchain_height}
                                    connection={this.state.connection_status}
                                    firstRefresh={this.state.first_refresh}
                                    cashBalance={this.state.cash}
                                    tokenBalance={this.state.tokens}
                                    pendingCash={this.state.pending_cash}
                                    pendingTokens={this.state.pending_tokens}
                                    walletHeight={this.state.wallet_height}
                                />

                                <SendSafex 
                                    title="SEND TOKENS"
                                    style="token"
                                    send={this.token_send}
                                    id="send_token"
                                />
                            </Col>

                            <Col sm={9} className="no-padding token-main-box">
                                <Row className="mx-auto w-100">
                                    <StakingTable 
                                        /*
                                            rows={stakingRows}
                                            Needs to be created using .map and StakingTableRow
                                        */
                                    />

                                    <Row className="justify-content-around w-100 mx-auto my-5">
                                        <Stake
                                            style="stake"
                                            send={this.make_token_stake}
                                            id="stake_token"
                                            tokenBalance={this.state.tokens.toLocaleString()}
                                        />

                                        <StakeInfo
                                            tokenBalance={this.state.tokens.toLocaleString()}
                                            pendingStakeBalance={pending_stake.toLocaleString()}
                                            stakedBalance={unlocked_tokens.toLocaleString()}
                                            interest={this.state.blockchain_current_interest.cash_per_token / 10000000000}
                                            blockHeight={this.state.blockchain_height.toLocaleString()}
                                            nextInterval={100 - (this.state.blockchain_height % 100)}
                                            totalNetworkStake={this.state.blockchain_tokens_staked.toLocaleString()}
                                        />

                                        <Stake 
                                            style="unstake"
                                            send={this.make_token_unstake}
                                            id="stake_token"
                                        />
                                    </Row>
                                </Row>
                            </Col>
                        </div>
                    );
                }

                case "settings": {
                    return (
                        <div>
                            <Settings
                                txnhistory = {this.state.txnhistory}
                                updateHistory = {this.refresh_history}
                            />
                        </div>
                    );
                }

                case "loading":
                    return (
                        <Container className="align-items-center justify-content-center d-flex white-text" fluid>
                            <Image
                                style={{height: 500}}
                                className="align-content-center"
                                src={require("./../../img/panda.png")}
                            />
                            <h1 className="black-text">Bear with us... we're just loading the correct info...</h1>
                        </Container>
                    );

                default:
                    return <h1>Major Error</h1>
            }
        };

        return (
            <div className="" >
                <Image className="entry-scene" src={require("./../../img/loading-scene.svg")}/>
                <Image className="plant3" src={require("./../../img/plant2.svg")}/>
                
                <MainHeader 
                    view={this.state.interface_view} 
                    goHome={this.go_home} 
                    goToTokens={this.show_tokens}
                    goToMarket={this.show_market}
                    goToMerchant={this.show_merchant}
                    goToSettings={this.show_settings}
                    logout={this.logout}
                />
                    
                {twmwallet()}
            </div>
        );
    }
}

export default withRouter(WalletHome);