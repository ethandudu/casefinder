document.addEventListener('DOMContentLoaded', (event) => {
    //get cities from db
    window.electronAPI.sendToMain('get-cities', {});

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
            resetTable();
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

//fetch cities from main process
window.electronAPI.receiveFromMain('cities', (data) => {
    const citySelect = document.getElementById('city');
    const cityOwnerSelect = document.getElementById('cityowner');
    if (citySelect) {
        data.cities.forEach((city) => {
            const option = document.createElement('option');
            option.value = city.city;
            option.text = city.city;
            citySelect.add(option);

            const option2 = document.createElement('option');
            option2.value = city.city;
            option2.text = city.city;
            cityOwnerSelect.add(option2);
        });
    } else {
        console.error('Element with id "city" not found.');
    }
});


//fetch search results from main process
window.electronAPI.receiveFromMain('search-results', (data) => {
    document.getElementById('results').style.display = 'block';
    const table = document.getElementById('resultstable');
    if (data.error) {
        table.innerHTML = `<tr><td colspan="5">${data.error}</td></tr>`;
    } else {
        //populate table with results
        data.results.forEach((row) => {
            table.innerHTML += `<tr>
                <td>${row.case}</td>
                <td>${row.city}</td>
                <td>${row.section}</td>
                <td>${row.plot}</td>
                <td>${row.owner}</td>
            </tr>`;
        });
    }
});

function resetTable() {
    const table = document.getElementById('resultstable');
    table.innerHTML = `<tr>
        <th scope="col">N° Dossier</th>
        <th scope="col">Commune</th>
        <th scope="col">Section</th>
        <th scope="col">Parcelle</th>
        <th scope="col">Propriétaire</th>
    </tr>`;

}