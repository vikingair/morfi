// @flow
import React from 'react';

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const rotationByDirection = {
    UP: 0,
    RIGHT: 90,
    DOWN: 180,
    LEFT: 270,
};

export const Arrow = ({ direction = 'UP' }: { direction?: Direction }) => (
    <svg viewBox="0 0 100 100" width="1em">
        <defs>
            <g id="arrow-up" strokeLinecap="round" stroke="currentColor" strokeWidth="20">
                <line x1="50" y1="10" x2="50" y2="90" />
                <line x1="10" y1="50" x2="50" y2="10" />
                <line x1="90" y1="50" x2="50" y2="10" />
            </g>
        </defs>
        <use href="#arrow-up" transform={`rotate(${rotationByDirection[direction] || 0} 50 50)`} />
    </svg>
);
