import React, { useEffect, useReducer, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from "react-router-dom";

import './index.css';
import Constants from '../Constants';
import SideMenu from './SideMenu';
import MessageContainer from './MessageContainer';
import jsonValidation from '../CommonFunctions/jsonValidation';

const filterReducer = (state, event) => {
    if (event.type === 'setFromHash') {
        let newState = JSON.parse(JSON.stringify(state));
        newState[event.field] = event.value;
        return newState;
    } else if (event.type === 'resetFromInput') {
        return event.values;
    } else if (event.type === 'pasteNumber') {
        let newState = JSON.parse(JSON.stringify(state));
        newState[event.field] = parseInt(event.value);
        return newState;
    }

    if (event.target.getAttribute('field') === "resetFilter") {
        let temp = JSON.parse(JSON.stringify(state['defaultValues']));
        temp['defaultValues'] = JSON.parse(JSON.stringify(state['defaultValues']));
        return temp;
    }

    const fieldType = event.target.type;
    const field = event.target.getAttribute('field');

    let newState = JSON.parse(JSON.stringify(state));
    if (fieldType == "select-one") {
        let value = event.target.value;
        if (value == "All") delete newState[field];
        else if (value == "N/A") newState[field] = value;
        else newState[field] = parseInt(value);
    } else if (fieldType == "radio") {
        let value = event.target.getAttribute('value');
        if (!value) delete newState[field];
        else newState[field] = value;
        return newState;
    } else if (fieldType == "checkbox") {
        let checked = event.target.checked;
        let value = event.target.getAttribute('value');
        let currentValues = newState[field] || [];
        if (checked) currentValues.push(value);
        else currentValues = currentValues.filter(v => v != value);
        if (currentValues.length == 0) delete newState[field];
        else newState[field] = currentValues;
        return newState;
    } else if (['text', 'number'].includes(fieldType)) {
        let value = event.target.value;
        let maxLength = event.target.getAttribute('maxLength');
        if (!value) delete newState[field];
        else newState[field] = maxLength ? value.toString().substring(0, parseInt(maxLength)) : value;
        return newState;
    }

    return newState;
}

const QATool = ({ setShowLog }) => {
    const userInfo = useSelector((state) => state.userInfo.value || {});
    const userRole = userInfo['role'];
    const qaer = userInfo['qaer'] && userRole === 'qaer';

    const getDefaultFilterValues = (qaToolType) => {
        //if we are in /emails qaToolType is emails

        const temp = {
            // The following line is a temp solution to adjust the default filter for the QA-ers
            statuses: qaer ? ['New'] : Object.values(Constants['qaToolTypes'][qaToolType]['statuses']).map(k => k || 'New'),
            //statuses: Object.values(Constants['textMessageStatuses']).map(k => k || 'New'),
            failReasons: [...Object.values(Constants['qaToolTypes'][qaToolType]['failReasons']), 'None'],
            qaer: '100',
            limiter: 50,
            currentEntity: Constants['qaToolTypes'][qaToolType],
            redacted: ['Yes', 'No']
        };
        temp['defaultValues'] = JSON.parse(JSON.stringify(temp));
        return temp;
    }

    const params = useParams();
    const [selectedMessage, setSelectedMessage] = useState("");
    const [filterIsOpen, setFilterIsOpen] = useState(false);
    //since now we are fine with using attachments there is no need for the filter which happende below
    const [qaToolType, setQaToolType] = useState((params['qaToolType'] || '').toString().replace('text-messages', 'textMessages'));
    const [filter, setFilter] = useReducer(filterReducer, getDefaultFilterValues(qaToolType || 'emails'));
    const [validate, setValidate] = useState(() => jsonValidation('main'));

    useEffect(() => {
        setQaToolType((params['qaToolType'] || '').toString().replace('text-messages', 'textMessages'));
        setFilter({ type: "resetFromInput", values: getDefaultFilterValues((params['qaToolType'] || '').toString().replace('text-messages', 'textMessages')) });
    }, [params['qaToolType']]);

    useEffect(() => {
        const handleLocationChange = () => {
            const queryString = window.location.search;
            const urlParams = new URLSearchParams(queryString);
            const urlTag = Constants['qaToolTypes'][qaToolType]['urlTag'];
            const messageId = urlParams.get(urlTag);
            setSelectedMessage(messageId || '');

            const participantId = urlParams.get('participant');
            const participantIdRegex = /^\d{5}$/;
            if (participantId && participantIdRegex.test(participantId)) {
                setFilter({ type: "setFromHash", field: "participantId", value: participantId });
                document.getElementById('navbarTitle').innerText = Constants['qaToolTypes'][qaToolType]['navbarName'] + " / PPT: " + participantId;
            }
        };

        window.addEventListener('popstate', handleLocationChange);
        handleLocationChange();

        return () => window.removeEventListener('popstate', handleLocationChange);
    }, [qaToolType]);

    useEffect(() => {
        if (selectedMessage) return;
        const participantIdOfFilter = filter['participantId'] || '';
        const regex = /^\d{5}$/;
        let tempTitle = Constants['qaToolTypes'][qaToolType]['navbarName'];
        if (regex.test(participantIdOfFilter)) tempTitle += " / PPT: " + participantIdOfFilter;
        document.getElementById('navbarTitle').innerText = tempTitle;
    }, [JSON.stringify(filter)]);

    const checkIfDefault = () => {
        let defaultValues = JSON.parse(JSON.stringify(filter['defaultValues']));
        let currentValues = JSON.parse(JSON.stringify(filter));
        delete currentValues['defaultValues'];

        const embeddedIsMatching = (key) => {
            let def = (defaultValues[key] || []).sort((a, b) => a < b ? 1 : -1).join(',');
            let cur = (currentValues[key] || []).sort((a, b) => a < b ? 1 : -1).join(',');
            return def == cur;
        }

        for (let key in defaultValues) {
            if (key === "limiter") continue;
            if (['statuses', 'failReasons'].includes(key)) {
                if (!embeddedIsMatching(key)) return false;
                continue;
            }
            if (defaultValues[key] !== currentValues[key]) return false;
        }

        for (let key in currentValues) {
            if (key === "limiter") continue;
            if (['statuses', 'failReasons'].includes(key)) {
                if (!embeddedIsMatching(key)) return false;
                continue;
            }
            if (defaultValues[key] !== currentValues[key]) return false;
        }

        return true;
    }

    if (qaToolType === null) return null;

    return <div id="qaTool">
        <SideMenu
            selectedMessage={selectedMessage}
            setSelectedMessage={setSelectedMessage}
            filterIsOpen={filterIsOpen}
            setFilterIsOpen={setFilterIsOpen}
            filter={filter}
            setFilter={setFilter}
            defaultFilter={checkIfDefault()}
            qaToolType={qaToolType}
        />

        <MessageContainer
            messageId={selectedMessage}
            setShowLog={setShowLog}
            qaToolType={qaToolType}
            validate={validate}
        />
    </div>
}

export default QATool;