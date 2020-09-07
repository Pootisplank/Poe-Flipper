async function getCurrency() {
    // var url = "https://poe.ninja/api/data/CurrencyOverview?league=Harvest&type=Currency&language=en";

    var myHeaders = new Headers();
    myHeaders.append('Access-Control-Allow-Origin', '*')

    var requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow'
    };

    // try {
    //     let response = await fetch(url, requestOptions);
    //     console.log("Got response");
    //     console.log(response);
    //     return await response.json();
    // } catch (error) {
    //     console.log(error);
    // }

    fetch("https://poe.ninja/api/data/currencyoverview?league=Harvest&type=Currency&language=en", requestOptions)
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));
}

getCurrency()