$(document).ready(function () {
  const $menuGrid = $('#menuGrid');
  const $noItemsMessage = $('#noItemsMessage');
  const $menuError = $('#menuError');
  const $successMessage = $('#successMessage');
  const $searchInput = $('#searchInput');
  const $filterBtn = $('#filterBtn');
  const $clearBtn = $('#clearBtn');

  // Extract truckId from URL
  const pathParts = window.location.pathname.split('/');
  const truckId = pathParts[pathParts.length - 1];

  if (!truckId || truckId === 'truckMenu') {
    showError('Invalid truck ID');
    return;
  }

  let allMenuItems = [];
  let currentCategory = null;

  function showError(message) {
    $menuError.text(message).show();
    $successMessage.hide();
    setTimeout(function() {
      $menuError.fadeOut();
    }, 5000);
  }

  function showSuccess(message) {
    $successMessage.text(message).show();
    $menuError.hide();
    setTimeout(function() {
      $successMessage.fadeOut();
    }, 3000);
  }

  function clearMessages() {
    $menuError.hide();
    $successMessage.hide();
  }

  function renderMenuItems(items) {
    $menuGrid.empty();

    if (!items || items.length === 0) {
      $noItemsMessage.show();
      return;
    }

    $noItemsMessage.hide();

    items.forEach(item => {
      const itemId = item.itemId;
      const name = item.name || 'Unnamed Item';
      const description = item.description || '';
      const price = item.price || 0;
      const category = item.category || 'Other';

      const $card = $(`
        <div class="col-sm-12 col-md-6">
          <div class="menu-card">
            <div class="menu-item-name">${name}</div>
            <div class="menu-item-desc">${description}</div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 10px;">
              <div>
                <span class="badge-type">${category}</span>
                <span class="price" style="margin-left: 10px;">$${price.toFixed(2)}</span>
              </div>
            </div>
            <div style="display: flex; align-items: center; justify-content: flex-end; margin-top: 15px;">
              <label style="margin-right: 10px;">Quantity:</label>
              <input type="number" class="form-control quantity-input" min="1" value="1" data-item-id="${itemId}" />
              <button class="btn btn-brand btn-sm add-to-cart-btn" data-item-id="${itemId}" style="margin-left: 10px;">
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      `);

      $card.find('.add-to-cart-btn').on('click', function() {
        const quantity = parseInt($card.find('.quantity-input').val()) || 1;
        addToCart(itemId, quantity, name);
      });

      $menuGrid.append($card);
    });
  }

  function loadMenuItems(category) {
    clearMessages();
    $menuGrid.empty();
    $noItemsMessage.hide();

    let url = `/api/v1/menuItem/truck/${truckId}`;
    if (category) {
      url = `/api/v1/menuItem/truck/${truckId}/category/${encodeURIComponent(category)}`;
    }

    $.ajax({
      type: 'GET',
      url: url,
      success: function (response) {
        const items = response && response.data ? response.data : [];
        if (category) {
          renderMenuItems(items);
        } else {
          allMenuItems = items;
          renderMenuItems(items);
        }
      },
      error: function (xhr) {
        let message = 'Failed to load menu items.';
        if (xhr && xhr.responseJSON && xhr.responseJSON.error) {
          message = xhr.responseJSON.error;
        }
        showError(message);
      }
    });
  }

  function addToCart(itemId, quantity, itemName) {
    if (!itemId || quantity < 1) {
      showError('Invalid item or quantity');
      return;
    }

    $.ajax({
      type: 'POST',
      url: '/api/v1/cart/new',
      data: {
        itemId: itemId,
        quantity: quantity
      },
      success: function (response) {
        showSuccess(`Successfully added ${quantity} x ${itemName} to cart!`);
        updateCartCount();
      },
      error: function (xhr) {
        let message = 'Failed to add item to cart.';
        if (xhr && xhr.responseJSON && xhr.responseJSON.error) {
          message = xhr.responseJSON.error;
        }
        showError(message);
      }
    });
  }

  function updateCartCount() {
    $.ajax({
      type: 'GET',
      url: '/api/v1/cart/view',
      success: function (response) {
        const cartItems = response && response.data ? response.data : [];
        const totalCount = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
        $('#cartCount').text(totalCount);
      },
      error: function () {
        // Silently fail - cart count update is not critical
      }
    });
  }

  function filterByCategory() {
    const category = $searchInput.val().trim();
    if (category) {
      currentCategory = category;
      loadMenuItems(category);
    } else {
      showError('Please enter a category name');
    }
  }

  function clearFilter() {
    $searchInput.val('');
    currentCategory = null;
    loadMenuItems();
  }

  // Event handlers
  $filterBtn.on('click', filterByCategory);
  $clearBtn.on('click', clearFilter);

  $searchInput.on('keypress', function(e) {
    if (e.which === 13) {
      e.preventDefault();
      filterByCategory();
    }
  });

  // Load initial menu items
  loadMenuItems();
  updateCartCount();
});

