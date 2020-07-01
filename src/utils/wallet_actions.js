
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

export async function purchase_offer(wallet, amount, offer_id, quantity, address, mixin) {
    let mixi = mixin >= 0 ? mixin : 6;
    return wallet.createAdvancedTransaction({
        tx_type: '5',
        address: address,
        amount: amount * 10000000000,
        safex_offer_id: offer_id,
        safex_purchase_quantity: quantity,
        mixin: mixi
    }).then((tx) => {
        console.log(`purchase transaction created: ${tx.transactionsIds()}`);
        return tx;
    });
}

export async function create_price_oracle(wallet, title, creator, description, currency, rate, mixin) {
    let mixi = mixin >= 0 ? mixin : 6;
    return wallet.createAdvancedTransaction({
        tx_type: '11',
        address: wallet.address(),
        amount: 0,
        safex_price_peg_title: title,
        safex_price_peg_creator: creator,
        safex_price_peg_description: description,
        safex_price_peg_currency: currency,
        safex_price_peg_rate: rate,
        mixin: mixi
    }).then((tx) => {
        console.log(`price oracle creation transaction created: ${tx.transactionsIds()}`);
        return tx;
    });
}

export async function update_price_oracle(wallet, title, creator, description, currency, rate, mixin) {
    let mixi = mixin >= 0 ? mixin : 6;
    return wallet.createAdvancedTransaction({
        tx_type: '12',
        address: wallet.address(),
        amount: 0,
        safex_price_peg_title: title,
        safex_price_peg_creator: creator,
        safex_price_peg_description: description,
        safex_price_peg_currency: currency,
        safex_price_peg_rate: rate,
        mixin: mixi
    }).then((tx) => {
        console.log(`price oracle update transaction created: ${tx.transactionsIds()}`);
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
