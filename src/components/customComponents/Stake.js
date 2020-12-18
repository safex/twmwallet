import React from 'react';

import {Row, Col, Image, } from 'react-bootstrap';

import ReactTooltip from "react-tooltip";

// Icon Imports
import { AiOutlineInfoCircle } from 'react-icons/ai'

import { IconContext } from 'react-icons'

import './ComponentCSS/Stake.css'

export default function Stake(props) {

    return (
            <form className="stake-token-box" id={props.id} onSubmit={props.send}>

                <p > 
                    { props.style.toUpperCase() } TOKENS

                    <IconContext.Provider  value={{color: '#767676', size: '25px'}}>
                        <AiOutlineInfoCircle className="ml-2 mb-2" data-tip data-for='sendSafexInfo' />
                        
                        <ReactTooltip 
                            className="entry-tooltip-container" 
                            id='sendSafexInfo' 
                            effect='solid'
                            place="right"
                        >
                            <span>
                                How to send?
                                <br/>
                                <br/>
                                1. The address that you are sending safex to should start with 
                                "Safex" and contain 95-105 characters.<br/>
                                Example: Safex5zHGtYQYE41yEzLTRQWiajC5keyJHVwQamarNyp9ssouD87bbGhobVnYAtUEQa4me79ybZev2AmLUnbds4PRYv3P1KmW6j2F
                                <br/>
                                <br/>
                                2. The amount that you are staking has to be grater than 10,000.
                                The transaction fee will be added on to the amount you are sending.
                            </span>
                        </ReactTooltip>
                    </IconContext.Provider>
                </p>

                {props.style === 'stake' ?
                    <div className="stake-label-div">
                        <h5>Available: {props.tokenBalance} SFT</h5>    

                        <input
                            name="destination"
                            defaultValue="How much to stake?"
                            type="number"
                        />
                    </div>
                :
                    <div className="stake-label-div">
                        <h5>Staked: {props.stakedBalance}</h5>
                        <select
                            name=""
                        >
                            <option>Choose Stake ID</option>
                            <option>376S6B7OUWQ131Z8Y26XPISU1LVCHVWAJ9M3CPGV9QFS59CPMJFK7W2WDKUSBZCA</option>
                            <option>UMAELCBVH7KKU5TL3D34Q7EVSK4QDIGQXCH1Y4COL1QWHPN1ZBTA8NCUCYG2NRHC</option>
                            <option>ZP36FH4PK4P7WYXRELYZQZZ4HGFGM7GDMJT195CQBCZD2UC59WH2WC041DL540YS</option>
                            <option>EMWPA4T2SC2KYDDUS2ORVTUO8JCWKYLN0VF40YNTXAAP365TXH3CFAKS80ORYCRR</option>
                        </select>
                    </div>
                }
                

                <Row>
                    <div className="mixins-label">
                        <IconContext.Provider value={{color: '#767676', size: '25px'}}>
                            <AiOutlineInfoCircle data-tip data-for='mixinInfo'
                                        className=""/>

                            <ReactTooltip id='mixinInfo' type='info' effect='solid' place="right">
                                <span>
                                    Mixins are transactions that have also been sent on the Safex blockchain. <br/>
                                    They are combined with yours for private transactions.<br/>
                                    Changing this from the default could hurt your privacy.<br/>
                                </span>
                            </ReactTooltip>
                        </IconContext.Provider>

                        <div>
                            <label>Mixins:</label>
                        </div>
                    </div>

                    <select className="w-25" name="mixins" defaultValue="7">
                        <option>1</option>
                        <option>2</option>
                        <option>3</option>
                        <option>4</option>
                        <option>5</option>
                        <option>6</option>
                        <option>7</option>
                    </select>
                </Row>
                    

                <button className="custom-button-send" type="submit">
                    {props.style.toUpperCase()}
                </button>
            </form>

    )
}