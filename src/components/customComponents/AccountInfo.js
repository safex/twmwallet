import React from 'react';

import { Row, Col } from 'react-bootstrap';
import ReactModal from 'react-modal';

import ReactTooltip from "react-tooltip";

// Icon Imports
import { AiOutlineInfoCircle } from 'react-icons/ai'
import { IconContext } from 'react-icons'
import { CgCloseR } from 'react-icons/cg'

import './ComponentCSS/AccountInfo.css'

import print from 'print-js'
import copy from "copy-to-clipboard"

export default function AccountInfo(props) {

    return (
        props.keyRequest === false ?
            <div className="account-info-box">
                    <h1>This is your SAFEX Cash and SAFEX Token address:</h1>

                    <h1>{ props.toEllipsis(props.address, 20, 20) }</h1>
                    {/*this.state.synced === false ? (
                        <Button variant="warning" onClick={this.check}>
                            Check
                    </Button>) : ''*/}
                <Row className="justify-content-around">
                    <button onClick={props.rescan}>
                        Hard Rescan
                    </button>

                    <button onClick={() => copy(props.address)}>
                        Copy Address
                    </button>

                    <button onClick={props.handleKeyRequest}>
                        Show Keys
                    </button>
                </Row>
                    
            </div>
        :
            <div className="account-info-box justify-content-around">

                <IconContext.Provider value={{color: '#FEB056', size: '20px'}}>
                    <CgCloseR
                        className=""
                        onClick={props.handleKeyRequest}
                    />
                </IconContext.Provider>

                <div className="show-keys-password-box">
                   {/* <h1 className="password-header">To see your <b>Private Keys</b> please enter your password:</h1>
                    
                    <input type="password" className="show-keys-password"/>
                */}
                    <button className="m-5" onClick={props.handleShow}>Open</button>

                    <button className="m-5" onClick={props.handleKeyRequest}>Close</button>
                    
                </div>
                    

                
                <ReactModal
                    isOpen={props.show}
                    className="keys-modal"
                    onRequestClose={props.handleShow}
                >  

                <button onClick={() => print('seedsAndKeysDiv', 'html')}>Print</button> 
                    <Row>
                        <Col sm={10}>
                            <h1>
                                Keys {'&'} Seeds
                                <IconContext.Provider  value={{color: '#767676', size: '25px'}}>
                                    <AiOutlineInfoCircle className="ml-2 mb-2" data-tip data-for='keysSeedInfo' />
                                    
                                    <ReactTooltip 
                                        className="entry-tooltip-container" 
                                        id='keysSeedInfo' 
                                        effect='solid'
                                        place="right"
                                    >
                                        <span>
                                            IMPORTANT: Secret Keys and Seed Phrases are sensitive information. 
                                            Make sure you don’t share them with anyone. 
                                            Back them up, and store on the safe place(s).
                                            Losing file backups can compromise your resources.
                                        </span>
                                    </ReactTooltip>
                                </IconContext.Provider>
                            </h1>
                        </Col>
                        <Col sm={2}>
                            <IconContext.Provider value={{color: '#FEB056', size: '30px'}}>
                                <CgCloseR
                                    className="mx-auto"
                                    onClick={props.handleShow}
                                />
                            </IconContext.Provider>
                        </Col>
                    </Row>
                   
                    
                    <Row>
                        <Col sm={12}>
                            <h2>
                                Public Address
                                <IconContext.Provider  value={{color: '#767676', size: '25px'}}>
                                    <AiOutlineInfoCircle className="ml-2 mb-2" data-tip data-for='keysSeedInfo' />
                                    
                                    <ReactTooltip 
                                        className="entry-tooltip-container" 
                                        id='keysSeedInfo' 
                                        effect='solid'
                                        place="right"
                                    >
                                        <span>
                                            IMPORTANT: Secret Keys and Seed Phrases are sensitive information. 
                                            Make sure you don’t share them with anyone. 
                                            Back them up, and store on the safe place(s).
                                            Losing file backups can compromise your resources.
                                        </span>
                                    </ReactTooltip>
                                </IconContext.Provider>
                            </h2>
                        </Col>

                        <Col sm={10}>
                            {props.address}
                        </Col>

                        <Col sm={2}>
                            <button onClick={() => copy(props.address)}>Copy</button>
                        </Col>
                    </Row>

                    <Row>
                        <Col sm={12}>
                            <h2>
                                Private Spend Key
                                <IconContext.Provider  value={{color: '#767676', size: '25px'}}>
                                    <AiOutlineInfoCircle className="ml-2 mb-2" data-tip data-for='keysSeedInfo' />
                                    
                                    <ReactTooltip 
                                        className="entry-tooltip-container" 
                                        id='keysSeedInfo' 
                                        effect='solid'
                                        place="right"
                                    >
                                        <span>
                                            IMPORTANT: Secret Keys and Seed Phrases are sensitive information. 
                                            Make sure you don’t share them with anyone. 
                                            Back them up, and store on the safe place(s).
                                            Losing file backups can compromise your resources.
                                        </span>
                                    </ReactTooltip>
                                </IconContext.Provider>
                            </h2>
                        </Col>

                        <Col sm={10}>
                            {props.spendKey}
                        </Col>

                        <Col sm={2}>
                            <button onClick={() => copy(props.spendKey)}>Copy</button>
                        </Col>
                    </Row>

                    <Row>
                        <Col sm={12}>
                            <h2>
                                Private View Key
                                <IconContext.Provider  value={{color: '#767676', size: '20px'}}>
                                    <AiOutlineInfoCircle className="ml-2 mb-2" data-tip data-for='keysSeedInfo' />
                                    
                                    <ReactTooltip 
                                        className="entry-tooltip-container" 
                                        id='keysSeedInfo' 
                                        effect='solid'
                                        place="right"
                                    >
                                        <span>
                                            IMPORTANT: Secret Keys and Seed Phrases are sensitive information. 
                                            Make sure you don’t share them with anyone. 
                                            Back them up, and store on the safe place(s).
                                            Losing file backups can compromise your resources.
                                        </span>
                                    </ReactTooltip>
                                </IconContext.Provider>
                            </h2>
                        </Col>

                        <Col sm={10}>
                            {props.viewKey}
                        </Col>

                        <Col sm={2}>
                            <button onClick={() => copy(props.viewKey)}>Copy</button>
                        </Col>
                    </Row>

                    <Row>
                        <Col sm={12}>
                            <h2>
                                Seed Phrase
                                <IconContext.Provider  value={{color: '#767676', size: '20px'}}>
                                    <AiOutlineInfoCircle className="ml-2 mb-2" data-tip data-for='keysSeedInfo' />
                                    
                                    <ReactTooltip 
                                        className="entry-tooltip-container" 
                                        id='keysSeedInfo' 
                                        effect='solid'
                                        place="right"
                                    >
                                        <span>
                                            IMPORTANT: Secret Keys and Seed Phrases are sensitive information. 
                                            Make sure you don’t share them with anyone. 
                                            Back them up, and store on the safe place(s).
                                            Losing file backups can compromise your resources.
                                        </span>
                                    </ReactTooltip>
                                </IconContext.Provider>
                            </h2>
                        </Col>

                        <Col sm={10}>
                            {props.seed}
                        </Col>

                        <Col sm={2}>
                            <button onClick={() => copy(props.seed)}>Copy</button>
                        </Col>
                    </Row>
                </ReactModal> 

                <div 
                    
                    style={{display: 'none'}}
                >
                    <h1 id="seedsAndKeysDiv" style={{textAlign: 'center'}}>
                        This is a copy of your <u>SAFEX KEYS + SEED PHRASE</u>. 
                        <br/><br/>
                        This is <u>SENSITIVE + IMPORTANT</u> information and should <u>BE KEPT PRIVATE + SAFE</u>. 
                        <br/><br/>
                        You will need this information to <u>RECOVER YOUR WALLET</u>.
                        <br/><br/>
                        Public Address: {props.address}
                        <br/><br/>
                        Private Spend Key: {props.spendKey}
                        <br/><br/>
                        Private View Key: {props.viewKey}
                        <br/><br/>
                        Private Seed Phrase: {props.seed}
                    </h1>
                </div>                   
            </div>
    )
}