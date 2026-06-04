import React, { useMemo } from 'react';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  avatarContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '2.5rem',
    fontWeight: 'bold',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
    position: 'relative',
    overflow: 'hidden',
  },
  waveContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-evenly',
    padding: '0 10%',
    opacity: 0.8,
    backgroundColor: 'rgba(0,0,0,0.2)', // slight overlay when playing
  },
  bar: {
    width: '10%',
    backgroundColor: 'white',
    borderRadius: '2px 2px 0 0',
    animation: '$bounce 1.2s ease-in-out infinite',
  },
  bar1: { height: '30%', animationDelay: '0.0s' },
  bar2: { height: '80%', animationDelay: '0.1s' },
  bar3: { height: '50%', animationDelay: '0.2s' },
  bar4: { height: '90%', animationDelay: '0.3s' },
  bar5: { height: '40%', animationDelay: '0.4s' },
  
  '@keyframes bounce': {
    '0%, 100%': { transform: 'scaleY(1)', transformOrigin: 'bottom' },
    '50%': { transform: 'scaleY(0.4)', transformOrigin: 'bottom' },
  },
}));

// A set of vibrant gradients
const gradients = [
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
  'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)',
  'linear-gradient(135deg, #0ba360 0%, #3cba92 100%)',
  'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
];

export default function DynamicAvatar({ name, className, isPlaying }) {
  const classes = useStyles();

  // Extract first alphanumeric character, default to 'N'
  const firstLetter = useMemo(() => {
    if (!name) return 'N';
    const match = name.match(/[a-zA-Z0-9]/);
    return match ? match[0].toUpperCase() : 'N';
  }, [name]);

  // Consistently assign a gradient based on character code
  const gradient = useMemo(() => {
    const charCode = firstLetter.charCodeAt(0);
    return gradients[charCode % gradients.length];
  }, [firstLetter]);

  return (
    <div className={`${classes.avatarContainer} ${className}`} style={{ background: gradient }}>
      {firstLetter}
      
      {isPlaying && (
        <div className={classes.waveContainer}>
          <div className={`${classes.bar} ${classes.bar1}`} />
          <div className={`${classes.bar} ${classes.bar2}`} />
          <div className={`${classes.bar} ${classes.bar3}`} />
          <div className={`${classes.bar} ${classes.bar4}`} />
          <div className={`${classes.bar} ${classes.bar5}`} />
        </div>
      )}
    </div>
  );
}
