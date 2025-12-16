$(document).ready(function () {
    const $form = $('#addItemForm');
    const $alert = $('#addItemAlert');
    const $success = $('#addItemSuccess');
    const $submitBtn = $('#btnSubmit');

    function showAlert(msg, type = 'danger') {
        if (type === 'success') {
            $success.text(msg).show();
            $alert.hide();
        } else {
            $alert.text(msg).show();
            $success.hide();
        }
    }

    function hideAlerts() {
        $alert.hide();
        $success.hide();
    }

    // Form validation
    function validateForm() {
        const name = $('#itemName').val().trim();
        const category = $('#itemCategory').val().trim();
        const priceStr = $('#itemPrice').val();
        const price = parseFloat(priceStr);

        if (!name) {
            showAlert('Item name is required');
            return false;
        }

        if (!category) {
            showAlert('Category is required');
            return false;
        }

        if (!priceStr || isNaN(price) || price <= 0) {
            showAlert('Valid price is required (must be greater than 0)');
            return false;
        }

        return true;
    }

    // Form submission
    $form.on('submit', function (e) {
        e.preventDefault();
        hideAlerts();

        if (!validateForm()) {
            return;
        }

        const formData = {
            name: $('#itemName').val().trim(),
            category: $('#itemCategory').val().trim(),
            description: $('#itemDescription').val().trim(),
            price: parseFloat($('#itemPrice').val()),
            truckId: null // Backend will use user.truckId from session
        };

        // Disable submit button
        $submitBtn.prop('disabled', true).text('Adding...');

        $.ajax({
            url: '/api/v1/menuItem/new',
            method: 'POST',
            data: formData,
            success: function (res) {
                if (res.success) {
                    showAlert('Menu item added successfully! Redirecting...', 'success');

                    // Reset form
                    $form[0].reset();

                    // Redirect after 1.5 seconds
                    setTimeout(() => {
                        window.location.href = '/menuItems';
                    }, 1500);
                }
            },
            error: function (xhr) {
                $submitBtn.prop('disabled', false).text('➕ ADD MENU ITEM');

                let msg = 'Failed to add menu item';
                if (xhr.responseJSON && xhr.responseJSON.error) {
                    msg = xhr.responseJSON.error;
                }
                showAlert(msg);
            }
        });
    });

    // Cancel button
    $('#btnCancel').on('click', function () {
        window.location.href = '/menuItems';
    });

    // Navigation
    $('#navOrders').on('click', function (e) {
        e.preventDefault();
        alert('Orders page - to be implemented');
    });
});
