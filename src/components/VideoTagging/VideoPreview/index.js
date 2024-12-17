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
    const [checkedClothingItems, setCheckedClothingItems] = useState({});
    const [items, setItems] = useState({});

    const reviewField = async (dataOfAllInputs, name) => {

        let obj = Constants[name];
        console.log(obj, 'object of all values and indexes')
        let values = Object.values(obj);
        //get just the values
        //console.log('currently values is', values);//in the case of the checkboxes this is an object with props
        //console.log(data, 'is data')
        //in case of an object it might be a good idea to have another value and save that
        console.log(dataOfAllInputs, 'this is the data we will be working with')
        let neededIndex = values.indexOf(dataOfAllInputs);
        // let objIndexes = values.map(individialValue=> )
        const path = `videos/${userId}/${keyIdentifier}/labels`;
        try {
            await realtimeDb.ref(path).update({ [name]: neededIndex });
            // await realtimeDb.ref(path).update({ [name]: data });

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

        // const { name, value, type, checked } = e.target;

        // if (true) {

        //     // console.log(value, 'this is the value');
        //     // setItems((prevState) => ({
        //     //     ...prevState,
        //     //     [value]: checked
        //     // }));

        //     // setCheckedClothingItems((prevState) => ({
        //     //     ...prevState,
        //     //     [value]: checked
        //     // }));
        //     console.log(value, 'is the value');
        //     setItems((prevState) => ({
        //         ...prevState,
        //         [name]: [checked ? checked : value]
        //     }));
        //     //since it is async we are not getting the correct values here. Something needs to be moved.

        //     //reviewField(checkedClothingItems, name);
        // } else {

        //     //reviewField(value, name);
        // }
        // console.log('data before function', items)
        // reviewField(items, name);
        // console.log(items);
        const { id, type, checked } = e.target;

        if (type === 'checkbox') {
            setItems(prevState => ({
                ...prevState,
                [id]: checked
            }));
        }

    }

    return (<div id="videoPreview">
        <video controls width="500" src={url} />
        <div className="controls">
            <form autoComplete="off">
                <select name="scenario" defaultValue="initialScenario" onChange={handleChange}>
                    <option value="selectInitial">Select a scenario</option>
                    {Object.values(Constants['scenario'])
                        .sort((a, b) => a.localeCompare(b))
                        .map((scenarioItem) => <option key={scenarioItem} value={scenarioItem}>{scenarioItem}</option>)}
                </select>

                <select name="deviceHeight" defaultValue="initialHeight" onChange={handleChange}>
                    <option value="initialHeight">Select a height</option>
                    {Object.values(Constants['deviceHeight'])
                        .sort((a, b) => a.localeCompare(b))
                        .map((deviceHeightItem) => <option key={deviceHeightItem} value={deviceHeightItem}>{deviceHeightItem}</option>)}
                </select>

                <select name="approachAngle" defaultValue="initialAngle" onChange={handleChange}>
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
                        .map(clothingItem =>
                            <div key={clothingItem}>
                                <input
                                    type="checkbox"
                                    name="clothing"
                                    checked={items[clothingItem] || false}
                                    id={clothingItem}
                                    onChange={handleChange}
                                />
                                <label key={clothingItem} htmlFor={clothingItem}>{clothingItem}</label>

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