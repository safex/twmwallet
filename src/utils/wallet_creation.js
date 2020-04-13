const safex = window.require("safex-nodejs-libwallet");

export async function create_wallet(path, password, restore_height, network, daemon) {
    return safex.createWallet({
        path: path,
        password: password,
        network: network,
        restoreHeight: restore_height,
        daemonAddress: daemon,
    }).then((wallet) => {
        console.log(`created the wallet for address ${wallet.address()}`);
        return wallet;
    });
};

export async function open_wallet(path, password, restore_height, network, daemon) {
    return safex.openWallet({
        path: path,
        password: password,
        network: network,
        restoreHeight: restore_height,
        daemonAddress: daemon,
    }).then((wallet) => {
        console.log(`opened the wallet for address ${wallet.address()}`);
        return wallet;
    });
};

export async function recover_from_keys(path, password, restore_height, network, daemon, address, viewkey, spendkey) {
    return safex.createWalletFromKeys({
        path: path,
        password: password,
        network: network,
        daemonAddress: daemon,
        restoreHeight: restore_height,
        addressString: address,
        viewKeyString: viewkey,
        spendKeyString: spendkey
    }).then((wallet) => {
        console.log(`recovered the wallet through keys for address ${wallet.address()}`);
        return wallet;
    })
};

export async function recover_from_seed(path, password, restore_height, network, daemon, menmonic_string) {
    return safex.recoveryWallet({
        path: path,
        password: password,
        network: network,
        daemonAddress: daemon,
        restoreHeight: restore_height,
        mnemonic: menmonic_string
    }).then((wallet) => {
        console.log(`recovered the wallet through seed for address ${wallet.address()}`);
        return wallet;
    })
};

export function normalize_8decimals(balance) {
    return Math.floor(parseFloat(balance) / 100000000) / 100;
}