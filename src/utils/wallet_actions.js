import path from "path";

const safex = window.require("safex-nodejs-libwallet");

export async function start_sync(wallet) {
    return wallet.on('refreshed', () => {
        console.log("refreshing");
    });
}
