import React from 'react';

import Navigation from '../partials/Navigation';

import {Row, Col, Container, Button, Table} from 'react-bootstrap';

import {get_chain_info} from '../../utils/safexd_calls';

export default class WalletHome extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        };



    }

    async componentDidMount() {

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
