import React from 'react';

import Loader from 'react-loader-spinner'

// Icon Imports

import './ComponentCSS/HomeInfo.css'

export default function HomeInfo(props) {

    return (
       
            <div className="home-info-box">
                <h3>{props.blockHeight}</h3>

                <p>{props.connection}</p>

                <h2 className={!props.firstRefresh ? 'infinity' : ''}>
                    SAFEX CASH: &nbsp;{ props.firstRefresh === true ?
                                    (props.cashBalance.toLocaleString())
                                    :
                                    ('∞')
                    }
                    <br/>

                    {props.penndingCash > 0 ? `(${props.pendingCash.toLocaleString()} SFX Pending)` : ''}

                    SAFEX TOKENS: &nbsp;{ props.firstRefresh === true ?
                                    (props.tokenBalance.toLocaleString())
                                    :
                                    ('∞')
                    }
                    <br/>

                    {props.pendingTokens > 0 ? `(${props.pendingTokens.toLocaleString()} SFT Pending)` : ''}
                </h2>
                
            </div>
     
    )
}