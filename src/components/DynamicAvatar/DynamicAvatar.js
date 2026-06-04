import React, { useMemo } from 'react';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  avatarContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.8rem',
    letterSpacing: '2px',
    fontWeight: 'bold',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
  },
}));

// Darker, more elegant gradients for the background
const backgroundGradients = [
  'linear-gradient(135deg, #2c3e50 0%, #1a252f 100%)', // Dark Slate
  'linear-gradient(135deg, #1e3c72 0%, #15294e 100%)', // Midnight Blue
  'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #13242b 100%)', // Deep Teal
  'linear-gradient(135deg, #2b5876 0%, #26213a 100%)', // Dark Indigo
  'linear-gradient(135deg, #141e30 0%, #0d1421 100%)', // Deep Space
  'linear-gradient(135deg, #4b1248 0%, #2b0a29 100%)', // Dark Purple
  'linear-gradient(135deg, #0ba360 0%, #073a24 100%)', // Dark Emerald
  'linear-gradient(135deg, #333333 0%, #111111 100%)', // Charcoal
];

// Bright, vibrant gradients for the text inside
const textGradients = [
  'linear-gradient(to right, #f83600 0%, #f9d423 100%)', // Orange to Yellow
  'linear-gradient(to right, #f093fb 0%, #f5576c 100%)', // Pink to Cyan (approximated)
  'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)', // Cyan to Light Blue
  'linear-gradient(to right, #fa709a 0%, #fee140 100%)', // Pink to Yellow
  'linear-gradient(to right, #43e97b 0%, #38f9d7 100%)', // Bright Green to Cyan
  'linear-gradient(to right, #ff0844 0%, #ffb199 100%)', // Bright Red to Peach
  'linear-gradient(to right, #84fab0 0%, #8fd3f4 100%)', // Mint to Cyan
  'linear-gradient(to right, #fccb90 0%, #d57eeb 100%)', // Orange to Light Purple
];

export default function DynamicAvatar({ name, className }) {
  const classes = useStyles();

  // Extract first and last alphanumeric character, default to 'NN'
  const letters = useMemo(() => {
    if (!name) return 'NN';
    const match = name.match(/[a-zA-Z0-9]/g);
    if (!match || match.length === 0) return 'NN';
    if (match.length === 1) return (match[0] + match[0]).toUpperCase();
    return (match[0] + match[match.length - 1]).toUpperCase();
  }, [name]);

  // Consistently assign gradients based on character code
  const { bgGradient, txtGradient } = useMemo(() => {
    const charCode = letters.charCodeAt(0) + letters.charCodeAt(1);
    return {
      bgGradient: backgroundGradients[charCode % backgroundGradients.length],
      txtGradient: textGradients[charCode % textGradients.length],
    };
  }, [letters]);

  return (
    <div className={`${classes.avatarContainer} ${className}`} style={{ background: bgGradient }}>
      <span style={{
        background: txtGradient,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        color: 'transparent',
        display: 'inline-block'
      }}>
        {letters}
      </span>
    </div>
  );
}
