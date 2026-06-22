import axios from 'axios';

async function run() {
    try {
        console.log('Fetching menus...');
        const res = await axios.post('http://nhansu.bms7.net/api/API_Gateway_Router', {
            List: 'WA_Menu',
            FormName: 'WA_Menu',
            Func: 'View',
            Limit: 1000
        });
        console.log('Result list:', res.data.list || res.data.records || res.data);
    } catch (err) {
        console.error('Error fetching menus:', err.message);
    }
}

run();
