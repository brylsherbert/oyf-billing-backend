import { pool } from "../../config/db.js";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createPaymentIntent = async (bill) =>
{
    const paymentIntent = await stripe.paymentIntents.create({
        amount: bill.amount * 100,
        currency: "php",
        payment_method_types: ["card"],
        metadata: {
            billId: bill.id,
            userId: bill.user_id,
        },
    });
    return paymentIntent;
}

export const confirmPayment = async (paymentIntentId) =>
{
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
        payment_method: "pm_card_visa",
    });
    return paymentIntent;
}

export const insertStripeEventToDB = async (eventId) =>
{
    const sqlQuery = `INSERT INTO stripe_events (id) VALUES ($1)`;
    const result = await pool.query(sqlQuery, [eventId]);
    return result.rowCount > 0;
}