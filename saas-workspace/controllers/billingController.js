const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');
const Workspace = require('../models/Workspace');

// Mapping Plan Tiers to Test Stripe Price IDs
const PLAN_PRICE_MAP = {
  PRO: process.env.STRIPE_PRO_PRICE_ID || 'price_pro_test_123',
  ENTERPRISE: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_ent_test_456',
};

// @desc    Create a Stripe Checkout Session for Plan Upgrade
// @route   POST /api/billing/checkout
// @access  Private (Workspace Owner Only)
exports.createCheckoutSession = async (req, res) => {
  try {
    const { workspaceId, plan } = req.body;

    if (!PLAN_PRICE_MAP[plan]) {
      return res.status(400).json({ message: 'Invalid subscription plan selected.' });
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found.' });
    }

    // Create Stripe Customer if not exists
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

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: PLAN_PRICE_MAP[plan],
          quantity: 1,
        },
      ],
      metadata: {
        workspaceId: workspace._id.toString(),
        plan: plan,
      },
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/workspace/${workspace.slug}?billing=success`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/workspace/${workspace.slug}?billing=canceled`,
    });

    res.status(200).json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Checkout Session Error:', error);
    res.status(500).json({ message: 'Failed to initiate checkout.', error: error.message });
  }
};

// @desc    Create Customer Billing Portal (Manage Cards/Cancel Sub)
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
      return_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/workspace/${workspace.slug}`,
    });

    res.status(200).json({ url: portalSession.url });
  } catch (error) {
    res.status(500).json({ message: 'Failed to open billing portal.', error: error.message });
  }
};