const expenseAmount = document.getElementById('expenseamount');
const chooseDescription = document.getElementById('choosedescription');
const selectCategory = document.getElementById('selectcategory');
const token = localStorage.getItem('token');
const ul = document.getElementById('list');

function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}
window.addEventListener('DOMContentLoaded', async () => {
    try {
        const decodedToken = parseJwt(token);

        if (decodedToken.isPremiumUser) {
            document.getElementById('rzp-button').style.display = "none"
            document.getElementById('isPremium').style.display = "block"
        }
        const limit = localStorage.getItem('limit') || 10;
        
        const res = await axios.get(`/getExpense?page=1&limit=${limit}`, {headers: {'auth': token}});
        
        for (let i = 0; i < res.data.expenses.length; i++) {
          showOnScreen(res.data.expenses[i]);
        }

        showPagignation(res.data)
    } catch (err) {
        console.log(err);
    }
})
async function addExpense(e){
    try {
        e.preventDefault();
        const expenseDetails = {
            amount: expenseAmount.value,
            description: chooseDescription.value,
            category: selectCategory.value
        }

        await axios.post('/addExpense', expenseDetails, {headers: {'auth': token}});
        alert("Successfully added.");
        location.reload('/');
    } catch (err) {
        console.log(err);
    }
}
async function deleteExpense(expenseId) {
    try {
        await axios.delete(`/deleteExpense/${expenseId}`, {headers: {'auth': token}})
        alert("Expense deleted")
        location.reload('/')
    } catch (err) {
        console.log(err);
    }
}
function showOnScreen(expense){
    const li = document.createElement('li');

    li.appendChild(document.createTextNode(`${expense.amount} - ${expense.description} - ${expense.category} `));

    // adding a delete button
    const del = document.createElement('button');
    del.appendChild(document.createTextNode('Delete Expense'));

    li.appendChild(del);
    ul.appendChild(li);

    del.addEventListener('click', () => deleteExpense(expense.id));
    del.addEventListener('click', deleteExpenseFromScreen);

    function deleteExpenseFromScreen(){
        ul.remove(li);
    }
}
document.getElementById('rzp-button').addEventListener('click', async () => {
    try {
      const purchaseResponse = await axios.get('/purchase', { headers: { "auth": token } });
      const options = {
        "key": purchaseResponse.data.key_id,
        "order_id": purchaseResponse.data.order.id,
        "handler": async (res) => {
          try {
            const updateResponse = await axios.post('/updateTransactionStatus', {
                order_id: options.order_id,
                payment_id: res.razorpay_payment_id
            }, { headers: { "auth": token } });

            alert("Congrats! you are a premium member now.");
            document.getElementById('rzp-button').style.display = "none";
            document.getElementById('isPremium').style.display = "block";
            localStorage.setItem('token', updateResponse.data.token);
          } catch (error) {
            console.error(error);
            alert("Something went wrong");
          }
        }
      };
  
      const rzp = new Razorpay(options);
      rzp.open();
      rzp.on('payment.failed', (res) => {
        console.log(res);
        alert("Something went wrong");
      });
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
});
document.getElementById('showLeaderboard').addEventListener('click', async () => {
    try {
      const res = await axios.get('/showLeaderboard', { headers: { "auth": token } });
      
      const ul = document.getElementById('leaderboard');
      res.data.forEach((result) => {
        const li = document.createElement('li');
        li.appendChild(document.createTextNode(`Name ${result.name}, Total Expense ${result.totalAmount}`));
        ul.appendChild(li);
      });
    } catch (error) {
      console.error(error);
    }
});
document.getElementById('showHistory').addEventListener('click', async () => {
    try {
      const res = await axios.get('/showHistory', { headers: { "auth": token } });

      const table = document.getElementById('table');
      const caption = document.createElement('caption');
      caption.appendChild(document.createTextNode("Show History"))

      for (const file of res.data) {
        // converting into local date string
        const newDate = new Date(file.updatedAt);
        const options = {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        };
      
        const formattedDate = newDate.toLocaleDateString('en-US', options);
      
        const a = document.createElement('a');
        a.appendChild(document.createTextNode(formattedDate));
        a.href = file.fileUrl;
        a.download = formattedDate;
      
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        
        td.appendChild(a);
        tr.appendChild(td);
        table.appendChild(caption);
        table.appendChild(tr);
      }
      

    } catch (error) {
      alert("Something went wrong")
    }
});
document.getElementById('download').addEventListener('click', async () => {
  try {
    const res = await axios.get('/download', {
        headers: { "auth": token }
    });

    const a = document.createElement('a');
    a.href = res.data.fileUrl;
    a.download = 'myExpenses.csv';

    a.click();
  } catch (err) {
    alert("Something went wrong!")
  }
});
function showPagignation(pageData) {
  if (pageData.hasNextPage) {
    document.getElementById('next').removeAttribute('disabled');
    document.getElementById('next').addEventListener('click', () => getExpenses(pageData.nextPage));
  }else{
      document.getElementById('next').setAttribute('disabled', 'true');
  }
  if (pageData.hasPreviousPage) {
    document.getElementById('prev').removeAttribute('disabled');
    document.getElementById('prev').addEventListener('click', () => getExpenses(pageData.previousPage));
  }else{
    document.getElementById('prev').setAttribute('disabled', 'true');
  }
}
async function getExpenses(page) {
  try {
    const limit = localStorage.getItem('limit') || 10;

    const res = await axios.get(`/getExpense?page=${page}&limit=${limit}`,
        { headers: { "auth": token } });

    ul.innerHTML = '';
    for (let i = 0; i < res.data.expenses.length; i++) {
      showOnScreen(res.data.expenses[i]);
    }
    showPagignation(res.data)
  }
  catch (err) {
      alert(err.res.data.message)
  }
}
async function updateRows(e) {
  try {
      const limit = e.target.value;
      localStorage.setItem('limit', limit);
      location.reload('/')
  }
  catch (err) {
      alert("Something went wrong")
  }
}