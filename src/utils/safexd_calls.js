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
    let d_obj = {};
    d_obj.interval = obj.interval;
    return axios({
        method: 'get',
        url: 'http://' + obj.daemon_host + ':' + obj.daemon_port + '/get_staked_tokens',
        data: d_obj,
        headers: {
            'Content-Type': 'application/json'
        }
    }).then((resp) => {
        return resp.data;
    });
}

export async function get_interest_map(obj) {
    let d_obj = {};
    d_obj.begin_interval = obj.begin_interval;
    d_obj.end_interval = obj.end_interval;
    return axios({
        method: 'post',
        url: 'http://' + obj.daemon_host + ':' + obj.daemon_port + '/get_interest_map',
        data: d_obj,
        headers: {
            'Content-Type': 'application/json'
        }
    }).then((resp) => {
        return resp.data;
    });
}