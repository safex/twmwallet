import React from 'react';

import {Row, Col, Container, Table} from 'react-bootstrap';


export default class Settings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};


    }

    async componentDidMount() {
        console.log("load settings");
        this.props.updateHistory();

    };

    render() {
        let txn_history_table_data = this.props.txnhistory.map((txn, key) => {
            console.log(txn);
            let the_type = '';
            switch (txn.transactionType) {
                case 0: {
                    console.log(`sfx txn`);
                    the_type = 'sfx';
                    break;
                }
                case 1: {
                    the_type = 'sft';
                    break;
                }
                case 2: {
                    the_type = 'migration';
                    break;
                }
                case 3: {
                    the_type = 'stake';
                    break;
                }
                case 4: {
                    the_type = 'unstake';
                    break;
                }
                case 5: {
                    if (txn.direction == 'in') {
                        the_type = 'incoming buy';
                    } else {
                        the_type = 'your purchase';
                    }
                    break;
                }
                case 6: {
                    the_type = 'new account';
                    break;
                }
                case 7: {
                    the_type = 'edit account';
                    break;
                }
                case 8: {
                    the_type = 'new offer';
                    break;
                }
                case 9: {
                    the_type = 'edit offer';
                    break;
                }
                case 10: {
                    console.log(`feedback ${txn.direction}`);
                    the_type = 'feedback';
                    break;
                }
                case 11: {
                    the_type = 'price oracle';
                    break;
                }
                case 12: {
                    the_type = 'update oracle';
                    break;
                }

            }


            return (
                <tr className="tx-row" key={key}>
                    <td>{txn.id}</td>
                    <td>{txn.direction}</td>
                    <td>{txn.pending}</td>
                    <td className="">{the_type}</td>
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
                    fontFamily: 'Inter',
                    fontSize: '1rem',
                    whiteSpace: 'nowrap',
                    minHeight: '800px',
                }}>
                     <Row>
                        <Table
                            style={{
                                margin: '50px auto',
                                maxWidth: '95%',
                                backgroundColor: 'white'
                            }}
                        >
                            <thead style={{border: '1px solid lightgray'}}>
                                <tr>
                                    <th>TXID</th>
                                    <th>In/Out</th>
                                    <th>Pending?</th>
                                    <th>type</th>
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
            </div>
        );
    }


}
