import { getRandomActivity } from "./activity.js";

const element = document.getElementById("activity");

/**
 * Function for displaying data on HTML page
 * It retrieves data from imported function and updates text content of an <i> element
 */
async function updateData() {
    let data = await getRandomActivity();
    element.textContent = data;

    setTimeout(updateData, 1000 * 60);
}        

updateData();