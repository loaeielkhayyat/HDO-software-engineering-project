$(document).ready(function () {
  function showRegisterError(message) {
    $('#registerError').text(message).show();
  }

  function clearRegisterError() {
    $('#registerError').hide().text('');
  }

  $('#name, #date, #email, #password').on('input change', function () {
    clearRegisterError();
  });

  $('#register').click(function () {
    const name = $('#name').val().trim();
    const birthDate = $('#date').val().trim();
    const email = $('#email').val().trim();
    const password = $('#password').val().trim();

    if (!name || !birthDate || !email || !password) {
      showRegisterError('Please fill in all required fields.');
      return;
    }

    const data = {
      name: name,
      email: email,
      birthDate: birthDate,
      password: password
    };

      $.ajax({
        type: "POST",
        url: '/api/v1/user',
        data : data,
        success: function(serverResponse) {
            alert("successfully registered user")
            location.href = '/';
        },
        error: function(errorResponse) {
            alert(`Error Register User: ${errorResponse.responseText}`);
        }
      });
    });      
  });