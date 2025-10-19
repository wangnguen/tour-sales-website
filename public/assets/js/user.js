// Login Form
const loginForm = document.querySelector('#login-form');
if (loginForm) {
  const validation = new JustValidate('#login-form');

  validation
    .addField('#email', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập email của bạn!'
      },
      {
        rule: 'email',
        errorMessage: 'Email không đúng định dạng!'
      }
    ])
    .addField('#password', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập mật khẩu!'
      },
      {
        validator: (value) => value.length >= 8,
        errorMessage: 'Mật khẩu phải chứa ít nhất 8 ký tự!'
      },
      {
        validator: (value) => /[A-Z]/.test(value),
        errorMessage: 'Mật khẩu phải chứa ít nhất một chữ cái in hoa!'
      },
      {
        validator: (value) => /[a-z]/.test(value),
        errorMessage: 'Mật khẩu phải chứa ít nhất một chữ cái thường!'
      },
      {
        validator: (value) => /\d/.test(value),
        errorMessage: 'Mật khẩu phải chứa ít nhất một chữ số!'
      },
      {
        validator: (value) => /[@$!%*?&]/.test(value),
        errorMessage: 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt!'
      }
    ])
    .onSuccess((event) => {
      const email = event.target.email.value;
      const password = event.target.password.value;
      const rememberPassword = event.target.rememberPassword.checked;

      const dataFinal = {
        email: email,
        password: password,
        rememberPassword: rememberPassword
      };

      fetch(`/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataFinal)
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.code == 'error') {
            if (data.code == 'error') {
              Swal.fire({
                icon: 'error',
                title: 'Đăng nhập thất bại',
                text: data.message,
                confirmButtonText: 'OK'
              });
            }
          }

          if (data.code == 'success') {
            if (data.code == 'success') {
              Swal.fire({
                icon: 'success',
                title: 'Đăng nhập thành công!',
                showConfirmButton: false,
                timer: 1500
              }).then(() => {
                window.location.href = `/`;
              });
            }
          }
        });
    });
}
// End Login Form

// Register Form
const registerForm = document.querySelector('#register-form');
if (registerForm) {
  const validation = new JustValidate('#register-form');
  validation
    .addField('#fullName', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập họ tên!'
      },
      {
        rule: 'minLength',
        value: 5,
        errorMessage: 'Họ tên phải có ít nhất 5 ký tự!'
      },
      {
        rule: 'maxLength',
        value: 50,
        errorMessage: 'Họ tên không được vượt quá 50 ký tự!'
      }
    ])
    .addField('#email', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập email của bạn!'
      },
      {
        rule: 'email',
        errorMessage: 'Email không đúng định dạng!'
      }
    ])
    .addField('#password', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập mật khẩu!'
      },
      {
        validator: (value) => value.length >= 8,
        errorMessage: 'Mật khẩu phải chứa ít nhất 8 ký tự!'
      },
      {
        validator: (value) => /[A-Z]/.test(value),
        errorMessage: 'Mật khẩu phải chứa ít nhất một chữ cái in hoa!'
      },
      {
        validator: (value) => /[a-z]/.test(value),
        errorMessage: 'Mật khẩu phải chứa ít nhất một chữ cái thường!'
      },
      {
        validator: (value) => /\d/.test(value),
        errorMessage: 'Mật khẩu phải chứa ít nhất một chữ số!'
      },
      {
        validator: (value) => /[@$!%*?&]/.test(value),
        errorMessage: 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt!'
      }
    ])
    .addField('#agree', [
      {
        rule: 'required',
        errorMessage: 'Bạn phải đồng ý với các điều khoản và điều kiện!'
      }
    ])
    .onSuccess((event) => {
      const fullName = event.target.fullName.value;
      const email = event.target.email.value;
      const password = event.target.password.value;

      const dataFinal = {
        fullName: fullName,
        email: email,
        password: password
      };

      fetch(`/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataFinal)
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.code == 'error') {
            if (data.code == 'error') {
              Swal.fire({
                icon: 'error',
                title: 'Đăng ký thất bại',
                text: data.message,
                confirmButtonText: 'OK'
              });
            }
          }

          if (data.code == 'success') {
            Swal.fire({
              icon: 'success',
              title: 'Đăng ký thành công!',
              showConfirmButton: false,
              timer: 1500
            }).then(() => {
              window.location.href = `/auth/register-initial`;
            });
          }
        });
    });
}
// End Register Form

