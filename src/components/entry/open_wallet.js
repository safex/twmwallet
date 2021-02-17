import React from "react";
import { Row, Col, Container, Form, Image } from "react-bootstrap";
import { open_wallet_util } from "../../utils/wallet_creation";
import WalletHome from "../wallet/home";
import { open_twm_file, save_twm_file } from "../../utils/twm_actions";

import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import Loader from "react-loader-spinner";
import ReactTooltip from "react-tooltip";

import ProgressIcon from "../customComponents/ProgressIcon";

import { AiOutlineInfoCircle } from "react-icons/ai";
import { IoIosArrowBack } from "react-icons/io";
import { IconContext } from "react-icons";

const crypto = window.require("crypto");

let { dialog } = window.require("electron").remote;

export default class OpenWallet extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      daemon_host: "",
      daemon_port: 0,
      password: "",
      new_path: "",
      wallet: null,
      network: "mainnet",
      testnet: false,
      wallet_made: false,
      loading: false,
      freshStart: true,
      pageNumber: 1,
      error: "",
    };
  }

  async componentDidMount() {}

  set_path = (e) => {
    e.preventDefault();

    try {
      let sails_path = dialog.showOpenDialogSync();
      console.log(sails_path);
      sails_path = sails_path[0];

      if (sails_path.length > 0) {
        let ipath;
        if (sails_path.includes(".keys")) {
          ipath = sails_path.substring(0, sails_path.length - 5);
        } else if (sails_path.includes(".safex_account_keys")) {
          ipath = sails_path.substring(0, sails_path.length - 19);
        } else if (sails_path.includes(".address.txt")) {
          ipath = sails_path.substring(0, sails_path.length - 12);
        } else if (sails_path.includes(".twm")) {
          ipath = sails_path.substring(0, sails_path.length - 4);
        } else {
          ipath = sails_path;
        }
        console.log(sails_path);
        console.log(ipath);
        this.setState({ new_path: ipath });
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
    console.log(e.target.daemon_host.value);
  };

  open_wallet_result = async (error, wallet) => {
    if (error) {
      console.error(error);
      this.setState({ error: "password" });
    } else {
      this.setState({
        wallet_made: true,
        wallet: wallet,
        password: this.state.password,
        loading: false,
      });
    }
  };

  open_wallet = async (e) => {
    e.preventDefault();

    let the_password = e.target.password.value;
    this.setState({ password: the_password, error: "checking" });

    //now check if you can load the .twm file if not you have to make it
    let daemon_string = `${this.state.daemon_host}:${this.state.daemon_port}`;

    open_wallet_util(
      this.state.new_path,
      e.target.password.value,
      0,
      this.state.network,
      daemon_string,
      this.open_wallet_result
    );
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

  backToSelect = () => {
    this.props.history.push({ pathname: "/select_entry" });
  };

  goBack = (e) => {
    e.preventDefault();
    if (this.state.pageNumber > 1) {
        return this.setState({pageNumber: this.state.pageNumber - 1});
    } 

    this.backToSelect();
  };

  exit_home = (e) => {
    e.preventDefault();
    this.props.history.push({ pathname: "/" });
  };

  get isLoading() {
    return this.state.loading === true;
  }

  render() {
    return (
      <div
        className={
          this.state.wallet_made && !this.isLoading
            ? "h-100 w-100"
            : "h-100 background-entry-fix w-100"
        }
      >
        {this.state.wallet_made && !this.isLoading ? (
          <div className="w-100 h-100">
            <WalletHome
              wallet={this.state.wallet}
              daemon_host={this.state.daemon_host}
              daemon_port={this.state.daemon_port}
              password={this.state.password}
              wallet_path={this.state.new_path}
            />
          </div>
        ) : (
          <Container
            fluid
            className="start-background-image height100 d-flex flex-column justify-content-center align-items-center"
          >
            <Container className="h-100 d-flex flex-column justify-content-center align-items-center">
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
                  className="d-flex align-items-center entry-back-text pointer"
                  md={2}
                >
                  <IconContext.Provider
                    value={{ color: "#13D3FD", size: "3rem" }}
                  >
                    <IoIosArrowBack />
                  </IconContext.Provider>
                  BACK
                </Col>

                <a
                  onClick={() => {
                    this.setState({ pageNumber: 1, error: "" });
                  }}
                >
                  <ProgressIcon
                    number={1}
                    color={
                      this.state.pageNumber === 1
                        ? "progress-icon-color"
                        : this.state.new_path.length > 0
                        ? "progress-icon-color-complete"
                        : ""
                    }
                    title={"SELECT FILES"}
                  />
                </a>

                <a
                  onClick={() => {
                    this.setState({ pageNumber: 2, error: "" });
                  }}
                >
                  <ProgressIcon
                    number={2}
                    title={"NETWORK CONNECTION"}
                    color={
                      this.state.pageNumber === 2
                        ? "progress-icon-color"
                        : this.state.daemon_host.length > 0
                        ? "progress-icon-color-complete"
                        : ""
                    }
                  />
                </a>

                <a
                  onClick={() => {
                    this.setState({ pageNumber: 3 });
                  }}
                >
                  <ProgressIcon
                    number={3}
                    title={"YOUR PASSWORD"}
                    color={
                      this.state.pageNumber === 3
                        ? "progress-icon-color"
                        : this.state.password.length > 0
                        ? "progress-icon-color-complete"
                        : ""
                    }
                  />
                </a>
              </Row>

              {this.state.pageNumber === 1 ? (
                <div>
                  {this.state.new_path.length > 0 ? (
                    <div className="entry-container">
                      <Col className="justify-content-around d-flex flex-column">
                        <p>
                          {" "}
                          Selected Wallet File: <i>{this.state.new_path}</i>
                        </p>

                        <button
                          className="mx-auto custom-button-entry"
                          onClick={this.change_path}
                        >
                          Change File
                        </button>

                        <button
                          autoFocus
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
                        Open an existing Safex wallet by selecting the{" "}
                        <b>.keys file</b>
                      </p>

                      <Form
                        className="mt-2 mb-2"
                        id="set_path"
                        onSubmit={this.set_path}
                      >
                        <input className="display-none" type="file" />
                        <Col className="justify-content-around d-flex flex-column">
                          <button
                            autoFocus
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

              {this.state.pageNumber === 2 ? (
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
                        autoFocus
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
                        autoFocus
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

              {this.state.pageNumber === 3 ? (
                <div className="entry-container">
                  <form
                    id="set_password"
                    className={
                      this.state.error === "password" ? "wrong-password" : ""
                    }
                    onSubmit={this.open_wallet}
                  >
                    <label htmlFor="password-input">
                      {this.state.error === "password" ? (
                        "Looks Like You Made a Mistake. Please Try Again"
                      ) : this.state.error === "checking" ? (
                        <Loader
                          type="ThreeDots"
                          color="#13D3FD"
                          height={40}
                          width={80}
                        />
                      ) : (
                        "Enter Your Password"
                      )}
                    </label>

                    <input
                      autoFocus
                      id="password-input"
                      type="password"
                      name="password"
                      className={
                        this.state.error === "checking"
                          ? "opacity100"
                          : "mt-2 mb-2"
                      }
                    />

                    <button
                      type="submit"
                      className={
                        this.state.error === "checking"
                          ? "opacity100"
                          : "custom-button-entry orange-border my-5"
                      }
                    >
                      Continue
                    </button>
                  </form>
                </div>
              ) : (
                ""
              )}
            </Container>
          </Container>
        )}
      </div>
    );
  }
}
