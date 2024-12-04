import { useEffect, useState } from 'react';
import { getFileUrl } from '../../../firebase/config';
import { useForm } from "react-hook-form";
import Constants from '../../Constants';
import { realtimeDb } from '../../../firebase/config';
import { useSelector } from 'react-redux';
import './index.css';

const VideoPreview = ({ videoUrl, keyIdentifier }) => {
    const userInfo = useSelector((state) => state.userInfo.value) || {};
    const userId = userInfo['userId'];
    const [url, setUrl] = useState(null);

    const reviewField = async (data, name) => {

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
        const { name, value } = e.target;
        reviewField(value, name);

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
                    <option value="selectInitial">Select a height</option>
                    {Object.values(Constants['deviceHeight'])
                        .sort((a, b) => a.localeCompare(b))
                        .map((deviceHeightItem) => <option key={deviceHeightItem} value={deviceHeightItem}>{deviceHeightItem}</option>)}
                </select>
                {/* <select
                    {...register("deviceHeight", {
                        required: true,
                        message: "Select a height"
                    })}
                    onChange={handleFieldChange}
                >
                    <option value="">Select device height</option>
                    {Object.values(Constants['deviceHeight'])
                        .sort((a, b) => a.localeCompare(b))
                        .map((deviceHeightItem) => <option key={deviceHeightItem}>{deviceHeightItem}</option>)}
                </select>
                <select
                    {...register("lighting", {
                        required: true,
                        message: "Select a type of lighting"
                    })}
                    onChange={handleFieldChange}
                >
                    <option value="">Select lighting</option>
                    {Object.values(Constants['lighting'])
                        .sort((a, b) => a.localeCompare(b))
                        .map((lightingItem) => <option key={lightingItem}>{lightingItem}</option>)}
                </select>
                <select
                    {...register("angle", {
                        required: true,
                        message: "Select an approach angle"
                    })}
                    onChange={handleFieldChange}
                >
                    <option value="">Select angle</option>
                    {Object.values(Constants['approachAngle'])
                        .sort((a, b) => a.localeCompare(b))
                        .map((approachAngleItem) => <option key={approachAngleItem}>{approachAngleItem}</option>)}
                </select>

                <fieldset>
                    <legend>Choose all clothing that applies</legend>
                    {Object.values(Constants['clothing'])
                        .sort((a, b) => a.localeCompare(b))
                        .map(clothingItem => <div key={clothingItem}>
                            <input
                                type="checkbox"
                                id={clothingItem}
                                value={clothingItem}
                                onChange={handleFieldChange}
                                {...register('clothing', {
                                    required: true
                                })} />

                            <label htmlFor={clothingItem}>{clothingItem}</label>
                        </div>)}
                </fieldset>
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