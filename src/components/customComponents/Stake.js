import React from 'react';
import ReactTooltip from "react-tooltip";
import { AiOutlineInfoCircle } from 'react-icons/ai'
import './ComponentCSS/Stake.css'

export default function Stake(props) {
    if (props.style === 'stake') {
        return (
            <form className="stake-token-box" id={props.id} onSubmit={props.send}>
                <p className="h3 my-3 text-center d-flex align-items-center"> 
                    STAKE TOKENS
                    <AiOutlineInfoCircle size={15} className="ml-3" data-tip data-for='stakeSafex' />
                        <ReactTooltip 
                            id='stakeSafex' 
                            type="info"
                            effect='solid'
                            place="left"
                        >
                            <span>
                                How to stake?
                                <br/>
                                {`The amount that you are staking has to be less than your token balance: ${props.tokenBalance}.`}
                                <br />
                                5% of each sale is awarded to the 
    revenue pool. The amount of tokens you stake will redeem your proportion of the accrued pool.
    <br />
    Each 1000 blocks a new interval is formed, and you must have staked ahead of the interval to
    count towards that pools accrual.
                            </span>
                        </ReactTooltip>
                </p>
                    <div className="w-100 d-flex flex-column">
                        <label>Available: </label>
                        <span>{props.tokenBalance} SFT</span>    

                        <input
                            className="mt-2"
                            name="amount"
                            placeholder="How much to stake?"
                            type="number"
                        />
                    </div>
                    <div className="w-100 d-flex align-items-center mt-3">
                            <label className="d-flex align-items-center">
                                Mixins:

                                <AiOutlineInfoCircle size={15} data-tip data-for='mixinInfo'
                                        className="ml-3"/>

                            <ReactTooltip id='mixinInfo' type='info' effect='solid' place="left">
                                <span>
                                    Mixins are transactions that have also been sent on the Safex blockchain. <br/>
                                    They are combined with yours for private transactions.<br/>
                                    Changing this from the default could hurt your privacy.<br/>
                                </span>
                            </ReactTooltip>    
                            </label>

                            <select 
                                className="ml-2"
                                style={{width: "50px"}}
                                name="mixins" 
                                defaultValue="7">
                        <option>1</option>
                        <option>2</option>
                        <option>3</option>
                        <option>4</option>
                        <option>5</option>
                        <option>6</option>
                        <option>7</option>
                    </select>
                        </div>
                    
                <div className="d-flex w-100" style={{flex: 1, alignItems: 'flex-end'}}>
                <button style={{height: '50px'}} className="custom-button-send" type="submit">
                    {props.style.toUpperCase()}
                </button>
                </div>
            </form>
        )
    }

    return (
            <form className="stake-token-box" id={props.id} onSubmit={props.send}>
                <p className="h3 my-3 text-center d-flex align-items-center"> 
                    UNSTAKE TOKENS
                </p>
                    <div className="w-100 d-flex align-items-center">
                        <label>Staked: {props.stakedBalance}</label>
                        
                        <select className="ml-3" style={{width: '50px'}} name="selected_stake">
                            {props.tokenStakes.map((staked, key) => {
                                return (
                                    <option key={key}>{staked.tokenStaked / 10000000000}
                                    | at height {staked.blockHeight}
                                    | SFX accrued {staked.collectedInterest / 10000000000}</option>
                                )
                            })}
                        </select>
                    </div>
                

                    <div className="w-100 d-flex align-items-center mt-3">
                            <label className="d-flex align-items-center">
                                Mixins:

                                <AiOutlineInfoCircle size={15} data-tip data-for='mixinInfo'
                                        className="ml-3"/>

                            <ReactTooltip id='mixinInfo' type='info' effect='solid' place="left">
                                <span>
                                    Mixins are transactions that have also been sent on the Safex blockchain. <br/>
                                    They are combined with yours for private transactions.<br/>
                                    Changing this from the default could hurt your privacy.<br/>
                                </span>
                            </ReactTooltip>    
                            </label>

                            <select 
                                className="ml-2"
                                style={{width: "50px"}}
                                name="mixins" 
                                defaultValue="7">
                        <option>1</option>
                        <option>2</option>
                        <option>3</option>
                        <option>4</option>
                        <option>5</option>
                        <option>6</option>
                        <option>7</option>
                    </select>
                        </div>
                    
                <div className="d-flex w-100" style={{flex: 1, alignItems: 'flex-end'}}>
                <button style={{height: '50px'}} className="custom-button-send" type="submit">
                    {props.style.toUpperCase()}
                </button>
                </div>
            </form>

    )
}