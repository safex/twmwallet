export interface BuyerPurchaseObj {
    /** Example: "http://stageapi.theworldmarketplace.com:17700" */
    api_url: string;
    /** Example: 139384 */
    bc_height: number;
    /** Example: "8b620e67edbc330b0d272032da837fdd4a10d14771bbf816b98f57577c920dc1" */
    offer_id: string;
    /** Example: 42 */
    price: number;
    /** Example: "1" */
    quantity: string;
    /** Example: "Katana & Holder" */
    title: string;
}

export interface BuyerPgpKeys {
    private_key: string;
    public_key: string;
}

export interface BuyerMessage {
    sender_pgp_pub_key: string;
    /** Username, eg. "demoforexpert" */
    to: string;
    /** This seems to be a public key */
    from: string;
    order_id: string;
    /** Some kind of hash */
    purchase_proof: string;
    bc_height: number;
    message_hash: string;
    message_signature: Buffer;
    encrypted_message_signature: string;
    encrypted_message: string;
    message: {
        s: string;
        o: string;
        m: string;
        n: string;
        so: string;
    }
}

export interface BuyerOrder {
    pgp_keys: BuyerPgpKeys;
    messages: {[index: string]: BuyerMessage}
    purchase_obj: BuyerPurchaseObj;
}