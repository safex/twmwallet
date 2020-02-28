import React from 'react';

import Navigation from '../partials/Navigation';

import {Row, Col, Container, Button, Table} from 'react-bootstrap';

import {get_chain_info} from '../../utils/safexd_calls';

export default class WalletHome extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            wallet: "",
            safex_key: null,
            instructionsModal: false,
            loading: true,
            height: 0,
            wallet_last_block: 0,
            cash: 0,
            tokens: 0,
            refresh_timer: 0,
            refresh_interval: '',
            syncing: false
        };



    }

    async componentDidMount() {
        try {

            let h_obj = {};
            h_obj.daemon_host = this.props.location.state.daemon_host;
            h_obj.daemon_port = this.props.location.state.daemon_port;
            console.log(h_obj);
            let chain_info = await get_chain_info(h_obj);

            //if wallet last block is less than height
            //start updating

            this.setState({
                height: chain_info.height,
                daemon_host: this.props.location.state.daemon_host,
                daemon_port: this.props.location.state.daemon_port
            });
        } catch (e) {
            console.error(e);
            console.error("error getting height ");
        }
        this.setState({loading: false});


        let interval = setInterval(this.update_check, 30000);
        this.setState({refresh_interval: interval})
    };


    view_keys = async () => {

    };

    render() {
      return (
            <div style={{position: 'relative'}}>
                <Container>
                    <Row>
                        <Navigation/>
                    </Row>

                    <Row>
                        <Col>
                        </Col>
                        <Col>
                            <ul>
                                <li>Syncronized Top Block: {this.state.wallet_last_block}</li>
                                <li>Blockchain Top Block: {this.state.height}</li>
                                {this.state.wallet_last_block < this.state.height && this.state.syncing === false ? (<li></li>) : ''}
                            </ul>
                        </Col>

                    </Row>


                    <Row>
                        <Table>
                            <thead>
                            <tr>
                                <th>index</th>
                                <th>safex address</th>
                                <th>Cash</th>
                                <th>Tokens</th>
                                <th>actions</th>
                            </tr>
                            </thead>

                            <tbody>
                            </tbody>
                        </Table>
                    </Row>
                </Container>

            </div>
        );
    }


}
