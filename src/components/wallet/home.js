import React from 'react';

import {Row, Col, Container, Button, Form, Image} from 'react-bootstrap';

import {withRouter} from 'react-router-dom';

import Settings from './Settings';

import {normalize_8decimals} from '../../utils/wallet_creation';
import sfxLogo from "../../img/sfx.svg";

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


import {
    get_staked_tokens,
    get_interest_map,
    daemon_parse_transaction,
    get_transactions
} from '../../utils/safexd_calls';

// Icon Imports
import {FaInfoCircle, FaCopy} from 'react-icons/fa'
import {IconContext} from 'react-icons'
import {CgCopy, CgClose} from 'react-icons/cg'

import copy from "copy-to-clipboard"
import ReactTooltip from "react-tooltip";
import ReactModal from 'react-modal';
import Loader from 'react-loader-spinner'

import print from 'print-js'

import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"

// Custom Components
import MainHeader from '../customComponents/MainHeader';
import SendSafex from '../customComponents/SendSafex';
import HomeInfo from '../customComponents/HomeInfo';
import AccountInfo from '../customComponents/AccountInfo';
import Stake from '../customComponents/Stake';
import StakeInfo from '../customComponents/StakeInfo';
import StakingTable from '../customComponents/StakingTable';
import MerchantAccounts from '../customComponents/MerchantAccounts';
import MerchantTabs from '../customComponents/MerchantTabs';
import MerchantOffers from '../customComponents/MerchantOffers';
import MyOrders from '../customComponents/MyOrders';

import {
    open_twm_file,
    save_twm_file,
    register_api,
    get_offers_url,
    get_seller_pubkey,
    dispatch_purchase_message,
    merchant_get_messages,
    merchant_reply_message,
    buyer_get_messages,
    buyer_send_message,
    is_user_registered
} from "../../utils/twm_actions";

import zlib from 'zlib';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import MessagesModal from '../customComponents/MessagesModal';

const cryptoRandomString = require('crypto-random-string');

const sfxjs = window.require('safex-addressjs');


var wallet;

