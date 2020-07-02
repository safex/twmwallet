import React from 'react';
import {Link} from 'react-router-dom';

export default class Navigation extends React.Component {
    constructor(props) {
        super(props);

        this.state = {}
    }

    componentDidMount() {

        console.log("navigation loaded");
        console.log(this.props.wallet);

        console.log(this.props.wallet.daemonBlockchainHeight());
    }

    logout = () => {
        this.props.wallet.close(true)
            .then(() => {
                console.log("wallet closed")
                this.props.history.push({pathname: '/'});
            })
            .catch((e) => {
                console.log("unable to close wallet: " + e)
            });
    };

    render() {
        return (
            <div className="container center white-text">
                <nav className="menu">
                    <h1 className="menu__logo"></h1>

                    <div className="menu__right">
                        <ul className="menu__list">
                            <li className="menu__list-item"><a className="menu__link"
                                                               params={{wallet: this.props.wallet}}
                                                               href="/wallet_home">Home</a></li>
                            <li className="menu__list-item"><a className="menu__link" href="#">Market</a></li>
                            <li className="menu__list-item"><a className="menu__link" href="#">Cash</a></li>
                            <li className="menu__list-item"><a className="menu__link" href="#">Tokens</a></li>
                            <li className="menu__list-item"><Link className="menu__link" to="#"
                                                                  params={{wallet: this.props.wallet}}
                                                                  path="/settings">Settings</Link></li>
                            <li className="menu__list-item"><a className="menu__link" href="#"
                                                               onClick={this.logout}>Exit</a></li>
                        </ul>
                    </div>
                </nav>
            </div>
        );
    }
}
