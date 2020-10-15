/**
 * View component for /flows/:flowId
 *
 * Displays a single flow from the 'byId' map in the flow reducer
 * as defined by the 'selected' property
 */

// import primary libraries
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link, useRouteMatch, withRouter } from 'react-router-dom';

// import actions
import * as flowActions from '../flowActions';
import * as taskActions from '../../task/taskActions';

// import global components
import Binder from '../../../global/components/Binder.js.jsx';

// import resource components
import FlowLayout from '../components/FlowLayout.js.jsx';
import TaskForm from '../../task/components/TaskForm.js.jsx';

class SingleFlow extends Binder {
  constructor(props) {
    super(props);
    this.state = {
      showTaskForm: false 
      , task: _.cloneDeep(this.props.defaultTask.obj)
      // NOTE: We don't want to actually change the store's defaultItem, just use a copy
      , taskFormHelpers: {}
      /**
       * NOTE: formHelpers are useful for things like radio controls and other
       * things that manipulate the form, but don't directly effect the state of
       * the task
       */
    }
  }

  componentDidMount() {
    const { dispatch, match } = this.props;
    dispatch(flowActions.fetchSingleIfNeeded(match.params.flowId));
    dispatch(taskActions.fetchDefaultTask());
    dispatch(taskActions.fetchListIfNeeded('_flow', match.params.flowId));
  }


  componentWillReceiveProps(nextProps) {
    const { dispatch, match } = this.props;
    dispatch(taskActions.fetchListIfNeeded('_flow', match.params.flowId));
    this.setState({
      task: _.cloneDeep(nextProps.defaultTask.obj)
    })
  }

  _handleFormChange = (e) => {
    /**
     * This let's us change arbitrarily nested objects with one pass
     */
    let newState = _.update(this.state, e.target.name, () => {
      return e.target.value;
    });
    this.setState({newState});
  }


  _handleTaskSubmit = (e) => {
    e.preventDefault();
    const { defaultTask, dispatch, match } = this.props;
    let newTask = {...this.state.task}
    newTask._flow = match.params.flowId;
    dispatch(taskActions.sendCreateTask(newTask)).then(response => {
      if(response.success) {
        console.log('response : ', response)
        dispatch(taskActions.addTaskToList(response.id, '_flow', response.item._flow));
        dispatch(taskActions.fetchListIfNeeded('all'));
        this.setState({
          showTaskForm: false
          , task: _.cloneDeep(defaultTask.obj)
        })
      } else {
        alert("ERROR - Check logs");
      }
    });
  }


