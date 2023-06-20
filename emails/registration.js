const keys = require('../keys');

module.exports = function(email) {
    return {
        to: email,
        from: keys.EMAIL_FROM,
        subject: 'Successful registration',
        html: `
            <h1>Welcome!</h1>  
            <p>Account ${email} was successfully created.</p>
            <hr />
            <a href="${keys.BASE_URL}">Course App</a>
        `
    }
}
