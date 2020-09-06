async function getCurrency() {
    let url = "https://poe.ninja/api/data/CurrencyOverview";

    try {
        let response = await fetch(url);
        console.log("Got response")
        return await response.json();
    } catch (error) {
        console.log(error);
    }
}

getCurrency()