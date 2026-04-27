import * as billsRepo from "../bills/bills.repository.js";
import * as stripeRepo from "./stripe.repository.js";
import * as paymentsRepo from "../payments/payments.repository.js";
import { v7 as uuidv7 } from "uuid";

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

    if (bill.status === "paid") {
        const error = new Error("Bill is already paid!");
        error.status = 400;
        throw error;
    }

    // Check if payment already exists
    const existingPayment = await paymentsRepo.findPaymentByBillId(billId);
    if (existingPayment) {
        const error = new Error("This bill already has a payment in progress. Finish or cancel that payment before starting a new one.");
        error.status = 409;
        throw error;
    }

    // Create payment intent
    const paymentIntent = await stripeRepo.createPaymentIntent(bill);

    // Insert payment into database
    const payment = {
        id: uuidv7(),
        bill_id: billId,
        user_id: userId,
        provider: "stripe",
        provider_payment_id: paymentIntent.id,
        amount: bill.amount,
        status: "pending",
        created_at: new Date(),
    };

    const paymentResult = await paymentsRepo.insertPaymentToDB(payment);
    if (!paymentResult) {
        const error = new Error("Error inserting payment into database!");
        error.status = 400;
        throw error;
    }

    // Update bill status to pending
    const billResult = await billsRepo.updateBillStatus(billId, userId, "pending");
    if (!billResult) {
        const error = new Error("Error updating bill status!");
        error.status = 400;
        throw error;
    }

    return {
        payment: {
            id: paymentResult.id,
            bill_id: paymentResult.bill_id,
            user_id: paymentResult.user_id,
            provider: paymentResult.provider,
            provider_payment_id: paymentResult.provider_payment_id,
            amount: paymentResult.amount,
            status: paymentResult.status,
        },
    };
}

export const confirmPayment = async (paymentIntentId) =>
{
    try {
        return await stripeRepo.confirmPayment(paymentIntentId);
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

    const result = await billsRepo.updateBillStatus(billId, userId, "paid");
    if (!result) {
        const error = new Error("Error marking bill as paid!");
        error.status = 400;
        throw error;
    }

    const paymentResult = await paymentsRepo.updatePaymentStatusByBillId(billId, "succeeded");
    if (!paymentResult) {
        const error = new Error("Error updating payment status!");
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
    const result = await billsRepo.updateBillStatus(billId, userId, "failed");
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
