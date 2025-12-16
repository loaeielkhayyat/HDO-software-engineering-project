$(document).ready(function () {
    const $truckName = $('#truckName');
    const $statusBadge = $('#truckStatusBadge');
    const $statTotal = $('#statTotal');
    const $statPending = $('#statPending');
    const $statCompleted = $('#statCompleted');
    const $recentOrdersList = $('#recentOrdersList');
    const $alert = $('#dashboardAlert');

    function showAlert(msg, type = 'danger') {
        $alert.removeClass('alert-danger alert-success')
            .addClass('alert-' + type)
            .text(msg)
            .show();

        // Auto hide after 3 seconds
        setTimeout(() => {
            $alert.hide();
        }, 3000);
    }

    function loadTruckInfo() {
        $.ajax({
            url: '/api/v1/trucks/myTruck',
            method: 'GET',
            success: function (res) {
                if (res.success && res.data) {
                    const truck = res.data;
                    $truckName.text(truck.truckName || 'My Food Truck');

                    // Status logic
                    // If both truckStatus and orderStatus are available, we are Open
                    // But we ONLY control orderStatus here typically.
                    updateStatusBadge(truck.orderStatus);
                }
            },
            error: function (xhr) {
                console.error('Failed to load truck info', xhr);
                const msg = xhr.responseJSON && xhr.responseJSON.error ? xhr.responseJSON.error : 'Failed to load truck info';
                $truckName.text('Error');
                showAlert(msg);
            }
        });
    }

    function updateStatusBadge(status) {
        $statusBadge.removeClass('active inactive').text(status);
        if (status === 'available') {
            $statusBadge.addClass('active').text('Accepting Orders');
        } else {
            $statusBadge.addClass('inactive').text('Currently Unavailable');
        }
    }

    function loadOrders() {
        $.ajax({
            url: '/api/v1/order/truckOrders',
            method: 'GET',
            success: function (res) {
                if (res.success && Array.isArray(res.data)) {
                    const orders = res.data;

                    // Stats
                    const total = orders.length;
                    const pending = orders.filter(o => o.orderStatus === 'pending').length;
                    const completed = orders.filter(o => o.orderStatus === 'completed').length;

                    $statTotal.text(total);
                    $statPending.text(pending);
                    $statCompleted.text(completed);

                    // Recent Orders (Take top 5)
                    renderRecentOrders(orders.slice(0, 5));
                }
            },
            error: function (xhr) {
                console.error('Failed to load orders', xhr);
            }
        });
    }

    function renderRecentOrders(orders) {
        $recentOrdersList.empty();
        if (!orders || orders.length === 0) {
            $recentOrdersList.html('<div class="text-muted small" style="margin-top: 12px;">No recent orders yet</div>');
            return;
        }

        const list = $('<div></div>');
        orders.forEach(order => {
            // Status color - Bootstrap 3 label classes
            let badgeClass = 'label-default';
            if (order.orderStatus === 'completed') badgeClass = 'label-success';
            if (order.orderStatus === 'pending') badgeClass = 'label-warning';
            if (order.orderStatus === 'cancelled') badgeClass = 'label-danger';

            const item = $(`
                <div style="padding: 10px 0; border-bottom: 1px solid #ddd;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: bold; font-size: 0.9rem;">Order #${order.orderId}</div>
                            <div class="text-muted" style="font-size:0.75rem">
                                ${new Date(order.createdAt).toLocaleDateString()} ${new Date(order.createdAt).toLocaleTimeString()}
                                <br/>
                                <span style="color: #337ab7;">${order.customerName || 'Customer'}</span>
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <span class="label ${badgeClass}" style="margin-bottom: 4px; display: inline-block;">${order.orderStatus}</span>
                            <div style="font-weight: bold; font-size: 0.9rem;">$${order.totalPrice}</div>
                        </div>
                    </div>
                </div>
             `);
            list.append(item);
        });
        $recentOrdersList.append(list);
    }

    // Actions
    $('.status-option').on('click', function (e) {
        e.preventDefault();
        const newStatus = $(this).data('status'); // available / unavailable

        $.ajax({
            url: '/api/v1/trucks/updateOrderStatus',
            method: 'PUT',
            data: { orderStatus: newStatus },
            success: function (res) {
                if (res.success) {
                    showAlert('Status updated successfully!', 'success');
                    loadTruckInfo(); // Reload to confirm
                }
            },
            error: function (xhr) {
                const msg = xhr.responseJSON && xhr.responseJSON.error ? xhr.responseJSON.error : 'Failed to update status.';
                showAlert(msg);
            }
        });
    });

    // Button interactions
    $('#btnAddMenuItem').click(() => {
        window.location.href = '/addMenuItem';
    });

    $('#btnManageMenu').click(() => {
        window.location.href = '/menuItems';
    });

    $('#btnViewOrders').click(() => {
        window.location.href = '/truckOrders';
    });

    // Init
    loadTruckInfo();
    loadOrders();
});
