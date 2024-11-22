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
        formState: { errors },
    } = useForm();

    useEffect(() => {
        const getSingleFile = async () => {
            const url = await getFileUrl(videoUrl);
            setUrl(url);
        }

        getSingleFile();
    }, [])

    const review = async (data, route) => {

        const { scenarios, deviceHeight, lighting, angle } = data;
        // const clothingSelections = Array.from(
        //     document.querySelectorAll('input[type="checkbox"]:checked')
        // ).map((input) => input.value);

        // const labels = {
        //     scenarios,
        //     deviceHeight,
        //     lighting,
        //     angle,
        //     clothing: clothingSelections,
        // };

        // const objectKey = route;
        // const path = `videos/${userId}/${objectKey}/labels`;

        // try {
        //     // Send the update request
        //     await realtimeDb.ref(path).set(labels);
        //     console.log("Labels updated successfully!");
        // } catch (error) {
        //     console.error("Error updating labels:", error);
        // }

    }

    return (<div id="videoPreview">
        {isClicked ? <>

            <video controls width="500" src={url} />
            <div className="controls">
                <button id="backButton" onClick={() => setIsClicked(value => !value)}>Go back</button>
                <form onSubmit={handleSubmit((data) => review(data, keyIdentifier))} autoComplete="off">
                    <select
                        {...register("scenarios", {
                            required: true,
                            message: "Select a relevant scenario"
                        })}
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
                                <input type="checkbox" id={clothingItem} value={clothingItem} />
                                <label htmlFor={clothingItem}>{clothingItem}</label>
                            </div>)}
                    </fieldset>
                    <fieldset>
                        <legend>Choose all accessories that apply</legend>
                        {Object.values(Constants['accessories'])
                            .sort((a, b) => a.localeCompare(b))
                            .map(accessoryItem => <div key={accessoryItem}>
                                <input type="checkbox" id={accessoryItem} value={accessoryItem} />
                                <label htmlFor={accessoryItem}>{accessoryItem}</label>
                            </div>)}
                    </fieldset>
                    <button type="submit" id="reviewButton">Confirm selections</button>
                </form>
            </div>
        </> : <button id="reviewButton" onClick={() => setIsClicked(value => !value)}>Review this video item</button>}
    </div>)
}

export default VideoPreview