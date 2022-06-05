import React from 'react'
import './circleProgress.css'

class CircleProgressBar extends React.Component{

    render() {
        return (
            <svg viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="17" fill="#000000" fillOpacity={0.3} />
                <path className="circle"
                    stroke={`${this.props.color}`}
                    strokeDasharray={`${this.props.percent}, 100`}
                    d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <text x="18" y="19" className="remainTime select-none" fill={`${this.props.color}`}>{this.props.value}</text>
                <text x="18" y="25" className="symbol select-none">{this.props.symbol}</text>
            </svg>
        )
    }
}

export default CircleProgressBar;