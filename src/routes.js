import {
    HashRouter as Router,
    Route,
    Switch
} from 'react-router-dom';
import React from 'react';

import CreateWallet from './components/entry/create_wallet';
import OpenWallet from './components/entry/open_wallet';
import RecoverKeys from "./components/entry/recover_keys";
import RecoverSeed from "./components/entry/recover_seed";

import SelectEntry from './components/entry/select_entry';
import LegacyPassword from './components/entry/legacy/1password';
import LegacyKeys from './components/entry/legacy/2loadkeys';
import ConvertLegacy from './components/entry/legacy/3makewallet';

import WalletHome from './components/wallet/home';
import Settings from './components/wallet/Settings';



const routes = (
    <Router>
        <div className="height100 p-2 d-flex oflow-y-scroll safex-background" >
            <Switch className="height100 ">
                <Route exact path="/" component={SelectEntry}/>
                <Route exact path="/recover_keys" component={RecoverKeys}/>
                <Route exact path="/recover_seed" component={RecoverSeed}/>
                <Route exact path="/legacy_password" component={LegacyPassword}/>
                <Route exact path="/legacy_keys" component={LegacyKeys}/>
                <Route exact path="/from_legacy_wallet" component={ConvertLegacy}/>
                <Route exact path="/create_wallet" component={CreateWallet}/>
                <Route exact path="/open_wallet" component={OpenWallet}/>
                <Route exact path="/wallet_home" component={WalletHome}/>
                <Route exact name="settings" path="/settings" component={Settings}/>
            </Switch>
        </div>
    </Router>
);

export default routes;