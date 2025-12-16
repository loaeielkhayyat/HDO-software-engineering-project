$(document).ready(function () {
    const $menuTableBody = $('#menuTableBody');
    const $menuTable = $('#menuTable');
    const $emptyState = $('#emptyState');
    const $loadingState = $('#loadingState');
    const $menuAlert = $('#menuAlert');
    const $menuSuccess = $('#menuSuccess');

    function showAlert(msg, type = 'danger') {
        const $alert = type === 'success' ? $menuSuccess : $menuAlert;
        $alert.text(msg).show();
        setTimeout(() => {
            $alert.hide();
        }, 3000);
    }

    function loadMenuItems() {
        $loadingState.show();
        $menuTable.hide();
        $emptyState.hide();

        $.ajax({
            url: '/api/v1/menuItem/view',
            method: 'GET',
            success: function (res) {
                $loadingState.hide();
                if (res.success && Array.isArray(res.data)) {
                    if (res.data.length === 0) {
                        $emptyState.show();
                    } else {
                        renderMenuItems(res.data);
                        $menuTable.show();
                    }
                }
            },
            error: function (xhr) {
                $loadingState.hide();
                const msg = xhr.responseJSON && xhr.responseJSON.error ? xhr.responseJSON.error : 'Failed to load menu items';
                showAlert(msg);
            }
        });
    }

    function renderMenuItems(items) {
        $menuTableBody.empty();
        items.forEach(item => {
            const statusClass = item.status === 'available' ? 'label-soft' : 'label-unavailable';
            const statusText = item.status === 'available' ? 'Available' : 'Unavailable';

            const row = $(`
                <tr>
                    <td>${item.itemId}</td>
                    <td><strong>${item.name}</strong></td>
                    <td><span class="label label-default">${item.category}</span></td>
                    <td>${item.description || ''}</td>
                    <td class="price">$${parseFloat(item.price).toFixed(2)}</td>
                    <td><span class="${statusClass}">${statusText}</span></td>
                    <td class="actions" style="text-align:right;">
                        <button class="btn btn-info btn-mini btn-view" data-id="${item.itemId}" title="View">👁</button>
                        <button class="btn btn-blue btn-mini btn-edit" data-id="${item.itemId}" title="Edit">✎</button>
                        <button class="btn btn-red btn-mini btn-delete" data-id="${item.itemId}" title="Delete">🗑</button>
                    </td>
                </tr>
            `);
            $menuTableBody.append(row);
        });
    }

    // View Item
    $(document).on('click', '.btn-view', function () {
        const itemId = $(this).data('id');
        $.ajax({
            url: `/api/v1/menuItem/view/${itemId}`,
            method: 'GET',
            success: function (res) {
                if (res.success && res.data) {
                    const item = res.data;
                    const statusText = item.status === 'available' ? 'Available' : 'Unavailable';
                    const html = `
                        <div class="form-horizontal">
                            <div class="form-group">
                                <label class="col-sm-3 control-label">ID:</label>
                                <div class="col-sm-9">
                                    <p class="form-control-static">${item.itemId}</p>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="col-sm-3 control-label">Name:</label>
                                <div class="col-sm-9">
                                    <p class="form-control-static"><strong>${item.name}</strong></p>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="col-sm-3 control-label">Category:</label>
                                <div class="col-sm-9">
                                    <p class="form-control-static">${item.category}</p>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="col-sm-3 control-label">Description:</label>
                                <div class="col-sm-9">
                                    <p class="form-control-static">${item.description || 'N/A'}</p>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="col-sm-3 control-label">Price:</label>
                                <div class="col-sm-9">
                                    <p class="form-control-static" style="color:#b64619; font-weight:800;">$${parseFloat(item.price).toFixed(2)}</p>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="col-sm-3 control-label">Status:</label>
                                <div class="col-sm-9">
                                    <p class="form-control-static">${statusText}</p>
                                </div>
                            </div>
                        </div>
                    `;
                    $('#viewItemBody').html(html);
                    $('#viewItemModal').modal('show');
                }
            },
            error: function (xhr) {
                const msg = xhr.responseJSON && xhr.responseJSON.error ? xhr.responseJSON.error : 'Failed to load item details';
                showAlert(msg);
            }
        });
    });

    // Edit Item - Load data
    $(document).on('click', '.btn-edit', function () {
        const itemId = $(this).data('id');
        $.ajax({
            url: `/api/v1/menuItem/view/${itemId}`,
            method: 'GET',
            success: function (res) {
                if (res.success && res.data) {
                    const item = res.data;
                    $('#editItemId').val(item.itemId);
                    $('#editName').val(item.name);
                    $('#editCategory').val(item.category);
                    $('#editDescription').val(item.description || '');
                    $('#editPrice').val(item.price);
                    $('#editStatus').val(item.status);
                    $('#editItemModal').modal('show');
                }
            },
            error: function (xhr) {
                const msg = xhr.responseJSON && xhr.responseJSON.error ? xhr.responseJSON.error : 'Failed to load item details';
                showAlert(msg);
            }
        });
    });

    // Save Edit
    $('#btnSaveEdit').on('click', function () {
        const itemId = $('#editItemId').val();
        const data = {
            name: $('#editName').val(),
            category: $('#editCategory').val(),
            description: $('#editDescription').val(),
            price: parseFloat($('#editPrice').val()),
            status: $('#editStatus').val()
        };

        $.ajax({
            url: `/api/v1/menuItem/edit/${itemId}`,
            method: 'PUT',
            data: data,
            success: function (res) {
                if (res.success) {
                    $('#editItemModal').modal('hide');
                    showAlert('Item updated successfully!', 'success');
                    loadMenuItems();
                }
            },
            error: function (xhr) {
                const msg = xhr.responseJSON && xhr.responseJSON.error ? xhr.responseJSON.error : 'Failed to update item';
                showAlert(msg);
            }
        });
    });

    // Delete Item
    $(document).on('click', '.btn-delete', function () {
        const itemId = $(this).data('id');
        if (confirm('Are you sure you want to delete this menu item?')) {
            $.ajax({
                url: `/api/v1/menuItem/delete/${itemId}`,
                method: 'DELETE',
                success: function (res) {
                    if (res.success) {
                        showAlert('Item deleted successfully!', 'success');
                        loadMenuItems();
                    }
                },
                error: function (xhr) {
                    const msg = xhr.responseJSON && xhr.responseJSON.error ? xhr.responseJSON.error : 'Failed to delete item';
                    showAlert(msg);
                }
            });
        }
    });

    // Add New Item button
    $('#btnAddNewItem').on('click', function () {
        window.location.href = '/addMenuItem';
    });

    // Navigation
    $('#navOrders').on('click', function (e) {
        e.preventDefault();
        alert('Orders page - to be implemented');
    });

    // Initial load
    loadMenuItems();
});
