import React from 'react';

import {Row, Col } from 'react-bootstrap';


import './ComponentCSS/StakingTable.css'

export default function StakingTable(props) {
    let stake_rows;
    if (props.stakeRows.length > 0) {
        console.log(`props row is greater`);
        stake_rows = props.stakeRows.map((row, key) => {
            return (
                <div key={key} className="staking-table-row">
                    <p>{row.tokenStaked / 10000000000}</p>

                    <p>{row.collectedInterest / 10000000000}</p>

                    <p>{row.blockHeight}</p>

                </div>
            )
        });
    } else {
        stake_rows = (<div className="staking-table-row"> </div>)
    }
    return (
        <div className="staking-table-box" id={props.id} onSubmit={props.send}>
            <Col sm={1} className="staking-table-title" >
                S<br/>
                T<br/>
                A<br/>
                K<br/>
                E<br/>
                S<br/>
            </Col>

            <Col sm={10} className="pt-3 staking-table-table">
                <div className="d-flex staking-table-header no-gutters">
                        <p>Staked (SFT)</p>

                        <p>Accrued (SFX)</p>

                        <p>Staked Height</p>
                </div>
                {stake_rows}

            </Col>
        </div>
                

    )
}