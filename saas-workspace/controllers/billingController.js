const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const Workspace = require('../models/Workspace');

// Dynamic Pricing Map (Amount in Cents: $29.00 = 2900, $99.00 = 9900)
const PLAN_DETAILS = {
  PRO: {
    name: 'Donglify Pro Plan',
    amount: 2900, // $29/month
  },
  ENTERPRISE: {
    name: 'Donglify Enterprise Plan',
    amount: 9900, // $99/month
  },
};

// @desc    Create a Stripe Checkout Session for Plan Upgrade
// @route   POST /api/billing/checkout
// @access  Private (Workspace Owner Only)
exports.createCheckoutSession = async (req, res) => {
  try {
    const { workspaceId, plan } = req.body;

    if (!PLAN_DETAILS[plan]) {
      return res.status(400).json({ message: 'Invalid subscription plan selected.' });
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found.' });
    }

    // Create or retrieve Stripe Customer
    let customerId = workspace.subscription.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        name: workspace.name,
        metadata: { workspaceId: workspace._id.toString() },
      });
      customerId = customer.id;
      workspace.subscription.stripeCustomerId = customerId;
      await workspace.save();
    }

    // Create Checkout Session using dynamic price_data
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: PLAN_DETAILS[plan].name,
              description: `Subscription tier for ${workspace.name}`,
            },
            unit_amount: PLAN_DETAILS[plan].amount,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        workspaceId: workspace._id.toString(),
        plan: plan,
      },
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/saas/dashboard?billing=success`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/saas/dashboard?billing=canceled`,
    });

    res.status(200).json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Checkout Session Error:', error);
    res.status(500).json({ message: 'Failed to initiate checkout.', error: error.message });
  }
};

// @desc    Create Customer Billing Portal
// @route   POST /api/billing/portal
// @access  Private (Workspace Owner Only)
exports.createCustomerPortal = async (req, res) => {
  try {
    const { workspaceId } = req.body;
    const workspace = await Workspace.findById(workspaceId);

    if (!workspace || !workspace.subscription.stripeCustomerId) {
      return res.status(400).json({ message: 'No active billing profile found for this workspace.' });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: workspace.subscription.stripeCustomerId,
      return_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/saas/dashboard`,
    });

    res.status(200).json({ url: portalSession.url });
  } catch (error) {
    res.status(500).json({ message: 'Failed to open billing portal.', error: error.message });
  }
};