let offerRows;
let tableOfOrders;
let buyerOrders;
let offerDropdown = [];
let orderDropdown = [];

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
            show_edit_offer_data: {description: '', main_image: '', image_2: '', image_3: '', image_4: '', sku: '', barcode: '', weight: '', country: ''},
            show_edit_offer: {},
            order_ids_selected: [],
            messages_selected: [],
            show_orders: false,
            showMyOrders: false,
            showBuyerOrders: false,
            new_account_image: require('./../../img/new-account.png'),
            newAccountImage: require('./../../img/new-account.png'),
            accountsImage: require('./../../img/see-accounts.png'),
            newOfferImage: require('./../../img/make-offer.png'),
            offersImage: require('./../../img/see-offers.png'),
            merchantTabs: 'accounts',
            showLoader: false,
            nft_switch: false,
            shipping_switch: false,
            open_message_switch: false,
            showMessages: false,
            currentMessage: {},
            offersLoaded: false,
            selectedOffer: '',
            tableOfTables: {},
            loadingOffers: false,
            showBuyerMessages: false,
            url: '',
            buyer_urls: [],
            user_registered: null,
            show_modal_for_image: null,
            token_stakes: []
        };
    }

    async componentWillUnmount() {
        localStorage.removeItem('twm_file');
        localStorage.removeItem('encrypted_wallet');
        localStorage.removeItem('wallet');
    };

    async componentDidMount() {
        try {
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
            } catch (err) {
                console.error(err);
                console.error(`error at mounting with the twm file`);
            }

            let txnhistory = wallet.history();

            txnhistory.sort(function (a, b) {
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
                console.log(wallet.getMyStake());
                console.log(`interest mapping`);
                let gst_obj = {};
                gst_obj.interval = 0;
                gst_obj.daemon_host = this.props.daemon_host;
                gst_obj.daemon_port = this.props.daemon_port;
                let gst = await get_staked_tokens(gst_obj);
                console.log(gst);
                this.setState({
                    blockchain_tokens_staked: gst.pairs[0].amount / 10000000000
                });
            } catch (err) {
                console.error(err);
                console.error(`error at getting the staked tokens from the blockchain`);
            }
            if (wallet.connected() !== 'disconnected') {
                this.setState({connection_status: 'Connected to the Safex Blockchain Network'});

            } else {
                this.setState({connection_status: 'Unable to connect to the Safex Blockchain Network'});
            }
            wallet.on('refreshed', () => {
                this.refresh_action();
                wallet.store(this.wallet_store_callback)
            });
            wallet.on('updated', () => {
                console.log('updated?');
            });
            console.log(wallet.synchronized());

            this.setState({loading: false, address: wallet.address(), wallet: wallet});

            var accs = wallet.getSafexAccounts();

            console.log(accs);
            console.log(`accounts`);
            this.refresh_action();
            this.buyer_get_offer_ids_by_api();
        } catch (err) {
            console.error(err);
            console.log("errors on startup");
        }
    };

    refresh_history = async () => {
        let txnhistory = wallet.history();
        txnhistory.sort(function (a, b) {
            return parseFloat(b.timestamp) - parseFloat(a.timestamp);
        });
        this.setState({txnhistory: txnhistory});
    }

    refresh_action = async () => {
        console.log("refreshing rn");
        try {
            let gst_obj = {};
            gst_obj.interval = 0;
            gst_obj.daemon_host = this.state.daemon_host;
            gst_obj.daemon_port = this.state.daemon_port;
            let gst = await get_staked_tokens(gst_obj);
            this.setState({blockchain_tokens_staked: gst.pairs[0].amount / 10000000000})
        } catch (err) {
            console.error(err);
            console.error(`error at checking the staked tokens from the blockchain`);
        }
        try {
            let height = wallet.daemonBlockchainHeight();
            /*console.log(height);
            let previous_interval = (height - (height % 100)) / 100;
            let gim_obj = {};
            gim_obj.begin_interval = previous_interval - 3;
            gim_obj.end_interval = previous_interval + 1;
            gim_obj.daemon_host = this.state.daemon_host;
            gim_obj.daemon_port = this.state.daemon_port;

            console.log(gim_obj);
            console.log(`refresh get`);
            console.log(wallet.getRefreshFromBlockHeight())
            let gim = await get_interest_map(gim_obj);

             this.setState({
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
                wallet_height: wallet.blockchainHeight(),
                blockchain_height: height,
                cash: normalize_8decimals(wallet.unlockedBalance()),
                pending_tokens: normalize_8decimals(wallet.tokenBalance() - wallet.unlockedTokenBalance()),
                tokens: normalize_8decimals(wallet.unlockedTokenBalance()),
                first_refresh: true,
                usernames: accs,
                staked_tokens: wallet.stakedTokenBalance() / 10000000000,
                unlocked_stake: wallet.unlockedStakedTokenBalance() / 10000000000,
                pending_stake: (wallet.stakedTokenBalance() - wallet.unlockedStakedTokenBalance()) / 10000000000
            });
        } catch (err) {
            console.error(err);
            console.error(`error at updating balances on refresh`);
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
            this.setState({connection_status: 'Connected to the Safex Blockchain Network'});
        } else {
            this.setState({connection_status: 'Unable to connect to the Safex Blockchain Network'});
        }
        if (wallet.synchronized()) {
            console.log("wallet synchronized");
            this.setState({
                cash: normalize_8decimals(wallet.unlockedBalance()),
                blockchain_height: wallet.daemonBlockchainHeight(),
                wallet_height: wallet.blockchainHeight()
            });
        } else {
            this.setState({
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
            wallet.rescanBlockchainAsync();
            const timer = setInterval(() => {
                console.log(wallet.blockchainHeight());
                if (wallet.blockchainHeight() === wallet.daemonBlockchainHeight()) {
                    console.log(`looks like we're synced heights match`);
                    clearInterval(this.state.timer);
                    wallet.on('refreshed', () => {
                        this.refresh_action();
                        wallet.store(this.wallet_store_callback)
                    });
                    this.setState({
                        timer: '', wallet_height: wallet.blockchainHeight(),
                        blockchain_height: wallet.daemonBlockchainHeight()
                    })
                } else {
                    this.setState({
                        wallet_height: wallet.blockchainHeight(),
                        blockchain_height: wallet.daemonBlockchainHeight()
                    })
                }
            }, 1000);
            this.setState({timer: timer});
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

        if (this.state.tokens >= 1000 && this.state.first_refresh === true) {
            try {
                let vees = e.target;

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
                    let this_account;
                    for (const acc of accs) {
                        if (acc.username === e.target.username.value) {
                            this_account = acc;
                        }
                    }
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
                        try {
                            let commit_create = await this.commit_create_account_async(create_acc);
                            console.log(commit_create);
                        } catch (err) {
                            console.error(err);
                            alert(`there was an error committing the account creation`);
                        }
                    } else {
                        let removed = wallet.removeSafexAccount(this_account.username);
                        console.log(`account ${this_account.username} was cancelled so removed and not made`);
                        alert(`your transaction was cancelled, no account registration was completed`);
                    }
                } else {
                    let removed = wallet.removeSafexAccount(e.target.username.value);
                    console.log(`account ${e.target.username.value} removed and not made`);
                    alert(`The account creation failed, ${e.target.username.value} was not created`);
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

                        let confirm = window.confirm(`this account didn't get created, remove and try again?`)
                        if (confirm) {
                            let removed = wallet.removeSafexAccount(username);
                            console.log(`removed ${username} at the first callback`)
                            alert(`removed ${username} during the transaction creation, you should be able to try again`);
                            alert(err);
                        } else {
                            alert(`error registering ${username} next message will give the error`);
                            alert(err);
                        }
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
            console.error("error at the edit account function");
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
            this.setState({[event.target.name]: event.target.value});
        } else {
            this.setState({[event.target.name]: event.target.value});
        }
    };

    handleBuyerChange = (e) => {
        let name = e.target.name;
        let value = e.target.value;
        this.setState({[name]: value});
        console.log(e.target.name);
        console.log(e.target.value);
        console.log(this.state.buyerSelectUrl);
    }

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
        try {
            console.log(this.state.api_url);
            let loaded_offers = await get_offers_url(this.state.api_url);
            console.log(loaded_offers);
            this.setState({
                twm_url_offers: loaded_offers.offers,
                offer_loading_flag: 'twmurl'
            });
        } catch (err) {
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
        this.buyer_get_offer_ids_by_api();
        setTimeout(() => {
            this.setState({
                interface_view: 'market',
                keyRequest: false
            });
        }, 500);
    };

    //open merchant management view from navigation
    show_merchant = () => {
        this.setState({keyRequest: false})
        this.setState({
            interface_view: 'merchant'
        });
    };

    //open staking view from navigation
    show_tokens = () => {
        let token_stakes = wallet.getMyStake();
        this.setState({interface_view: 'tokens', keyRequest: false, token_stakes: token_stakes})
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

    handleBuyerMessages = (offerId, orderId) => {
        const showBuyerMessages = !this.state.showBuyerMessages;
        this.setState({showBuyerMessages, buyerSelectOffer: offerId, buyerSelectOrder: orderId});
        if (showBuyerMessages) {
            // Automatically load messages when opening modal
            this.load_buyers_messages_for_selected_order(offerId, orderId);
        }
    }

    //show modal of private keys
    handleKeys = (password) => {
        if (!this.state.show_keys && password && password === this.state.password) {
            this.setState({show_keys: true});
        } else {
            this.setState({show_keys: false, keyRequest: false})
        }
    };

    //close modal of New Offer
    handleCloseNewOfferForm = () => {
        this.setState({show_new_offer_form: false});
    };

    //show modal of New Offer
    handleShowNewOfferForm = () => {
        if (this.state.user_registered) {
            this.setState({
                show_new_offer_form: true,
                nft_switch: false,
                shipping_switch: false,
                open_message_switch: false
            });
        } else if (!this.state.user_registered) {
            alert(`user must be successfully approved and registered to use this feature`);
        }
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
        let d_obj = {};
        try {
            let p_data = JSON.parse(listing.description);
            console.log(p_data);
            let d_obj = {};
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
            if (p_data.description) {
                d_obj.description = p_data.description;
            }
            if (p_data.main_image) {
                d_obj.main_image = p_data.main_image;
            }
            if (p_data.image_2) {
                d_obj.image_2 = p_data.image_2;
            }
            if (p_data.image_3) {
                d_obj.image_3 = p_data.image_3;
            }
            if (p_data.image_4) {
                d_obj.image_4 = p_data.image_4;
            }
            if (p_data.sku) {
                d_obj.sku = p_data.sku;
            }
            if (p_data.barcode) {
                d_obj.barcode = p_data.barcode;
            }
            if (p_data.weight) {
                d_obj.weight = p_data.weight;
            }
            if (p_data.country) {
                d_obj.country = p_data.country;
            }
            this.setState({show_edit_offer_data: p_data})
        } catch (err) {
            console.error(err);
            console.error(`error at the loading of listing data`);
        }
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
    select_merchant_user = async (username, index) => {
        this.setState({selected_user: {username: username, index: index}});
        try {
            let req_payload = {};
            req_payload.username = username;
            let is_user = await is_user_registered(req_payload, this.state.api_url);

            if (is_user.error) {
                console.log(is_user);
            } else if (is_user.r_msg) {
                console.log(`user is not registered`);
                console.log(is_user);
                this.setState({selected_user: {username: username, index: index}, user_registered: false});
            } else if (is_user.user) {
                console.log(is_user);
                console.log(`turns out user is registered`);

                var offrs = wallet.getMySafexOffers();
                let twm_offers = [];

                for (var i in offrs) {
                    console.log(`checking the offers`);
                    console.log(offrs[i]);
                    try {
                        if (offrs[i].seller == username) {
                            console.log(`seller matched infact`);
                            let offer_description = JSON.parse(offrs[i].description);
                            if (offer_description.twm_version > 0) {
                                offrs[i].description_obj = offer_description;
                                twm_offers.push(offrs[i]);
                            }
                        }
                    } catch (err) {
                        console.error(`error at parsing json from description of ${username} offer list`);
                        console.error(err);
                    }
                }
                this.setState({
                    twm_offers: twm_offers
                });

                this.fetch_messages_seller(username, 'http://stageapi.theworldmarketplace.com:17700');
                this.setState({selected_user: {username: username, index: index}, user_registered: true});
            }
        } catch (err) {
            console.error(err);
            console.error(`error at checking if user is registered`);
            alert(`this user ${username} is not yet approved with the TWM API`);
            this.setState({selected_user: {username: username, index: index}, user_registered: false});
        }
    };

    list_new_offer = async (e) => {
        e.preventDefault();
        e.persist();
        let vees = e.target;

        let o_obj = {};
        o_obj.twm_version = 1;

        if (vees.description.value.length > 0) {
            o_obj.description = vees.description.value;
        }
        if (vees.main_image.value.length > 0) {
            o_obj.main_image = vees.main_image.value;
        }
        if (vees.image_2.value.length > 0) {
            o_obj.image_2 = vees.image_2.value;
        }
        if (vees.image_3.value.length > 0) {
            o_obj.image_3 = vees.image_3.value;
        }
        if (vees.image_4.value.length > 0) {
            o_obj.image_4 = vees.image_4.value;
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
        if (!this.state.shipping_switch) {
            this.setState({
                nft_switch: false,
                open_message_switch: false,
                shipping_switch: true
            });
        } else {
            this.setState({shipping_switch: false});
        }
    };

    change_nft_switch = () => {
        if (!this.state.nft_switch) {
            this.setState({
                nft_switch: true,
                open_message_switch: false,
                shipping_switch: false
            });
        } else {
            this.setState({nft_switch: false});
        }
    };

    change_open_message_switch = () => {
        if (!this.state.open_message_switch) {
            this.setState({
                nft_switch: false,
                open_message_switch: true,
                shipping_switch: false
            });
        } else {
            this.setState({open_message_switch: false});
        }
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
        try {
            let mixins = e.target.mixins.value - 1;
            if (mixins >= 0) {
                let confirmed = window.confirm(`Are you sure you want to stake ${e.target.amount.value} SFT Safex Tokens?`);
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
                            alert(`the token staking transaction has been successfully cancelled`);
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
        console.log(e.target.selected_stake.value);
        let selected_stake_index = e.target.selected_stake.selectedIndex;
        console.log(selected_stake_index);
        let stake_is = this.state.token_stakes[selected_stake_index];
        try {
            let mixins = e.target.mixins.value - 1;
            if (mixins >= 0) {
                let confirmed = window.confirm(`Are you sure you want to stake ${stake_is.tokenStaked / 10000000000} SFT Safex Tokens, 
                from height: ${stake_is.blockHeight}, and collect ${stake_is.collectedInterest} SFX`);
                console.log(confirmed);
                if (confirmed) {
                    try {
                        this.setState({unstake_txn_amount: stake_is.tokenStaked / 10000000000});
                        let unstaked = await this.token_unstake_async(
                            wallet,
                            stake_is.tokenStaked / 10000000000,
                            stake_is.blockHeight,
                            mixins
                        );
                        let confirmed_fee = window.confirm(`The network fee to unstake ${this.state.unstake_txn_amount} SFT will be:  ${unstaked.fee() / 10000000000} SFX Safex Cash`);
                        let fee = unstaked.fee();
                        let txid = unstaked.transactionsIds();
                        if (confirmed_fee) {
                            try {
                                this.setState({unstake_txn_id: txid, unstake_txn_fee: fee});
                                let commit_unstake = await this.commit_token_unstake_txn_async(unstaked);
                                console.log(`unstake committed`);
                                alert(`stake transaction successfully committed`);
                            } catch (err) {
                                console.error(err);
                                console.error(`Error when trying to commit the token unstaking transaction to the blockchain`);
                                alert(`Error when trying to commit the token unstaking transaction to the blockchain`);
                            }
                        } else {
                            console.log("token staking transaction cancelled");
                            alert(`token unstake transaction successfully cancelled`);
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

    token_unstake_async = async (wallet, amount, block_height, mixins) => {
        return new Promise((resolve, reject) => {
            try {
                unstake_tokens(wallet, amount, block_height, mixins, (err, res) => {
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
                        let token_stakes = wallet.getMyStakes();
                        this.setState({token_stakes: token_stakes});
                        resolve(res);
                    }
                });
            } catch (err) {
                reject(err);
            }
        });
    };

    register_twmapi = async (user, twm_api_url = 'http://stageapi.theworldmarketplace.com:17700') => {
        try {
            let twm_file = this.state.twm_file;
            if (twm_file.accounts.hasOwnProperty(user.username)) {
                if (twm_file.accounts[user.username].urls.hasOwnProperty(twm_api_url)) {
                    alert(`this account is already registered with the api`);
                } else {
                    try {
                        const crypto = window.require('crypto');

                        const {privateKey, publicKey} = await crypto.generateKeyPairSync('rsa', {
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
                        f_obj.msg_hash = sfxjs.cn_fast_hash_safex(r_obj_string, r_obj_string.length);

                        try {
                            let register_msgg = await register_api(twm_api_url, f_obj);
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

                            let twm_save = await save_twm_file(this.state.new_path + '.twm', crypted, this.state.password, hash1.digest('hex'));
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
                                alert(`there was an error saving the contents to the twm file at registering`);
                            }
                        } catch (err) {
                            console.error(err);
                            console.error(`error at the register_api function`);
                            alert(`${user.username} has not been registered with the api at this time`);
                            alert(err);
                        }
                    } catch (err) {
                        console.error(err);
                        alert(`there was an error at the registrion to api function`);
                        alert(err);
                    }
                }
            }
        } catch (err) {
            console.error(err);
            console.error(`error at the twm_file at register api`);
            alert(`there was an error registering with the api`);
            alert(err);
        }
    };

    to_ellipsis = (text, firstHalf, secondHalf) => {
        if (typeof text !== "string") {
            return text
        } else {
            const ellipse = `${text.substring(0, firstHalf)}.....${text.substring(text.length - secondHalf, text.length)}`
            return (ellipse)
        }
    };

    hexStringToByte = (str) => {
        if (!str) {
            return new Uint8Array();
        }
        var a = [];
        for (var i = 0, len = str.length; i < len; i += 2) {
            a.push(parseInt(str.substr(i, 2), 16));
        }
        return new Uint8Array(a);
    };

    get_seller_order_ids_by_offer = async (offer_id, username, twm_api_url) => {
        try {
            this.setState({selectedMerchantOffer: offer_id})
            let twm_file = this.state.twm_file;
            let more_core = twm_file.accounts[username].urls[twm_api_url].messages;
            console.log(`accessing messages`);
            if (more_core.hasOwnProperty(offer_id)) {
                console.log(`found offer_id`);
                console.log(more_core[offer_id]);
                let order_ids_array = [];
                for (const order in more_core[offer_id].orders) {
                    var count = Object.keys(more_core[offer_id].orders[order].messages).length;
                    let o_obj = {};
                    o_obj.order_id = order;
                    o_obj.msg_count = count;
                    o_obj.quantity = more_core[offer_id].orders[order].purchase_info.quantity;
                    order_ids_array.push(o_obj);
                }
                return order_ids_array;
            } else {
                console.log(`${offer_id} not found in file`);
                alert(`There are no orders found for ${offer_id}`)
            }
        } catch (err) {
            console.error(err);
            alert(`error user and/or url are not in this file, no messages`);
        }
    };

    get_messages_by_order_id_of_seller = async (offer_id, username, twm_api_url, order_id) => {
        try {
            let twm_file = this.state.twm_file;
            let more_core = twm_file.accounts[username].urls[twm_api_url].messages[offer_id].orders;
            if (more_core.hasOwnProperty(order_id)) {
                let messages_array = [];
                for (const message in more_core[order_id].messages) {
                    console.log(message);
                    console.log(more_core[order_id].messages[message])
                    messages_array.push(more_core[order_id].messages[message]);
                }
                return messages_array;
            } else {
                console.log(`${order_id} not found in file`);
                alert(`this order was not found ${order_id}`);
            }
        } catch (err) {
            console.error(err);
            alert(`error user and/or url are not in this file, no messages`);
        }
    };

    fetch_messages_seller = async (username, twm_api_url) => {
        try {
            if (this.state.twm_file.accounts.hasOwnProperty(username)) {
                if (this.state.twm_file.accounts[username].urls.hasOwnProperty(twm_api_url)) {
                    console.log(`it has the twmapi in it's file for the fetch messages_seller`);
                    let date = new Date(new Date().toUTCString());

                    const crypto = window.require('crypto');
                    let our_key = crypto.createPrivateKey(this.state.twm_file.accounts[username].urls[twm_api_url].pgp_key.sec_key)
                    let date_msg = Buffer.from(date.toString());

                    let msg_hex = this.byteToHexString(date_msg);
                    const signature = crypto.sign("sha256", date_msg, {
                        key: our_key,
                        padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
                    });
                    let verified_sig = crypto.verify(
                        "sha256",
                        date_msg,
                        {
                            key: our_key,
                            padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
                        },
                        signature
                    );
                    let req_payload = {};
                    req_payload.signature = this.byteToHexString(signature);
                    req_payload.username = username;
                    req_payload.msg = date.toString();
                    req_payload.msg_hex = msg_hex;

                    let req_msgs = await merchant_get_messages(req_payload, twm_api_url);

                    let twm_file = this.state.twm_file;

                    for (const order in req_msgs.to) {
                        console.log(req_msgs.to[order]);
                        for (const msg of req_msgs.to[order]) {
                            try {
                                const decryptedData = crypto.privateDecrypt(
                                    {
                                        key: our_key,
                                        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                                        oaepHash: "sha256",
                                    },
                                    this.hexStringToByte(msg.message)
                                );
                                let decomped = zlib.inflateSync(Buffer.from(decryptedData));
                                try {
                                    let parsed = JSON.parse(decomped.toString());
                                    msg.message = decomped.toString();
                                    console.log(`this is the decryped parsed message`);
                                    console.log(parsed);
                                    if (msg.to === username) {
                                        if (twm_file.accounts[username].urls[twm_api_url].messages.hasOwnProperty(parsed.o)) {
                                            //if has this offer
                                            if (twm_file.accounts[username].urls[twm_api_url].messages[parsed.o].orders.hasOwnProperty(msg.order_id)) {
                                                //if has messages from this order_id
                                                if (twm_file.accounts[username].urls[twm_api_url].messages[parsed.o].orders[msg.order_id].messages.hasOwnProperty(msg.position)) {
                                                    console.log(`we already have this message`);
                                                } else {
                                                    twm_file.accounts[username].urls[twm_api_url].messages[parsed.o].orders[msg.order_id].messages[msg.position] = msg;
                                                }
                                            } else {
                                                //if this is a new order id for the offer
                                                let pinfo_obj = {};
                                                pinfo_obj.buyers_pgp = msg.sender_pgp_pub_key;
                                                pinfo_obj.purchase_proof = msg.purchase_proof;
                                                try {
                                                    let gt_obj = {};
                                                    gt_obj.daemon_host = this.state.daemon_host;
                                                    gt_obj.daemon_port = this.state.daemon_port;
                                                    console.log(msg.purchase_proof);
                                                    console.log(`purchase proof ${msg.purchase_proof}`);
                                                    let txn = await get_transactions(gt_obj, msg.purchase_proof);
                                                    try {
                                                        console.log(txn);
                                                        let the_txn = JSON.parse(txn.txs[0].as_json);
                                                        console.log(`gotten txn ${the_txn}`);
                                                        console.log(the_txn);
                                                        console.log(`the txn ^^^`);
                                                        for (const vout of the_txn.vout) {
                                                            if (vout.target.script) {
                                                                if (vout.target.script.output_type === 30) {
                                                                    console.log(`we found the purchase txn here`);
                                                                    try {
                                                                        let parsed_txn = await daemon_parse_transaction(gt_obj, vout.target.script.data, 30);
                                                                        console.log(parsed_txn);
                                                                        console.log(`daemon parsed txn ^^`)
                                                                        let o_id = '';
                                                                        let l_price = 0;
                                                                        let l_quant = 0;
                                                                        for (const field of parsed_txn.parsed_fields) {
                                                                            if (field.field === 'offer_id') {
                                                                                o_id = field.value;
                                                                            } else if (field.field === 'price') {
                                                                                l_price = parseInt(field.value) / 10000000000;
                                                                            } else if (field.field === 'quantity') {
                                                                                l_quant = field.value;
                                                                            }
                                                                        }
                                                                        if (o_id === parsed.o) {
                                                                            pinfo_obj.quantity = l_quant;
                                                                            pinfo_obj.price = l_price;

                                                                            twm_file.accounts[username].urls[twm_api_url].messages[parsed.o].orders[msg.order_id] = {};
                                                                            twm_file.accounts[username].urls[twm_api_url].messages[parsed.o].orders[msg.order_id].messages = {};
                                                                            twm_file.accounts[username].urls[twm_api_url].messages[parsed.o].orders[msg.order_id].purchase_info = {};

                                                                            twm_file.accounts[username].urls[twm_api_url].messages[parsed.o].orders[msg.order_id].purchase_info = pinfo_obj;

                                                                            twm_file.accounts[username].urls[twm_api_url].messages[parsed.o].orders[msg.order_id].messages[msg.position] = msg;
                                                                            alert(`just recorded transaction ${msg.order_id} order for ${parsed.o}`);
                                                                        } else {
                                                                            console.log(`retrieved purchase proof does not match the offer id on the message something is wrong here.`);
                                                                        }
                                                                    } catch (err) {
                                                                        console.error(err);
                                                                        console.error(`error getting the parsed transaction contents`);
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    } catch (err) {
                                                        console.error(err);
                                                        console.error(`error at parsing the txn retreived`)
                                                    }

                                                } catch (err) {
                                                    console.error(err);
                                                    console.error(`error fetching the transaction`);
                                                }
                                            }
                                        } else {
                                            //in case this offer hasn't been seen before
                                            twm_file.accounts[username].urls[twm_api_url].messages[parsed.o] = {};
                                            twm_file.accounts[username].urls[twm_api_url].messages[parsed.o].orders = {};
                                            twm_file.accounts[username].urls[twm_api_url].messages[parsed.o].orders[msg.order_id] = {};
                                            twm_file.accounts[username].urls[twm_api_url].messages[parsed.o].orders[msg.order_id].messages = {};
                                            twm_file.accounts[username].urls[twm_api_url].messages[parsed.o].orders[msg.order_id].purchase_info = {};
                                            if (twm_file.accounts[username].urls[twm_api_url].messages[parsed.o].orders[msg.order_id].messages.hasOwnProperty(msg.position)) {
                                                console.log(`seems we have a duplicated message`);
                                            } else {
                                                let pinfo_obj = {};
                                                pinfo_obj.buyers_pgp = msg.sender_pgp_pub_key;
                                                pinfo_obj.purchase_proof = msg.purchase_proof;
                                                try {
                                                    let gt_obj = {};
                                                    gt_obj.daemon_host = this.state.daemon_host;
                                                    gt_obj.daemon_port = this.state.daemon_port;
                                                    console.log(`purchase proof ${msg.purchase_proof}`);
                                                    console.log(msg.purchase_proof);
                                                    console.log(`purchase proof ${msg.purchase_proof}`);
                                                    let txn = await get_transactions(gt_obj, msg.purchase_proof);
                                                    try {
                                                        console.log(txn);
                                                        let the_txn = JSON.parse(txn.txs[0].as_json);
                                                        console.log(`gotten txn ${the_txn}`);
                                                        console.log(the_txn);
                                                        console.log(`the txn ^^^`);
                                                        for (const vout of the_txn.vout) {
                                                            if (vout.target.script) {
                                                                if (vout.target.script.output_type === 30) {
                                                                    console.log(`we found the purchase txn here`);
                                                                    try {
                                                                        let parsed_txn = await daemon_parse_transaction(gt_obj, vout.target.script.data, 30);
                                                                        console.log(parsed_txn);
                                                                        console.log(`daemon parsed txn ^^`)
                                                                        let o_id = '';
                                                                        let l_price = 0;
                                                                        let l_quant = 0;
                                                                        for (const field of parsed_txn.parsed_fields) {
                                                                            if (field.field === 'offer_id') {
                                                                                o_id = field.value;
                                                                            } else if (field.field === 'price') {
                                                                                l_price = field.price / 10000000000;
                                                                            } else if (field.field === 'quantity') {
                                                                                l_quant = field.quant;
                                                                            }
                                                                        }
                                                                        if (o_id === parsed.o) {
                                                                            pinfo_obj.quantity = l_quant;
                                                                            pinfo_obj.price = l_price;

                                                                            twm_file.accounts[username].urls[twm_api_url].messages[parsed.o].orders[msg.order_id].purchase_info = pinfo_obj;

                                                                            twm_file.accounts[username].urls[twm_api_url].messages[parsed.o].orders[msg.order_id].messages[msg.position] = msg;
                                                                            alert(`just recorded transaction ${msg.order_id} order for ${parsed.o}`);
                                                                        } else {
                                                                            console.log(`retrieved purchase proof does not match the offer id on the message something is wrong here.`);
                                                                        }
                                                                    } catch (err) {
                                                                        console.error(err);
                                                                        console.error(`error getting the parsed transaction contents`);
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    } catch (err) {
                                                        console.error(err);
                                                        console.error(`error at parsing the txn retreived`)
                                                    }
                                                } catch (err) {
                                                    console.error(err);
                                                    console.error(`error fetching the transaction`);
                                                }
                                            }
                                        }
                                    } else {
                                        console.error(`there is an error with this msg.to doesn't match the username`);
                                    }
                                    try {
                                        const crypto = window.require('crypto');
                                        const algorithm = 'aes-256-ctr';
                                        const cipher = crypto.createCipher(algorithm, this.state.password.toString());
                                        let crypted = cipher.update(JSON.stringify(twm_file), 'utf8', 'hex');
                                        crypted += cipher.final('hex');
                                        const hash1 = crypto.createHash('sha256');
                                        hash1.update(JSON.stringify(twm_file));
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
                                    } catch (err) {
                                        this.setState({showLoader: false});
                                        console.error(err);
                                        console.error(`error at initial save of the twm file`);
                                        alert(`Error at saving to the twm file during account creation initialization stage`);
                                    }
                                } catch (err) {
                                    console.error(err);
                                    console.error(`error at parsing the message`)
                                }
                            } catch (err) {
                                console.error(err);
                            }
                        }
                    }
                }
            }
        } catch (err) {
            console.error(err);
            console.error(`error at the fetch_messages_seller`);
        }
    };

    isEmpty(obj) {
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop))
                return false;
        }
        return true;
    };

    buyer_get_offer_ids_by_api = async () => {
        try {
            let urls = [];
            let t_f = this.state.twm_file;
            if (!this.isEmpty(t_f.api.urls)) {
                for (const url in t_f.api.urls) {
                    console.log(url);
                    urls.push(url);
                }
                this.setState({buyer_urls: urls});
            } else {
                console.log(`there are no urls to parse from`);
            }
            console.log(this.state.buyer_urls)
        } catch (err) {
            console.error(err);
            console.error(`error at the checking of the urls of the buyer_get_offer_ids_by_api`)
        }
    };

    /**
     * @return {string[]}
     */
    buyer_get_offer_ids = () => {
        const {api_url, twm_file: twm} = this.state;
        if (!api_url || !twm || !twm.api || !twm.api.urls) {
            return [];
        }
        const offersAtUrl = this.state.twm_file.api.urls[api_url];
        if (!offersAtUrl) {
            return [];
        }
        return Object.keys(offersAtUrl);
    };

    /**
     * @return {Array<BuyerPurchaseObj & { order_id }>}
     */
    buyer_get_orders = () => {
        const {api_url, twm_file: twm} = this.state;
        if (!api_url || !twm || !twm.api || !twm.api.urls) {
            return [];
        }
        const offers = this.state.twm_file.api.urls[api_url];
        if (!offers) {
            return [];
        }

        const result = [];

        for (const offerId in offers) {
            const offerOrders = offers[offerId];
            for (const orderId in offerOrders) {
                const order = offerOrders[orderId];
                result.push({
                    ...order.purchase_obj,
                    order_id: orderId
                });
            }
        }
        return result;
    };

    renderBuyerMessages() {
        const {api_url, buyerSelectOffer, buyerSelectOrder, twm_file: t_f} = this.state;
        if (!api_url || !buyerSelectOffer || !buyerSelectOrder || !t_f || !t_f.api || !t_f.api.urls) {
            return [];
        }
        const messages = [];
        try {
            /** @type {BuyerOrder} */
            const core = t_f.api.urls[api_url][buyerSelectOffer][buyerSelectOrder];
            if (!core) {
                console.error(`order ${buyerSelectOrder} not found`);
                return;
            }
            for (const msg in core.messages) {
                //console.log(t_f.api.urls[this.state.api_url][this.state.buyerSelectOffer][this.state.buyerSelectOrder].messages[msg]);
                try {
                    let t_msg = core.messages[msg];
                    if (typeof t_msg.message == 'string') {
                        t_msg.message = JSON.parse(t_msg.message);
                    }
                    if (t_msg.message.n.length > 0) {
                        console.log(`nft address supplied!`);
                        messages.push(
                            <div className="d-flex align-items-center justify-content-between mt-3" key={msg}>
                                <span>
                                    {t_msg.position}
                                </span>
                                <span>{t_msg.message.n}</span>
                            </div>
                        );
                    } else if (t_msg.message.m.length > 0) {
                        console.log(`this is a direct message open ended`);
                        messages.push(
                            <div className="d-flex align-items-center mt-3" key={msg}>
                                <span style={{color: '#0000004d'}}>
                                    {t_msg.position}
                                </span>
                                <span className={`message ${t_msg.from.startsWith('-----BEGIN') ? 'message--mine' : 'message--yours'}`}>{t_msg.message.m}</span>
                            </div>
                        );
                    } else if (t_msg.message.hasOwnProperty('so')) {
                        let parsed_so;
                        if (typeof t_msg.message.so == 'string') {
                            parsed_so = JSON.parse(t_msg.message.so);
                        } else {
                            parsed_so = t_msg.message.so;
                        }
                        if (parsed_so.fn.length > 2) {
                            console.log(`there is a shipping object supplied!`);
                            try {
                                console.log(`parsed the so`);
                                messages.push(
                                    <div key={msg}>
                                        <div>
                                            <span>
                                                {t_msg.position}
                                            </span>
                                            <div class="d-flex flex-column"
                                            style={{
                                                backgroundColor: '#d3d3d345',
                                                padding: '10px',
                                                borderRadius: '10px'}}>
                                                <div class="d-flex">
                                                <label>First name:</label>
                                                <span className="ml-2">{parsed_so.fn}</span>
                                                </div>
                                                
                                                <div class="d-flex">
                                                <label>Last name:</label>
                                                <span className="ml-2">{parsed_so.ln}</span>
                                                </div>

                                                <div class="d-flex">
                                                <label>Email:</label>
                                                <span className="ml-2">{parsed_so.ea}</span>
                                                </div>

                                                <div class="d-flex">
                                                <label>Phone:</label>
                                                <span className="ml-2">{parsed_so.ph}</span>
                                                </div>
                                            <div>
                                                <label>Street Address:</label>
                                                <span className="ml-2">{parsed_so.a1}</span>
                                                </div>
                                                <div class="d-flex">
                                                <label>City:</label>
                                                <span className="ml-2">{parsed_so.city}</span>
                                                </div>
                                                <div class="d-flex">
                                                <label>State:</label>
                                                <span className="ml-2">{parsed_so.s}</span>
                                                </div>
                                                <div class="d-flex">
                                                <label>Area code:</label>
                                                <span className="ml-2">{parsed_so.z}</span>
                                                </div>
                                                <div class="d-flex">
                                                <label>Country:</label>
                                                <span className="ml-2">{parsed_so.c}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            } catch (err) {
                                console.error(err);
                                console.error(`error at parsing the shipping object`);
                            }
                        }
                    }
                } catch (err) {
                    console.error(err);
                }
            }
        } catch (err) {
            console.error(err);
            console.error(`error at buyer_get_messages_by_offer_id`);
        }
        return messages;
    }

    seller_reply_message = async (e, seller_name, offer_id, order_id, message, twm_api_url) => {
        e.preventDefault();
        try {
            //let's get the order we want to reply to
            let twm_file = this.state.twm_file;
            if (twm_file.accounts.hasOwnProperty(seller_name)) {
                if (twm_file.accounts[seller_name].urls.hasOwnProperty(twm_api_url)) {
                    if (twm_file.accounts[seller_name].urls[twm_api_url].messages.hasOwnProperty(offer_id)) {
                        if (twm_file.accounts[seller_name].urls[twm_api_url].messages[offer_id].orders.hasOwnProperty(order_id)) {

                            const crypto = window.require('crypto');
                            let the_order = twm_file.accounts[seller_name].urls[twm_api_url].messages[offer_id].orders[order_id];
                            console.log(`hey, you're gonna be able to reply :)`);

                            console.log(the_order)

                            let seller_pub = twm_file.accounts[seller_name].urls[twm_api_url].pgp_key.pub_key;
                            let seller_pri = twm_file.accounts[seller_name].urls[twm_api_url].pgp_key.sec_key;

                            let message_header_obj = {};
                            message_header_obj.sender_pgp_pub_key = seller_pub;
                            message_header_obj.to = the_order.purchase_info.buyers_pgp;
                            message_header_obj.from = seller_name;
                            message_header_obj.order_id = order_id;
                            message_header_obj.bc_height = this.state.blockchain_height;

                            let pre_sign_message_obj = {};
                            pre_sign_message_obj.s = ''; //subject
                            pre_sign_message_obj.o = offer_id; //offer_id
                            pre_sign_message_obj.m = message; //open_message contents
                            pre_sign_message_obj.n = ''; //nft address
                            pre_sign_message_obj.so = ''; //shipping object

                            message_header_obj.message_hash = keccak256(JSON.stringify(pre_sign_message_obj)).toString('hex');

                            message_header_obj.message_signature = '';

                            let pres_sign_string = JSON.stringify(pre_sign_message_obj);

                            const signature = crypto.sign("sha256", Buffer.from(pres_sign_string), {
                                key: seller_pri,
                                padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
                            });

                            message_header_obj.message_signature = signature;

                            let compressed_message_obj = zlib.deflateSync(Buffer.from(JSON.stringify(pre_sign_message_obj)));

                            console.log(": " + compressed_message_obj.length + " characters, " +
                                Buffer.byteLength((compressed_message_obj), 'utf8') + " bytes");

                            let found_key = crypto.createPublicKey(the_order.purchase_info.buyers_pgp);

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
                                key: seller_pri,
                                padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
                            });

                            let hex_enc_sig = this.byteToHexString(enc_signature);

                            message_header_obj.encrypted_message_signature = hex_enc_sig;
                            message_header_obj.encrypted_message = hex_enc_msg;

                            let mdispatched = await merchant_reply_message(message_header_obj, this.state.api_url);

                            message_header_obj.message = pre_sign_message_obj;
                            message_header_obj.position = mdispatched.msg_obj.position;
                            the_order.messages[mdispatched.msg_obj.position] = message_header_obj;
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
                                    alert(`message has been sent`);

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
                        } else {
                            console.log(`this ${order_id} is not present in the twmfile`);
                            alert(`unable to send message ${order_id} is not present`);
                        }
                    } else {
                        console.log(`user does not have the ${offer_id} in the file`);
                        alert(`unable to send message since ${offer_id} is not present`);
                    }
                } else {
                    console.log(`user has does not have content from ${twm_api_url}`);
                    alert(`this ${seller_name} does not have content from ${twm_api_url}`);
                }
            } else {
                console.log(`user is not present in the twm file`);
                alert(`unable to send message, could not find your username in the twm file`);
            }
        } catch (err) {
            console.error(err);
            console.error(`error at the seller reply message function call`);
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
    };

    load_buyers_messages_for_selected_order = async (offerId, orderId) => {
        const {api_url, twm_file: t_f} = this.state;
        if (!api_url || !offerId || !orderId || !t_f || !t_f.api || !t_f.api.urls) {
            return [];
        }
        try {
            console.log(`it has the twmapi in it's file for the fetch messages_of the buyer`);

            let date = new Date(new Date().toUTCString());
            console.log(date);
            console.log(date.toString());

            const crypto = window.require('crypto');
            let our_key = crypto.createPrivateKey(t_f.api.urls[api_url][offerId][orderId].pgp_keys.private_key)
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
            req_payload.pgp_public_key = t_f.api.urls[api_url][offerId][orderId].pgp_keys.public_key;
            req_payload.msg = date.toString();
            req_payload.order_id = orderId;
            req_payload.msg_hex = msg_hex;
            let req_msgs = await buyer_get_messages(req_payload, api_url);
            console.log(req_msgs.to);
            console.log(req_msgs.from);

            for (const order in req_msgs.to) {
                console.log(req_msgs.to[order]);
                for (const msg of req_msgs.to[order]) {
                    try {
                        const decryptedData = crypto.privateDecrypt(
                            {
                                key: our_key,
                                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                                oaepHash: "sha256",
                            },
                            this.hexStringToByte(msg.message)
                        );

                        console.log(decryptedData.toString());
                        let decomped = zlib.inflateSync(Buffer.from(decryptedData));
                        console.log(decomped.toString());
                        try {
                            let parsed = JSON.parse(decomped.toString());
                            msg.message = decomped.toString();
                            console.log(parsed);
                            if (msg.to === req_payload.pgp_public_key) {
                                console.log(msg.message);
                                if (t_f.api.urls[api_url][offerId][orderId].messages.hasOwnProperty(msg.position)) {
                                    console.log(`duplicate message here for fetch buyer messages`)
                                } else {
                                    // WARN! We are mutating the state here!
                                    t_f.api.urls[api_url][offerId][orderId].messages[msg.position] = msg;
                                }
                            }
                        } catch (err) {
                            console.error(err);
                            console.error(`err at parsing the decompressed string at buyer fetch the message`);
                        }
                    } catch (err) {
                        console.error(err);
                        console.error(`error at decrypting the message at the buyer fetch the message`);
                    }
                }
            }

            // NOTE: Due to mutating state variable, we need to force a reload
            this.forceUpdate();

            try {
                const crypto = window.require('crypto');
                const algorithm = 'aes-256-ctr';
                console.log(this.state.password);
                const cipher = crypto.createCipher(algorithm, this.state.password.toString());
                let crypted = cipher.update(JSON.stringify(t_f), 'utf8', 'hex');
                crypted += cipher.final('hex');

                const hash1 = crypto.createHash('sha256');
                hash1.update(JSON.stringify(t_f));
                console.log(`password ${this.state.password}`);
                console.log(JSON.stringify(t_f));

                let twm_save = await save_twm_file(this.state.new_path + '.twm', crypted, this.state.password, hash1.digest('hex'));

                try {
                    let opened_twm_file = await open_twm_file(this.state.new_path + '.twm', this.state.password);
                    console.log(opened_twm_file);

                    localStorage.setItem('twm_file', t_f);

                    this.setState({twm_file: t_f});

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
        } catch (err) {
            console.error(err);
            console.error(`error at fetching the messages of the buyer`);
        }
    };

    buyer_reply_by_order = async (e, twm_api_url = this.state.api_url, offer_id = this.state.buyerSelectOffer, order_id = this.state.buyerSelectOrder) => {
        e.preventDefault();
        let messageToSend = e.target.messageBox.value
        let t_f = this.state.twm_file;
        try {
            if (t_f.api.urls.hasOwnProperty(twm_api_url)) {
                if (t_f.api.urls[twm_api_url].hasOwnProperty(offer_id)) {
                    if (t_f.api.urls[twm_api_url][offer_id].hasOwnProperty(order_id)) {
                        try {
                            let the_order = t_f.api.urls[twm_api_url][offer_id][order_id];
                            let seller_pubkey = await get_seller_pubkey(the_order.messages[1].to, twm_api_url);
                            const crypto = window.require('crypto');
                            console.log(`hey buyer, you're gonna be able to reply :)`);

                            let buyer_pub = the_order.pgp_keys.public_key;
                            let buyer_pri = the_order.pgp_keys.private_key;

                            let message_header_obj = {};
                            message_header_obj.sender_pgp_pub_key = buyer_pub;
                            message_header_obj.to = the_order.messages[1].to;
                            message_header_obj.from = buyer_pub;
                            message_header_obj.order_id = order_id;
                            message_header_obj.bc_height = this.state.blockchain_height;

                            let pre_sign_message_obj = {};
                            pre_sign_message_obj.s = ''; //subject
                            pre_sign_message_obj.o = offer_id; //offer_id
                            pre_sign_message_obj.m = messageToSend; //open_message contents
                            pre_sign_message_obj.n = ''; //nft address
                            pre_sign_message_obj.so = ''; //shipping object

                            message_header_obj.message_hash = keccak256(JSON.stringify(pre_sign_message_obj)).toString('hex');

                            message_header_obj.message_signature = '';

                            let pres_sign_string = JSON.stringify(pre_sign_message_obj);

                            const signature = crypto.sign("sha256", Buffer.from(pres_sign_string), {
                                key: buyer_pri,
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
                                key: buyer_pri,
                                padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
                            });

                            let hex_enc_sig = this.byteToHexString(enc_signature);

                            message_header_obj.encrypted_message_signature = hex_enc_sig;
                            message_header_obj.encrypted_message = hex_enc_msg;

                            try {
                                let buyermdispatched = await buyer_send_message(message_header_obj, twm_api_url);
                                console.log(buyermdispatched);

                                message_header_obj.message = pre_sign_message_obj;
                                message_header_obj.position = buyermdispatched.msg_obj.position;

                                t_f.api.urls[twm_api_url][offer_id][order_id].messages[buyermdispatched.msg_obj.position] = message_header_obj;

                                try {
                                    const crypto = window.require('crypto');
                                    const algorithm = 'aes-256-ctr';
                                    console.log(this.state.password);
                                    const cipher = crypto.createCipher(algorithm, this.state.password.toString());
                                    let crypted = cipher.update(JSON.stringify(t_f), 'utf8', 'hex');
                                    crypted += cipher.final('hex');

                                    const hash1 = crypto.createHash('sha256');
                                    hash1.update(JSON.stringify(t_f));
                                    console.log(`password ${this.state.password}`);
                                    console.log(JSON.stringify(t_f));

                                    let twm_save = await save_twm_file(this.state.new_path + '.twm', crypted, this.state.password, hash1.digest('hex'));

                                    try {
                                        let opened_twm_file = await open_twm_file(this.state.new_path + '.twm', this.state.password);
                                        console.log(opened_twm_file);

                                        localStorage.setItem('twm_file', t_f);

                                        this.setState({twm_file: t_f});

                                        alert(`message has been sent`);

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
                            } catch (err) {
                                console.error(err);
                                console.error(`error at submitting the message to the seller`);
                            }
                        } catch (err) {
                            console.error(err);
                            console.error(`error at fetching the users pub key from the api for buyer_reply_by_order`);
                        }
                    } else {
                        console.log(`missing order_id : ${order_id}`);
                    }
                } else {
                    console.log(`missing offer_id : ${offer_id}`);
                }
            } else {
                console.log(`missing twm_api_url : ${twm_api_url}`);
            }
        } catch (err) {
            console.error(err);
            console.error(`error at the buyer_reply_by_order`);
        }
    };

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
                        let confirm_message = '';
                        let open_message = '';
                        let nft_address = '';
                        let shipping = {};

                        confirm_message = `Are you sure you want to purchase ${quant} X ${listing.title} for a total of ${total_cost} SFX?`;

                        confirmed = window.confirm(confirm_message);

                        console.log(confirmed);
                        if (confirmed) {
                            try {
                                console.log(listing.title);
                                console.log(listing.offer_id);
                                console.log(listing.price);
                                console.log(total_cost);
                                console.log(mixins);
                                this.setState({
                                    purchase_txn_image: listing.main_image,
                                    purchase_txn_quantity: quant,
                                    purchase_txn_title: listing.title,
                                    purchase_txn_seller: listing.username,
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
                                console.log(txid);
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

                                                    const crypto = window.require('crypto');

                                                    const {privateKey, publicKey} = await crypto.generateKeyPairSync('rsa', {
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
                                                    message_header_obj.purchase_proof = txid[0];
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
                                                    api_file_url_offer_id[order_id_hash].pgp_keys = {
                                                        private_key: privateKey,
                                                        public_key: publicKey
                                                    };
                                                    api_file_url_offer_id[order_id_hash].messages = {};
                                                    api_file_url_offer_id[order_id_hash].purchase_obj = purchase_obj;
                                                    api_file_url_offer_id[order_id_hash].messages['1'] = message_header_obj;

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
                                                    } catch (err) {
                                                        this.setState({showLoader: false});
                                                        console.error(err);
                                                        console.error(`error at initial save of the twm file`);
                                                        alert(`Error at saving to the twm file during account creation initialization stage`);
                                                    }
                                                    console.log(`payments from twm_url`);
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


        let o_obj = {};
        o_obj.twm_version = 1;

        if (va.description.value.length > 0) {
            o_obj.description = va.description.value;
        }
        if (va.main_image.value.length > 0) {
            o_obj.main_image = va.main_image.value;
        }
        if (va.image_2.value.length > 0) {
            o_obj.image_2 = va.image_2.value;
        }
        if (va.image_3.value.length > 0) {
            o_obj.image_3 = va.image_3.value;
        }
        if (va.image_4.value.length > 0) {
            o_obj.image_4 = va.image_4.value;
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

    handleShowOffers = () => {
            this.setState({merchantTabs: 'offers'});
    }

    handleShowMessages = (messageObject) => {
        this.setState({showMessages: true, showMyOrders: true, currentMessage: messageObject})
    };

    hideMessages = () => {
        this.setState({showMessages: false, currentMessage: {}})
    };

    handleMyOrders = (id) => {
        this.setState({showMyOrders: !this.state.showMyOrders});

        if (this.state.showMyOrders === false) {
            offerRows = []
        }
    };

    handleBuyerOrders = (e) => {
        e.preventDefault();
        this.setState({
            showBuyerOrders: !this.state.showBuyerOrders,
        })
    };

    renderAddressComponent = () => {
        return (<AccountInfo
            password={this.state.password}
            rescan={this.rescan}
            address={this.props.wallet.address()}
            spendKey={this.props.wallet.secretSpendKey()}
            viewKey={this.props.wallet.secretViewKey()}
            seed={this.props.wallet.seed()}
            showKeys={this.props.showKeys}
            onInitialShowClose={this.props.onInitialShowClose}
            toEllipsis={this.to_ellipsis}
        />)
    }


    render() {
        var message_render;

        try {
            message_render = this.state.messages_selected.map((msg, key) => {

            });
        } catch (err) {
            console.error(err);
        }

        console.log(message_render);

        const twmwallet = () => {
            switch (this.state.interface_view) {
                case "home": {
                    return (
                        <div className="home-main-div">
                            <Col sm={4}
                                 className="no-padding d-flex flex-column align-items-center">
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
                                    send={this.cash_send}
                                    id="send_cash"
                                />
                            </Col>

                            <Col sm={7} className="no-padding d-flex flex-column  justify-content-between">
                                {this.renderAddressComponent()}                                
                            </Col>
                        </div>
                    );
                }
                case "market":
                    var table_of_listings;
                    if (this.state.offer_loading_flag === 'twmurl') {
                        table_of_listings = this.state.twm_url_offers.map((listing, key) => {
                            listing.offerID = listing.offer_id;

                            try {
                                var data = {};
                                data.description = listing.description;
                                data.main_image = listing.main_image;
                                data.image_2 = listing.image_2;
                                data.image_3 = listing.image_3;
                                data.image_4 = listing.image_4;
                                data.sku = '';
                                data.barcode = '';
                                data.weight = '';
                                data.country = '';
                                data.shipping = listing.shipping;
                                data.nft = listing.nft;
                                data.open_message = listing.open_message;
                                let offer_type = 'none';
                                if (listing.shipping == true) { offer_type = 'shipped';}
                                else if (listing.nft == true) { offer_type = 'nft';}
                                else if (listing.open_message == true) { offer_type = 'open';}
                                try {
                                    return (
                                        <div className="products-table-row d-flex" key={key}>
                                            <div className="d-flex align-items-center justify-content-center" style={{width: '128px', height: '128px', backgroundColor: '#d3d3d34a'}}>
                                                {listing.main_image ? <img width="128px" height="128px" src={listing.main_image} /> : <span style={{color: '#afafaf'}}>no product image</span>}
                                            </div>
                                            <div className="p-2" style={{width: '200px'}} data-tip data-for={`offerTitle${key}`}>
                                                {listing.title}
                                            </div>
                                            <div style={{width: '100px'}}>{offer_type}</div>

                                            <div className="d-flex align-items-center" style={{width: '150px'}}>
                                                {listing.price} <img width="20px" className="ml-2" src={sfxLogo} /></div>

                                            <div style={{width: '150px'}}>{listing.quantity}</div>

                                            <div style={{width: '100px'}}>{listing.username}</div>

                                            <div className="d-flex align-items-center" style={{width: '100px'}} data-tip data-for={`offerID${key}`}>
                                                {this.to_ellipsis(listing.offer_id, 5, 5)}
                                                    <CgCopy className="ml-1" onClick={() => {copy(listing.offer_id); alert('Offer ID has been copied to clipboard')}} size={15} />
                                                <ReactTooltip id={`offerID${key}`} type='info' effect='solid'>
                                                <span>{listing.offer_id}</span>
                                            </ReactTooltip>
                                            </div>

                                            <div style={{width: '100px'}}>
                                                {listing.quantity <= 0 ?
                                                    (<button className="search-button" disabled>
                                                        SOLD OUT
                                                    </button>)
                                                    :
                                                    (<button style={{fontSize: '1.5rem'}} className="search-button"
                                                             onClick={() => this.handleShowPurchaseForm(listing, data)}>
                                                        BUY
                                                    </button>)
                                                }
                                            </div>
                                        </div>
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

                    return (
                        <div className="">
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
                                        top: '20%',
                                        left: '12%',
                                    }
                                }}>
                                <div className="modal-title">
                                    BUY 
                                    <CgClose
                                        className="pointer"
                                        style={{position: 'absolute', right: '15px', color: 'red'}} 
                                        size={20} 
                                        onClick={this.handleClosePurchaseForm} /></div>

                                <Form id="purchase_item"
                                      onSubmit={(e) => this.purchase_item(e, this.state.show_purchase_offer)}>
                                    <div className="d-flex flex-column p-3">
                                        
                                        {this.state.show_purchase_offer_data.nft ?
                                            (<div style={{width: '300px'}} className="d-flex flex-column mt-2">
                                                <label>
                                                    NFT Ethereum Address
                                                </label>
                                                    <Form.Control name="eth_address" rows="3"/>
                                            </div>)
                                            :
                                            ''
                                        }

                                        {this.state.show_purchase_offer_data.shipping &&
                                        <>
                                        <h2>Shipping Info</h2>
                                        <div className="d-flex justify-content-between mt-3">
                                        <div style={{width: '45%'}} className="d-flex flex-column">
                                        <label>First Name:</label>
                                        <Form.Control name="first_name" />
                                        </div>

                                    <div style={{width: '45%'}} className="d-flex flex-column">
                                        <label>Last Name:</label>
                                        <Form.Control name="last_name" />
                                    </div>
                                        </div>

                                    <div className="d-flex flex-column mt-3">
                                        <label>Address Line 1:</label>
                                        <Form.Control name="address1" />
                                    </div>

                                    <div className="d-flex flex-column mt-3">
                                        <label>Address Line 2:</label>
                                        <Form.Control name="address2" />
                                    </div>

                                    <div className="d-flex justify-content-between mt-3">
                                    <div style={{width: '30%'}} className="d-flex flex-column">
                                        <label>City:</label>
                                        <Form.Control name="city" />
                                    </div>

                                    <div style={{width: '30%'}} className="d-flex flex-column">
                                        <label>State/Country:</label>
                                        <Form.Control name="state" />
                                    </div>

                                    <div style={{width: '30%'}} className="d-flex flex-column">
                                        <label>Zip/Area code:</label>
                                        <Form.Control name="zipcode" />
                                    </div>
                                    </div>

                                    <div className="d-flex flex-column mt-3">
                                        <label>Country:</label>
                                        <Form.Control name="country" />
                                    </div>

                                    <div className="d-flex flex-column mt-3">
                                        <label>Email:</label>
                                        <Form.Control type="email" name="email_address" />
                                    </div>

                                    <div className="d-flex flex-column mt-3">
                                        <label>Phone:</label>
                                        <Form.Control name="phone_number" />
                                    </div>
                                    </>
                                        }
                                        {this.state.show_purchase_offer_data.open_message &&
                                        <div style={{width: '300px'}} className="d-flex flex-column mt-3">
                                        <label>NFT Ethereum Address:</label>
                                        <Form.Control name="message" />
                                    </div>
                                        }

                                        <div className="d-flex align-items-center mt-3">
                                        <label className="d-flex align-items-center">
                                            Mixins:
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
                                        </label>
                                            <Form.Control
                                                className="ml-2"
                                                style={{width: "50px"}}
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
                                    </div>
                                    </div>
                                          <div className="d-flex flex-column">
                                              <div className="d-flex" style={{height: '128px'}}>
                                              {this.state.show_purchase_offer_data.main_image && <Image
                                            className="product-image pointer"
                                               src={this.state.show_purchase_offer_data.main_image}
                                               onClick={() => this.setState({show_modal_for_image: this.state.show_purchase_offer_data.main_image})}></Image>}

                                            {this.state.show_purchase_offer_data.image_2 && 
                                                <Image className="product-image pointer ml-1"
                                                    src={this.state.show_purchase_offer_data.image_2}
                                                    onClick={() => this.setState({show_modal_for_image: this.state.show_purchase_offer_data.image_2})}></Image>}

                                            {this.state.show_purchase_offer_data.image_3 && 
                                                <Image className="product-image pointer ml-1"
                                                    src={this.state.show_purchase_offer_data.image_3}
                                                    onClick={() => this.setState({show_modal_for_image: this.state.show_purchase_offer_data.image_3})}></Image>}

                                            {this.state.show_purchase_offer_data.image_4 && 
                                                <Image className="product-image pointer ml-1"
                                                    src={this.state.show_purchase_offer_data.image_4}
                                                    onClick={() => this.setState({show_modal_for_image: this.state.show_purchase_offer_data.image_4})}></Image>}    
                                            <ReactModal 
                                                isOpen={!!this.state.show_modal_for_image}
                                                onRequestClose={() => this.setState({show_modal_for_image: null})}
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
                                                        top: '50%',
                                                        left: '50%',
                                                        right: 'auto',
                                                        bottom: 'auto',
                                                        marginRight: '-50%',
                                                        transform: 'translate(-50%, -50%)'
                                                    }
                                                }}
                                                >
                                    <CgClose
                                        className="pointer bg-white"
                                        style={{position: 'absolute', top: '5px', right: '15px', color: 'red'}} 
                                        size={20} 
                                        onClick={()=> this.setState({show_modal_for_image: null})} />
                                                    <div className="mt-4">
                                                        <img src={this.state.show_modal_for_image} />
                                                    </div>
                                            </ReactModal>
                                              </div>

                                        <hr className="border border-light w-100"></hr>

                                        <div className="d-flex mt-3">
                                            <label>Title:</label>
                                            <span className="ml-2">{this.state.show_purchase_offer.title}</span>
                                        </div>

                                        <div className="d-flex mt-3">
                                            <label>Seller:</label>
                                            <span className="ml-2">{this.state.show_purchase_offer.username}</span>
                                        </div>

                                        <div className="d-flex align-items-center mt-3">
                                            <label className="mb-0">Offer ID:</label>
                                            <span className="ml-2">{this.state.show_purchase_offer.offer_id}</span>
                                            <FaCopy
                                                className="ml-4 pointer"
                                                data-tip data-for='copyIDInfo'
                                                onClick={() => {
                                                    copy(this.state.show_purchase_offer.offer_id);
                                                    alert("Copied offer ID to clipboard");
                                                }}
                                            />
                                        </div>

                                        <div className="d-flex flex-column mt-3">
                                            <label>Description:</label>
                                            <span>{this.state.show_purchase_offer.description}</span>
                                        </div>

                                        <div className="d-flex flex-column mt-3">
                                            <label>Quantity:</label>
                                            <div className="d-flex align-items-center">
                                            <Form.Control
                                            style={{width: "60px"}}
                                            className="light-blue-back"
                                            id="quantity"
                                            name="quantity"
                                            type="number"
                                            onChange={e => this.setState({quantity_input: e.target.value})}
                                            min="0"
                                            max={this.state.show_purchase_offer.quantity} />
                                            <span className="ml-2"> / {this.state.show_purchase_offer.quantity} available</span>
                                            </div>
                                        </div>

                                        <div className="d-flex mt-3">
                                        <div className="d-flex align-items-center">
                                            <label className="mb-0">Price:</label>
                                            <div className="d-flex align-items-center">
                                            <span className="ml-2">{this.state.show_purchase_offer.price} SFX</span>
                                            <img className="ml-2" width="20px" className="ml-2" src={sfxLogo} />
                                            </div>
                                        </div>

                                        <div className="d-flex align-items-center ml-3">
                                            <label className="mb-0">Total:</label>
                                            <div className="d-flex align-items-center">
                                            <span className="ml-2">{this.state.show_purchase_offer.price * (this.state.quantity_input || 0)} SFX</span>
                                            <img className="ml-2" width="20px" className="ml-2" src={sfxLogo} />
                                            </div>
                                        </div>
                                        </div>

                                        {this.state.showLoader ?
                                        <Loader
                                            className="justify-content-center align-content-center"
                                            type="Bars"
                                            color="#00BFFF"
                                            height={50}
                                            width={50}
                                        />
                                        :
                                        <button className="mt-3">
                                            Buy
                                        </button>
                                    }
                                          </div>
                                </Form>
                            </ReactModal>

                            <ReactModal
                                isOpen={this.state.show_purchase_confirm_modal}
                                closeTimeoutMS={500}
                                className="purchase-confirm-modal"
                                onRequestClose={this.handleConfirmationModal}

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
                                        top: '12%',
                                        left: '30%',
                                        overflow: 'auto',
                                    }
                                }}
                            >
                                <div className="modal-title">
                                    Purchase confirmed
                                        <CgClose
                                            className="pointer"
                                            style={{ position: "absolute", right: "15px", color: "red" }}
                                            size={20}
                                            onClick={this.handleConfirmationModal}
                                        />
                                </div>
{console.error(this.state.show_purchase_offer)}
                                <div id="receipt" className="p-4">
                                <div className="d-flex justify-content-center">
                                    <img width="200px" src={this.state.purchase_txn_image} />
                                </div>
                                <div className="d-flex mt-3 align-items-center">
                                    <label className="mb-0">Title:</label>
                                    <span className="ml-3">{this.state.show_purchase_offer.title}</span>
                                </div>

                                <div className="d-flex align-items-center mt-2">
                                    <label className="mb-0">Transaction ID:</label>
                                    <span className="ml-3">{this.state.purchase_txn_id}</span>
                                </div>

                                <div className="d-flex align-items-center mt-2">
                                    <label className="mb-0">Seller:</label>
                                    <span className="ml-3">{this.state.purchase_txn_seller}</span>
                                </div>

                                <div className="d-flex align-items-center mt-2">
                                    <label className="mb-0">Purchased:</label>
                                    <span className="ml-3">{this.state.purchase_txn_title}</span>
                                </div>

                                <div className="d-flex align-items-center mt-2">
                                    <label className="mb-0">Amount:</label>
                                    <span className="ml-3">{this.state.purchase_txn_quantity}</span>
                                </div>

                                <div className="d-flex align-items-center mt-2">
                                    <label className="mb-0">Price:</label>
                                    <span className="ml-3">{this.state.purchase_txn_price}</span>
                                </div>

                                <div className="d-flex align-items-center mt-2">
                                    <label className="mb-0">Network fee:</label>
                                    <span className="ml-3">{this.state.purchase_txn_fee / 10000000000} SFX</span>
                                </div>

                                <button className="mt-3" onClick={() => print('receipt', 'html')}>Print</button>
                                </div>
                            </ReactModal>

                            <Col sm={4}
                                 className="no-padding d-flex flex-column align-items-center justify-content-between">
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

                            <Col
                                sm={7}
                                className="no-padding d-flex flex-column justify-content-between"
                            >
                                {this.renderAddressComponent()}
                            </Col>

                                <div
                                    className="d-flex align-items-center py-3"
                                    style={{width: '1028px', margin: '0 auto', backgroundColor: 'white'}}
                                >
                                        <form
                                            className="flex-row"
                                            id="search-form" action=""
                                            method=""
                                        >
                                                <input
                                                style={{height: '30px', width: '300px', paddingLeft: '10px'}}
                                                type="text"
                                                       onChange={this.handle_change_api_fetch_url}
                                                       value="http://stageapi.theworldmarketplace.com:17700"/>
                                            
                                                <button
                                                style={{padding: '1rem', lineHeight: 0}} 
                                                onClick={this.load_offers_from_api} className="search-button ml-3">
                                                    Show Products
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={this.handleBuyerOrders}
                                                    style={{padding: '1rem', lineHeight: 0}}
                                                    className={`search-button ml-3 ${this.state.showBuyerOrders ? 'search-button--red' : ''}`}
                                                >
                                                    {this.state.showBuyerOrders ? 'Close Orders' : 'My Orders'}
                                                </button>
                                                    <AiOutlineInfoCircle className="ml-2" size={20} data-tip data-for='apiInfo' />
                                                    <ReactTooltip id='apiInfo' type='info' effect='solid'>
                                                        <span>This is info about setting a market API. Lorem Ipsum.</span>
                                                    </ReactTooltip>
                                        </form>
                                    </div>

                            {this.state.showBuyerOrders ?
                                <div style={{width: '1028px', margin: '0 auto'}}>
                                    <div style={{height: '25px', backgroundColor: 'white', borderBottom: '3px solid #d3d3d369'}} className="d-flex">
                                        <label style={{width: '200px'}}>Title</label>
                                        <label style={{width: '100px'}}>Price (SFX)</label>
                                        <label style={{width: '100px'}}>Quantity</label>
                                        <label style={{width: '120px'}}>Order ID</label>
                                        <label style={{width: '120px'}}>Offer ID</label>
                                        <label style={{width: '160px'}}>Actions</label>
                                    </div>
                                    {this.buyer_get_orders().map(order => 
                                    <div key={order.order_id} className="products-table-row d-flex">
                                        <div className="p-2" style={{width: '200px'}}>{order.title}</div>
                                        <div className="d-flex align-items-center" style={{width: '100px'}}>{order.price} <img width="20px" className="ml-2" src={sfxLogo} /></div>
                                        <div style={{width: '100px'}}>{order.quantity}</div>
                                        <div style={{width: '120px'}}>
                                        {this.to_ellipsis(order.order_id, 5, 5)}
                                                <ReactTooltip type='info' effect='solid'>
                                                <span>{order.order_id}</span>
                                            </ReactTooltip>
                                        </div>
                                        <div className="d-flex align-items-center" style={{width: '120px'}}>
                                        {this.to_ellipsis(order.offer_id, 5, 5)}
                                        <CgCopy className="ml-1" onClick={() => {copy(order.offer_id); alert('Offer ID has been copied to clipboard')}} size={15} />
                                                <ReactTooltip id={`${order.offer_id}`} type='info' effect='solid'>
                                                <span>{order.offer_id}</span>
                                            </ReactTooltip>
                                        </div>
                                        <div style={{width: '160px'}}>
                                                <button style={{fontSize: '1.5rem'}} className="search-button" type="button"
                                                        onClick={() => this.handleBuyerMessages(order.offer_id, order.order_id)}>Show Messages
                                                </button>
                                    </div>
                                    </div>)}

                                    <MessagesModal 
                                        isOpen={this.state.showBuyerMessages}
                                        apiUrl={this.state.api_url}
                                        closeFn={() => this.handleBuyerMessages()}
                                        sendFn={e => this.buyer_reply_by_order(e)}
                                        refreshFn={() => this.load_buyers_messages_for_selected_order()}
                                        messages={this.renderBuyerMessages()}
                                        orderId={this.state.buyerSelectOrder}
                                        offerId={this.state.buyerSelectOffer} />
                                </div>

                                :
                                <div style={{width: "1028px", margin: '0 auto'}} className="">
                                    <div style={{height: '25px', backgroundColor: 'white', borderBottom: '3px solid #d3d3d369'}} className="d-flex">
                                        <label style={{width: '128px'}}>Image</label>
                                        <label style={{width: '200px'}}>Title</label>
                                        <label style={{width: '100px'}}>Type</label>
                                        <label style={{width: '150px'}}>Price (SFX)</label>
                                        <label style={{width: '150px'}}>Quantity</label>
                                        <label style={{width: '100px'}}>Seller</label>
                                        <label style={{width: '100px'}}>Offer ID</label>
                                        <label style={{width: '100px'}}>Actions</label>
                                    </div>
                                    <div style={{width: '100%', maxHeight: '550px', overflow: 'overlay'}}>
                                    {table_of_listings || <div className="products-table-row p-4 text-align-center">Click "Show Products" to load products.</div>}
                                    </div>
                                    
                                </div>
                            }
                        </div>
                    );

                case "merchant": {
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
                            <Row className={
                                this.state.selected_user.username === user.username ?
                                    "no-gutters account-element selected-account"
                                    :
                                    "no-gutters account-element"
                            }
                                 key={key}
                                 onClick={() => this.select_merchant_user(user.username, key)}>

                                <Col>
                                    <Image
                                        width={50}
                                        height={50}
                                        src={avatar}
                                        roundedCircle
                                        className="border border-white grey-back"/>
                                </Col>

                                <Col>
                                    <h2>{user.username}</h2>
                                </Col>

                                {user.status == 0 ?
                                    <button
                                        className="merchant-mini-buttons"
                                        onClick={(e) => this.remove_account(e, user.username, key)}>
                                        Remove
                                    </button>
                                    :
                                    ''
                                }
                            </Row>)
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
                                <Col sm={4}
                                     className="no-padding d-flex flex-column align-items-center justify-content-between">
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
                                        showOffers={this.handleShowOffers}
                                    />
                                </Col>

                                <Col sm={7} className="no-padding d-flex flex-column  justify-content-between">
                                    {this.renderAddressComponent()}
                                    {this.state.merchantTabs === "accounts" ?
                                        <MerchantAccounts
                                            handleChange={this.handleChange}
                                            userRegistered={this.state.user_registered}
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
                                                            rows={this.state.tableOfTables[this.state.selectedOffer]}
                                                            showMessages={this.state.showMessages}
                                                            handleShowMessages={this.handleShowMessages}
                                                            handleHideMessages={this.handleHideMessages}
                                                            handleOrders={this.handleMyOrders}
                                                            //selectedOffer={}
                                                        />
                                                    </div>
                                                </Row>

                                                :
                                                <MerchantOffers
                                                    apiUrl={this.state.api_url}
                                                    merchantReply={this.seller_reply_message}
                                                    loadOrders={this.get_seller_order_ids_by_offer}
                                                    loadMessages={this.get_messages_by_order_id_of_seller}
                                                    handleOrders={this.handleMyOrders}
                                                    handleShowEditOfferForm={this.handleShowEditOfferForm}
                                                    userOffers={this.state.twm_offers}
                                                />
                                            }

                                        </Row>
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
                                        }}>
                                        <h1>Create New Offer</h1>
                                        <Form id="list_new_offer" onSubmit={this.list_new_offer}>
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

                                                    <Form.Group as={Col}>
                                                        <Form.Label>Image URL</Form.Label>

                                                        <Form.Control
                                                            name="main_image"
                                                            onChange={this.handleChange}
                                                        />
                                                    </Form.Group>
                                                    <Form.Group as={Col}>
                                                        <Form.Label>Image 2</Form.Label>

                                                        <Form.Control
                                                            name="image_2"
                                                            onChange={this.handleChange}
                                                        />
                                                    </Form.Group>
                                                    <Form.Group as={Col}>
                                                        <Form.Label>Image 3</Form.Label>

                                                        <Form.Control
                                                            name="image_3"
                                                            onChange={this.handleChange}
                                                        />
                                                    </Form.Group>
                                                    <Form.Group as={Col}>
                                                        <Form.Label>Image 4</Form.Label>

                                                        <Form.Control
                                                            name="image_4"
                                                            onChange={this.handleChange}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md="4">
                                                    <Image
                                                        className="border border-white grey-back"
                                                        width={150}
                                                        height={150}
                                                        src={this.state.main_offer_image}
                                                        roundedCircle
                                                    />
                                                </Col>
                                            </Row>
                                            <Row md="8">
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

                                                <Form.Group md="6" as={Col}>
                                                    <Form.Label>Price (SFX)</Form.Label>

                                                    <Form.Control
                                                        name="price"
                                                        defaultValue={1}
                                                    />
                                                </Form.Group>

                                                <Form.Group md="6" as={Col}>
                                                    <Form.Label>Available Quantity</Form.Label>

                                                    <Form.Control
                                                        name="quantity"
                                                        defaultValue={1}
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
                                                    <IconContext.Provider value={{color: 'black', size: '20px'}}>
                                                        <FaInfoCircle data-tip data-for='apiInfo'
                                                                      className="blockchain-icon mx-4 white-text"/>

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

                                        <Button className="close-button" onClick={this.handleCloseNewOfferForm}>
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
                                        }}>

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
                                                            type="email"
                                                        />
                                                    </Form.Group>

                                                    <Form.Group>
                                                        <Form.Group md="6" as={Col}>
                                                            <Form.Label>Twitter Link</Form.Label>
                                                            <Form.Control
                                                                name="twitter"
                                                            />
                                                        </Form.Group>

                                                        <Form.Group md="6" as={Col}>
                                                            <Form.Label>Facebook Link</Form.Label>
                                                            <Form.Control
                                                                name="facebook"
                                                            />

                                                        </Form.Group>

                                                        <Form.Group md="6" as={Col}>
                                                            <Form.Label>LinkedIn Link</Form.Label>
                                                            <Form.Control
                                                                name="linkedin"
                                                            />
                                                        </Form.Group>

                                                        <Form.Group md="6" as={Col}>
                                                            <Form.Label>Website</Form.Label>
                                                            <Form.Control
                                                                name="website"
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

                                        <button className="close-button" onClick={this.handleNewAccountForm}>
                                            Close
                                        </button>
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
                                        }}>
                                        <h1>Edit Offer {this.state.show_edit_offer.title}</h1>

                                        <Form id="edit_offer"
                                              onSubmit={(e) => this.make_edit_offer(e, this.state.show_edit_offer)}>
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
                                                            defaultValue={this.state.show_edit_offer_data.main_image}
                                                            onChange={this.handleChange}
                                                        />
                                                        <Form.Control
                                                            name="image_2"
                                                            defaultValue={this.state.show_edit_offer_data.image_2}
                                                            onChange={this.handleChange}
                                                        />
                                                        <Form.Control
                                                            name="image_3"
                                                            defaultValue={this.state.show_edit_offer_data.image_3}
                                                            onChange={this.handleChange}
                                                        />
                                                        <Form.Control
                                                            name="image_4"
                                                            defaultValue={this.state.show_edit_offer_data.image_4}
                                                            onChange={this.handleChange}
                                                        />
                                                    </Form.Group>

                                                </Col>

                                                <Col md="4">
                                                    <Image
                                                        className="border border-white grey-back"
                                                        width={150}
                                                        height={150}
                                                        src={this.state.new_offer_image ? this.state.new_offer_image : this.state.show_edit_offer_data.main_image}
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
                                                                  defaultValue={this.state.show_edit_offer_data.description}/>
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
                                                        defaultValue={this.state.show_edit_offer_data.sku}
                                                    />
                                                </Form.Group>
                                                <Form.Group md="6" as={Col}>
                                                    <Form.Label>Barcode (ISBN, UPC, GTIN, etc)</Form.Label>

                                                    <Form.Control
                                                        name="barcode"
                                                        defaultValue={this.state.show_edit_offer_data.barcode}
                                                    />
                                                </Form.Group>
                                                <Form.Group md="6" as={Col}>
                                                    <Form.Label>Weight</Form.Label>

                                                    <Form.Control
                                                        name="weight"
                                                        defaultValue={this.state.show_edit_offer_data.weight}
                                                    />
                                                </Form.Group>

                                            </Form.Row>
                                            <Form.Row>
                                                <Form.Group md="6" as={Col}>
                                                    <Form.Label>Country of Origin</Form.Label>

                                                    <Form.Control
                                                        name="country"
                                                        defaultValue={this.state.show_edit_offer_data.country}
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
                                                    <Form.Control name="mixins" as="select" defaultValue="7">
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
                                        <button className="close-button my-5" onClick={this.handleCloseEditOfferForm}>
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
                        console.error(`error at the interval loading of staking`);
                    }
                    return (
                        <div className="home-main-div">
                            <Col sm={3}
                                 className="no-padding d-flex flex-column justify-content-around align-items-center">
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
                                <div style={{width: '900px'}} className="p-4">
                                    <StakingTable
                                        stakeRows={this.state.token_stakes}
                                    />
                                    <div className="d-flex justify-content-between w-100 mt-4">
                                    <StakeInfo
                                            tokenBalance={this.state.tokens.toLocaleString()}
                                            pendingStakeBalance={this.state.pending_stake.toLocaleString()}
                                            stakedBalance={this.state.unlocked_stake.toLocaleString()}
                                            interest={this.state.blockchain_current_interest.cash_per_token / 10000000000}
                                            blockHeight={this.state.blockchain_height.toLocaleString()}
                                            nextInterval={100 - (this.state.blockchain_height % 100)}
                                            totalNetworkStake={this.state.blockchain_tokens_staked.toLocaleString()}
                                        />
                                        <Stake
                                            style="stake"
                                            send={this.make_token_stake}
                                            id="stake_token"
                                            tokenBalance={this.state.tokens.toLocaleString()}
                                            tokenStakes={this.state.token_stakes}
                                        />
                                        <Stake
                                            style="unstake"
                                            send={this.make_token_unstake}
                                            id="stake_token"
                                            tokenStakes={this.state.token_stakes}
                                        />
                                    </div>
                                </div>
                        </div>
                    );
                }
                case "settings": {
                    return (
                        <div>
                            <Settings
                                txnhistory={this.state.txnhistory}
                                updateHistory={this.refresh_history}
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
                                src={require("./../../img/wolf.svg")}
                            />
                            <div className="bg-white"><h1 className="black-text">Loading...</h1></div>
                        </Container>
                    );
                default:
                    return <h1>Major Error</h1>
            }
        };

        return (
            <div className="height100 home-background-image">
                
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
