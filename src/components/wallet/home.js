import React from 'react';

import Navigation from './Navigation';

import {Row, Col, Container, Button, Table} from 'react-bootstrap';

import {get_chain_info} from '../../utils/safexd_calls';

export default class WalletHome extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            public_address: '',
            wallet_path: '',
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
        this.wallet_meta = null;


    }

    async componentDidMount() {
        console.log(this.props.wallet);
        try {

            let h_obj = {};
            h_obj.daemon_host = `rpc.safex.io`;
            h_obj.daemon_port = 17402;
            console.log(h_obj);
            let chain_info = await get_chain_info(h_obj);

            //if wallet last block is less than height
            //start updating

            this.setState({
                height: chain_info.height,
                daemon_host: h_obj.daemon_host,
                daemon_port: h_obj.daemon_port

            });
        } catch (e) {
            console.error(e);
            console.error("error getting height ");
        }
        this.setState({loading: false});

    };

    render() {
      return (
            <div style={{position: 'relative'}}>
                <Container>
                    <Row>
                        <Navigation/>
                    </Row>

                    <Row>
                        <Col sm={8}>
                            <ul>
                                <li>
                                    Public Address
                                </li>
                                <li>
                                    {this.props.wallet.address()}
                                </li>
                            </ul>
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
                        <Col>

                        </Col>

                    </Row>
                </Container>

            </div>
        );
    }


}
