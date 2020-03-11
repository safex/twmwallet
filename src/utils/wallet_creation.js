import path from "path";

const safex = window.require("safex-nodejs-libwallet");

export async function create_wallet(path, password, network, daemon) {
    return safex.createWallet({
        'path': path,
        'password': password,
        'network': network,
        'daemonAddress': daemon,
    }).then((wallet) => {
        console.log(`created the wallet for address ${wallet.address()}`);
        return wallet;
    });
}