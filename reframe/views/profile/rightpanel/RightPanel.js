import React from 'react';
import * as Autolinker from 'autolinker';
import * as moment from 'moment';
import * as Parser from 'html-react-parser';

import {urls} from '../../../ghuser';
import CreateYourProfile from './CreateYourProfile';
import ProfileBeingCreated from './ProfileBeingCreated';
import Contrib from './contrib/Contrib';
import './RightPanel.css';

const RightPanel = props => {
  // Use these queues to avoid filling up the event loop:
  let functionQueues = [Promise.resolve(), Promise.resolve(), Promise.resolve()];
  const pushToFunctionQueue = (index, func) => {
    functionQueues[index] = functionQueues[index].then(
      () => new Promise(resolve => setTimeout(() => {
        func();
        resolve();
      }, 0))
    );
  };

  const compare = (a, b) => {
    if (a.total_score < b.total_score) {
      return 1;
    }
    if (a.total_score > b.total_score) {
      return -1;
    }
    return 0;
  };

  const repos = [];

  if (props.contribs) {
    const contribs = Object.values(props.contribs.repos);
    contribs.sort(compare);

    const uniqueNames = [];
    for (const contrib of contribs) {
      // We don't want to have two repos with the same name. This happens when a user is
      // contributing to a project and has a fork with the same name:
      if (uniqueNames.indexOf(contrib.name) > -1) {
        continue;
      }
      uniqueNames.push(contrib.name);

      repos.push(
          <Contrib key={contrib.full_name} username={props.username} contrib={contrib}
                   pushToFunctionQueue={pushToFunctionQueue} />
      );
    }
  } else {
    const alertCssClasses = 'alert alert-warning my-3';
    if (props.being_created) {
      repos.push(
        <div key="alert" className={alertCssClasses} role="alert">
          This profile is being created...
        </div>,
        <ProfileBeingCreated key="profilecreation"
                             profilesBeingCreated={props.profilesBeingCreated} />
      );
    } else {
      if (props.deleted_because) {
        repos.push(
          <div key="alert" className={alertCssClasses} role="alert">
            This profile was deleted because {Parser(Autolinker.link(props.deleted_because, {
              className: 'external'
            }))}<br /><br />
            If you want to have it again, no problem, just&nbsp;
            <a href={urls.issues} target="_blank" className="external">create an issue</a> :)
          </div>
        );
      } else {
        repos.push(
          <div key="alert" className={alertCssClasses} role="alert">
            This profile doesn't exist yet.<br /><br />
            And we're quite overloaded at the moment, see&nbsp;
            <a href="https://news.ycombinator.com/item?id=17951481" target="_blank" className="external">
              https://news.ycombinator.com/item?id=17951481
            </a>. If you have clicked on "Get your profile" already, please don't click again, this
            is being created and will take a few hours.<br /><br />
            <a href="https://github.com/AurelienLourot/github-contribs#why-is-it-so-slow"
               target="_blank" className="external">
              Why does it take so long?
            </a>
          </div>
        );
      }
      repos.push(
        <CreateYourProfile key="profilecreation" />
      );
    }
  }

  return (
    <div className="col-9 pl-2 pr-0">
      <div className="user-profile-nav">
        <nav className="UnderlineNav-body">
          <a href="javascript:;" className="UnderlineNav-item selected" aria-selected="true" role="tab">
            Contributions
          </a>
          {/*<a href="javascript:;" className="UnderlineNav-item" aria-selected="false" role="tab">
            Other tab
          </a>*/}
        </nav>
      </div>
      <div className="contribs">
        {repos}
      </div>
      {
        props.contribs &&
        <div className="updated-hint text-gray">
          <small><i>Updated {moment(props.fetchedat).fromNow()}.</i></small>
        </div>
      }
    </div>
  );
};

export default RightPanel;
