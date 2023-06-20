const toCurrency = price => {
    return new Intl.NumberFormat('en-US', {
        style: "currency",
        currency: "USD"
    }).format(price);
}

const toDate = date => {
    return new Intl.DateTimeFormat('en-US', {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    }).format(date);    
}

document.querySelectorAll('.price').forEach(e => {
    e.textContent = toCurrency(e.textContent);
});

document.querySelectorAll('.date').forEach(e => {
    const date = new Date(e);
    date.textContent = toDate(date.textContent);
});

const $cart = document.querySelector('#cart');

if ($cart) {
    $cart.addEventListener('click', event => {
        if (event.target.classList.contains('js-remove')) {
            const id = event.target.dataset.id;
            const csrf = event.target.dataset.csrf;
            
            fetch('/cart/remove/' + id, {
                method: 'delete',
                headers: {
                    'X-XSRF-TOKEN': csrf
                }
            }).then(res => res.json())
            .then(cart => {
                if (cart.courses.length) {
                    const html = cart.courses.map(e => {
                        return `
                        <tr>
                            <td>${e.title}</td>
                            <td>${e.price}</td>
                            <td>${e.count}</td>
                            <td><button class="btn btn-small js-remove" data-id="${e.id}">Delete</button></td>
                        </tr>
                        `;
                    }).join('');
                    $cart.querySelector('tbody').innerHTML = html;
                    $cart.querySelector('.price').textContent = toCurrency(cart.price);
                } else {
                    $cart.innerHTML = '<p>Cart is empty</p>';
                }  
            });
        }   
    });
}

var instance = M.Tabs.init(document.querySelectorAll('.tabs'));
