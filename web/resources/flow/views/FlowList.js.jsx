/**
 * View component for /flows
 *
 * Generic flow list view. Defaults to 'all' with:
 * this.props.dispatch(flowActions.fetchListIfNeeded());
 *
 * NOTE: See /product/views/ProductList.js.jsx for more examples
 */

// import primary libraries
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';

// import actions
import * as flowActions from '../flowActions';
import * as taskActions from '../../task/taskActions';

// import global components
import Binder from '../../../global/components/Binder.js.jsx';

// import resource components
import FlowLayout from '../components/FlowLayout.js.jsx';
import FlowListItem from '../components/FlowListItem.js.jsx';
import apiUtils from '../../../global/utils/api';

class FlowList extends Binder {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const { dispatch } = this.props;

    // fetch a list of your choice
    dispatch(flowActions.fetchListIfNeeded('all')); // defaults to 'all'
    dispatch(taskActions.fetchListIfNeeded('all'));
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
    const { flowStore, taskStore, user } = this.props;

    /**
     * Retrieve the list information and the list items for the component here.
     *
     * NOTE: if the list is deeply nested and/or filtered, you'll want to handle
     * these steps within the mapStoreToProps method prior to delivering the
     * props to the component.  Othwerwise, the render() action gets convoluted
     * and potentially severely bogged down.
     */

    // get the flowList meta info here so we can reference 'isFetching'
    const flowList = flowStore.lists ? flowStore.lists.all : null;

    /**
     * use the reducer getList utility to convert the all.items array of ids
     * to the actual flow objetcs
     */
    const flowListItems = flowStore.util.getList("all");

    /**
     * NOTE: isEmpty is is usefull when the component references more than one
     * resource list.
     */
    const isEmpty = (
      !flowListItems
      || !flowList
    );

    const isFetching = (
      !flowListItems
      || !flowList
      || flowList.isFetching
    )

    return (
      <FlowLayout>
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
            float: 'right'
          }}
          to={'/flows/new'}
        > 
          New Flow 
        </Link>
        <h1 style={{color: '#54596d'}}> Flow List </h1>
        <hr/>
        { isEmpty ?
          (isFetching ? <h2>Loading...</h2> : <h2>Empty.</h2>)
          :
          <div style={{ opacity: isFetching ? 0.5 : 1 }}>
            <div 
              style={{
                marginTop: 10,
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
              }}
            >
              {
                flowListItems.map((flow, i) => {
                  const tasks = taskStore.util.getList().filter(task => task._flow === flow._id);

                  return (
                    <FlowListItem key={flow._id + i} flow={flow} tasks={tasks} toggleCheckboxChange={this.toggleCheckboxChange} user={user}/>
                  )
                })
              }
            </div>
          </div>
        }
      </FlowLayout>
    )
  }
}

FlowList.propTypes = {
  dispatch: PropTypes.func.isRequired
}

const mapStoreToProps = (store) => {
  /**
  * NOTE: Yote refer's to the global Redux 'state' as 'store' to keep it mentally
  * differentiated from the React component's internal state
  */
  return {
    flowStore: store.flow,
    taskStore: store.task,
    user: store.user.loggedIn.user
  }
}

export default withRouter(
  connect(
    mapStoreToProps
  )(FlowList)
);
