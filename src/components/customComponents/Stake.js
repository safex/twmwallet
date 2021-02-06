import React from 'react';

import { Row } from 'react-bootstrap';

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

                   
                </p>
                    <IconContext.Provider  value={{color: '#767676', size: '25px'}}>
                        <AiOutlineInfoCircle className="ml-2 mb-2" data-tip data-for='sendSafexInfoTokensStake' />
                        
                        <ReactTooltip 
                            className="entry-tooltip-container" 
                            id='sendSafexInfoTokensStake' 
                            effect='solid'
                            place="left"
                        >
                            <span>
                                How to {props.style}?
                                <br/>
                                { props.style === 'stake' ?
                                    `The amount that you are staking has to be less than your token balance: ${props.tokenBalance}.
                                    `
                                :
                                    `The amount that you are unstaking has to be greater than the amount you have staked.
                                    The transaction fee will be added on to the amount you are unstaking.`
                                }
                            </span>
                        </ReactTooltip>
                    </IconContext.Provider>
                {props.style === 'stake' ?
                    <div className="stake-label-div">
                        <h5>Available: {props.tokenBalance} SFT</h5>    

                        <input
                            name="amount"
                            placeholder="How much to stake?"
                            type="number"
                        />
                    </div>
                :
                    <div className="stake-label-div">
                        <h5>Staked: {props.stakedBalance}</h5>
                        
                        <select name="selected_stake">
                            {props.tokenStakes.map((staked, key) => {
                                return (
                                    <option key={key}>{staked.tokenStaked / 10000000000}
                                    | at height {staked.blockHeight}
                                    | SFX accrued {staked.collectedInterest / 10000000000}</option>
                                )
                            })}
                        </select>
                    </div>
                }
                

                <Row>
                    <div className="mixins-label">
                        <IconContext.Provider value={{color: '#767676', size: '25px'}}>
                            <AiOutlineInfoCircle data-tip data-for='mixinInfo'
                                        className=""/>

                            <ReactTooltip id='mixinInfo' type='info' effect='solid' place="left">
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