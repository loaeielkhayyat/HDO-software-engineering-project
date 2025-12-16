$(document).ready(function () {
    let allOrders = [];
    let currentFilter = 'all';

    const $ordersTableBody = $('#ordersTableBody');
    const $ordersTableContainer = $('#ordersTableContainer');
    const $emptyState = $('#emptyState');
    const $loadingState = $('#loadingState');
    const $ordersAlert = $('#ordersAlert');
    const $ordersSuccess = $('#ordersSuccess');

    function showAlert(msg, type = 'danger') {
        const $alert = type === 'success' ? $ordersSuccess : $ordersAlert;
        $alert.text(msg).show();
        setTimeout(() => {
            $alert.hide();
        }, 3000);
    }

    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function getStatusBadgeClass(status) {
        const statusMap = {
            'pending': 'badge-pending',
            'preparing': 'badge-preparing',
            'ready': 'badge-ready',
            'completed': 'badge-completed',
            'cancelled': 'badge-cancelled'
        };
        return statusMap[status] || 'badge-pending';
    }

    function loadOrders() {
        $loadingState.show();
        $ordersTableContainer.hide();
        $emptyState.hide();

        $.ajax({
            url: '/api/v1/order/truckOrders',
            method: 'GET',
            success: function (res) {
                $loadingState.hide();
                if (res.success && Array.isArray(res.data)) {
                    allOrders = res.data;
                    if (allOrders.length === 0) {
                        $emptyState.show();
                    } else {
                        filterAndRenderOrders();
                        $ordersTableContainer.show();
                    }
                }
            },
            error: function (xhr) {
                $loadingState.hide();
                const msg = xhr.responseJSON && xhr.responseJSON.error ? xhr.responseJSON.error : 'Failed to load orders';
                showAlert(msg);
            }
        });
    }

    function filterAndRenderOrders() {
        let filteredOrders = allOrders;

        if (currentFilter !== 'all') {
            filteredOrders = allOrders.filter(order => order.orderStatus === currentFilter);
        }

        if (filteredOrders.length === 0) {
            $ordersTableContainer.hide();
            $emptyState.show();
        } else {
            renderOrders(filteredOrders);
            $emptyState.hide();
            $ordersTableContainer.show();
        }
    }

    function renderOrders(orders) {
        $ordersTableBody.empty();

        orders.forEach(order => {
            const statusBadge = getStatusBadgeClass(order.orderStatus);
            const statusText = order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1);

            const row = $(`
                <tr>
                    <td><strong>#${order.orderId}</strong></td>
                    <td>${order.customerName || 'N/A'}</td>
                    <td><span class="order-badge ${statusBadge}">${statusText}</span></td>
                    <td style="color:#b64619; font-weight:800;">$${parseFloat(order.totalPrice).toFixed(2)}</td>
                    <td>${formatDate(order.scheduledPickupTime)}</td>
                    <td>${formatDate(order.createdAt)}</td>
                    <td style="text-align:right;">
                        <button class="btn btn-info btn-mini btn-view-order" data-id="${order.orderId}" title="View Details">👁</button>
                        <button class="btn btn-brand btn-mini btn-update-status" data-id="${order.orderId}" data-status="${order.orderStatus}" title="Update Status">✎</button>
                    </td>
                </tr>
            `);
            $ordersTableBody.append(row);
        });
    }

    // Filter tabs
    $('.status-tabs a').on('click', function (e) {
        e.preventDefault();
        const filter = $(this).data('filter');

        // Update active tab
        $('.status-tabs a').removeClass('active');
        $(this).addClass('active');

        // Update current filter and re-render
        currentFilter = filter;
        filterAndRenderOrders();
    });

    // View Order Details
    $(document).on('click', '.btn-view-order', function () {
        const orderId = $(this).data('id');

        $.ajax({
            url: `/api/v1/order/truckOwner/${orderId}`,
            method: 'GET',
            success: function (res) {
                if (res.success && res.data) {
                    const { order, orderItems } = res.data;

                    let itemsHtml = '';
                    if (orderItems && orderItems.length > 0) {
                        itemsHtml = '<table class="table table-condensed"><thead><tr><th>Item</th><th>Quantity</th><th>Price</th><th>Subtotal</th></tr></thead><tbody>';
                        orderItems.forEach(item => {
                            const subtotal = item.price * item.quantity;
                            itemsHtml += `
                                <tr>
                                    <td><strong>${item.name}</strong><br><small>${item.description || ''}</small></td>
                                    <td>${item.quantity}</td>
                                    <td>$${parseFloat(item.price).toFixed(2)}</td>
                                    <td>$${subtotal.toFixed(2)}</td>
                                </tr>
                            `;
                        });
                        itemsHtml += '</tbody></table>';
                    }

                    const statusBadge = getStatusBadgeClass(order.orderStatus);
                    const statusText = order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1);

                    const html = `
                        <div class="row">
                            <div class="col-md-6">
                                <h5><strong>Order Information</strong></h5>
                                <p><strong>Order ID:</strong> #${order.orderId}</p>
                                <p><strong>Status:</strong> <span class="order-badge ${statusBadge}">${statusText}</span></p>
                                <p><strong>Total Price:</strong> <span style="color:#b64619; font-weight:800;">$${parseFloat(order.totalPrice).toFixed(2)}</span></p>
                                <p><strong>Created:</strong> ${formatDate(order.createdAt)}</p>
                                <p><strong>Scheduled Pickup:</strong> ${formatDate(order.scheduledPickupTime)}</p>
                            </div>
                            <div class="col-md-6">
                                <h5><strong>Customer Information</strong></h5>
                                <p><strong>Name:</strong> ${order.customerName || 'N/A'}</p>
                                <p><strong>Email:</strong> ${order.customerEmail || 'N/A'}</p>
                            </div>
                        </div>
                        <hr>
                        <h5><strong>Order Items</strong></h5>
                        ${itemsHtml}
                    `;

                    $('#viewOrderBody').html(html);
                    $('#viewOrderModal').modal('show');
                }
            },
            error: function (xhr) {
                const msg = xhr.responseJSON && xhr.responseJSON.error ? xhr.responseJSON.error : 'Failed to load order details';
                showAlert(msg);
            }
        });
    });

    // Update Status - Open Modal
    $(document).on('click', '.btn-update-status', function () {
        const orderId = $(this).data('id');
        const currentStatus = $(this).data('status');

        $('#updateOrderId').val(orderId);
        $('#updateOrderStatus').val(currentStatus);
        $('#updateStatusModal').modal('show');
    });

    // Update Status - Confirm
    $('#btnConfirmUpdate').on('click', function () {
        const orderId = $('#updateOrderId').val();
        const newStatus = $('#updateOrderStatus').val();

        $.ajax({
            url: `/api/v1/order/updateStatus/${orderId}`,
            method: 'PUT',
            data: { orderStatus: newStatus },
            success: function (res) {
                if (res.success) {
                    $('#updateStatusModal').modal('hide');
                    showAlert('Order status updated successfully!', 'success');
                    loadOrders();
                }
            },
            error: function (xhr) {
                const msg = xhr.responseJSON && xhr.responseJSON.error ? xhr.responseJSON.error : 'Failed to update order status';
                showAlert(msg);
            }
        });
    });

    // Initial load
    loadOrders();
});
