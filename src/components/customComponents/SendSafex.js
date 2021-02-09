import React from "react";
import ReactTooltip from "react-tooltip";
import { AiOutlineInfoCircle } from "react-icons/ai";

import "./ComponentCSS/SendSafex.css";

export default function SendSafex(props) {
  return (
    <div className="send-safex-box">
      <div className="send-safex-box--header d-flex p-3">
        <span>{props.title}</span>

          <AiOutlineInfoCircle
          className="ml-2"
          size={20}
            data-tip
            data-for="sendSafexInfo"
          />

          <ReactTooltip
            id="sendSafexInfo"
            type="info"
            effect="solid"
            place="right"
          >
            <span>
              How to send?
              <br />
              <br />
              1. The address that you are sending safex to should start with
              "Safex" and contain 95-105 characters.
              <br />
              Example:
              Safex5zHGtYQYE41yEzLTRQWiajC5keyJHVwQamarNyp9ssouD87bbGhobVnYAtUEQa4me79ybZev2AmLUnbds4PRYv3P1KmW6j2F
              <br />
              <br />
              2. The amount that you are sending has to be grater than 0. The
              transaction fee will be added on to the amount you are sending.
            </span>
          </ReactTooltip>
      </div>
      <form className="p-4" id={props.id} onSubmit={props.send}>
          <label htmlFor="address">RECEIVING ADDRESS</label>
        <input className="mb-4" id="address" name="destination" placeholder="Safex address" />

        <label htmlFor="amount">AMOUNT</label>
        <input className="mb-4" id="amount" name="amount" placeholder="How much to send?" type="number" />

        <div className="mb-4">
            <label>
                MIXINS
                <AiOutlineInfoCircle size={15} data-tip data-for="mixinInfo" className="ml-1" />
<ReactTooltip
  id="mixinInfo"
  type="info"
  effect="solid"
  place="right"
>
  <span>
    Mixins are transactions that have also been sent on the Safex
    blockchain. <br />
    They are combined with yours for private transactions.
    <br />
    Changing this from the default could hurt your privacy.
    <br />
  </span>
</ReactTooltip>
                : 
            </label>
            <select className="ml-4 pl-2" name="mixins" defaultValue="7">
            <option>1</option>
            <option>2</option>
            <option>3</option>
            <option>4</option>
            <option>5</option>
            <option>6</option>
            <option>7</option>
          </select>
        </div>

        <button className="btn btn-dark" type="submit">
          SEND
        </button>
      </form>
    </div>
  );
}
