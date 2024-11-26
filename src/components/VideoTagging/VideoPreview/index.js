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
    const [isClicked, setIsClicked] = useState(false);
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm();

    useEffect(() => {
        const getSingleFile = async () => {
            const url = await getFileUrl(videoUrl);
            setUrl(url);
        }

        getSingleFile();
    }, [])

    const handleFieldChange = (e) => {
        const { name, value } = e.target;
        console.log(name, value, 'handleFieldChange');
        setValue(name, value);
    }

    const review = async (data, route) => {
        console.log('route is', route);
        console.log('userId is', userId)

        const { scenarios, deviceHeight, lighting, angle } = data;
        const clothingSelections = Array.from(
            document.querySelectorAll('input[type="checkbox"]:checked')
        ).map((input) => input.value);

        const labels = {
            scenarios,
            deviceHeight,
            lighting,
            angle,
            clothing: clothingSelections,
        };
        //110001
        const path = `videos/${userId}/${route}/labels`;

        try {
            // Send the update request
            await realtimeDb.ref(path).set(labels);
            console.log("Labels updated successfully!");
        } catch (error) {
            console.error("Error updating labels:", error);
        }

    }

    return (<div id="videoPreview">
        <video controls width="500" src={url} />
        <div className="controls">
            {/* <button id="backButton" onClick={() => setIsClicked(value => !value)}>Go back</button> */}
            <form autoComplete="off">
                <select
                    {...register("scenarios", {
                        required: true,
                        message: "Select a relevant scenario"
                    })}

                    onChange={handleFieldChange}
                >
                    {Object.values(Constants['scenarios'])
                        .sort((a, b) => a.localeCompare(b))
                        .map((scenarioItem) => <option key={scenarioItem}>{scenarioItem}</option>)}
                </select>
                <select
                    {...register("deviceHeight", {
                        required: true,
                        message: "Select a height"
                    })}
                    onChange={handleSubmit((data) => review(data, keyIdentifier))}
                >
                    {Object.values(Constants['deviceHeight'])
                        .sort((a, b) => a.localeCompare(b))
                        .map((deviceHeightItem) => <option key={deviceHeightItem}>{deviceHeightItem}</option>)}
                </select>
                <select
                    {...register("lighting", {
                        required: true,
                        message: "Select a type of lighting"
                    })}
                    onChange={handleSubmit((data) => review(data, keyIdentifier))}
                >
                    {Object.values(Constants['lighting'])
                        .sort((a, b) => a.localeCompare(b))
                        .map((lightingItem) => <option key={lightingItem}>{lightingItem}</option>)}
                </select>
                <select
                    {...register("angle", {
                        required: true,
                        message: "Select an approach angle"
                    })}
                    onChange={handleSubmit((data) => review(data, keyIdentifier))}
                >
                    {Object.values(Constants['approachAngle'])
                        .sort((a, b) => a.localeCompare(b))
                        .map((approachAngleItem) => <option key={approachAngleItem}>{approachAngleItem}</option>)}
                </select>

                <fieldset>
                    <legend>Choose all clothing that applies</legend>
                    {Object.values(Constants['clothing'])
                        .sort((a, b) => a.localeCompare(b))
                        .map(clothingItem => <div key={clothingItem}>
                            <input type="checkbox" id={clothingItem} value={clothingItem} onChange={handleSubmit((data) => review(data, keyIdentifier))} />
                            <label htmlFor={clothingItem}>{clothingItem}</label>
                        </div>)}
                </fieldset>
                <fieldset>
                    <legend>Choose all accessories that apply</legend>
                    {Object.values(Constants['accessories'])
                        .sort((a, b) => a.localeCompare(b))
                        .map(accessoryItem => <div key={accessoryItem}>
                            <input type="checkbox" id={accessoryItem} value={accessoryItem} onChange={handleSubmit((data) => review(data, keyIdentifier))} />
                            <label htmlFor={accessoryItem}>{accessoryItem}</label>
                        </div>)}
                </fieldset>
                {/**no button needed */}
            </form>
        </div>
    </div>)
}

export default VideoPreview