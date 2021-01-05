import React from 'react';
import ReactJson from 'react-json-view';

import Navigation from './Navigation';

import {Row, Col, Container, Button, Table} from 'react-bootstrap';


export default class Settings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        };



    }

    async componentDidMount() {
        console.log("load settings");
        console.log(this.props.history);


    };

    render() {
        let txn_history_table_data = this.props.history.map((txn, key) => {
            console.log(txn);
            return (
                <tr className="tx-row" key={key}>
                    <td>{txn.id}</td>
                    <td>{txn.direction}</td>
                    <td>{txn.pending}</td>
                    <td>{txn.tokenAmount > 0 ? (`${txn.tokenAmount / 10000000000} SFT`) : (`${txn.amount / 10000000000} SFX`)}</td>
                    <td>{txn.fee / 10000000000}</td>
                    <td>{txn.blockHeight}</td>
                    <td>{txn.confirmations}</td>
                </tr>
            )
        });
        console.log(txn_history_table_data);
        return (
            <div  
                style={{
                    position: 'relative', 
                    fontFamily: 'Inter', 
                    fontSize: '1.5rem', 
                    whiteSpace: 'nowrap',
                    maxHeight: '90vh',
                    overflowY: 'auto'
                }}>
                <Container>

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
                                <th>TXID</th>
                                <th>In/Out</th>
                                <th>Pending?</th>
                                <th>Amount</th>
                                <th>Fee (SFX)</th>
                                <th>Blockheight</th>
                                <th>Confirmations</th>
                            </tr>
                            </thead>

                            <tbody>
                                {txn_history_table_data}
                            </tbody>
                        </Table>
                    </Row>
                </Container>

            </div>
        );
    }


}
