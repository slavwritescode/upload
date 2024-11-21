import { realtimeDb } from '../../firebase/config';
import appInfo from '../../../package.json';
import Swal from 'sweetalert2';

export default async () => {
    let databaseVersion = await realtimeDb.ref('/settings/appVersion').once('value');
    databaseVersion = databaseVersion.val();
    if (appInfo.version !== databaseVersion) {
        Swal.fire({
            icon: 'error',
            title: 'App version mismatch',
            text: 'Please refresh the page to update the app version',
        });
        return false;
    }
    return true;
}
