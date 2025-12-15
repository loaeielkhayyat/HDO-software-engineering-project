$(document).ready(function () {
  const $ordersList = $('#ordersList');
  const $emptyState = $('#emptyState');
  const $ordersError = $('#ordersError');

  function showError(message) {
    $ordersError.text(message).show();
    $emptyState.hide();
    setTimeout(function() {
      $ordersError.fadeOut();
    }, 5000);
  }

  function clearError() {
    $ordersError.hide();
  }

  function formatMoney(amount) {
    return '$' + parseFloat(amount).toFixed(2);
  }

  function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function getStatusClass(status) {
    const statusLower = (status || '').toLowerCase();
    if (statusLower === 'pending') return 'status-pending';
    if (statusLower === 'preparing') return 'status-preparing';
    if (statusLower === 'ready') return 'status-ready';
    if (statusLower === 'completed') return 'status-completed';
    if (statusLower === 'cancelled') return 'status-cancelled';
    if (statusLower==="done") return 'status-completed';
    return 'status-pending'; // default
  }

  function getStatusLabel(status) {
    return (status || 'pending').charAt(0).toUpperCase() + (status || 'pending').slice(1).toLowerCase();
  }

  function renderOrders(orders) {
    $ordersList.empty();
    clearError();

    if (!orders || orders.length === 0) {
      $emptyState.show();
      $ordersList.hide();
      return;
    }

    $emptyState.hide();
    $ordersList.show();

    orders.forEach(function(order) {
      const orderId = order.orderId;
      const truckName = order.truckName || 'Unknown Truck';
      const orderStatus = order.orderStatus || 'pending';
      const totalPrice = parseFloat(order.totalPrice) || 0;
      const createdAt = order.createdAt;
      const scheduledPickupTime = order.scheduledPickupTime;
      const estimatedEarliestPickup = order.estimatedEarliestPickup;

      const $orderCard = $(`
        <div class="order-card" data-order-id="${orderId}">
          <div class="order-header">
            <div class="order-info">
              <div class="order-title">Order #${orderId}</div>
              <div class="order-meta">
                <strong>Truck:</strong> ${truckName}<br>
                <strong>Date:</strong> ${formatDate(createdAt)}
                ${scheduledPickupTime ? '<br><strong>Scheduled Pickup:</strong> ' + formatDate(scheduledPickupTime) : ''}
                ${estimatedEarliestPickup ? '<br><strong>Estimated Ready:</strong> ' + formatDate(estimatedEarliestPickup) : ''}
              </div>
            </div>
            <div style="text-align: right;">
              <span class="order-status ${getStatusClass(orderStatus)}">${getStatusLabel(orderStatus)}</span>
              <div class="order-price">${formatMoney(totalPrice)}</div>
            </div>
          </div>
          <div class="order-actions">
            <button class="btn btn-default btn-sm view-details-btn" data-order-id="${orderId}">
              View Details
            </button>
          </div>
          <div class="order-details" id="orderDetails-${orderId}" data-loaded="false">
          </div>
        </div>
      `);

      $orderCard.find('.view-details-btn').on('click', function() {
        const $detailsDiv = $orderCard.find('.order-details');
        const isLoaded = $detailsDiv.data('loaded') === true;
        
        if ($detailsDiv.hasClass('show')) {
          $detailsDiv.removeClass('show');
          $(this).text('View Details');
        } else {
          if (!isLoaded) {
            loadOrderDetails(orderId, $detailsDiv);
          }
          $detailsDiv.addClass('show');
          $(this).text('Hide Details');
        }
      });

      $ordersList.append($orderCard);
    });
  }

  function loadOrders() {
    $.ajax({
      type: 'GET',
      url: '/api/v1/order/myOrders',
      success: function (response) {
        const orders = response && response.data ? response.data : [];
        renderOrders(orders);
      },
      error: function (xhr) {
        let message = 'Failed to load orders.';
        if (xhr && xhr.responseJSON && xhr.responseJSON.error) {
          message = xhr.responseJSON.error;
        }
        showError(message);
        $emptyState.show();
        $ordersList.hide();
      }
    });
  }

  function loadOrderDetails(orderId, $detailsDiv) {
    $detailsDiv.html('<p>Loading...</p>');
    $detailsDiv.addClass('show'); // Show loading state

    $.ajax({
      type: 'GET',
      url: `/api/v1/order/details/${orderId}`,
      success: function (response) {
        const data = response && response.data ? response.data : {};
        const orderItems = data.orderItems || [];

        let html = '<h5 style="margin-bottom: 15px;">Order Items</h5>';

        if (orderItems.length > 0) {
          orderItems.forEach(function(item) {
            const itemName = item.name || 'Unknown Item';
            const itemDescription = item.description || '';
            const itemCategory = item.category || 'Other';
            const itemQuantity = parseInt(item.quantity) || 1;
            const itemPrice = parseFloat(item.price) || 0;
            const itemSubtotal = itemPrice * itemQuantity;

            html += '<div class="order-item">';
            html += '<div class="order-item-name">' + itemName + ' <span class="badge" style="background: #ffe6da; color: #b64619;">' + itemCategory + '</span></div>';
            if (itemDescription) {
              html += '<div class="order-item-meta">' + itemDescription + '</div>';
            }
            html += '<div class="order-item-meta" style="margin-top: 5px;">';
            html += 'Quantity: ' + itemQuantity + ' × ' + formatMoney(itemPrice) + ' = <strong>' + formatMoney(itemSubtotal) + '</strong>';
            html += '</div>';
            html += '</div>';
          });
        } else {
          html += '<p class="text-muted">No items found for this order.</p>';
        }

        $detailsDiv.html(html);
        $detailsDiv.data('loaded', true);
      },
      error: function (xhr) {
        let message = 'Failed to load order details.';
        if (xhr && xhr.responseJSON && xhr.responseJSON.error) {
          message = xhr.responseJSON.error;
        }
        $detailsDiv.html('<div class="alert alert-danger">' + message + '</div>');
        $detailsDiv.data('loaded', true);
      }
    });
  }

  // Load orders on page load
  loadOrders();
});

