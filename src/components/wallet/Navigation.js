import React from 'react';
import {Link} from 'react-router';

export default class Navigation extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
        }
    }
//add a reload function, reload the json_rpc and start over
    //probably need ipc here for electron process interaction
    render() {
        return (
            <div className="container center">
                <nav className="menu">
                    <h1 className="menu__logo"></h1>

                    <div className="menu__right">
                        <ul className="menu__list">
                            <li className="menu__list-item"><a className="menu__link" href="/wallet_home">Home</a></li>
                            <li className="menu__list-item"><a className="menu__link" href="#">Market</a></li>
                            <li className="menu__list-item"><a className="menu__link" href="#">Cash</a></li>
                            <li className="menu__list-item"><a className="menu__link" href="#">Tokens</a></li>
                            <li className="menu__list-item"><a className="menu__link" href="/settings">Settings</a></li>
                            <li className="menu__list-item"><a className="menu__link" href="#">Bitcoin</a></li>
                        </ul>
                    </div>
                </nav>
            </div>
        );
    }
}
