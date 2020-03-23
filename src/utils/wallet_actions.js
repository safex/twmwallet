import path from "path";

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

export async function commit_txn(txn) {
    return txn.commit().then((commit) => {
        console.log(`commit ${commit}`);
        console.log(commit);
        return txn;
    });
}

export async function send_cash(wallet, address, amount, mixin) {
    let mixi = mixin >= 0 ? mixin : 6;
    return wallet.createTransaction({
        address: address,
        amount: amount * 10000000000,
        mixin: mixi
    }).then((tx) => {
        console.log("token transaction created: " + tx.transactionsIds());

        tx.commit().then(() => {
            console.log("transaction commited successfully");
            return tx;
        })
    });
}