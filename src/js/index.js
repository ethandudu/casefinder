document.addEventListener('DOMContentLoaded', (event) => {
    const searchTypeSelect = document.getElementById('searchtype');

    if (searchTypeSelect) {
        searchTypeSelect.addEventListener('change', (event) => {
            console.log(`Search type changed to: ${event.target.value}`);
            if (event.target.value === 'owner') {
                //hide div with id "searchbycase"
                document.getElementById('plotsearch').style.display = 'none';
                document.getElementById('ownersearch').style.display = 'block';
            } else {
                //hide div with id "searchbyowner"
                document.getElementById('ownersearch').style.display = 'none';
                document.getElementById('plotsearch').style.display = 'block';
            }
        });
    } else {
        console.error('Element with id "searchtype" not found.');
    }

    const formButton = document.getElementById('searchbtn');

    if (formButton) {
        formButton.addEventListener('click', (event) => {
            event.preventDefault();
            if (document.getElementById('searchtype').value === 'plot') {
                if (!document.getElementById('city').value || !document.getElementById('section').value || !document.getElementById('plot').value) {
                    alert('Please fill all fields.');
                    return;
                }
                //sanitize input
                const city = document.getElementById('city').value;
                const section = document.getElementById('section').value;
                const plot = document.getElementById('plot').value;
                window.electronAPI.sendToMain('search', {
                    searchtype: 'plot',
                    city,
                    section,
                    plot,
                    owner: null
                });
            } else {
                if (!document.getElementById('cityowner').value || !document.getElementById('owner').value) {
                    alert('Please fill all fields.');
                    return;
                }
                const city = document.getElementById('cityowner').value;
                const owner = document.getElementById('owner').value;
                window.electronAPI.sendToMain('search', {
                    searchtype: 'owner',
                    city,
                    section: null,
                    plot: null,
                    owner
                });
            }
            
        });
    }
});

window.electronAPI.receiveFromMain('search-results', (data) => {
    //populate table with results
    document.getElementById('results').style.display = 'block';
    const table = document.getElementById('resultstablebody');
    if (data.error) {
        table.innerHTML = `<tr><td colspan="5">${data.error}</td></tr>`;
    } else {
        let tableRows = '';
        data.results.forEach((result) => {
            tableRows += `<tr>
                <td>${result.city}</td>
                <td>${result.section}</td>
                <td>${result.plot}</td>
                <td>${result.owner}</td>
                <td>${result.case}</td>
            </tr>`;
            table.innerHTML = tableRows;
        });
        
        table.style.display = 'block';

    }
});