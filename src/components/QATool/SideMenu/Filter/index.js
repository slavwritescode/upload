import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { realtimeDb } from '../../../../firebase/config';
import { useSelector } from 'react-redux';

import './index.css';
import Constants from '../../../Constants';

const Filter = ({ setFilterIsOpen, filter, setFilter, messages, qaToolType }) => {
    const userInfo = useSelector((state) => state.userInfo.value || {});
    const userRole = userInfo['role'];
    const [qaers, setQaers] = useState([]);
    const [stats, setStats] = useState({});

    useEffect(() => {
        realtimeDb.ref('/users').orderByChild('qaer').equalTo(true).on('value', res => {
            let users = res.val() || {};
            let temp = {};
            Object.values(users).map(user => {
                const userId = user['userId'];
                const name = user['name'];
                temp[userId] = name;
            });

            let temp2 = [];
            Object.keys(temp).sort((a, b) => {
                let aName = temp[a];
                let bName = temp[b];
                return aName < bName ? -1 : 1;
            }).map(key => {
                temp2.push({ [key]: temp[key] });
            });

            temp2.push({ 0: '**Unassigned**' });
            temp2.push({ 100: 'All' });

            setQaers(temp2);

            // Updating stats
            let tempStats = {};
            const qaerKeys = temp2.map(qaer => parseInt(Object.keys(qaer)[0]));
            Object.keys(messages).map(messageId => {
                const message = messages[messageId];
                let qaer = message['qaer'] || 0;
                if (!qaerKeys.includes(qaer)) qaer = 0;
                if (!tempStats[qaer]) tempStats[qaer] = {};
                if (!tempStats[100]) tempStats[100] = {};
                const status = message['status'] || 0;
                if (!tempStats[qaer][status]) tempStats[qaer][status] = 0;
                if (!tempStats[100][status]) tempStats[100][status] = 0;
                tempStats[qaer][status]++;
                tempStats[100][status]++;
            });
            setStats(tempStats);
        });

        const handleEsc = (event) => { if (event.keyCode === 27) setFilterIsOpen(""); };
        window.addEventListener('keydown', handleEsc);
        return () => {
            realtimeDb.ref('/users').off();
            window.removeEventListener('keydown', handleEsc);
        };
    }, [JSON.stringify(messages)]);

    return ReactDOM.createPortal((
        <div id="qaToolFilterBackdrop" onClick={(e) => { if (e.target.id == "qaToolFilterBackdrop") setFilterIsOpen("") }}>
            <div id="qaToolFilterMainContainer">
                <div className='filter-item'>
                    <span>Participant ID</span>
                    <input type='number' autoComplete="off" field="participantId" value={filter['participantId'] || ''} onChange={setFilter} placeholder="5 digits long" maxLength="5" />
                </div>

                <div className='filter-item'>
                    <span>{Constants['qaToolTypes'][qaToolType]['name3']} ID</span>
                    <input
                        type='number'
                        autoComplete="off"
                        field="messageId"
                        value={filter['messageId'] || ''}
                        onChange={setFilter}
                        placeholder="6 digits long"
                        maxLength="6"
                        onPaste={(e) => {
                            e.preventDefault();
                            // Keep numbers only
                            const pasted = e.clipboardData.getData('text').replace(/\D/g, '').toString().substring(0, 6);
                            setFilter({ type: "pasteNumber", field: 'messageId', value: pasted });
                        }}
                    />
                </div>

                <div className='filter-item'>
                    <span>QA Date</span>
                    {/* Including a dropdown that shows the last 7 days as options */}
                    <select
                        field="qaDate"
                        //value={filter['qaDate'] || ''}
                        onChange={setFilter}>
                        <option value='All'>All</option>
                        {Array.from({ length: 7 }, (_, i) => {
                            const date = new Date();
                            date.setDate(date.getDate() - i);
                            return <option
                                key={"filter-qaDate-" + i}
                                value={date.toISOString().replaceAll('-', '').substring(0, 8)}
                            >
                                {date.toISOString().substring(0, 10)}
                            </option>
                        })}
                        <option value='N/A'>N/A</option>
                    </select>
                </div>

                <div className='filter-item'>
                    <span>{Constants['qaToolTypes'][qaToolType]['name3']} status</span>
                    {Object.keys(Constants['qaToolTypes'][qaToolType]['statuses']).map((id, i) => {
                        const val = Constants['qaToolTypes'][qaToolType]['statuses'][id];
                        return <div key={"filter-status-" + val + i} className="checkbox-row">
                            <input id={"filter-status-" + val} field="statuses" value={val} type="checkbox" checked={(filter['statuses'] || []).includes(val)} onChange={setFilter} />
                            <label htmlFor={"filter-status-" + val}>{val}</label>
                        </div>
                    })}
                </div>

                {qaToolType === 'attachments' && <div className='filter-item'>
                    <span>Redacted attachment</span>
                    {['Yes', 'No'].map((val, i) => {
                        return <div key={"filter-redacted-" + val + i} className="checkbox-row">
                            <input id={"filter-redacted-" + val} field="redacted" value={val} type="checkbox" checked={(filter['redacted'] || []).includes(val)} onChange={setFilter} />
                            <label htmlFor={"filter-redacted-" + val}>{val}</label>
                        </div>
                    })}
                </div>}

                <div className='filter-item'>
                    <span>Fail reason</span>
                    {[...Object.keys(Constants['qaToolTypes'][qaToolType]['failReasons']).sort((a, b) => {
                        const reasonA = Constants['qaToolTypes'][qaToolType]['failReasons'][a];
                        const reasonB = Constants['qaToolTypes'][qaToolType]['failReasons'][b];
                        if (reasonA === 'Other') return 1;
                        return reasonA.localeCompare(reasonB);
                    }), 'None']
                        .map((id, i) => {
                            const val = Constants['qaToolTypes'][qaToolType]['failReasons'][id] || 'None';
                            return <div key={"filter-fail-reason-" + val + i} className="checkbox-row">
                                <input id={"filter-fail-reason-" + val} field="failReasons" value={val} type="checkbox" checked={(filter['failReasons'] || []).includes(val)} onChange={setFilter} />
                                <label htmlFor={"filter-fail-reason-" + val}>{val}</label>
                            </div>
                        })}
                </div>

                {userRole == 'admin' && <div className='filter-item'>
                    <span>QA-er</span>
                    {qaers.map((qaer, i) => {
                        const val = Object.keys(qaer)[0];
                        const qaerName = Object.values(qaer)[0];
                        return <div key={"filter-qaer-" + val + i} className="checkbox-row">
                            <input id={"filter-qaer-" + val} field="qaer" value={val} type="radio" checked={(filter['qaer'] || '') === val} onChange={setFilter} />
                            <label htmlFor={"filter-qaer-" + val}>{qaerName}</label>
                        </div>
                    })}
                </div>}

                <div className='filter-item'>
                    <span>Max items to show</span>
                    {Constants['qaToolFilterItemsToShow'].map((val, i) => {
                        return <div key={"filter-limiter-" + val + i} className="checkbox-row">
                            <input id={"filter-limiter-" + val} name="filter-limiter" field="limiter" value={val} type="radio" checked={filter['limiter'] == val} onChange={setFilter} />
                            <label htmlFor={"filter-limiter-" + val}>{val}</label>
                        </div>
                    })}
                </div>

                <button field="resetFilter" onClick={setFilter}>Reset filter</button>
            </div>

            {userRole === 'admin' && <div id="qaToolQaersContainer">
                <table>
                    <thead>
                        <tr>
                            <th rowSpan="2">QA-er</th>
                            <th colSpan={Object.keys(Constants['qaToolTypes'][qaToolType]['statuses']).length}>{Constants['qaToolTypes'][qaToolType]['name3']} statuses</th>
                            {/* <th className='strong-left-border' colSpan="2">Minutes spent</th> */}
                        </tr>
                        <tr>
                            {Object.keys(Constants['qaToolTypes'][qaToolType]['statuses']).map((statusId, i) => {
                                let status = Constants['qaToolTypes'][qaToolType]['statuses'][statusId] || statusId;
                                if (status.includes('by client')) status = status.replace('by client', 'BC.');
                                return <th key={"qaer-status-header-" + statusId + i}>{status}</th>
                            })}
                            {/* <th className='strong-left-border'>Accepted</th>
                            <th>Rejected</th> */}
                        </tr>
                    </thead>
                    <tbody>
                        {qaers.map((qaer, i) => {
                            const qaerKey = Object.keys(qaer)[0];
                            const qaerName = Object.values(qaer)[0] == 'All' ? 'Total' : Object.values(qaer)[0];

                            return <tr key={"qaer-" + qaerKey + i + qaerName}>
                                <td>{qaerName}</td>
                                {Object.keys(Constants['qaToolTypes'][qaToolType]['statuses']).map((statusId, i) => {
                                    let output;
                                    try {
                                        output = stats[qaerKey][statusId];
                                    } catch (e) { }
                                    return <td key={"qaer-number-" + qaerKey + statusId + i}>
                                        {output || 0}
                                    </td>
                                })}
                            </tr>
                        })}
                    </tbody>
                </table>
            </div>}
        </div>
    ), document.body);
}

export default Filter;