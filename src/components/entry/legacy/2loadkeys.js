import React from 'react';
import {Row, Col, Container, Button, Table} from 'react-bootstrap';


export default class LegacyKeys extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            safex_keys: []
        };

    }

    async componentDidMount() {
        try {
            let parsed_wallet = this.props.location.state.parsed_wallet;
            console.log(`loaded the parsed wallet through props state`);

            let safex_array = [];
            for (const safex of parsed_wallet.safex_keys) {
                if (safex.hasOwnProperty('public_addr')) {
                    safex_array.push(safex);
                } else {
                    console.error("there is an error with the key");
                }
            }
            console.log(`stored Safex keys into the array: count ${safex_array.length} keys`)
            this.setState({safex_keys: safex_array});

        } catch (e) {
            console.log(`the parsed wallet didn't make it over to the component`);
            alert("there was an error loading the wallet");
            this.props.history.push({pathname: '/'})
        }
    }


    return_to_entry = (e) => {
        e.preventDefault();
        this.props.history.push({pathname: '/', state: {exit_legacy: true}});
    };

    proceed_to_import = (e, index) => {
        e.preventDefault();
        console.log(`successfully received the go ahead for importing Safex key at index: ${index}`);
        this.props.history.push({
            pathname: '/from_legacy_wallet',
            state: {safex_key: this.state.safex_keys[index]}
        });
    };


    render() {

        const {safex_keys} = this.state;
        var table;
        table = Object.keys(this.state.safex_keys).map((key) => {
            return (
                <tr>
                    <td>{safex_keys[key].public_addr.slice(0, 5) + "..." + safex_keys[key].public_addr.slice(96, 102)}</td>
                    <td>
                        <button onClick={(e, key) => this.proceed_to_import}>restore this key</button>
                    </td>
                </tr>
            );
        });
        return (
            <div>
                <Container>
                    <Row className="justify-content-md-center">
                        <Col>
                            <p>
                                You can exit this process and use the wallet along the other paths
                                by clicking this exit button: <Button onClick={this.return_to_entry}>exit button</Button>
                            </p>
                        </Col>
                    </Row>
                    <Row className="justify-content-md-center">
                        <Col>
                            <Table striped bordered hover>
                                <thead>
                                <tr>
                                    <th>Address</th>
                                    <th>Action</th>
                                </tr>
                                </thead>
                                <tbody>
                                    {table}
                                </tbody>

                            </Table>

                        </Col>
                    </Row>
                </Container>
            </div>
        );
    }
}
