import React from "react";
import ReactModal from "react-modal";
import ReactTooltip from "react-tooltip";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { CgClose, CgCopy, CgKey } from "react-icons/cg";

import "./ComponentCSS/AccountInfo.css";
import copy from "copy-to-clipboard";

const renderRow = (id, label, value, renderTooltipMessage) => (
  <div className="d-flex flex-column mb-4">
    <label>
      {label}
      <AiOutlineInfoCircle className="ml-2" size={15} data-tip data-for={id} />

      <ReactTooltip id={id} type="info" effect="solid" place="right">
        {renderTooltipMessage()}
      </ReactTooltip>
    </label>
    <div className="d-flex align-items-center">
      <span>{value}</span>
      <CgCopy
        size={15}
        className="mb-0 ml-2"
        onClick={() => {
          copy(value);
          alert("Copied to clipboard");
        }}
      >
        Copy
      </CgCopy>
    </div>
  </div>
);

class AccountInfo extends React.Component {
  defaultState = {
    passwordInput: "",
    askPassword: false,
    wrongPassword: false,
    showKeys: false
  };

  constructor(props) {
    super(props);
    this.state = this.defaultState;
  }

  showPasswordConfirmation = () => {
    this.setState({askPassword: true})
  }

  reset = () => {
    this.setState(this.defaultState);
  };

  confirmPassword = () => {
    if (this.state.passwordInput !== this.props.password) {
      return this.setState({ wrongPassword: true });
    }
    this.setState({...this.defaultState, showKeys: true});
  };

  render() {
    const { props } = this;
    return (
      <div className="account-info-box p-4 mt-4">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <label for="safexAddress" class="form-label">
            SAFEX Cash and SAFEX Token address
          </label>
          <button onClick={props.rescan}>Hard Rescan</button>
        </div>

        <div class="input-group">
          <input
            style={{ height: "30px", textOverflow: "ellipsis", zIndex: "0" }}
            id="safexAddress"
            readOnly={true}
            value={props.address}
            type="text"
            class="form-control"
            aria-describedby="button-addon2"
          />
          <button
            class="btn btn-outline-secondary"
            type="button"
            data-tip="Copy address"
            id="button-addon2"
            onClick={() => {
              copy(props.address);
              alert("Wallet address has been copied to clipboard");
            }}
          >
            <CgCopy size={20} />
          </button>
          <ReactTooltip />
          <button
            class="btn btn-outline-secondary"
            type="button"
            data-tip="Show keys"
            id="button-addon2"
            onClick={() => this.showPasswordConfirmation()}
          >
            <CgKey size={20} />
          </button>
        </div>

        <ReactModal
          isOpen={this.state.askPassword}
          className="ask-password-modal"
          onRequestClose={this.reset}
          style={{
            overlay: {
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(255, 255, 255, 0.75)",
            },
            content: {
              position: "absolute",
              top: "30%",
              left: "40%",
              overflow: "auto",
            },
          }}
        >
          <div className="modal-title">
            Confirm password
            <CgClose
              className="pointer"
              style={{ position: "absolute", right: "15px", color: "red" }}
              size={20}
              onClick={this.reset}
            />
          </div>
          <div
            className={`d-flex flex-column p-4 ${
              this.state.wrongPassword ? "wrong-password" : ""
            }`}
          >
            <span>
              To see your <b>private keys</b> please enter your password.
            </span>
            <label className="mt-2">Password:</label>
            <input
              value={this.state.passwordInput}
              onChange={(e) => this.setState({ passwordInput: e.target.value })}
              type="password"
            />
            {this.state.wrongPassword && (
              <span style={{ color: "red" }}>Wrong password</span>
            )}
            <button className="mt-3" onClick={this.confirmPassword}>
              Confirm
            </button>
          </div>
        </ReactModal>

        <ReactModal
          isOpen={this.state.showKeys}
          className="show-keys-modal"
          onRequestClose={this.reset}
          style={{
            overlay: {
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(255, 255, 255, 0.75)",
            },
            content: {
              position: "absolute",
              top: "12%",
              left: "17%",
              overflow: "auto",
            },
          }}
        >
          <div className="modal-title">
            Keys {"&"} Seeds
            <CgClose
              className="pointer"
              style={{ position: "absolute", right: "15px", color: "red" }}
              size={20}
              onClick={this.reset}
            />
          </div>
          <div className="p-4">
            {renderRow(
              "publicKeyInfo",
              "Public Address:",
              props.address,
              () => (
                <span>
                  IMPORTANT: Secret Keys and Seed Phrases are sensitive
                  information. <br />
                  Make sure you don’t share them with anyone. Back them up, and
                  store on the safe place(s). <br /> Losing file backups can
                  compromise your resources.
                </span>
              )
            )}

            {renderRow(
              "spendKeyInfo",
              "Private Spend Address:",
              props.spendKey,
              () => (
                <span>
                  IMPORTANT: Secret Keys and Seed Phrases are sensitive
                  information. <br />
                  Make sure you don’t share them with anyone. Back them up, and
                  store on the safe place(s). <br /> Losing file backups can
                  compromise your resources.
                </span>
              )
            )}

            {renderRow(
              "viewKeyInfo",
              "Private View Address:",
              props.viewKey,
              () => (
                <span>
                  IMPORTANT: Secret Keys and Seed Phrases are sensitive
                  information. <br />
                  Make sure you don’t share them with anyone. Back them up, and
                  store on the safe place(s). <br /> Losing file backups can
                  compromise your resources.
                </span>
              )
            )}

            {renderRow("seedPhraseInfo", "Seed Phrase:", props.seed, () => (
              <span>
                IMPORTANT: Secret Keys and Seed Phrases are sensitive
                information. <br />
                Make sure you don’t share them with anyone. Back them up, and
                store on the safe place(s). <br /> Losing file backups can
                compromise your resources.
              </span>
            ))}
          </div>
        </ReactModal>
      </div>
    )
  }
}

export default AccountInfo;
