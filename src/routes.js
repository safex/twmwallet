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


const routes = (
    <Router>
        <div>
            <Switch>
                <Route exact path="/" component={SelectEntry}/>
                <Route path="/legacy_password" component={LegacyPassword}/>
                <Route path="/legacy_keys" component={LegacyKeys}/>
                <Route path="/from_legacy_wallet" component={ConvertLegacy}/>

            </Switch>
        </div>
    </Router>
);

export default routes;
