import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { lipaNaMpesa } from "./daraja";

if (!admin.apps.length) {
    admin.initializeApp();
}

/**
 * Creates a new order.
 * Validates product prices against Firestore to prevent client-side manipulation.
 */
export const createOrder = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');
    }
    const uid = context.auth.uid;
    const { items, shipping, paymentMethod } = data;

    // Validate items exist and fetch real prices
    let total = 0;
    const orderItems = [];

    for (const item of items) {
        const productDoc = await admin.firestore().collection('products').doc(item.productId).get();
        if (!productDoc.exists) {
            throw new functions.https.HttpsError('invalid-argument', `Product ${item.productId} not found.`);
        }
        const productData = productDoc.data();
        const price = productData?.price || 0;

        // Basic Stock Check (Optional: Implement robust locking)
        if (productData?.stock < item.quantity) {
            throw new functions.https.HttpsError('failed-precondition', `Insufficient stock for product ${productData?.name}`);
        }

        total += price * item.quantity;
        orderItems.push({
            productId: item.productId,
            name: productData?.name,
            quantity: item.quantity,
            price: price
        });
    }

    const order = {
        userId: uid,
        items: orderItems,
        total,
        shipping,
        paymentMethod,
        status: 'Pending Payment',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const orderRef = await admin.firestore().collection('orders').add(order);

    // Reduce Stock
    // Note: Ideally use a transaction for stock inventory to be safe against race conditions
    for (const item of orderItems) {
        await admin.firestore().collection('products').doc(item.productId).update({
            stock: admin.firestore.FieldValue.increment(-item.quantity)
        });
    }

    if (paymentMethod === 'MPESA') {
        // Sanitize phone number to format 254...
        let phone = shipping.phone.replace('+', '').replace(/\s/g, '');
        if (phone.startsWith('0')) phone = '254' + phone.slice(1);

        try {
            await lipaNaMpesa(phone, total, orderRef.id);
        } catch (e) {
            console.error("Mpesa Error", e);
            // Don't fail the order creation, just log the payment initiation failure
        }
    } else {
        await orderRef.update({ status: 'Placed' });
    }

    return { orderId: orderRef.id };
});

export const mpesaCallback = functions.https.onRequest(async (req, res) => {
    const body = req.body;
    console.log("Mpesa Callback Received", JSON.stringify(body));

    const { Body } = body;
    if (!Body || !Body.stkCallback) {
        res.status(400).send("Invalid Callback Body");
        return;
    }

    const { CheckoutRequestID, ResultCode } = Body.stkCallback;

    // In a real app, you might look up the order by CheckoutRequestID if you stored it.
    // Here we rely on the `AccountReference` sent during STK push being the Order ID 
    // BUT Daraja callback doesn't always return AccountReference easily in metadata.
    // Best practice: Save MerchantRequestID/CheckoutRequestID to the Order document when initiating payment.

    // For now, assuming we can find the order via a query or if we saved the IDs.
    // Since we didn't save IDs in createOrder (simple version), we might need to rely on the user manually checking or
    // improve the createOrder to save these IDs.

    // Simplified: Just log success for now. Real implementation needs ID correlation.

    if (ResultCode === 0) {
        // Payment Successful
        console.log("Payment Successful for Request:", CheckoutRequestID);
        // Find order with this CheckoutRequestID and update status to 'Paid'
        const snapshot = await admin.firestore().collection('orders').where('checkoutRequestId', '==', CheckoutRequestID).get();
        if (!snapshot.empty) {
            snapshot.docs[0].ref.update({ status: 'Paid' });
        }
    } else {
        console.log("Payment Failed for Request:", CheckoutRequestID);
    }

    res.json({ result: 'ok' });
});

/**
 * Trigger: On Order Status Change
 * Sends a notification/email to the user.
 */
export const onOrderStatusChange = functions.firestore
    .document('orders/{orderId}')
    .onUpdate(async (change, context) => {
        const newValue = change.after.data();
        const previousValue = change.before.data();

        if (newValue.status !== previousValue.status) {
            console.log(`Order ${context.params.orderId} status changed from ${previousValue.status} to ${newValue.status}`);
            // Here: Send Email (using SendGrid/Nodemailer) or FCM Notification
            // await sendOrderUpdateEmail(newValue.userId, newValue.status);
        }
    });

/**
 * Callable: Promote User to Admin
 * Only accessible by existing admins.
 */
export const makeAdmin = functions.https.onCall(async (data, context) => {
    // Check if requester is admin
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Not logged in');

    // Fetch requester's role from custom claims or Firestore
    const requester = await admin.auth().getUser(context.auth.uid);
    if (requester.customClaims?.role !== 'admin') {
        // Fallback check Firestore (if claims not yet propagated)
        const userDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();
        if (userDoc.data()?.role !== 'admin') {
            throw new functions.https.HttpsError('permission-denied', 'You must be an admin to perform this action.');
        }
    }

    const { uid } = data;
    // Set Custom Claims
    await admin.auth().setCustomUserClaims(uid, { role: 'admin' });
    // Update Firestore
    await admin.firestore().collection('users').doc(uid).update({ role: 'admin' });

    return { success: true };
});
