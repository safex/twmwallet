import React from "react";

import { Col } from "react-bootstrap";

import "./ComponentCSS/StakingTable.css";

export default function StakingTable(props) {
  const label = (val) => (
    <label className="text-center" style={{ width: "200px" }}>
      {val}
    </label>
  );
  const column = (val) => (
    <div className="text-center" style={{ width: "200px" }}>
      {val}
    </div>
  );
  let stake_rows;
  if (props.stakeRows.length > 0) {
    console.log(`props row is greater`);
    stake_rows = props.stakeRows.map((row, key) => {
      return (
        <div key={key} className="d-flex">
          {column(row.tokenStaked / 10000000000)}
          {column(row.collectedInterest / 10000000000)}
          {column(row.blockHeight)}
        </div>
      );
    });
  } else {
    stake_rows = <div className="staking-table-row"> </div>;
  }
  return (
    <div className="staking-table-box" id={props.id} onSubmit={props.send}>
      <Col sm={1} className="staking-table-title">
        S<br />
        T<br />
        A<br />
        K<br />
        E<br />
        S<br />
      </Col>

      <Col sm={10} className="pt-3 staking-table-table">
        <div className="d-flex">
          {label("Staked (SFT)")}
          {label("Accrued (SFX)")}
          {label("Staked Height")}
        </div>
        {stake_rows}
      </Col>
    </div>
  );
}
