import React from "react";
import { Row, Col, Container, Form, Image } from "react-bootstrap";
import { recover_from_keys_util } from "../../utils/wallet_creation";

import WalletHome from "../wallet/home";

import ProgressIcon from "../customComponents/ProgressIcon";

import Loader from "react-loader-spinner";

import { AiOutlineInfoCircle } from "react-icons/ai";
import { IoIosArrowBack } from "react-icons/io";
import { IconContext } from "react-icons";
import ReactTooltip from "react-tooltip";

const safex = window.require("safex-nodejs-libwallet");

let { dialog } = window.require("electron").remote;

export default class RecoverKeys extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      daemon_host: "",
      daemon_port: 0,
      new_path: "",
      password: "",
      safex_key: null,
      success: false,
      network: "mainnet",
      testnet: false,
      wallet: null,
      wallet_made: false,
      public_address: "",
      viewkey: "",
      spendkey: "",
      loading: false,
      freshStart: true,
      pageNumber: 0,
    };
  }

  async componentDidMount() {}

  set_path = (e) => {
    e.preventDefault();

    let sails_path = dialog.showSaveDialogSync();
    let new_path = sails_path;

    try {
      if (new_path.length > 0) {
        this.setState({ new_path: new_path });
      }
    } catch (err) {
      console.log("cancelled, no path set");
    }
  };

  change_path = (e) => {
    e.preventDefault();
    this.setState({ new_path: "" });
  };
  set_daemon_state = (e) => {
    e.preventDefault();
    this.setState({
      daemon_host: e.target.daemon_host.value,
      daemon_port: parseInt(e.target.daemon_port.value),
    });
  };

  change_daemon = (e) => {
    e.preventDefault();
    this.setState({ daemon_host: "", daemon_port: 0 });
  };

  set_password = (e) => {
    e.preventDefault();
    if (e.target.password.value === e.target.repeat_password.value) {
      this.setState({ password: e.target.password.value });
    } else {
      alert("passwords dont match");
    }
  };

  change_password = (e) => {
    e.preventDefault();
    this.setState({ password: "" });
  };

  make_wallet_result = async (error, wallet) => {
    if (error) {
    } else {
      this.setState({ wallet_made: true, wallet: wallet, loading: false });
    }
  };

  make_wallet = async (e) => {
    e.preventDefault();
    try {
      this.setState({ loading: true });
      let daemon_string = `${this.state.daemon_host}:${this.state.daemon_port}`;
      recover_from_keys_util(
        this.state.new_path,
        this.state.password,
        0,
        this.state.network,
        daemon_string,
        this.state.public_address,
        this.state.viewkey,
        this.state.spendkey,
        this.make_wallet_result
      );
    } catch (err) {
      this.setState({ loading: false });
      console.error(err);
      console.error("error on initial recovery");
    }
  };

  set_to_testnet = (e) => {
    e.preventDefault();
    const target = e.target;
    if (target.checked === true) {
      this.setState({
        testnet: true,
        network: "testnet",
      });
    } else {
      this.setState({
        testnet: false,
        network: "mainnet",
      });
    }
  };

  show_password = (e) => {
    e.preventDefault();
    alert(this.state.password);
  };

  set_keys = (e) => {
    e.preventDefault();
    let items = e.target;
    try {
      if (
        safex.addressValid(items.public_address.value, this.state.network) &&
        items.viewkey.value.length > 63 &&
        items.spendkey.value.length > 63
      ) {
        this.setState({
          viewkey: items.viewkey.value,
          spendkey: items.spendkey.value,
          public_address: items.public_address.value,
          pageNumber: 1,
        });
      } else {
        alert("not a valid safex address");
      }
    } catch (err) {
      console.error(err);
      console.error("error at setting the keys");
    }
  };

  reset_keys = (e) => {
    this.setState({
      public_address: "",
      viewkey: "",
      spendkey: "",
    });
  };

  backToSelect = () => {
    this.props.history.push({ pathname: "/select_entry" });
  };

  goBack = (e) => {
    e.preventDefault();
    if (this.state.pageNumber > 1) {
      return this.setState({ pageNumber: this.state.pageNumber - 1 });
    }

    this.backToSelect();
  };

  exit_home = (e) => {
    e.preventDefault();
    this.props.history.push({ pathname: "/" });
  };

  render() {
    return (
      <div
        className={
          this.state.wallet_made && this.state.loading === false
            ? "w-100 h-100"
            : "w-100 h-100 background-entry-fix"
        }
      >
        {this.state.wallet_made && this.state.loading === false ? (
          <div fluid className="w-100 height100 justify-content-between">
            <WalletHome
              wallet={this.state.wallet}
              daemon_host={this.state.daemon_host}
              daemon_port={this.state.daemon_port}
              password={this.state.password}
              wallet_path={this.state.new_path}
            />
          </div>
        ) : (
          <div
            fluid
            className="w-100 height100 d-flex flex-column justify-content-center align-items-center"
          >
            <div className="start-background-image w-100 h-100 d-flex flex-column justify-content-center align-items-center">
              <Image
                className="entry-mini-logo"
                src={require("./../../img/safex-multi-small.svg")}
              />
              <Image
                onClick={() => {
                  alert("Closing Wallet... (TEST)");
                }}
                className="entry-off-button"
                src={require("./../../img/off_black.svg")}
              />

              <Row className="entry-progress-row">
                <Col
                  onClick={this.goBack}
                  className="pointer d-flex align-items-center entry-back-text"
                  md={2}
                >
                  <IconContext.Provider
                    value={{ color: "#13D3FD", size: "3rem" }}
                  >
                    <IoIosArrowBack />
                  </IconContext.Provider>
                  BACK
                </Col>

                <ProgressIcon
                  amount={4}
                  number={1}
                  color={
                    this.state.pageNumber === 0
                      ? "progress-icon-color"
                      : this.state.viewkey.length > 0
                      ? "progress-icon-color-complete"
                      : ""
                  }
                  title={"ADDRESS & KEYS"}
                />

                <ProgressIcon
                  amount={4}
                  number={2}
                  title={"SAVE FILES"}
                  color={
                    this.state.pageNumber === 1
                      ? "progress-icon-color"
                      : this.state.new_path.length > 0
                      ? "progress-icon-color-complete"
                      : ""
                  }
                />

                <ProgressIcon
                  amount={4}
                  number={3}
                  title={"NETWORK CONNECTION"}
                  color={
                    this.state.pageNumber === 2
                      ? "progress-icon-color"
                      : this.state.daemon_host.length > 0
                      ? "progress-icon-color-complete"
                      : ""
                  }
                />

                <ProgressIcon
                  amount={4}
                  number={4}
                  title={"YOUR PASSWORD"}
                  color={
                    this.state.pageNumber === 3
                      ? "progress-icon-color"
                      : this.state.password.length > 0
                      ? "progress-icon-color-complete"
                      : ""
                  }
                />
              </Row>

              {this.state.wallet_made && (
                <Container fluid className="height100 justify-content-between">
                  <WalletHome
                    wallet={this.state.wallet}
                    daemon_host={this.state.daemon_host}
                    daemon_port={this.state.daemon_port}
                    password={this.state.password}
                    wallet_path={this.state.new_path}
                  />
                </Container>
              )}

              {this.state.pageNumber === 0 ? (
                <div className="entry-container">
                  <Form id="set_keys" onSubmit={this.set_keys}>
                    <label htmlFor="public_address">
                      Public Address
                      <IconContext.Provider
                        value={{ color: "#767676", size: "30px" }}
                      >
                        <AiOutlineInfoCircle
                          data-tip
                          data-for="publicAddressInfo"
                          className="ml-3 mb-1"
                        />

                        <ReactTooltip
                          className="entry-tooltip-container"
                          id="publicAddressInfo"
                          effect="solid"
                          place="bottom"
                        >
                          <span>
                            Your Safex Address should start with ’Safex’ and
                            contain between 95 and 105 characters. <br />
                            Example:
                            <br />
                            Safex5zHGtYQYE41yEzLTRQWiajC5keyJHVwQamarNyp9ssouD87bbGhobVnYAtUEQa4me79ybZev2AmLUnbds4PRYv3P1KmW6j2F
                          </span>
                        </ReactTooltip>
                      </IconContext.Provider>
                    </label>
                    <input className="mb-3 w-75" name="public_address" />

                    <label htmlFor="spendkey">
                      Spend Key
                      <IconContext.Provider
                        value={{ color: "#767676", size: "30px" }}
                      >
                        <AiOutlineInfoCircle
                          data-tip
                          data-for="spendKeyInfo"
                          className="ml-3 mb-1"
                        />

                        <ReactTooltip
                          className="entry-tooltip-container"
                          id="spendKeyInfo"
                          effect="solid"
                          place="bottom"
                        >
                          <span>
                            Your Secret Spend Key should be a 64 digit hex.
                            <br />
                            Example:
                            <br />
                            55e48e029634404f1f19b45eb89298e7c27efb414d4151d98f551b39f015fb0d
                          </span>
                        </ReactTooltip>
                      </IconContext.Provider>
                    </label>
                    <input className="mb-3 w-75" name="spendkey" />

                    <label htmlFor="viewkey">
                      View Key
                      <IconContext.Provider
                        value={{ color: "#767676", size: "30px" }}
                      >
                        <AiOutlineInfoCircle
                          data-tip
                          data-for="viewKeyInfo"
                          className="ml-3 mb-1"
                        />

                        <ReactTooltip
                          className="entry-tooltip-container"
                          id="viewKeyInfo"
                          effect="solid"
                          place="bottom"
                        >
                          <span>
                            Your Secret View Key should be a 64 digits hex.
                            <br />
                            Example:
                            <br />
                            <b>
                              c53eaf7c443f1b5a9967a1d1a651897f5a1aafd13a21b519aea6d0798ba5d007
                            </b>
                          </span>
                        </ReactTooltip>
                      </IconContext.Provider>
                    </label>
                    <input className="mb-3 w-75" name="viewkey" />

                    <button
                      className="mx-auto custom-button-entry orange-border my-3"
                      type="submit"
                    >
                      Set Keys
                    </button>
                  </Form>
                </div>
              ) : (
                ""
              )}

              {this.state.pageNumber === 1 ? (
                <div>
                  {this.state.new_path.length > 0 ? (
                    <div className="entry-container">
                      <Col className="justify-content-around d-flex flex-column">
                        <p>
                          {" "}
                          This file will be saved to:{" "}
                          <i>{this.state.new_path}</i>
                        </p>

                        <button
                          className="mx-auto custom-button-entry"
                          onClick={this.change_path}
                        >
                          Change Path
                        </button>

                        <button
                          className="mx-auto custom-button-entry orange-border"
                          onClick={() => this.setState({ pageNumber: 2 })}
                        >
                          Continue
                        </button>
                      </Col>
                    </div>
                  ) : (
                    <div className="entry-container">
                      <p>
                        Where would you like to save your new Safex Wallet
                        Files?
                      </p>
                      <Form
                        className="mt-2 mb-2"
                        id="set_path"
                        onSubmit={this.set_path}
                      >
                        <input className="display-none" type="file" />
                        <Col className="justify-content-around d-flex flex-column">
                          <button
                            className="mx-auto custom-button-entry orange-border my-5"
                            type="submit"
                            variant="primary"
                            size="lg"
                          >
                            Select File Path
                          </button>
                        </Col>
                      </Form>
                    </div>
                  )}
                </div>
              ) : (
                ""
              )}

              {this.state.new_path.length > 0 && this.state.pageNumber === 2 ? (
                <div className="entry-container">
                  <div className="entry-info-div">
                    <IconContext.Provider
                      value={{ color: "#767676", size: "30px" }}
                    >
                      <AiOutlineInfoCircle data-tip data-for="daemonHostInfo" />

                      <ReactTooltip
                        className="entry-tooltip-container"
                        id="daemonHostInfo"
                        effect="solid"
                        place="bottom"
                      >
                        <span>
                          This is the URL used to connect to the Safex
                          blockchain.
                          <br />
                          You can use the default provided by the Safex
                          Foundation
                          <br />
                          or replace it with your own full node.
                          <br />
                          <br />
                          <ul className="mb-4">
                            <li>
                              The default self hosted wallet setup would be:
                            </li>
                            <li className="mt-4">
                              HOST: <b>127.0.0.1</b>
                            </li>
                            <li className="mt-1">
                              PORT: <b>17402</b>
                            </li>
                            <li className="mt-2">
                              The default is rpc.safex.org:17402
                            </li>
                          </ul>
                        </span>
                      </ReactTooltip>
                    </IconContext.Provider>
                  </div>
                  {this.state.daemon_host.length < 1 ? (
                    <form
                      id="set_daemon"
                      onSubmit={this.set_daemon_state}
                      className=""
                    >
                      <label className="entry-form-label" htmlFor="daemon-host">
                        Daemon Host:
                      </label>

                      <input
                        id="daemon-host"
                        className="my-2 entry-form-input"
                        name="daemon_host"
                        defaultValue="rpc.safex.org"
                        placedholder="set the ip address of the safex blockchain"
                      />

                      <label htmlFor="daemon-port">Daemon Port:</label>

                      <input
                        id="daemon-port"
                        className="mt-2 mb-5"
                        name="daemon_port"
                        defaultValue="17402"
                        placedholder="set the port of the safex blockchain"
                      />

                      <button
                        className="custom-button-entry orange-border"
                        type="submit"
                        variant="primary"
                        size="lg"
                      >
                        Set Connection
                      </button>
                    </form>
                  ) : (
                    <div className="d-flex flex-column justify-content-around h-100">
                      <p>
                        You will be connected to:
                        <br />
                        <i>
                          {this.state.daemon_host}:{this.state.daemon_port}
                        </i>
                      </p>

                      <button
                        className="custom-button-entry"
                        size="lg"
                        onClick={() =>
                          this.setState({ daemon_host: "", daemon_port: 0 })
                        }
                      >
                        Reset Connection
                      </button>

                      <button
                        className="mx-auto custom-button-entry orange-border"
                        onClick={() => this.setState({ pageNumber: 3 })}
                      >
                        Continue
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                ""
              )}

              {this.state.pageNumber === 3 && (
                <div className="entry-container">
                  <form
                    id="set_password"
                    className=""
                    onSubmit={this.set_password}
                  >
                    <label htmlFor="password-input">Choose a password</label>

                    <input
                      id="password-input"
                      type="password"
                      name="password"
                      className="mt-2 mb-2"
                    />

                    <label htmlFor="repeat-password-input">
                      Confirm your password
                    </label>

                    <input
                      id="repeat-password-input"
                      name="repeat_password"
                      className="mt-2 mb-2"
                      type="password"
                    />

                    <button
                      type="submit"
                      onClick={() => {
                        this.setState({ pageNumber: 4 });
                      }}
                      className="custom-button-entry orange-border my-5"
                    >
                      Set Password
                    </button>
                  </form>
                </div>
              )}

              {this.state.pageNumber === 4 && (
                <div className="entry-container">
                  <p>
                    This file will be saved to: <i>{this.state.new_path}</i>
                  </p>

                  <button
                    onClick={this.make_wallet}
                    className="my-5 mx-auto custom-button-entry orange-border"
                  >
                    Restore Wallet
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
}
