import { auth, realtimeDb } from '../../firebase/config';
import appInfo from '../../../package.json';
import Constants from '../Constants';

export default async (input) => {
    let { participantId, messageId, qaToolType, action, value, userId, appVersion } = input;
    if (!userId) userId = auth.currentUser.uid;
    //if (userId === 1) return;

    const dateBasis = new Date();
    const dateString = ("00" + dateBasis.getUTCFullYear()).slice(-2) +
        ("00" + (dateBasis.getUTCMonth() + 1)).slice(-2) +
        ("00" + dateBasis.getUTCDate()).slice(-2) +
        ("00" + dateBasis.getUTCHours()).slice(-2) +
        ("00" + dateBasis.getUTCMinutes()).slice(-2) +
        ("00" + dateBasis.getUTCSeconds()).slice(-2) +
        dateBasis.getUTCMilliseconds();

    const logId = dateString + makeid(1);
    const path = "/log/" + logId;

    const data = {
        u: userId,
        a: parseInt(action),
        v: value,
    }

    if (appVersion && appVersion !== appInfo.version) data['o'] = true;

    if (qaToolType) {
        const messageLogKey = Constants['qaToolTypes'][qaToolType]['messageLogKey'];
        if (messageId) data[messageLogKey] = parseInt(messageId);
    }

    if (participantId) data['p'] = parseInt(participantId);

    await realtimeDb.ref(path).update(data);
}

function makeid(length) {
    let result = '';
    const characters = 'abcdefghijklmnopqrstuvwxyz';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}
