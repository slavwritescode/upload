import React, { useEffect, useState } from 'react';
import { realtimeDb } from '../../../firebase/config';
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import { auth } from '../../../firebase/config';

import './index.css';
import Constants from '../../Constants';
import Filter from './Filter';
import LogEvent from '../../CommonFunctions/LogEvent';
import CheckAppVersion from '../../CommonFunctions/CheckAppVersion';

const SideMenu = ({ selectedMessage, setSelectedMessage, filterIsOpen, setFilterIsOpen, filter, setFilter, defaultFilter, qaToolType }) => {

    const userInfo = useSelector((state) => state.userInfo.value || {});
    const userRole = userInfo['role'];
    const userId = userInfo['userId'];
    const [messages, setMessages] = useState({});
    const [unAssignedMessages, setUnAssignedMessages] = useState({});
    const [disabledAssignMore, setDisabledAssignMore] = useState(false);
    const [participantIdToAssign, setParticipantIdToAssign] = useState(null);

    useEffect(() => {
        const path = Constants['qaToolTypes'][qaToolType]['root'];
        let query = realtimeDb.ref(path);
        if (userRole === 'qaer') query = query.orderByChild('qaer').equalTo(userId);
        query.on('value', res => setMessages(res.val() || {}));

        if (userInfo['qaer']) {
            realtimeDb.ref(path).orderByChild('qaer').equalTo(0).limitToFirst(2000).on('value', res => setUnAssignedMessages(res.val() || {}));
        }

        return () => realtimeDb.ref(path).off();
    }, [JSON.stringify(userInfo), qaToolType]);

    const updateValue = (path, newValue) => {
        if (Object.keys(newValue).length == 1 && (Object.values(newValue)[0] == "" || Object.values(newValue)[0] == false)) {
            realtimeDb.ref(path + "/" + Object.keys(newValue)[0]).remove();
        } else {
            realtimeDb.ref(path).update(newValue);
        }
    }

    const assignOneMore = async () => {
        const appIsUpToDate = await CheckAppVersion();
        if (!appIsUpToDate) return;

        const unQaedItems = Object.values(messages).filter(message => (message['status'] || 0) === 0 && message['qaer'] === userId);
        if (unQaedItems.length > 30) {
            Swal.fire({
                title: 'You have to QA the assigned messages first...',
                icon: 'info',
            });
            return;
        }

        let assigned = false;
        const root = Constants['qaToolTypes'][qaToolType]['root'];
        const action = Constants['qaToolTypes'][qaToolType]['qaerAssignedAction'];

        const assign = (participantId, messageId) => {
            updateValue(root + '/' + messageId, { 'qaer': userId });
            LogEvent({ participantId, messageId, qaToolType, action, value: userId, userId: userId, appVersion: userInfo['appVersion'] });

            assigned = true;
            const urlTag = Constants['qaToolTypes'][qaToolType]['urlTag'];
            window.history.pushState({}, null, pagePrefix + '/qa-tool/' + qaToolType + '?' + urlTag + '=' + messageId);
            setSelectedMessage(messageId);
            setParticipantIdToAssign(participantId);
        }

        if (Object.keys(unAssignedMessages).length > 0) {
            setDisabledAssignMore(true);

            Object.keys(unAssignedMessages).forEach(messageId => {
                if (assigned) return;
                const message = unAssignedMessages[messageId];
                const participantId = message['participantId'];
                if (participantIdToAssign && participantIdToAssign !== participantId) return;
                const status = message['status'] || 0;
                if (status === 0) assign(participantId, messageId);
            })

            if (!assigned) {
                Object.keys(unAssignedMessages).forEach(messageId => {
                    if (assigned) return;
                    const message = unAssignedMessages[messageId];
                    const participantId = message['participantId'];
                    const status = message['status'] || 0;
                    if (status === 0) assign(participantId, messageId);
                })
            }
        }

        if (assigned) {
            await new Promise(resolve => setTimeout(resolve, 500));
            setDisabledAssignMore(false);
        } else {
            Swal.fire({
                title: 'No more messages to assign',
                icon: 'info'
            });
        }
    }

    const switchToNext = () => {
        const limiter = filter['limiter'] || 100;
        const nextMessageId = !selectedMessage ? Object.keys(messages)[0] : ((Object.keys(messages).indexOf(selectedMessage) === Object.keys(messages).length - 1 || Object.keys(messages).indexOf(selectedMessage) == limiter - 1) ? Object.keys(messages)[0] : Object.keys(messages)[Object.keys(messages).indexOf(selectedMessage) + 1]);
        if (nextMessageId) {
            const urlTag = Constants['qaToolTypes'][qaToolType]['urlTag'];
            window.history.pushState({}, null, pagePrefix + '/qa-tool/' + qaToolType + '?' + urlTag + '=' + nextMessageId);
            setSelectedMessage(nextMessageId);
        }
    }

    const switchToPrevious = () => {
        const previousMessageId = !selectedMessage ? Object.keys(messages)[0] : ((Object.keys(messages).indexOf(selectedMessage) === 0) ? Object.keys(messages)[Object.keys(messages).length - 1] : Object.keys(messages)[Object.keys(messages).indexOf(selectedMessage) - 1]);
        if (previousMessageId) {
            const urlTag = Constants['qaToolTypes'][qaToolType]['urlTag'];
            window.history.pushState({}, null, pagePrefix + '/qa-tool/' + qaToolType + '?' + urlTag + '=' + previousMessageId);
            setSelectedMessage(previousMessageId);
        }
    }

    const devMode = (!process.env.NODE_ENV || process.env.NODE_ENV === 'development');
    const pagePrefix = devMode ? window.location.origin : 'https://aspen-a18cc.web.app';

    let counter = 0;
    return <div id="sideMenu" onKeyDown={(e) => {
        if (auth.currentUser.email != 'zoltan.bathori@telusinternational.com') return;
        if (e.key.toString().toLowerCase() === 'arrowleft') switchToPrevious();
        if (e.key.toString().toLowerCase() === 'arrowright') switchToNext();
    }}>

        <button id="filterButton" onClick={() => setFilterIsOpen(!filterIsOpen)}><span className={'fas fa-filter' + (defaultFilter ? '' : ' filter-is-used')} />Filter</button>

        {userInfo['qaer'] && <button id="oneMoreButton" disabled={disabledAssignMore} onClick={() => assignOneMore()}>+1</button>}

        <div id="menu">
            {Object.keys(messages).map((messageId, index) => {
                if (counter === parseInt((filter['limiter'] || 100))) return null;

                if (filter['messageId'] && !messageId.includes(filter['messageId'] || '')) return null;

                const message = messages[messageId];
                const participantId = message['participantId'];
                if (filter['participantId'] && !participantId.toString().includes(filter['participantId'] || '')) return null;

                const failReasons = message['failReasons'] || [];
                if (!filter['failReasons']) return null;
                if (!filter['failReasons'].includes('None') && failReasons.length === 0) return null;

                let failReasonOk = failReasons.length === 0;
                failReasons.map(failReasonId => {
                    const failReason = Constants['qaToolTypes'][qaToolType]['failReasons'][failReasonId] || 'None';
                    if ((filter['failReasons'] || []).includes(failReason)) failReasonOk = true;
                });
                if (!failReasonOk) return null;

                const status = Constants['qaToolTypes'][qaToolType]['statuses'][message['status']] || 'New';
                if (!(filter['statuses'] || []).includes(status)) return null;

                if (qaToolType === 'attachments') {
                    const redacted = message['redacted'] ? 'Yes' : 'No';
                    if (!filter['redacted'].includes(redacted)) return null;
                }

                const qaer = message['qaer'] || 0;
                if (filter['qaer'] && filter['qaer'] !== '100' && filter['qaer'] !== qaer.toString()) return null;

                if (filter['qaDate'] !== 'All' && filter['qaDate']) {
                    const qaDate = message['qaDate'] ? '20' + message['qaDate'] : 'N/A';
                    if (qaDate != filter['qaDate']) return null;
                }

                let className;
                switch (status) {
                    case 'New':
                        className = 'fa-star'
                        break;
                    case 'Accepted':
                        className = 'fa-check-circle';
                        break;
                    case 'Rejected':
                        className = 'fa-square';
                        break;
                    case 'Backup':
                        className = 'fa-save';
                        break;
                    case 'Delivered':
                        className = 'fa-arrow-alt-circle-right';
                        break;
                    case 'Accepted by client':
                        className = 'fa-arrow-alt-circle-right';
                        break;
                    case 'Rejected by client':
                        className = 'fa-arrow-alt-circle-right';
                        break;
                    default:
                        className = '';
                }

                className += ' ' + status.toLowerCase().replaceAll(' ', '-') + '-status-marker';
                counter++;
                return <button
                    key={"message-selector-" + messageId + index}
                    className={messageId === selectedMessage ? "selected-message" : ""}
                    onClick={async () => {
                        const appIsUpToDate = await CheckAppVersion();
                        if (!appIsUpToDate) return;

                        const urlTag = Constants['qaToolTypes'][qaToolType]['urlTag'];
                        window.history.pushState({}, null, pagePrefix + '/qa-tool/' + qaToolType + '?' + urlTag + '=' + messageId);
                        setSelectedMessage(messageId);
                    }}
                >
                    {messageId} <span className={"fas " + className} />
                </button>
            })}
        </div>

        {filterIsOpen && <Filter
            setFilterIsOpen={setFilterIsOpen}
            filter={filter}
            setFilter={setFilter}
            messages={messages}
            qaToolType={qaToolType}
        />}
    </div>
}

export default SideMenu;