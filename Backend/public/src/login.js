$(document).ready(function () {
  function showLoginError(message) {
    $('#loginError').text(message).show();
  }

  function clearLoginError() {
    $('#loginError').hide().text('');
  }

  $('#email, #password').on('input', function () {
    clearLoginError();
  });

  $('#submit').click(function () {
    const email = $('#email').val().trim();
    const password = $('#password').val().trim();

    if (!email || !password) {
      showLoginError('Please enter both email and password.');
      return;
    }

    const data = {
      email: email,
      password: password
    };

      $.ajax({
        type: "POST",
        url: '/api/v1/user/login',
        data,
        success: function(serverResponse) {
          if(serverResponse) {
            alert("login successfully");
            location.href = '/dashboard';
          }
        },
        error: function(errorResponse) {
          if(errorResponse) {
            alert(`User login error: ${errorResponse.responseText}`);
          }            
        }
      });
    });
  });