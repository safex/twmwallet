import React from 'react';

export default function StakeInfo(props) {
    const renderRow = (label, body) => {
        return (
            <div className="d-flex flex-column mb-3">
                <label>{label}</label>
                {body()}
            </div>
        )
    }

    return (
            <div className="stake-token-box" id={props.id} onSubmit={props.send}>
                <p className="h3 my-3 text-center">STATUS</p>
                {renderRow("Staked Safex Token:", () => <span>
                    {props.stakedBalance} SFT
                    {props.pendingStakeBalance > 0 ? (<li>Pending Stake: {props.pendingStakeBalance} SFT</li>) : ''}
                    </span>)}

                {renderRow("Current Block:", () => <span>{props.blockHeight}</span>)}
                {renderRow("Next Interval:", () => <span>{props.nextInterval}</span>)}
                {renderRow("Total SFT Staked on the Network:", () => <span>{props.totalNetworkStake}</span>)}
            </div>
    )
}