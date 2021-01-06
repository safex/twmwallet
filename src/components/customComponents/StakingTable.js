import React from 'react';

import {Row, Col } from 'react-bootstrap';


import './ComponentCSS/StakingTable.css'

export default function StakingTable(props) {
    return (
        <Row className="staking-table-box" id={props.id} onSubmit={props.send}>
            <Col sm={1} className="staking-table-title" >
                S<br/>
                T<br/>
                A<br/>
                K<br/>
                E<br/>
                S<br/>
            </Col>

            <Col sm={10} className="pt-3 staking-table-table">
                <Row className="staking-table-header no-gutters">
                        <p>TXID</p>

                        <p>Date</p>

                        <p>Amount (SFT)</p>

                        <p>Interest (SFX)</p>

                        <p>Block</p>
                </Row>
            
                <Row className="staking-table-row">
                    <p>erse...4e43</p>
                
                    <p>7-12-2020</p>
                
                    <p>42,000</p>
                
                    <p>42.69</p>
                
                    <p>102,240</p>
                </Row>
            </Col>
        </Row>
                

    )
}