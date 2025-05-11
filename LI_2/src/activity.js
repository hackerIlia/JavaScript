/**
 * Function that fetches a random word from an external API.
 * It retrieves a Response object from the API and converts it to JSON, then returns the data as an Promise<object>.
 * If an error occurs, in the console is displayed error message and is returned required error string.
 * @returns {Promise<object>} - Returns a promise that resolves to an object containing a random word.     
 */
export async function getRandomActivity() {
    try {
        let response = await fetch('https://random-word-api.vercel.app/api?words=1', {
            mode: 'cors',
            method: 'GET',
            headers: {
                // 'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        let data = await response.json();
        return data;
    }
    catch(error){
        console.error("Error fetching data: ", error);
        return "К сожалению, произошла ошибка";
    }
}
