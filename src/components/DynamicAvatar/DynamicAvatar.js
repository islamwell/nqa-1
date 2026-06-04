import React, { useMemo } from 'react';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  avatarContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '1.8rem',
    letterSpacing: '2px',
    fontWeight: 'bold',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
  },
}));

// Darker, more elegant gradients
const gradients = [
  'linear-gradient(135deg, #2c3e50 0%, #1a252f 100%)', // Dark Slate
  'linear-gradient(135deg, #1e3c72 0%, #15294e 100%)', // Midnight Blue
  'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #13242b 100%)', // Deep Teal
  'linear-gradient(135deg, #2b5876 0%, #26213a 100%)', // Dark Indigo
  'linear-gradient(135deg, #141e30 0%, #0d1421 100%)', // Deep Space
  'linear-gradient(135deg, #4b1248 0%, #2b0a29 100%)', // Dark Purple
  'linear-gradient(135deg, #0ba360 0%, #073a24 100%)', // Dark Emerald
  'linear-gradient(135deg, #333333 0%, #111111 100%)', // Charcoal
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

  // Consistently assign a gradient based on character code
  const gradient = useMemo(() => {
    const charCode = letters.charCodeAt(0) + letters.charCodeAt(1);
    return gradients[charCode % gradients.length];
  }, [letters]);

  return (
    <div className={`${classes.avatarContainer} ${className}`} style={{ background: gradient }}>
      {letters}
    </div>
  );
}
