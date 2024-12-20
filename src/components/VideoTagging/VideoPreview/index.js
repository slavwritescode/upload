import { useEffect, useState } from 'react';
import { getFileUrl } from '../../../firebase/config';
import Constants from '../../Constants';
import { realtimeDb } from '../../../firebase/config';
import { useSelector } from 'react-redux';
import './index.css';
import Label from '../Label';

const VideoPreview = ({ videoUrl, videoId }) => {
    const userInfo = useSelector((state) => state.userInfo.value) || {};
    const userId = userInfo['userId'];

    const [url, setUrl] = useState(null);
    const [labels, setLabels] = useState({});

    useEffect(() => {
        const getSingleFile = async () => {
            const url = await getFileUrl(videoUrl);
            setUrl(url);
        }

        getSingleFile();

        return () => {
            setUrl(null);
        }

    }, [videoUrl])

    useEffect(() => {
        const listener = realtimeDb.ref('videos/' + userId + '/' + videoId + '/labels').on('value', (snapshot) => setLabels(snapshot.val() || {}));
        return () => realtimeDb.ref('videos/' + userId + '/' + videoId + '/labels').off('value', listener);
    }, [videoId])

    function handleChange(e) {
        console.log('handle change')
        const { name, value, type } = e.target;
        console.log('current type is', type, name, value);
        if (type === 'select-one') {
            const currentValue = labels[name] === undefined ? null : labels[name];
            const newValue = value === '--select--' ? null : parseInt(value);

            if (currentValue !== newValue) {
                realtimeDb.ref('videos/' + userId + '/' + videoId + '/labels/' + name).set(newValue);
            }
        } else if (type === 'checkbox') {
            let currentValues = labels[name] === undefined ? [] : labels[name];
            const valueToUpdate = parseInt(value);

            if (currentValues.includes(valueToUpdate)) {
                const index = currentValues.indexOf(valueToUpdate);
                currentValues.splice(index, 1);
            } else {
                currentValues.push(valueToUpdate);
            }

            if (currentValues.length === 0) {
                realtimeDb.ref('videos/' + userId + '/' + videoId + '/labels/' + name).remove();
            } else {
                realtimeDb.ref('videos/' + userId + '/' + videoId + '/labels/' + name).set(currentValues);
            }
        } else if (type === 'radio') {
            const currentValue = labels[name] === undefined ? null : labels[name];
            const newValue = parseInt(value);

            if (currentValue !== newValue) {
                realtimeDb.ref('videos/' + userId + '/' + videoId + '/labels/' + name).set(newValue);
            }
        } else if (type === 'button') {
            const currentValue = labels[name] === undefined ? null : labels[name];
            console.log(labels);
            console.log(currentValue);
        }
    }

    return (<div id="videoPreview">
        <video controls width="500" src={url} />
        <div className="controls">
            <form autoComplete="off">
                <select name="scenario" onChange={handleChange} value={labels['scenario'] === undefined ? '--select--' : labels['scenario']}>
                    <option value="--select--">Select a scenario</option>
                    {Object.keys(Constants['scenario'])
                        .sort((a, b) => Constants['scenario'][a].localeCompare(Constants['scenario'][b]))
                        .map((key) => <option key={'scenario-' + key} value={key}>{Constants['scenario'][key]}</option>)}
                </select>

                <select name="deviceHeight" onChange={handleChange} value={labels['deviceHeight'] === undefined ? '--select--' : labels['deviceHeight']}>
                    <option value="--select--">Select a height</option>
                    {Object.keys(Constants['deviceHeight'])
                        .sort((a, b) => Constants['deviceHeight'][a].localeCompare(Constants['deviceHeight'][b]))
                        .map((key) => <option key={'deviceHeight-' + key} value={key}>{Constants['deviceHeight'][key]}</option>)}
                </select>

                <select name="approachAngle" onChange={handleChange} value={labels['approachAngle'] === undefined ? '--select--' : labels['approachAngle']}>
                    <option value="--select--">Select angle</option>
                    {Object.keys(Constants['approachAngle'])
                        .sort((a, b) => Constants['approachAngle'][a].localeCompare(Constants['approachAngle'][b]))
                        .map((key) => <option key={'approachAngle-' + key} value={key}>{Constants['approachAngle'][key]}</option>)}
                </select>


                {/* <select name="lighting" onChange={handleChange} value={labels['lighting'] === undefined ? '--select--' : labels['lighting']}>
                    <option value="--select--">Select lighting</option>
                    {Object.keys(Constants['lighting'])
                        .sort((a, b) => Constants['lighting'][a].localeCompare(Constants['lighting'][b]))
                        .map((key) => <option key={'lighting-' + key} value={key}>{Constants['lighting'][key]}</option>)}
                </select> */}
                <Label
                    multifieldData={Object.keys(Constants["lighting"])}
                    type={"button"}
                    name={"lighting"}
                    onClick={handleChange} />
                <fieldset>
                    <legend>Choose all clothing that applies</legend>
                    {Object.keys(Constants['clothing'])
                        .sort((a, b) => Constants['clothing'][a].localeCompare(Constants['clothing'][b]))
                        .map(key =>
                            <div key={'clothing-' + key}>
                                <input
                                    type="checkbox"
                                    name="clothing"
                                    checked={(labels['clothing'] || []).includes(parseInt(key))}
                                    // checked={labels['clothing'] === parseInt(key)} // in case of radio
                                    value={key}
                                    id={'clothing-' + key}
                                    onChange={handleChange}
                                />
                                <label htmlFor={'clothing-' + key}>{Constants['clothing'][key]}</label>
                            </div>)}
                </fieldset>

                {/*

                <fieldset>
                    <legend>Choose all accessories that apply</legend>
                    {Object.values(Constants['accessories'])
                        .sort((a, b) => a.localeCompare(b))
                        .map(accessoryItem => <div key={accessoryItem}>
                            <input
                                type="checkbox"
                                id={accessoryItem}
                                value={accessoryItem}
                                onChange={handleFieldChange}
                                {...register('accessory', {
                                    required: true
                                })} />
                            <label htmlFor={accessoryItem}>{accessoryItem}</label>
                        </div>)}
                </fieldset> */}

            </form>
        </div>
    </div >)
}

export default VideoPreview