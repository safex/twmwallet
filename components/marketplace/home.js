import React from 'react';

import Navigation from '../partials/Navigation';

import {Row, Col, Container, Button, Table} from 'react-bootstrap';

import {get_chain_info} from '../../utils/safexd_calls';

export default class MarketHome extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            public_address: '',
            wallet: '',
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



    }

    async componentDidMount() {
        try {

        } catch(err) {
            console.error(err);
        }

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
