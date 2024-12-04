import { useEffect, useState } from 'react';
import { getFileUrl } from '../../../firebase/config';
import Constants from '../../Constants';
import { realtimeDb } from '../../../firebase/config';
import { useSelector } from 'react-redux';
import './index.css';

const VideoPreview = ({ videoUrl, keyIdentifier }) => {
    const userInfo = useSelector((state) => state.userInfo.value) || {};
    const userId = userInfo['userId'];
    const [url, setUrl] = useState(null);

    const reviewField = async (data, name) => {
        if (name.contains('initial')) {
            return;
        }
        const path = `videos/${userId}/${keyIdentifier}/labels`;
        try {
            await realtimeDb.ref(path).update({ [name]: data });
            console.log("Labels updated successfully!");
        } catch (error) {
            console.log(error.message);
        }
    }

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

    function handleChange(e) {
        e.preventDefault();
        const { name, value, checked } = e.target;
        if (name === 'clothingBox') {
            console.log('box');

        } else {

            reviewField(value, name);
        }

    }

    return (<div id="videoPreview">
        <video controls width="500" src={url} />
        <div className="controls">
            <form autoComplete="off">
                <select name="scenario" defaultValue="initialScenario" onChange={handleChange}>
                    <option value="selectInitial">Select a scenario</option>
                    {Object.values(Constants['scenarios'])
                        .sort((a, b) => a.localeCompare(b))
                        .map((scenarioItem) => <option key={scenarioItem} value={scenarioItem}>{scenarioItem}</option>)}
                </select>

                <select name="deviceHeight" defaultValue="initialHeight" onChange={handleChange}>
                    <option value="initialHeight">Select a height</option>
                    {Object.values(Constants['deviceHeight'])
                        .sort((a, b) => a.localeCompare(b))
                        .map((deviceHeightItem) => <option key={deviceHeightItem} value={deviceHeightItem}>{deviceHeightItem}</option>)}
                </select>

                <select name="angle" defaultValue="initialAngle" onChange={handleChange}>
                    <option value="initialAngle">Select angle</option>
                    {Object.values(Constants['approachAngle'])
                        .sort((a, b) => a.localeCompare(b))
                        .map((angleItem) => <option key={angleItem} value={angleItem}>{angleItem}</option>)}
                </select>

                <select name="lighting" defaultValue="initialLighting" onChange={handleChange}>
                    <option value="initialLighting">Select lighting</option>
                    {Object.values(Constants['lighting'])
                        .sort((a, b) => a.localeCompare(b))
                        .map((lightingItem) => <option key={lightingItem} value={lightingItem}>{lightingItem}</option>)}
                </select>
                <fieldset>
                    <legend>Choose all clothing that applies</legend>
                    {Object.values(Constants['clothing'])
                        .sort((a, b) => a.localeCompare(b))
                        .map(clothingItem => <label key={clothingItem} htmlFor={clothingItem}>
                            <input
                                type="checkbox"
                                name="clothingBox"
                                id={clothingItem}
                                value={clothingItem}
                                onChange={handleChange}
                            />
                            {clothingItem}
                        </label>)}
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
    </div>)
}

export default VideoPreview