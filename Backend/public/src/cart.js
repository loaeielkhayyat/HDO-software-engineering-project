$(document).ready(function () {
  const $cartArea = $('#cartArea');
  const $empty = $('#empty');
  const $summary = $('#summary');
  const $totalPrice = $('#totalPrice');
  const $cartCount = $('#cartCount');
  const $clearCartBtn = $('#clearCartBtn');
  const $placeOrderBtn = $('#placeOrderBtn');
  const $pickupTime = $('#pickupTime');
  const $successMessage = $('#successMessage');
  const $cartError = $('#cartError');

  let cartItems = [];
  let currentTruckId = null;

  function showError(message) {
    $cartError.text(message).show();
    $successMessage.hide();
    setTimeout(function () {
      $cartError.fadeOut();
    }, 5000);
  }

  function showSuccess(message) {
    $successMessage.text(message).show();
    $cartError.hide();
    setTimeout(function () {
      $successMessage.fadeOut();
    }, 3000);
  }

  function clearMessages() {
    $cartError.hide();
    $successMessage.hide();
  }

  function formatMoney(amount) {
    return '$' + parseFloat(amount).toFixed(2);
  }

  function calculateTotal() {
    return cartItems.reduce(function (sum, item) {
      return sum + (parseFloat(item.price) * parseInt(item.quantity));
    }, 0);
  }

  function updateCartCount() {
    const totalCount = cartItems.reduce(function (sum, item) {
      return sum + parseInt(item.quantity);
    }, 0);
    $cartCount.text(totalCount);
  }

  function renderCart() {
    $cartArea.empty();
    clearMessages();

    if (!cartItems || cartItems.length === 0) {
      $empty.show();
      $summary.hide();
      $cartCount.text('0');
      return;
    }

    $empty.hide();
    $summary.show();

    // Determine truckId (use first item's truckId, assuming all items are from same truck)
    if (cartItems.length > 0) {
      currentTruckId = cartItems[0].truckId;
    }

    cartItems.forEach(function (item) {
      const cartId = item.cartId;
      const name = item.name || 'Unnamed Item';
      const category = item.category || 'Other';
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 1;
      const subtotal = price * quantity;

      const $item = $(`
        <div class="cart-item">
          <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between;">
            <div>
              <div style="font-weight: bold; font-size: 18px; margin-bottom: 5px;">${name}</div>
              <span class="badge badge-type">${category}</span>
            </div>

            <div style="display: flex; align-items: center; gap: 15px; margin-top: 10px;">
              <div class="price" style="font-size: 18px;">${formatMoney(price)}</div>

              <div style="display: flex; align-items: center; gap: 5px;">
                <button class="btn btn-default qty-btn decrease-qty" data-cart-id="${cartId}" type="button">−</button>
                <div style="font-weight: bold; min-width: 28px; text-align: center;">${quantity}</div>
                <button class="btn btn-default qty-btn increase-qty" data-cart-id="${cartId}" type="button">+</button>
              </div>

              <button class="btn btn-danger btn-sm remove-item" data-cart-id="${cartId}" type="button">Remove</button>
            </div>
          </div>

          <div class="muted" style="margin-top: 10px; font-size: 14px;">
            Subtotal: <span style="font-weight: 600;">${formatMoney(subtotal)}</span>
          </div>
        </div>
      `);

      $item.find('.increase-qty').on('click', function () {
        updateQuantity(cartId, quantity + 1);
      });

      $item.find('.decrease-qty').on('click', function () {
        if (quantity > 1) {
          updateQuantity(cartId, quantity - 1);
        }
      });

      $item.find('.remove-item').on('click', function () {
        removeItem(cartId);
      });

      $cartArea.append($item);
    });

    $totalPrice.text(formatMoney(calculateTotal()));
    updateCartCount();
  }

  function loadCart() {
    $.ajax({
      type: 'GET',
      url: '/api/v1/cart/view',
      success: function (response) {
        cartItems = response && response.data ? response.data : [];
        renderCart();
      },
      error: function (xhr) {
        let message = 'Failed to load cart.';
        if (xhr && xhr.responseJSON && xhr.responseJSON.error) {
          message = xhr.responseJSON.error;
        }
        showError(message);
        $empty.show();
        $summary.hide();
      }
    });
  }

  function updateQuantity(cartId, newQuantity) {
    if (newQuantity < 1) {
      showError('Quantity must be at least 1');
      return;
    }

    $.ajax({
      type: 'PUT',
      url: `/api/v1/cart/edit/${cartId}`,
      data: {
        quantity: newQuantity
      },
      success: function (response) {
        loadCart(); // Reload cart to get updated data
      },
      error: function (xhr) {
        let message = 'Failed to update quantity.';
        if (xhr && xhr.responseJSON && xhr.responseJSON.error) {
          message = xhr.responseJSON.error;
        }
        showError(message);
      }
    });
  }

  function removeItem(cartId) {
    if (!confirm('Are you sure you want to remove this item from your cart?')) {
      return;
    }

    $.ajax({
      type: 'DELETE',
      url: `/api/v1/cart/delete/${cartId}`,
      success: function (response) {
        showSuccess('Item removed from cart');
        loadCart(); // Reload cart
      },
      error: function (xhr) {
        let message = 'Failed to remove item.';
        if (xhr && xhr.responseJSON && xhr.responseJSON.error) {
          message = xhr.responseJSON.error;
        }
        showError(message);
      }
    });
  }

  function clearCart() {
    if (!confirm('Are you sure you want to clear your entire cart?')) {
      return;
    }

    // Delete all items one by one
    const deletePromises = cartItems.map(function (item) {
      return $.ajax({
        type: 'DELETE',
        url: `/api/v1/cart/delete/${item.cartId}`
      });
    });

    $.when.apply($, deletePromises).done(function () {
      showSuccess('Cart cleared');
      loadCart();
    }).fail(function () {
      showError('Failed to clear some items');
      loadCart();
    });
  }

  function placeOrder() {
    if (!currentTruckId) {
      showError('Unable to determine truck. Please try again.');
      return;
    }

    if (cartItems.length === 0) {
      showError('Your cart is empty');
      return;
    }

    const scheduledPickupTime = $pickupTime.val() || null;

    $.ajax({
      type: 'POST',
      url: '/api/v1/order/new',
      data: {
        truckId: currentTruckId,
        scheduledPickupTime: scheduledPickupTime
      },
      success: function (response) {
        showSuccess('Order placed successfully! Redirecting to orders...');
        setTimeout(function () {
          window.location.href = '/orders';
        }, 2000);
      },
      error: function (xhr) {
        let message = 'Failed to place order.';
        if (xhr && xhr.responseJSON && xhr.responseJSON.error) {
          message = xhr.responseJSON.error;
        }
        showError(message);
      }
    });
  }

  // Event handlers
  $clearCartBtn.on('click', clearCart);
  $placeOrderBtn.on('click', placeOrder);

  // Load cart on page load
  loadCart();
});

