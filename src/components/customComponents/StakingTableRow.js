import React from 'react';

import { Row } from 'react-bootstrap';

import './ComponentCSS/StakingTable.css'

export default function StakingTableRow(props) {

    return (
        <Row className="staking-table-row">
            <p>{props.id}</p>
        
            <p>{props.date}</p>
        
            <p>{props.amount}</p>
        
            <p>{props.interest}</p>
        
            <p>{props.blockHeight}</p>
        </Row>
    )
}