import axios from 'axios';

export async function get_chain_info(obj) {
    return axios({
        method: 'get',
        url: 'http://' + obj.daemon_host + ':' + obj.daemon_port + '/get_info',
        data: obj,
    }).then((resp) => {
        return resp.data;
    });
}