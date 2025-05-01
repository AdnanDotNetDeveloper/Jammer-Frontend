
    const orderTable = document.getElementById('orderBody');
    const itemPopup = document.getElementById('itemPopup');
    const itemDetails = document.getElementById('itemDetails');
    const closePopup = document.getElementById('closePopup');

const token = Cookies.get('Token');

    async function fetchOrders() {
        const response = await fetch('https://jammerapi.mahmadamin.com/api/Order/GetOrdersByUserId', {
            headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
        });
    const data = await response.json();

            data.data.forEach(order => {
                const row = document.createElement('tr');

    const orderId = document.createElement('td');
    orderId.classList.add('px-4', 'py-2', 'border');
    orderId.textContent = order.orderId;
    row.appendChild(orderId);

    const totalAmount = document.createElement('td');
    totalAmount.classList.add('px-4', 'py-2', 'border');
    totalAmount.textContent = ` PKR : ${order.totalAmount}`;
    row.appendChild(totalAmount);

    const status = document.createElement('td');
    status.classList.add('px-4', 'py-2', 'border');
    status.textContent = order.status;
    row.appendChild(status);

    const orderDate = document.createElement('td');
    orderDate.classList.add('px-4', 'py-2', 'border');
    orderDate.textContent = new Date(order.orderDate).toLocaleDateString();
    row.appendChild(orderDate);

    const itemsCount = document.createElement('td');
    itemsCount.classList.add('px-4', 'py-2', 'border');
    itemsCount.textContent = order.items.length;
    row.appendChild(itemsCount);

    const actions = document.createElement('td');
    actions.classList.add('px-4', 'py-2', 'border');
    const viewBtn = document.createElement('button');
    viewBtn.textContent = 'View';
    viewBtn.classList.add('px-4', 'py-2', 'bg-blue', 'text-white', 'rounded');
                viewBtn.addEventListener('click', () => showOrderItems(order.items));
    actions.appendChild(viewBtn);
    row.appendChild(actions);

    orderTable.appendChild(row);
            });
        }

    function showOrderItems(items) {
        itemDetails.innerHTML = '';
            items.forEach(item => {
                const itemDiv = document.createElement('div');
    itemDiv.textContent = `${item.productName} -  PKR : ${item.price}`;
    itemDetails.appendChild(itemDiv);
            });
    itemPopup.classList.remove('hidden');
        }

        closePopup.addEventListener('click', () => {
        itemPopup.classList.add('hidden');
        });

    fetchOrders();
