/**
 * View component for /tasks/:taskId
 *
 * Displays a single task from the 'byId' map in the task reducer
 * as defined by the 'selected' property
 */

// import primary libraries
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import Avatar from 'react-avatar';
import moment from 'moment';


// import actions
import * as taskActions from '../taskActions';
import * as noteActions from '../../note/noteActions';
import * as userActions from '../../user/userActions';

// import global components
import Binder from '../../../global/components/Binder.js.jsx';

// import resource components
import TaskLayout from '../components/TaskLayout.js.jsx';
import apiUtils from '../../../global/utils/api';

import NoteForm from '../../note/components/NoteForm.js.jsx';


class SingleTask extends Binder {
  constructor(props) {
    super(props);
    this.state = {
      note : {
        content: '',
      },
      formHelpers: {}
    }
  }

  componentDidMount() {
    const { dispatch, match } = this.props;

    dispatch(taskActions.fetchSingleIfNeeded(match.params.taskId));
    dispatch(noteActions.fetchDefaultNote());
    dispatch(noteActions.fetchListIfNeeded('_task', match.params.taskId));
    dispatch(userActions.fetchListIfNeeded());
  }

  componentDidUpdate(prevProps) {
    const { taskStore, userStore } = this.props;
    const { note } = this.state;

    if (taskStore.selected.id !== prevProps.taskStore.selected.id) {
      this.setState({
        note : {
          ...note,
          _task : taskStore.selected.id,
          _user : userStore.loggedIn.user._id,
        }
      });
    } else if (taskStore.byId !== prevProps.taskStore.byId) {
      this.setState({
        note : {
          ...note,
          _flow : taskStore.byId[taskStore.selected.id]._flow,
          _user : userStore.loggedIn.user._id,
        }
      });
    }

  }

  handleChange = (event) => {
    const { note } = this.state;

    this.setState({
      note : {
        ...note,
        content: event.target.value
      }
    });
  }

  handleAddComment = () => {
    const { dispatch, history, match } = this.props;
    const { note } = this.state;


    if (note.content !== '') {
      dispatch(noteActions.sendCreateNote(this.state.note)).then(response => {

        if(response.success) {
          dispatch(noteActions.addNoteToList(response.id, '_task', match.params.taskId));
          this.setState({
            note : {
              ...note,
              content : ''
            }
          })
        } else {
          alert("ERROR - Check logs");
        }
      });
    }
  }

  toggleCheckboxChange = (event) => {
    const { dispatch, taskStore } = this.props;

    const taskId      = event.target.id;
    const taskStatus  = event.target.value;
    const task        = taskStore.byId[taskId] ? _.cloneDeep(taskStore.byId[taskId]) : {}

    let newTaskStatus;
    if (taskStatus === 'open') {
      newTaskStatus = 'awaiting_approval';
    } else if (taskStatus === 'awaiting_approval' || taskStatus === 'approved') {
      newTaskStatus = 'open';
    }

    const newTask = {
      ...task,
      status : newTaskStatus
    }
    
    dispatch(taskActions.sendUpdateTask(newTask)).then(response => {

      if(response.success) {
        
      } else {
        alert("ERROR - Check logs");
      }
    });
  }

  handleApprove = () => {
    const { dispatch, taskStore, match } = this.props;

    const taskId  = match.params.taskId;
    const task    = taskStore.byId[taskId] ? _.cloneDeep(taskStore.byId[taskId]) : {}

    const newTask = {
      ...task,
      status : 'approved'
    }
    
    dispatch(taskActions.sendUpdateTask(newTask)).then(response => {

      if(response.success) {
        
      } else {
        alert("ERROR - Check logs");
      }
    });
  }

  handleReject = () => {
    const { dispatch, taskStore, match } = this.props;

    const taskId  = match.params.taskId;
    const task    = taskStore.byId[taskId] ? _.cloneDeep(taskStore.byId[taskId]) : {}

    const newTask = {
      ...task,
      status : 'open'
    }
    
    dispatch(taskActions.sendUpdateTask(newTask)).then(response => {

      if(response.success) {
        
      } else {
        alert("ERROR - Check logs");
      }
    });
  }   

