// import form components
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

// import actions
import * as userActions from '../userActions';

// import global components
import Base from "../../../global/components/BaseComponent.js.jsx";

// import form components
import { TextInput } from '../../../global/components/forms';

class ResetPassword extends Base {
  constructor(props) {
    super(props);
    this.state = {
      password: ""
    };
    this._bind(
      '_handleFormChange'
      , '_handleFormSubmit'
    );
  }

  componentDidMount() {
    this.props.dispatch(userActions.sendCheckResetHex(this.props.params.hex));
  }

  _handleFormChange(e) {
    var nextState = this.state;
    nextState[e.target.name] = e.target.value;
    this.setState(nextState);
  }

  _handleFormSubmit(e) {
    e.preventDefault();
    this.props.dispatch(userActions.sendResetPassword(this.props.params.hex, this.state.password));
  }

  render() {
    return  (
      <div>
        <div className="yt-container">
          <h1> Reset Password </h1>
          <div className="yt-row center-horiz">
            <div className="form-container">
              { this.props.user.isFetching ?
                <h3>Loading...</h3>
                :
                <div>
                  { this.props.user.resetTokenValid ?
                    <form name="userForm" className="card user-form" onSubmit={this._handleFormSubmit}>
                      <TextInput
                        name="password"
                        label="New Password"
                        value={this.state.password}
                        change={this._handleFormChange}
                        placeholder="New Password"
                        required={true}
                      />
                      <div className="input-group">
                        <div className="yt-row space-between">
                          <button className="yt-btn " type="submit" > Send Password Reset </button>
                        </div>
                        <br/>
                        <div className="yt-row space-between u-pullRight">
                          <Link to={"/user/login"} className="yt-btn fowler x-small"> Back To Login </Link>
                        </div>
                      </div>
                    </form>
                    :
                    <div>
                      <h2>The password reset token is invalid or has expired. Please visit the forgot password page to request a new token.</h2>
                      <Link to={"/user/forgotpassword"} className="yt-btn fowler small"> Forgot Password </Link>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    )
  }
}

ResetPassword.propTypes = {
  dispatch: PropTypes.func.isRequired
}

const mapStoreToProps = (store) => {
  return { user: store.user.loggedIn.user }
}

export default connect(
  mapStoreToProps
)(ResetPassword);
