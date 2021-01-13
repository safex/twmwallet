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

export async function daemon_parse_transaction(data, out_put_type) {
    let d_obj = {};
    d_obj.jsonrpc = "2.0";
    d_obj.id = 0;
    d_obj.method = "decode_safex_output";
    let h_obj = {};
    h_obj.output_type = output_type;
    h_obj.data = data;
    d_obj.params = h_obj;
    return axios({
        method: 'post',
        url: 'http://' + obj.daemon_host + ':' + obj.daemon_port + '/json_rpc',
        data: d_obj
    }).then((resp) => {
        return resp.data.result;
    })
}

async function get_transactions(txid) {
    let tx_array = [];
    tx_array.push(txid);
    let t_obj = {};
    t_obj.txs_hashes = tx_array;
    t_obj.decode_as_json = true;
    return axios({
        method: 'post',
        url: 'http://' + obj.daemon_host + ':' + obj.daemon_port +  '/get_transactions',
        data: obj
    }).then((resp) => {
        return resp.data;
    })
}