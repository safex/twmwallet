import React from 'react';

import {Row, Modal, Button} from 'react-bootstrap';

import {BiCog, BiPowerOff} from 'react-icons/bi'

import './ComponentCSS/AccountInfo.css'


import copy from "copy-to-clipboard"

export default function AccountInfo(props) {

    return (
        <div className="account-info-box">
                <h1>This is your safex and safex token address:</h1>

                <h1>{ props.toEllipsis(props.address, 20, 20) }</h1>
                {/*this.state.synced === false ? (
                    <Button variant="warning" onClick={this.check}>
                        Check
                </Button>) : ''*/}
            <Row className="justify-content-around">
                <button onClick={props.rescan}>
                    Hard Rescan
                </button>

                <button onClick={props.handleShow}>
                    Show Keys
                </button>

                <Modal
                    className="width100 black-text"
                    animation={false}
                    show={props.show}
                    onHide={props.handleShow}
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Your Private Keys</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <ul>
                            <li>
                                <b>Address:</b> <br/> {props.addre}
                            </li>
                            <li>
                                <b>Secret Spend Key:</b>
                                <br/> {props.spendKey}
                            </li>
                            <li>
                                <b>Secret View Key:</b>
                                <br/> {props.viewKey}
                            </li>
                            <li>
                                <b>Mnemonic Seed:</b>
                                <br/> {props.seed.toUpperCase()}
                            </li>
                        </ul>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={props.handleClose}>
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>

                <button onClick={() => copy(props.address)}>
                    Copy Address
                </button>
            </Row>
                
        </div>
    )
}