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
      network: "stagenet",
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
      try {
        localStorage.setItem("wallet", JSON.stringify(wallet));

        try {
          console.log(`the path ${this.state.new_path}`);
          let twm_file = await open_twm_file(
            this.state.new_path + ".twm",
            this.state.password
          );
          if (twm_file.success) {
            //parse the json and pack it into the local storage for usages
            console.log(`success`);
            console.log(twm_file);
            localStorage.setItem("twm_file", JSON.stringify(twm_file.contents));
          } else {
            console.log(`error`);
            console.log(twm_file);
            throw `error`;
          }
        } catch (err) {
          console.error(err);
          let make_new_twm_file = window.confirm(
            `the wallet couldn't open the twm file, perhaps there was none, let's make a new one?`
          );
          console.log(make_new_twm_file);
          if (make_new_twm_file === true) {
            try {
              let twm_obj = {};

              twm_obj.version = 1;
              twm_obj.api = {};
              twm_obj.api.urls = {}; /*
                    twm_obj.api.urls.theworldmarketplace = {};
                    twm_obj.api.urls.theworldmarketplace.url = 'api.theworldmarketplace.com';*/
              twm_obj.accounts = {};
              twm_obj.settings = {};

              //for each account make one, and within an account you have urls and keys  the top lvel api urls is for top level non account actions
              var accs = wallet.getSafexAccounts();
              for (const acc of accs) {
                console.log(acc);
                twm_obj.accounts[acc.username] = {};
                twm_obj.accounts[acc.username].username = acc.username;
                twm_obj.accounts[acc.username].data = acc.data;
                twm_obj.accounts[acc.username].safex_public_key = acc.publicKey;
                twm_obj.accounts[acc.username].safex_private_key =
                  acc.privateKey;
                twm_obj.accounts[acc.username].urls = {};
                /*
                                                        twm_obj.accounts[acc.username].urls.theworldmarketplace = {};
                                                        twm_obj.accounts[acc.username].urls.theworldmarketplace.url = 'api.theworldmarketplace.com';
                                */
              }

              const algorithm = "aes-256-ctr";
              const cipher = crypto.createCipher(
                algorithm,
                this.state.password
              );
              let crypted = cipher.update(
                JSON.stringify(twm_obj),
                "utf8",
                "hex"
              );
              crypted += cipher.final("hex");

              const hash1 = crypto.createHash("sha256");
              hash1.update(JSON.stringify(twm_obj));
              console.log(`password ${this.state.password}`);
              console.log(JSON.stringify(twm_obj));

              let twm_save = await save_twm_file(
                this.state.new_path + ".twm",
                crypted,
                this.state.password,
                hash1.digest("hex")
              );

              try {
                let twm_file = await open_twm_file(
                  this.state.new_path + ".twm",
                  this.state.password
                );
                console.log(twm_file);
                localStorage.setItem(
                  "twm_file",
                  JSON.stringify(twm_file.contents)
                );
              } catch (err) {
                console.error(err);
                console.error(`error opening twm file after save to verify`);
              }
              console.log(twm_save);
            } catch (err) {
              console.error(err);
              console.error(`error at initial save of the twm file`);
            }
          } else {
            alert(`opening wallet without making twm_file`);
          }
        }
        this.setState({
          wallet_made: true,
          wallet: wallet,
          password: this.state.password,
          loading: false,
        });
      } catch (err) {
        console.error(err);
        console.error("error on initial recovery");
        alert(err);
      }
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

  renderUrlTooltip() {
    return (
      <>
      <AiOutlineInfoCircle className="ml-2" size={15} data-tip data-for="daemonHostInfo" />
                      <ReactTooltip
                        id="daemonHostInfo"
                        effect="solid"
                        type="info"
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
                              The default is rpc.safex.org:30393
                            </li>
                          </ul>
                        </span>
                      </ReactTooltip>
                      </>
    )
  }

  render() {
    return (
      <div className="h-100 w-100">
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
                className="entry-off-button pointer"
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
                        <p className="h3">
                          {" "}
                          Selected Wallet File: <br /><i>{this.state.new_path}</i>
                        </p>

                        <div className="d-flex flex-column mt-3">
                        <button
                          className="w-100 mx-auto custom-button-entry"
                          onClick={this.change_path}
                        >
                          Change File
                        </button>

                        <button
                          autoFocus
                          className="mt-2 w-100 mx-auto custom-button-entry orange-border"
                          onClick={() => this.setState({ pageNumber: 2 })}
                        >
                          Continue
                        </button>
                        </div>
                    </div>
                  ) : (
                    <div className="entry-container">
                      <p className="h3">
                        Open an existing Safex wallet by selecting the{" "}
                        <b>.keys file</b>
                      </p>

                      <Form
                        className="mt-4"
                        id="set_path"
                        onSubmit={this.set_path}
                      >
                        <input className="display-none" type="file" />
                          <button
                            autoFocus
                            className="w-100 mx-auto custom-button-entry orange-border"
                            type="submit"
                            variant="primary"
                          >
                            Select File Path
                          </button>
                      </Form>
                    </div>
                  )}
                </div>
              ) : (
                ""
              )}

              {this.state.pageNumber === 2 ? (
                <div className="entry-container p-4">
                  {this.state.daemon_host.length < 1 ? (
                    <form
                      id="set_daemon"
                      onSubmit={this.set_daemon_state}
                      className=""
                    >
                      <label className="entry-form-label" htmlFor="daemon-host">
                        Daemon Host:
                        {this.renderUrlTooltip()}
                      </label>

                      <input
                        id="daemon-host"
                        className="my-2 entry-form-input"
                        name="daemon_host"
                        defaultValue="stagenetrpc.safex.org"
                        placedholder="set the ip address of the safex blockchain"
                      />

                      <label htmlFor="daemon-port">Daemon Port:</label>

                      <input
                        id="daemon-port"
                        className="mt-2 mb-3"
                        name="daemon_port"
                        defaultValue="30393"
                        placedholder="set the port of the safex blockchain"
                      />

                      <button
                        autoFocus
                        className="w-100 custom-button-entry orange-border"
                        type="submit"
                        variant="primary"
                      >
                        Set Connection
                      </button>
                    </form>
                  ) : (
                    <div className="d-flex flex-column h-100">
                      <p className="h3">
                        You will be connected to:
                        <br />
                        <i>
                          {this.state.daemon_host}:{this.state.daemon_port}
                        </i>
                        {this.renderUrlTooltip()}
                      </p>

                      <button
                        className="mt-2 w-100 custom-button-entry"
                        onClick={() =>
                          this.setState({ daemon_host: "", daemon_port: 0 })
                        }
                      >
                        Reset Connection
                      </button>

                      <button
                        autoFocus
                        className="mt-2 w-100 mx-auto custom-button-entry orange-border"
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
                      className={`w-100 mt-2 ${
                        this.state.error === "checking"
                          ? "opacity100"
                          : "custom-button-entry orange-border"}`
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
