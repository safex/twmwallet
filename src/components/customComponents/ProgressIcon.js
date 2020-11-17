import React from 'react';

export default function ProgressIcon(props) {
    
        return (
            <div className="progress-icon">
                <div className={`progress-bar-number ${props.color}`}>
                   {props.number}
                </div>

                <div className={`progress-bar-title ${props.color}`}>
                    {props.title}
                </div>
            </div>
        );
    }