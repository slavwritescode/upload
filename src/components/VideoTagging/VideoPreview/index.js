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
    console.log(videoUrl, keyIdentifier, 'inside preview');
    const {
        register,
        watch,
        setValue,
        formState: { errors },
    } = useForm();
    const selectedClothing = watch('clothing', []);
    const selectedAccessory = watch('accessory', []);

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

        const updateChecboxes = async () => {
            const path = `videos/${userId}/${keyIdentifier}/labels`;
            try {
                await realtimeDb.ref(path).update({
                    clothing: selectedClothing,
                    accessories: selectedAccessory
                });
                console.log("Labels updated successfully!");
            } catch (error) {
                console.log(error.message);
            }
        }

        if (selectedClothing.length > 0 || selectedAccessory.length > 0) {
            updateChecboxes();
        }
    }, [selectedClothing, selectedAccessory]);

    const handleFieldChange = (e) => {
        console.log('run...')
        const { name, value } = e.target;
        console.log(name, value, 'handleFieldChange');
        setValue(name, value);
        review(value, name);
    }

    const review = async (data, name) => {

        const path = `videos/${userId}/${keyIdentifier}/labels`;
        try {
            await realtimeDb.ref(path).update({ [name]: data });
            console.log("Labels updated successfully!");
        } catch (error) {
            console.log(error.message);
        }
    }

    return (<div id="videoPreview">
        <video controls width="500" src={url} />
        <p>{videoUrl}</p>
        <p>{keyIdentifier}</p>
        <div className="controls">
            {/* <button id="backButton" onClick={() => setIsClicked(value => !value)}>Go back</button> */}
            <form autoComplete="off">
                <select
                    {...register("scenario", {
                        required: true,
                        message: "Select a relevant scenario"
                    })}

                    onChange={handleFieldChange}
                >
                    <option value="">Select scenario</option>
                    {Object.values(Constants['scenarios'])
                        .sort((a, b) => a.localeCompare(b))
                        .map((scenarioItem) => <option key={scenarioItem}>{scenarioItem}</option>)}
                </select>
                <select
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
                </fieldset>

            </form>
        </div>
    </div>)
}

export default VideoPreview