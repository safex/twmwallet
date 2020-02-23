import {
    BrowserRouter as Router,
    Route,
    Switch
} from 'react-router-dom';
import React from 'react';

import SelectEntry from './components/entry/select_entry';
import LegacyPassword from './components/entry/legacy/1password';
import LegacyKeys from './components/entry/legacy/2loadkeys';
import ConvertLegacy from './components/entry/legacy/3makewallet';

import WalletHome from './components/wallet/home';


const routes = (
    <Router>
        <div>
            <Switch>
                <Route exact path="/" component={SelectEntry}/>
                <Route path="/legacy_password" component={LegacyPassword}/>
                <Route path="/legacy_keys" component={LegacyKeys}/>
                <Route path="/from_legacy_wallet" component={ConvertLegacy}/>
                <Route path="/wallet_home" component={WalletHome}/>

            </Switch>
        </div>
    </Router>
);

export default routes;

/*


import ExistingWallet from './components/primary/entry/ExistingWallet';
import CreateNew from './components/primary/entry/CreateNew';
import RestoreWallet from './components/primary/entry/RestoreKeys';

//legacy conversion paths
import LegacyPassword from './components/primary/entry/legacy/1password';
import LegacyKeys from './components/primary/entry/legacy/2loadkeys';
import ConvertLegacy from './components/primary/entry/legacy/3makewallet';

//wallet
import WalletHome from './components/primary/wallet/home';
import CashWallet from './components/primary/wallet/cash';
const routes = (
    <Router>
        <div>
            <Switch>
                <Route exact path="/" component={Select_entry}/>
                <Route path="/existing" component={ExistingWallet}/>
                <Route path="/restore_keys" component={RestoreWallet}/>
                <Route path="/create" component={CreateNew}/>
                <Route path="/legacy_password" component={LegacyPassword}/>
                <Route path="/legacy_keys" component={LegacyKeys}/>
                <Route path="/convert_legacy" component={ConvertLegacy}/>
                <Route path="/wallet_home" component={WalletHome}/>
                <Route path="/cash_wallet" component={CashWallet}/>

            </Switch>
        </div>
    </Router>
);
 */