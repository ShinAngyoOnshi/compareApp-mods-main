import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Button from 'material-ui/Button';
import { CircularProgress } from 'material-ui/Progress';
import Check from 'material-ui-icons/Check';

const styles = theme => ({
  button: {
    margin: theme.spacing.unit,
  },
});

const LoadingButton = (props) => {
  const { classes, loading, done, ...other } = props;

  if (done) {
    return (
      <Button className={classes.button} {...other} disabled>
        <Check />
      </Button>
    );
  }
  else if (loading) {
    return (
      <Button className={classes.button} {...other}>
        <CircularProgress />
      </Button>
    );
  } else {
    return (
      <Button className={classes.button} {...other} />
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

export default withStyles(styles)(LoadingButton);