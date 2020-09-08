function buildTable (data) {

    lines = data.lines;

    for (var i = 0; i < lines.length; i++) {
        var row = 
        `<tr>
            <td>${data[i].currencyTypeName}</td>
        </tr>`
        var table = $('MyTable')
        table.innerHTML += row
    }
}

async function main() {
    const data = await getCurrency();
    buildTable(data)
}