<Container>
                    <Row>
                        <div className="container center">
                            <nav className="menu">
                            <Image className="entry-image align-content-center mb-5" src={require("./../../img/sails-logo.png")}/>

                                <div className="menu__right">
                                    <ul className="menu__list">
                                        <li className="menu__list-item">
                                            SFX: {this.state.cash}
                                        </li>
                                        <li className="menu__list-item">
                                            SFT: {this.state.tokens}
                                        </li>
                                        <li className="menu__list-item">
                                            <a className="menu__link" href="javascript:void(0)"
                                               onClick={this.go_home}>Home</a>
                                        </li>
                                        <li className="menu__list-item">
                                            <a className="menu__link" href="javascript:void(0)"
                                               onClick={this.show_market}>Market</a>
                                        </li>
                                        <li className="menu__list-item">
                                            <a className="menu__link" href="javascript:void(0)"
                                               onClick={this.show_merchant}>Merchant</a>
                                        </li>
                                        <li className="menu__list-item">
                                            <a className="menu__link" href="javascript:void(0)"
                                               onClick={this.show_staking}>Staking</a>
                                        </li>
                                        <li className="menu__list-item">
                                            <a className="menu__link" href="javascript:void(0)"
                                               onClick={this.show_settings}>Settings</a>
                                        </li>
                                        <li className="menu__list-item">
                                            <a className="menu__link" href="javascript:void(0)"
                                               onClick={this.logout}>Exit</a>
                                        </li>
                                    </ul>
                                </div>
                            </nav>
                        </div>
                    </Row>

                    <Row>
                        <Col sm={8}>
                            <ul>

                                <li>
                                    Public Address: Receive SFT and SFX here (share this to get paid)
                                </li>
                                <li>
                                    {this.state.address}
                                </li>
                            </ul>
                        </Col>
                        <Col>
                            <ul>
                                <li className="mb-2">Blockchain Height: <b>{this.state.blockchain_height}</b></li>
                                {this.state.wallet_height < this.state.blockchain_height ?
                                    (<li>
                                        {this.state.wallet_height} / {this.state.blockchain_height}
                                    </li>) : ''}
                                <li>{this.state.connection_status}</li>
                                <li>
                                    {this.state.synced === false ? (
                                        <Button className="m-1" onClick={this.check}>Check</Button>) : ''}
                                    <Button className="m-1" variant="danger" onClick={this.rescan}>Hard Rescan</Button>
                                    <Button className="m-1" variant="primary" onClick={this.handleShow}>
                                        Show Keys
                                    </Button>

                                    <Modal animation={false} show={this.state.show_keys} onHide={this.handleClose}>
                                        <Modal.Header closeButton>
                                            <Modal.Title>Your Private Keys</Modal.Title>
                                        </Modal.Header>
                                        <Modal.Body>
                                            <ul>
                                                <li>
                                                    <b>Address:</b> <br/> {this.props.wallet.address()}
                                                </li>
                                                <li>
                                                    <b>Secret Spend Key:</b> <br/> {this.props.wallet.secretSpendKey()}
                                                </li>
                                                <li>
                                                    <b>Secret View Key:</b> <br/> {this.props.wallet.secretViewKey()}
                                                </li>
                                                <li>
                                                    <b>Mnemonic Seed:</b> <br/> {this.props.wallet.seed()}
                                                </li>
                                            </ul>
                                        </Modal.Body>
                                        <Modal.Footer>
                                            <Button variant="secondary" onClick={this.handleClose}>
                                                Close
                                            </Button>
                                        </Modal.Footer>
                                    </Modal>
                                </li>

                            </ul>
                        </Col>
                    </Row>

                    {twmwallet()}

                </Container>