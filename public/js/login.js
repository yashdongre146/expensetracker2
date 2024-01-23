const loginEmail = document.getElementById('login-email');
const loginPassword = document.getElementById('login-password');

function login(e) {
    e.preventDefault();

    const loginDetails = {
        email: loginEmail.value,
        password: loginPassword.value
    }
    axios.post(`/login`, loginDetails)
        .then((res) => {
                console.log(res.data.token);
                localStorage.setItem('token', res.data.token)
                window.location.href = '/home';
        }).catch((err) => {
            if (err.response && (err.response.status === 404 || err.response.status === 422 || err.response.status === 500)) {
                alert(err.response.data.message);
            } else {
                alert('An error occurred.');
            }            
        });
}
async function forgotPassword(e) {
    e.preventDefault();
    const forgotEmail = document.getElementById('forgot-email');
    
    try {
        await axios.post('/forgotPassword', { forgotEmail: forgotEmail.value });
        alert('Email sent.');
        window.location.href = '/login';
    } catch (err) {
        if (err.response && err.response.status === 401) {
            alert('Email not found.');
        } else if (err.response && err.response.status === 500) {
            alert('Something went wrong.');
        } else {
            alert('An error occurred.');
        }
    }
}
function toggleForm(e) {
    e.preventDefault();
    document.getElementById('forgotForm').style.display = 'block';
    document.getElementById('loginForm').style.display = 'none';
    document.getElementsByTagName('a')[0].style.display = 'block';
    document.getElementsByTagName('a')[1].style.display = 'none';
    document.getElementsByTagName('a')[2].style.display = 'none';
}