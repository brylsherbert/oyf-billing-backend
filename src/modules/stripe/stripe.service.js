import * as billsRepo from "../bills/bills.repository.js";
import * as stripeRepo from "./stripe.repository.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createPaymentIntent = async (billId, userId) =>
{
    const bill = await billsRepo.findBillById(billId);
    if (!bill) {
        const error = new Error("Bill does not exist!");
        error.status = 400;
        throw error;
    }
    if (bill.user_id !== userId) {
        const error = new Error("You are not authorized to create a payment intent for this bill!");
        error.status = 403;
        throw error;
    }
    const paymentIntent = await stripe.paymentIntents.create({
        amount: bill.amount * 100,
        currency: "php",
        payment_method_types: ["card"],
        metadata: {
            billId: billId,
            userId: userId,
        },
    });

    return paymentIntent;
}

export const confirmPayment = async (paymentIntentId) =>
{
    try {
        const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
            payment_method: "pm_card_visa",
        });
        return paymentIntent;
    } catch (error) {
        console.error(error);
        const errorMessage = error.message || "Error confirming payment!";
        const errorObject = new Error(errorMessage);
        errorObject.status = 400;
        throw errorObject;
    }
}

export const insertStripeEventToDB = async (eventId) =>
{
    return await stripeRepo.insertStripeEventToDB(eventId);
}

export const stripeEventRouter = async (event) =>
{
    switch (event.type) {
        case "payment_intent.succeeded":
            return handlePaymentSuccess(event.data.object);

        case "payment_intent.payment_failed":
            return handlePaymentFailed(event.data.object);

        case "payment_intent.created":
            return handlePaymentCreated(event.data.object);

        case "payment_intent.updated":
            return handlePaymentUpdated(event.data.object);

        default:
            console.log("Unhandled:", event.type);
    }
};

export const handlePaymentSuccess = async (paymentIntent) =>
{
    const { billId, userId } = paymentIntent.metadata;
    console.log("Handling payment success for bill:", billId);

    const bill = await billsRepo.findBillById(billId);
    if (!bill) {
        const error = new Error("Bill does not exist!");
        error.status = 400;
        throw error;
    }

    if (bill.user_id !== userId) {
        const error = new Error("You are not authorized to handle this payment intent!");
        error.status = 403;
        throw error;
    }

    const result = await billsRepo.updateBillStatus(billId, userId, true);
    if (!result) {
        const error = new Error("Error marking bill as paid!");
        error.status = 400;
        throw error;
    }

    console.log("Bill marked as paid:", billId);
    return result;
}

export const handlePaymentFailed = async (paymentIntent) =>
{
    const { billId, userId } = paymentIntent.metadata;
    const bill = await billsRepo.findBillById(billId);
    if (!bill) {
        const error = new Error("Bill does not exist!");
        error.status = 400;
        throw error;
    }
    if (bill.user_id !== userId) {
        const error = new Error("You are not authorized to handle this payment intent!");
        error.status = 403;
        throw error;
    }
    const result = await billsRepo.updateBillStatus(billId, userId, false);
    if (!result) {
        const error = new Error("Error marking bill as unpaid!");
        error.status = 400;
        throw error;
    }
    return result;
}

export const handlePaymentCreated = async (paymentIntent) =>
{
    return paymentIntent;
}

export const handlePaymentUpdated = async (paymentIntent) =>
{
    return paymentIntent;
}
