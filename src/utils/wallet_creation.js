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

export async function open_wallet(path, password, network, daemon) {
    return safex.openWallet({
        'path': path,
        'password': password,
        'network': network,
        'daemonAddress': daemon,
    }).then((wallet) => {
        console.log(`opened the wallet for address ${wallet.address()}`);
        return wallet;
    });
}
export async function recover_from_keys(path, password, network, daemon, address, viewkey, spendkey) {
    return safex.createWalletFromKeys({
        path: path,
        password: password,
        network: network,
        daemonAddress: daemon,
        restoreHeight: 0,
        addressString: address,
        viewKeyString: viewkey,
        spendKeyString: spendkey
    }).then((wallet) => {
        console.log(`recovered the wallet for address ${wallet.address()}`);
        return wallet;
    })
}