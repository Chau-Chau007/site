const stripe = Stripe('pk_test_51QdGhNRx37a2eYu73p8GE0yOsJOPhBYYFk2LY0Gvj65UK6LQo5bCWm4HufLkDuGNs9sQxCWP30ZBruF4jL1OiCVM00g9jNxjLE');  // Sua chave pública do Stripe
const elements = stripe.elements();

const card = elements.create('card');
card.mount('#card-element');

card.addEventListener('change', (event) => {
    const displayError = document.getElementById('card-errors');
    if (event.error) {
        displayError.textContent = event.error.message;
    } else {
        displayError.textContent = '';
    }
});

const form = document.getElementById('payment-form');
form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const { paymentMethod, error } = await stripe.createPaymentMethod({
        type: 'card',
        card: card,
        billing_details: {
            name: document.getElementById('cardholder-name').value,
        },
    });

    if (error) {
        const errorElement = document.getElementById('card-errors');
        errorElement.textContent = error.message;
    } else {

        const response = await fetch('/create-payment-intent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                paymentMethodId: paymentMethod.id,
                amount: 100,  // 1 metical em centavos
                currency: 'mzn',  // Metical (Mozambique Metical)
            }),
        });

        const paymentResult = await response.json();

        if (paymentResult.error) {
            alert('Erro no pagamento: ' + paymentResult.error);
        } else {
            alert('Pagamento realizado com sucesso!');
        }
    }
});
const express = require('express');
const app = express();
const stripe1 = require('stripe')('sk_test_51QdGhNRx37a2eYu7IlRe0HbQgFd8nUa4Fb1XhIgD3sNEsPonBV3TH64w5Y739Nt6OlgaFPT021I9t1mFZ9NopnNl00ukLokgNZ');

app.use(express.json());

app.post('/create-payment-intent', async (req, res) => {
    const { paymentMethodId, amount, currency } = req.body;

    try {
        const paymentIntent = await stripe1.paymentIntents.create({
            amount,
            currency,
            payment_method: paymentMethodId,
            confirm: true,
        });

        res.send({ success: true });
    } catch (error) {
        res.send({ error: error.message });
    }
});

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
