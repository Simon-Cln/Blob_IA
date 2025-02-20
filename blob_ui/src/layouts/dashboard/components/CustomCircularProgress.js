import React from 'react';
import PropTypes from 'prop-types';

const CustomCircularProgress = ({ value, size }) => {
  const radius = (size - 10) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: '#00c853', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#b2ff59', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <circle
        stroke="url(#gradient)"
        fill="transparent"
        strokeWidth="10"
        strokeDasharray={circumference}
        strokeDashoffset={0}
        r={radius}
        cx={size / 2}
        cy={size / 2}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        opacity="0.2" // Make it lighter
      />
      <circle
        stroke="url(#gradient)"
        fill="transparent"
        strokeWidth="10"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        r={radius}
        cx={size / 2}
        cy={size / 2}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
};

CustomCircularProgress.propTypes = {
  value: PropTypes.number.isRequired,
  size: PropTypes.number.isRequired,
};

export default CustomCircularProgress;