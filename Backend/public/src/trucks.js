$(document).ready(function () {
  const $trucksContainer = $('#trucksContainer');
  const $noTrucksMessage = $('#noTrucksMessage');
  const $trucksError = $('#trucksError');

  function showError(message) {
    $trucksError.text(message).show();
  }

  function clearError() {
    $trucksError.hide().text('');
  }

  function renderTrucks(trucks) {
    $trucksContainer.empty();

    if (!trucks || trucks.length === 0) {
      $noTrucksMessage.show();
      return;
    }

    $noTrucksMessage.hide();

    trucks.forEach(truck => {
      const name = truck.truckName || 'Unnamed Truck';
      const statusOpen = truck.truckStatus === 'available' && truck.orderStatus === 'available';
      const statusLabel = statusOpen ? 'Open' : 'Closed';
      const statusClass = statusOpen ? 'bg-success' : 'bg-danger';
      const truckId = truck.truckId;

      const $card = $(`
        <div class="col-sm-6 col-md-4 col-lg-3">
          <div class="truck-card">
            <div class="truck-icon">🚚</div>
            <h6></h6>
            <span class="badge ${statusClass}" style="margin-bottom: 15px;"></span>
            <div style="margin-top: 15px;">
              <button class="btn btn-warning btn-block view-menu-btn" ${statusOpen ? '' : 'disabled'}>
                🍽 VIEW MENU
              </button>
            </div>
          </div>
        </div>
      `);

      $card.find('h6').text(name);
      $card.find('.badge').text(statusLabel);

      $card.find('.view-menu-btn').on('click', function () {
        if (!truckId) return;
        window.location.href = `/truckMenu/${truckId}`;
      });

      $trucksContainer.append($card);
    });
  }

  function loadTrucks() {
    clearError();

    $.ajax({
      type: 'GET',
      url: '/api/v1/trucks/view',
      success: function (response) {
        const trucks = response && response.data ? response.data : [];
        renderTrucks(trucks);
      },
      error: function (xhr) {
        let message = 'Failed to load trucks.';
        if (xhr && xhr.responseJSON && xhr.responseJSON.error) {
          message = xhr.responseJSON.error;
        }
        showError(message);
      }
    });
  }

  loadTrucks();
});


