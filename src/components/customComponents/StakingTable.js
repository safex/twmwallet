import React from 'react';

import {Row, Col } from 'react-bootstrap';


import './ComponentCSS/StakingTable.css'

export default function StakingTable(props) {
    let stake_rows;
    if (props.stakeRows.length > 0) {
        console.log(`props row is greater`);
        stake_rows = props.stakeRows.map((row, key) => {
            return (
                <Row key={key} className="staking-table-row">
                    <p>{row.tokenStaked / 10000000000}</p>

                    <p>{row.collectedInterest / 10000000000}</p>

                    <p>{row.blockHeight}</p>

                </Row>
            )
        });
    } else {
        stake_rows = (<Row className="staking-table-row"> </Row>)
    }
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
                        <p>Staked (SFT)</p>

                        <p>Accrued (SFX)</p>

                        <p>Staked Height</p>
                </Row>
                {stake_rows}

            </Col>
        </Row>
                

    )
}