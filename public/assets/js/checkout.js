/**
 * checkout.js
 * Handles PayPal Smart Checkout button logic on the frontend.
 */

function initPayPalButtons(productId, productName, productPrice) {
  // Clear any existing buttons to prevent duplicates
  const container = document.getElementById('paypal-button-container');
  if (container) {
    container.innerHTML = '';
  }

  // Use the global paypal SDK object loaded via script tag
  paypal.Buttons({
    createOrder: function(data, actions) {
      // Create the order on the client side
      return actions.order.create({
        purchase_units: [{
          description: productName,
          amount: {
            currency_code: 'USD',
            value: productPrice
          }
        }]
      });
    },
    onApprove: function(data, actions) {
      // Capture the funds
      return actions.order.capture().then(function(orderData) {
        
        // Log to backend to grant access
        const payer = orderData.payer;
        
        fetch('/api/payments/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderID: data.orderID,
            productID: productId,
            productName: productName,
            price: productPrice,
            payerEmail: payer.email_address,
            payerFirstName: payer.name.given_name,
            payerLastName: payer.name.surname
          })
        })
        .then(res => res.json())
        .then(verification => {
          if(verification.success) {
            alert('Payment successful! Your Client Portal account has been created. Check your email for login instructions.');
            window.location.href = '/portal-login.html';
          } else {
            alert('Payment received, but there was an issue granting access. Please contact support.');
          }
        })
        .catch(err => {
          console.error(err);
          alert('Error communicating with the server. Your payment is safe, please contact support.');
        });
      });
    },
    onError: function(err) {
      console.error('PayPal Checkout onError', err);
      // alert('An error occurred during checkout. Please try again.');
    }
  }).render('#paypal-button-container');
}

// Global modal open helper
window.openCheckoutModal = function(id, name, price) {
  const modal = document.getElementById('checkout-modal');
  if (!modal) return;
  
  document.getElementById('checkout-product-name').textContent = name;
  document.getElementById('checkout-product-price').textContent = '$' + price;
  
  modal.style.display = 'flex';

  // Initialize buttons
  initPayPalButtons(id, name, price);
};

window.closeCheckoutModal = function() {
  document.getElementById('checkout-modal').style.display = 'none';
};
