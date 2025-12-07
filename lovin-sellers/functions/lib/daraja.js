"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lipaNaMpesa = exports.getAccessToken = void 0;
const axios_1 = require("axios");
const CONSUMER_KEY = process.env.DARAJA_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.DARAJA_CONSUMER_SECRET;
const PASSKEY = process.env.DARAJA_PASSKEY;
const SHORTCODE = process.env.DARAJA_SHORTCODE;
const CALLBACK_URL = process.env.DARAJA_CALLBACK_URL;
async function getAccessToken() {
    const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
    const response = await axios_1.default.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
        headers: {
            Authorization: `Basic ${auth}`,
        },
    });
    return response.data.access_token;
}
exports.getAccessToken = getAccessToken;
async function lipaNaMpesa(phone, amount, orderId) {
    const token = await getAccessToken();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const password = Buffer.from(`${SHORTCODE}${PASSKEY}${timestamp}`).toString('base64');
    const response = await axios_1.default.post('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
        BusinessShortCode: SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.ceil(amount),
        PartyA: phone,
        PartyB: SHORTCODE,
        PhoneNumber: phone,
        CallBackURL: CALLBACK_URL,
        AccountReference: orderId,
        TransactionDesc: 'Payment for order',
    }, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
}
exports.lipaNaMpesa = lipaNaMpesa;
//# sourceMappingURL=daraja.js.map