// Forgot Password Form
const forgotPasswordForm = document.querySelector('#forgot-password-form');
if (forgotPasswordForm) {
  const validation = new JustValidate('#forgot-password-form');

  validation
    .addField('#email', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập email của bạn!'
      },
      {
        rule: 'email',
        errorMessage: 'Email không đúng định dạng!'
      }
    ])
    .onSuccess((event) => {
      const email = event.target.email.value;

      const dataFinal = {
        email: email
      };

      fetch(`/auth/forgot_password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataFinal)
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.code == 'error') {
            Swal.fire({
              icon: 'error',
              title: 'Yêu cầu thất bại',
              text: data.message,
              confirmButtonText: 'OK'
            });
          }
          if (data.code == 'success') {
            window.location.href = `/auth/otp_password?email=${email}`;
          }
        });
    });
}
// End Forgot Password Form

// OTP Password Form
const otpPasswordForm = document.querySelector('#otp-password-form');
if (otpPasswordForm) {
  const validation = new JustValidate('#otp-password-form');

  validation
    .addField('#otp', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập mã OTP!'
      }
    ])
    .onSuccess((event) => {
      const otp = event.target.otp.value;

      const urlParams = new URLSearchParams(window.location.search);
      const email = urlParams.get('email');

      const dataFinal = {
        otp: otp,
        email: email
      };

      fetch(`/auth/otp_password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataFinal)
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.code == 'error') {
            Swal.fire({
              icon: 'error',
              title: 'Yêu cầu thất bại',
              text: data.message,
              confirmButtonText: 'OK'
            });
          }

          if (data.code === 'success') {
            window.location.href = `/auth/reset_password`;
          }
        });
    });
}
// End OTP Password Form

// Reset Password Form
const resetPasswordForm = document.querySelector('#reset-password-form');
if (resetPasswordForm) {
  const validation = new JustValidate('#reset-password-form');

  validation
    .addField('#password', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập mật khẩu!'
      },
      {
        validator: (value) => value.length >= 8,
        errorMessage: 'Mật khẩu phải chứa ít nhất 8 ký tự!'
      },
      {
        validator: (value) => /[A-Z]/.test(value),
        errorMessage: 'Mật khẩu phải chứa ít nhất một chữ cái in hoa!'
      },
      {
        validator: (value) => /[a-z]/.test(value),
        errorMessage: 'Mật khẩu phải chứa ít nhất một chữ cái thường!'
      },
      {
        validator: (value) => /\d/.test(value),
        errorMessage: 'Mật khẩu phải chứa ít nhất một chữ số!'
      },
      {
        validator: (value) => /[@$!%*?&]/.test(value),
        errorMessage: 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt!'
      }
    ])
    .addField('#confirm-password', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng xác nhận mật khẩu!'
      },
      {
        validator: (value, fields) => {
          const password = fields['#password'].elem.value;
          return value == password;
        },
        errorMessage: 'Mật khẩu xác nhận không khớp!'
      }
    ])
    .onSuccess((event) => {
      const password = event.target.password.value;
      const confirmPassword = event.target['confirm-password'].value;

      const dataFinal = {
        password: password,
        confirmPassword: confirmPassword
      };

      fetch(`/auth/reset_password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataFinal)
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.code == 'error') {
            if (data.code == 'error') {
              Swal.fire({
                icon: 'error',
                title: 'Yêu cầu thất bại',
                text: data.message,
                confirmButtonText: 'OK'
              });
            }
          }

          if (data.code == 'success') {
            Swal.fire({
              icon: 'success',
              title: 'Đổi mật khẩu thành công!',
              showConfirmButton: false,
              timer: 1500
            }).then(() => {
              window.location.href = `/`;
            });
          }
        });
    });
}
// End Reset Password Form
