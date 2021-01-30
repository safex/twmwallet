import React from 'react';

import Loader from 'react-loader-spinner'

// Icon Imports
import { FaCubes } from 'react-icons/fa'

import './ComponentCSS/HomeInfo.css'

export default function HomeInfo(props) {

    return (
       
            <div className="home-info-box">
                <h4>
                    <FaCubes className="mr-3"/>
                    { props.walletHeight === props.blockHeight ? 
                        props.blockHeight 
                    : 
                        `${props.walletHeight} / ${props.blockHeight}`}
                </h4>

                <p>{props.connection}</p>

                <h4 className={!props.firstRefresh ? 'infinity' : ''}>
                    CASH: &nbsp;{ props.firstRefresh === true ?
                                    (props.cashBalance.toLocaleString() + ' SFX')
                                    :
                                    ('∞')
                    }
                    <br/>
                    {props.pendingCash > 0 ? `(${props.pendingCash.toLocaleString()} SFX Pending)` : ''}
                    
                    <br/>
                    TOKENS: &nbsp;{ props.firstRefresh === true ?
                                (props.tokenBalance.toLocaleString() + ' SFT')
                                :
                                ('∞')
                    }
                    <br/>
                    {props.pendingTokens > 0 ? `(${props.pendingTokens.toLocaleString()} SFT Pending)` : ''}
                </h4>
                
            </div>
     
    )
}