  toggleCheckboxChange = (event) => {
    const { dispatch, taskStore } = this.props;

    const taskId      = event.target.id;
    const taskStatus  = event.target.value;
    const task        = taskStore.byId[event.target.id] ? _.cloneDeep(taskStore.byId[taskId]) : {}

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

  render() {
    const { showTaskForm, task, formHelpers } = this.state;
    const { 
      defaultTask      
      , flowStore
      , match
      , taskStore,
      user
    } = this.props;

    /**
     * use the selected.getItem() utility to pull the actual flow object from the map
     */
    const selectedFlow = flowStore.selected.getItem();


    // get the taskList meta info here so we can reference 'isFetching'
    const taskList = taskStore.lists && taskStore.lists._flow ? taskStore.lists._flow[match.params.flowId] : null;

    /**
     * use the reducer getList utility to convert the all.items array of ids
     * to the actual task objetcs
     */
    const taskListItems = taskStore.util.getList("_flow", match.params.flowId);
    
    const isFlowEmpty = (
      !selectedFlow
      || !selectedFlow._id
      || flowStore.selected.didInvalidate
    );

    const isFlowFetching = (
      flowStore.selected.isFetching
    )

    const isTaskListEmpty = (
      !taskListItems
      || !taskList
    );

    const isTaskListFetching = (
      !taskListItems
      || !taskList
      || taskList.isFetching
    )


    const isNewTaskEmpty = !task;

    return (
      <FlowLayout>
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
        { isFlowEmpty ?
          (isFlowFetching ? <h2>Loading...</h2> : <h2>Empty.</h2>)
          :
          <div style={{ opacity: isFlowFetching ? 0.5 : 1 }}>
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
            <h3 style={{color: '#54596d', fontWeight: 'bold', marginTop: 10}}>{selectedFlow.name}</h3>
            <p style={{color: '#54596d'}}><b>{selectedFlow.description}</b></p>
            <hr/>
            <br/>
            { isTaskListEmpty ?
              (isTaskListFetching ? <h2>Loading...</h2> : <h2>Empty.</h2>)
                :
              <div style={{ opacity: isTaskListFetching ? 0.5 : 1 }}>
                <div>
                  {
                    taskListItems.filter((task) => task.status !== 'approved').map((task, i) => {
                      return (
                        <div 
                          style={{
                            margin: '0 0 25px 0',
                            display: 'flex',
                            flexDirection: 'row',
                          }}
                          key={task._id + i}
                        >
                          <div
                            style={{
                              paddingRight: 5
                            }}
                          >
                            <div className="checkbox">
                              <input
                                style={{
                                  zoom: '1.3',
                                  backgroundColor: '#4864E6'
                                }}
                                id={task._id}
                                name={task._id}
                                type="checkbox"
                                disabled={user && user.roles && user.roles.includes('admin')}
                                value={task.status}
                                checked={task.status !== 'open' ? true : false} 
                                onChange={this.toggleCheckboxChange}
                              />
                            </div>
                          </div>
                          <div>
                            <p style={{color: '#54596d', fontWeight: 'bold', lineHeight: 1, fontSize: 18}}>{`Name: ${task.name}`}</p>
                            <p style={{color: '#54596d', paddingBottom: 10, fontSize: 14, lineHeight: 1}}>{`Description: ${task.description}`}</p>
                            <Link 
                              style={{
                                backgroundColor: '#EDEFF7',
                                color: '#4864E6',
                                padding: 5,
                                paddingLeft: 10,
                                paddingRight: 10,
                                borderRadius: '5px',
                                border: '1px solid #4864E6',
                                fontWeight: 'bold'
                              }}
                              to={{
                                pathname: "/tasks/"+task._id,
                                state: { fromDashboard: true }
                              }}
                            >
                              Comment
                            </Link>
                          </div>
                        </div>
                      )
                    })
                  }
                </div>
              </div>
            }
            <br/>
            { 
              !isNewTaskEmpty && showTaskForm ?
                <div>
                  <TaskForm
                    task={task}
                    cancelAction={() => this.setState({showTaskForm: false, task: _.cloneDeep(defaultTask.obj)})}
                    formHelpers={formHelpers}
                    formTitle="Create Task"
                    formType="create"
                    handleFormChange={this._handleFormChange}
                    handleFormSubmit={this._handleTaskSubmit}
                  />
                </div>
              : 
                <button 
                  style={{
                    backgroundColor: '#4864E6',
                    color: '#EDEFF7',
                    padding: 10,
                    paddingLeft: 15,
                    paddingRight: 15,
                    borderRadius: '5px',
                    marginBottom: '10px',
                    border: '1px solid #4864E6',
                    fontWeight: 'bold'
                  }} 
                  onClick={() => this.setState({showTaskForm: true})}
                >
                  Add new task
                </button>
            } 
            <hr/>
            <br/>
            <p style={{color: '#54596d', paddingBottom: 10, fontStyle: 'italic'}}>Completed tasks</p>
            {
              !isTaskListEmpty && taskListItems.filter((task) => task.status === 'approved').length === 0 && 
                <p style={{color: '#54596d', lineHeight: 1, padding: 5}}>No Completed Task</p>
            }
            { isTaskListEmpty ?
              (isTaskListFetching ? <h2>Loading...</h2> : <h2>Empty.</h2>)
                :
              <div style={{ opacity: isTaskListFetching ? 0.5 : 1 }}>
                <div>
                  {
                    taskListItems.filter((task) => task.status === 'approved').map((task, i)  => {
                      return (
                        <div 
                          style={{
                            margin: '0 0 25px 0',
                            display: 'flex',
                            flexDirection: 'row',
                          }}
                          key={task._id + i}
                        >
                          <div
                            style={{
                              paddingRight: 5
                            }}
                          >
                            <div className="checkbox">
                              <input
                                style={{
                                  zoom: '1.3',
                                  backgroundColor: '#4864E6'
                                }}
                                id={task._id}
                                name={task._id}
                                type="checkbox"
                                disabled={(user && user.roles && user.roles.includes('admin')) || task.status === 'approved'}
                                value={task.status}
                                checked={task.status !== 'open' ? true : false} 
                                onChange={this.toggleCheckboxChange}
                              />
                            </div>
                          </div>
                          <div>
                            <p style={{color: '#54596d', fontWeight: 'bold', lineHeight: 1, fontSize: 18, textDecoration: 'line-through'}}>{`Name: ${task.name}`}</p>
                          </div>
                        </div>
                      )
                    })
                  }
                </div>
              </div>
            }
          </div>
        }
      </FlowLayout>
    )
  }
}

SingleFlow.propTypes = {
  dispatch: PropTypes.func.isRequired
}

const mapStoreToProps = (store) => {
  /**
  * NOTE: Yote refer's to the global Redux 'state' as 'store' to keep it mentally
  * differentiated from the React component's internal state
  */
  return {
    defaultTask: store.task.defaultItem
    , flowStore: store.flow
    , taskStore: store.task,
    user: store.user.loggedIn.user
  }
}

export default withRouter(
  connect(
    mapStoreToProps
  )(SingleFlow)
);
