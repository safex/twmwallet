import React from "react";
import { FaCubes } from "react-icons/fa";
import "./ComponentCSS/HomeInfo.css";
import sfxLogo from "../../img/sfx.svg";
import sftLogo from "../../img/sft.svg";

export default function HomeInfo(props) {
  return (
    <div className="home-info-box p-4 mt-4">
      <h4 className="d-flex align-content-center">
        <FaCubes className="mr-3" />
        {props.walletHeight === props.blockHeight
          ? props.blockHeight
          : `${props.walletHeight} / ${props.blockHeight}`}
      </h4>

      <p>{props.connection}</p>

      <div className="d-flex flex-column">
        <label>SAFEX CASH BALANCE</label>
        <div className="d-flex align-items-center">
          {props.firstRefresh === true
            ? props.cashBalance.toLocaleString() + " SFX"
            : "∞"}{" "}
          <img className="ml-2" src={sfxLogo} width={20} alt="Safex Cash" />
          <br />
          {props.pendingCash > 0
            ? `(${props.pendingCash.toLocaleString()} SFX Pending)`
            : ""}
        </div>
      </div>

      <div className="d-flex flex-column mt-4">
        <label>SAFEX TOKEN BALANCE</label>
        <div className="d-flex align-items-center">
          {props.firstRefresh === true
            ? props.tokenBalance.toLocaleString() + " SFT"
            : "∞"}
            <img src={sftLogo} width={30} alt="Safex Cash" />
          <br />
          {props.pendingTokens > 0
            ? `(${props.pendingTokens.toLocaleString()} SFT Pending)`
            : ""}
        </div>
      </div>
    </div>
  );
}
