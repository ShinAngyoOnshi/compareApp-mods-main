'use client'
import React from 'react';
import PropTypes from 'prop-types';
// import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import { CircularProgress } from '@mui/material/CircularProgress';
import Check from '@mui/icons-material/Check';

// const styles = (theme) => ({
//   button: {
//     margin: theme.spacing(1),
//   },
// });

const LoadingButton = (props) => {
  const { classes, loading, done, ...other } = props;

  if (done) {
    return (
      <Button {...other} disabled>
        <Check />
      </Button>
    );
  }
  else if (loading) {
    return (
      <Button {...other}>
        <CircularProgress />
      </Button>
    );
  } else {
    return (
      <Button {...other} />
    );
  }
}

LoadingButton.defaultProps = {
  loading: false,
  done: false,
  };

LoadingButton.propTypes = {
  classes: PropTypes.object.isRequired,
  loading: PropTypes.bool,
  done: PropTypes.bool,
};

export default LoadingButton;