  render() {
    const { taskStore, noteStore, userStore, user, match } = this.props;
    const { note } = this.state;

    /**
     * use the selected.getItem() utility to pull the actual task object from the map
     */
    const selectedTask = taskStore.selected.getItem();

    // get the taskList meta info here so we can reference 'isFetching'
    const noteList = noteStore.lists && noteStore.lists._task ? noteStore.lists._task[match.params.taskId] : null;

    /**
     * use the reducer getList utility to convert the all.items array of ids
     * to the actual task objetcs
     */
    const noteListItems = noteStore.util.getList("_task", match.params.taskId);    

    const isEmpty = (
      !selectedTask
      || !selectedTask._id
      || taskStore.selected.didInvalidate
    );

    const isFetching = (
      taskStore.selected.isFetching
    )

    const isNoteListEmpty = (
      !noteListItems
      || !noteList
    );

    const isNoteListFetching = (
      !noteListItems
      || !noteList
      || noteList.isFetching
    )

    return (
      <TaskLayout>
        <button 
          style={{
            color: '#4864E6',
            marginBottom: 10,
            marginTop: 10,
            backgroundColor: 'transparent',
            border: 'none',
            fontWeight: 'bold'
          }}
          onClick={() => this.props.history.goBack()}
        > 
          Go back
        </button>
        { isEmpty ?
          (isFetching ? <h2>Loading...</h2> : <h2>Empty.</h2>)
          :
          <div>
            <Link 
              style={{
                backgroundColor: '#4864E6',
                color: '#EDEFF7',
                padding: 5,
                paddingLeft: 10,
                paddingRight: 10,
                borderRadius: '5px',
                border: '1px solid #4864E6',
                fontWeight: 'bold',
                float: 'right',
              }}
              to={`${this.props.match.url}/update`}
            > 
              Edit 
            </Link>
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
              }}
            >
              <div
                style={{
                  paddingRight: 5
                }}
              >
                <div className="checkbox">
                  <input
                    style={{
                      zoom: '2.9',
                      backgroundColor: '#4864E6'
                    }}
                    disabled={user && user.roles && user.roles.includes('admin')}
                    id={selectedTask._id}
                    name={selectedTask._id}
                    type="checkbox"
                    value={selectedTask.status}
                    checked={selectedTask.status !== 'open' ? true : false} 
                    onChange={this.toggleCheckboxChange}
                  />
                </div>
              </div>
              <div>
                <h3 style={{color: '#54596d', marginTop: 5, fontWeight: 'bold'}}>{selectedTask.name}</h3>
              </div>
            </div>
            <p style={{color: '#54596d'}}><b>{selectedTask.description}</b></p>
            {
              selectedTask.status === 'awaiting_approval' && (user && user.roles && user.roles.includes('admin')) && 
                <div
                  style={{
                    flexDirection: 'row'
                  }}
                >
                  <button 
                    style={{
                      backgroundColor: '#4864E6',
                      color: '#EDEFF7',
                      padding: 5,
                      paddingLeft: 10,
                      paddingRight: 10,
                      borderRadius: '5px',
                      marginBottom: '10px',
                      marginRight: '10px',
                      border: '1px solid #4864E6',
                      fontWeight: 'bold'
                    }}
                    onClick={this.handleApprove}
                  > 
                    Approve
                  </button>
                  <button 
                    style={{
                      backgroundColor: '#EDEFF7',
                      color: '#4864E6',
                      padding: 5,
                      paddingLeft: 10,
                      paddingRight: 10,
                      borderRadius: '5px',
                      marginBottom: '10px',
                      border: '1px solid #4864E6',
                      fontWeight: 'bold'
                    }}
                    onClick={this.handleReject}
                  > 
                    Reject
                  </button>
                </div>
            }
            <hr/>
            <br/>
            { 
              isNoteListEmpty ?
                (isNoteListFetching ? <h2>Loading...</h2> : <h2>Empty.</h2>)
              :
                <div style={{ opacity: isNoteListFetching ? 0.5 : 1 }}>
                  {
                    noteListItems.map((note, i) => {
                      let name = `${user.firstName} ${user.lastName}`;

                      if (note._user !== user._id) {
                        const fetchUser = userStore.util.getList().find(findUser => findUser._id == note._user);
                        name = fetchUser && `${fetchUser.firstName} ${fetchUser.lastName}`;
                      }

                      return (
                        <div 
                          key={note._id + i} 
                          style={{
                            display: 'flex',
                            flexDirection: 'row',
                            marginBottom: '20px'
                          }}
                        >
                          <div>
                            <Avatar 
                              name={name}
                              round
                              color={'#4864E6'}
                              size={40}
                            />
                          </div>
                          <div 
                            style={{
                              justifyContent: 'center',
                              display: 'flex',
                              flexDirection: 'column',
                              padding: '5px 10px 5px 10px',
                            }}
                          >
                            <p 
                              style={{
                                color: '#54596d',
                                fontSize: 18,
                                margin: 0,
                                lineHeight: 1.2,
                              }}
                            ><b>{name}</b></p>
                            <p
                              style={{
                                color: '#54596d',
                                margin: 0,
                                fontSize: 12,
                                lineHeight: 1.2,
                              }}
                            >{moment(note.created).format('MM/D/YYYY @ h:mm A')}</p>
                            <p
                              style={{
                                color: '#54596d',
                                margin: 0,
                                paddingTop: 10,
                              }}
                            >{note.content}</p>
                            
                          </div>
                        </div>
                      )
                    })
                  }
                </div>
            }
            <br/>
            <hr/>
            <br/>
            <textarea 
              style={{
                border: '1px solid #EDEFF7'
              }}
              rows="4" 
              cols="50"
              value={note.content}
              onChange={this.handleChange}
            />
            <br/>
            <button 
              style={{
                backgroundColor: '#EDEFF7',
                color: '#4864E6',
                padding: 5,
                paddingLeft: 10,
                paddingRight: 10,
                borderRadius: '5px',
                marginBottom: '10px',
                border: '1px solid #4864E6',
                fontWeight: 'bold'
              }}
              onClick={this.handleAddComment}
            > 
              Add Comment
            </button>
            <br/>
          </div>
        }
      </TaskLayout>
    )
  }
}

SingleTask.propTypes = {
  dispatch: PropTypes.func.isRequired
}

const mapStoreToProps = (store) => {
  /**
  * NOTE: Yote refer's to the global Redux 'state' as 'store' to keep it mentally
  * differentiated from the React component's internal state
  */
  return {
    taskStore: store.task,
    noteStore: store.note,
    userStore: store.user,
    user: store.user.loggedIn.user,
  }
}

export default withRouter(
  connect(
    mapStoreToProps
  )(SingleTask)
);
