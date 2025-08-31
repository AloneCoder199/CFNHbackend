const express = require('express');
const cors = require('cors');
const stripe = require('./Stripe');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const sendDonationEmail = require('./mailer');

dotenv.config();
const app = express();

// ✅ Normal body parser for JSON requests
app.use(express.json());

// ✅ Raw body parser only for Stripe Webhook route
app.use('/webhook', bodyParser.raw({ type: 'application/json' }));

// ✅ Secure CORS (origins from .env)
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "").split(",");

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); // Postman, mobile apps
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error(`CORS blocked for origin: ${origin}`), false);
    }
  }
}));

// ✅ Create Checkout Session
app.post('/create-checkout-session', async (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: "Invalid donation amount" });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: 'Donation to Support' },
            unit_amount: amount * 100, // Convert dollars to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/success`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
    });

    res.json({ id: session.id });
  } catch (err) {
    console.error('❌ Stripe Error:', err);
    res.status(500).json({ error: "Payment session creation failed" });
  }
});

// ✅ Stripe Webhook (for Stripe events only)
app.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('❌ Webhook Error:', err.message);
    return res.status(400).send(`Webhook Error`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    console.log('✅ Payment Successful:', session);

    const donorEmail = session.customer_details?.email || 'N/A';
    const amount = session.amount_total; // cents

    try {
      await sendDonationEmail(donorEmail, amount);
      console.log('📩 Email sent successfully');
    } catch (emailErr) {
      console.error('❌ Email send error:', emailErr.message);
    }
  }

  res.status(200).json({ received: true });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
