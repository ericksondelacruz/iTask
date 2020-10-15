// import primary libraries
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const FlowListItem = ({
  flow,
  tasks,
  toggleCheckboxChange,
  user
}) => {
  return (
    <div
     style={{
       display: 'flex',
       flexDirection: 'column',
       marginBottom: 30,
       border: '1px solid lightgray',
       width: '30%',
     }}
    >
      <Link 
        style={{
          padding: 5,
          paddingLeft: 10,
          paddingRight: 10,
          color: '#54596d'
        }} 
        to={`/flows/${flow._id}`}
      > 
        {flow.name}
      </Link>
      <hr/>
        {
          tasks.length === 0 ?
            <p style={{color: '#54596d', lineHeight: 1, padding: 5}}>No Task Available</p>
          :
            tasks.map((task, index) => {
              return (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    padding: 5
                  }}
                  key={index}
                >
                  <div className="checkbox">
                    <input
                      style={{
                        zoom: '1.3',
                        backgroundColor: '#4864E6',
                        marginRight: 5
                      }}
                      disabled={(user && user.roles && user.roles.includes('admin')) || task.status === 'approved'}
                      id={task._id}
                      name={task._id}
                      type="checkbox"
                      value={task.status}
                      checked={task.status !== 'open' ? true : false} 
                      onChange={toggleCheckboxChange.bind(this)}
                    />
                  </div>
                  <p style={{color: '#54596d', lineHeight: 1, textDecoration: task.status === 'approved' && 'line-through'}}>{task.name}</p>
                </div>
              )
            })
        }
    </div>
  )
}

FlowListItem.propTypes = {
  flow: PropTypes.object.isRequired
}

export default FlowListItem;
