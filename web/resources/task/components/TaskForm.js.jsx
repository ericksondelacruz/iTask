/**
 * Reusable stateless form component for Task
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

const  TaskForm = ({
  cancelAction
  , cancelLink
  , formHelpers
  , formTitle
  , formType
  , handleFormChange
  , handleFormSubmit
  , task
}) => {

  // set the button text
  const buttonText = formType === "create" ? "Create Task" : "Update Task";

  // set the form header
  const header = formTitle ? <div style={{color: '#54596d'}} className="formHeader"><h2> {formTitle} </h2><hr/></div> : <div/>;

  return (
    <div className="yt-container">
      <div className="yt-row center-horiz">
        <div className="form-container -slim">
          <form name="taskForm" className="task-form" onSubmit={handleFormSubmit}>
            {header}
            <TextInput
              change={handleFormChange}
              label="Name"
              name="task.name"
              required={true}
              value={task.name}
            />
            <TextAreaInput
              change={handleFormChange}
              label="Description"
              name="task.description"
              required={false}
              value={task.description}
            />
            <div className="input-group">
              <div className="yt-row space-between">
                { !cancelAction ?
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
                  :
                  <button 
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
                    onClick={cancelAction}
                  >
                    Cancel
                  </button>
                }
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
                > {buttonText} </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

TaskForm.propTypes = {
  cancelAction: PropTypes.func
  , cancelLink: PropTypes.string
  , formHelpers: PropTypes.object
  , formTitle: PropTypes.string
  , formType: PropTypes.string.isRequired
  , handleFormChange: PropTypes.func.isRequired
  , handleFormSubmit: PropTypes.func.isRequired
  , task: PropTypes.object.isRequired
}

TaskForm.defaultProps = {
  cancelLink: '/tasks'
  , formHelpers: {}
  , formTitle: ''
}

export default TaskForm;
