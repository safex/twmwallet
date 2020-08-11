const safex = window.require("safex-nodejs-libwallet");

export async function create_wallet_util(path, password, restore_height, network, daemon, callback) {
    return safex.createWallet({
        path: path,
        password: password,
        network: network,
        restoreHeight: restore_height,
        daemonAddress: daemon,
    }, callback);
};

export async function open_wallet_util(path, password, restore_height, network, daemon, callback) {
    safex.openWallet({
        path: path,
        password: password,
        network: network,
        restoreHeight: restore_height,
        daemonAddress: daemon,
    }, callback);
};

export async function recover_from_keys_util(path, password, restore_height, network, daemon, address, viewkey, spendkey, callback) {
    safex.createWalletFromKeys({
        path: path,
        password: password,
        network: network,
        daemonAddress: daemon,
        restoreHeight: restore_height,
        addressString: address,
        viewKeyString: viewkey,
        spendKeyString: spendkey
    }, callback);
};

export async function recover_from_seed_util(path, password, restore_height, network, daemon, menmonic_string, callback) {
    safex.recoveryWallet({
        path: path,
        password: password,
        network: network,
        daemonAddress: daemon,
        restoreHeight: restore_height,
        mnemonic: menmonic_string
    }, callback);
};

export function normalize_8decimals(balance) {
    return Math.floor(parseFloat(balance) / 100000000) / 100;
}