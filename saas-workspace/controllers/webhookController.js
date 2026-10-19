const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');
const Workspace = require('../models/Workspace');

exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Note: req.body MUST be a raw Buffer here for signature verification
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_secret'
    );
  } catch (err) {
    console.error(`❌ Webhook Signature Verification Failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle Specific Event Types
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const workspaceId = session.metadata.workspaceId;
      const plan = session.metadata.plan;

      await Workspace.findByIdAndUpdate(workspaceId, {
        'subscription.stripeSubscriptionId': session.subscription,
        'subscription.plan': plan,
        'subscription.status': 'active',
      });
      console.log(`✅ Webhook: Subscription created for Workspace ${workspaceId} -> Plan: ${plan}`);
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      const workspace = await Workspace.findOne({
        'subscription.stripeSubscriptionId': subscription.id,
      });

      if (workspace) {
        workspace.subscription.plan = 'FREE';
        workspace.subscription.status = 'canceled';
        workspace.subscription.stripeSubscriptionId = null;
        await workspace.save();
        console.log(`⚠️ Webhook: Subscription canceled for Workspace ${workspace._id}. Downgraded to FREE.`);
      }
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.status(200).json({ received: true });
};