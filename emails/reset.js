const keys = require('../keys');

module.exports = function(email, token) {
    return {
        to: email,
        from: keys.EMAIL_FROM,
        subject: 'Restore access',
        html: `
            <h1>Forgot your password?</h1>  
            <p>If not, ignore this email</p>
            <p>Otherwise, click on the link:</p>
            <p><a href="${keys.BASE_URL}/auth/password/${token}">Restore access</a></p>
            <hr />
            <a href="${keys.BASE_URL}">Course App</a>
        `
    }
}
