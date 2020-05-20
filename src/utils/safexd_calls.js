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

export async function get_staked_tokens(obj) {
    return axios({
        method: 'get',
        url: 'http://' + obj.daemon_host + ':' + obj.daemon_port + '/get_staked_tokens',
        data: obj,
    }).then((resp) => {
        return resp.data;
    });
}

export async function get_interest_map(obj) {
    return axios({
        method: 'get',
        url: 'http://' + obj.daemon_host + ':' + obj.daemon_port + '/get_interest_map',
        data: obj,
    }).then((resp) => {
        return resp.data;
    });
}