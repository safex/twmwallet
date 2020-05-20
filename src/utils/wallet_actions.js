const safex = window.require("safex-nodejs-libwallet");

export async function send_tokens(wallet, address, amount, mixin) {
    let mixi = mixin >= 0 ? mixin : 6;
    console.log(`mixi ${mixi}`);
    return wallet.createTransaction({
        address: address,
        amount: amount * 10000000000,
        tx_type: 1, //token transaction
        mixin: mixi
    }).then((tx) => {
        console.log("token transaction created: " + tx.transactionsIds());
        return tx;
    });
}

export async function send_cash(wallet, address, amount, mixin) {
    let mixi = mixin >= 0 ? mixin : 6;
    return wallet.createTransaction({
        address: address,
        amount: amount * 10000000000,
        mixin: mixi
    }).then((tx) => {
        console.log("cash transaction created: " + tx.transactionsIds());
        return tx;
    });
}


export async function stake_tokens(wallet, amount, mixin) {
    let mixi = mixin >= 0 ? mixin : 6;
    return wallet.createAdvancedTransaction({
        tx_type: '3',
        address: wallet.address(),
        amount: amount * 10000000000,
        mixin: mixi
    }).then((tx) => {
        console.log(`stake tokens transaction created: ${tx.transactionsIds()}`);
        return tx;
    });
}


export async function unstake_tokens(wallet, amount, mixin) {
    let mixi = mixin >= 0 ? mixin : 6;
    return wallet.createAdvancedTransaction({
        tx_type: '4',
        address: wallet.address(),
        amount: amount * 10000000000,
        mixin: mixi
    }).then((tx) => {
        console.log(`stake tokens transaction created: ${tx.transactionsIds()}`);
        return tx;
    });
}

export async function commit_txn(txn) {
    return txn.commit().then((commit) => {
        console.log(`commit ${commit}`);
        console.log(commit);
        return txn;
    });
}
