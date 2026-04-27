import { handleResponse } from "../../utils/response-handler.js";
import
{
    createPaymentIntent as createPaymentIntentService,
    confirmPayment as confirmPaymentService,
    stripeEventRouter,
    insertStripeEventToDB,
} from "./stripe.service.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createPaymentIntent = async (req, res, next) =>
{
    try {
        const { billId } = req.body;
        const userId = req.user.id;
        const paymentIntent = await createPaymentIntentService(billId, userId);
        handleResponse(res, 200, "Payment intent created successfully", paymentIntent);
    } catch (error) {
        next(error);
    }
}

export const confirmPayment = async (req, res, next) =>
{
    try {
        const { paymentIntentId } = req.body;
        const paymentIntent = await confirmPaymentService(paymentIntentId);
        handleResponse(res, 200, "Payment confirmed successfully", paymentIntent);
    } catch (error) {
        next(error);
    }
}

export const stripeWebhookController = async (req, res) =>
{
    const sig = req.headers["stripe-signature"];

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );

        console.log("Webhook received:", event.type);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        await insertStripeEventToDB(event.id);
        await stripeEventRouter(event);

        res.json({ received: true });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
};