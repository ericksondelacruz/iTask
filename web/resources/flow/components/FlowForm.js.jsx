/**
 * Reusable stateless form component for Flow
 */

// import primary libraries
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

// import form components
import { 
  TextAreaInput 
  , TextInput 
} from '../../../global/components/forms';

const  FlowForm = ({
  cancelLink
  , formHelpers
  , formTitle
  , formType
  , handleFormChange
  , handleFormSubmit
  , flow
}) => {

  // set the button text
  const buttonText = formType === "create" ? "Create Flow" : "Update Flow";

  // set the form header
  const header = formTitle ? <div style={{color: '#54596d'}} className="formHeader"><h2> {formTitle} </h2><hr/></div> : <div/>;

  return (
    <div className="yt-container">
      <div className="yt-row center-horiz">
        <div className="form-container -slim">
          <form name="flowForm" className="flow-form" onSubmit={handleFormSubmit}>
            {header}
            <TextInput
              change={handleFormChange}
              label="Name"
              name="flow.name"
              placeholder="Name (required)"
              required={true}
              value={flow.name}
            />
             <TextAreaInput
              change={handleFormChange}
              label="Description"
              name="flow.description"
              required={false}
              value={flow.description}
              rows="3"
            />
            <div className="input-group">
              <div className="yt-row space-between">
                <Link
                   style={{
                    backgroundColor: '#EDEFF7',
                    color: '#4864E6',
                    padding: 5,
                    paddingLeft: 10,
                    paddingRight: 10,
                    borderRadius: '5px',
                    marginBottom: '10px',
                    border: '1px solid #EDEFF7',
                    fontWeight: 'bold'
                  }}  
                  to={cancelLink}
                >
                  Cancel
                </Link>
                <button
                  style={{
                    backgroundColor: '#4864E6',
                    color: '#EDEFF7',
                    padding: 5,
                    paddingLeft: 10,
                    paddingRight: 10,
                    borderRadius: '5px',
                    marginBottom: '10px',
                    border: '1px solid #4864E6',
                    fontWeight: 'bold'
                  }} 
                  type="submit" 
                > 
                  {buttonText} 
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

FlowForm.propTypes = {
  cancelLink: PropTypes.string.isRequired
  , formHelpers: PropTypes.object
  , formTitle: PropTypes.string
  , formType: PropTypes.string.isRequired
  , handleFormChange: PropTypes.func.isRequired
  , handleFormSubmit: PropTypes.func.isRequired
  , flow: PropTypes.object.isRequired
}

FlowForm.defaultProps = {
  formHelpers: {}
  , formTitle: ''
}

export default FlowForm;
