// To - Do
// add errors for functions

let UserId = null;
let OfferCount = 0;
let PendingCount = 0;
let RejectedCount = 0;

function handlePendingClick() {
    window.location.href = "/pendingPage.html";
}

function handleOfferedClick() {
    window.location.href = "/offeredPage.html";

}

function handleRejectedClick() {
    window.location.href = "/rejectedPage.html";
}

fetch("/api/user-id")
    .then((response) => response.json())
    .then((data) => {
        if (data.userId) {
            console.log("User ID:", data.userId);
            UserId = data.userId;
        } else {
            console.error("No user ID found.");
        }
    })
    .catch((error) => console.error("Error fetching user ID:", error));

fetch(`/api/interviewsByGenre?interviewType=${'Offered'}`)
    .then((response) => {
        if (!response.ok) {
            throw new Error("Failed to fetch interviews by genre");
        }
        return response.json();
    })
    .then((data) => {
        console.log("Total Interviews:", data.totalInterviews);
    })
    .catch((error) => {
        console.error("Error:", error);
    });

function updateFillPercentage(containerId, percentage) {
    const container = document.getElementById(containerId);
    if (container) {
        container.style.setProperty('--fill-percentage', `${percentage}%`);
    }
}

function updateValue(containerId, value) {
    const container = document.getElementById(containerId);
    if (container) {
        container.textContent = value
    }
}

async function updateTotalInterviews() {
    try {
        const response = await fetch("/api/total-interviews");
        if (!response.ok) {
            throw new Error("Failed to fetch total interviews");
        }

        const data = await response.json();
        const totalInterviews = data.totalInterviews; 

        console.log("Total Interviews:", totalInterviews);

        const totalElements = document.querySelectorAll('.Total_Interviews');
        totalElements.forEach(element => {
            element.textContent = totalInterviews;
        });

        return totalInterviews; 
    } catch (error) {
        console.error("Error fetching total interviews:", error);
        return 0; 
    }
}

function getTotalInterviews() {
    const totalElement = document.querySelector('.Total_Interviews'); 
    if (totalElement) {
        return parseInt(totalElement.textContent, 10);
    }
    return 0;
}

function getChartValue(chartId) {
    const value = document.getElementById(chartId);
    if (value) {
        return parseInt(value.textContent, 10);
    } 
}

async function updateCharts() {
    try {
        const totalInterviews = await updateTotalInterviews();

        updateOffers();
        updateRejects();
        updatePending();

        await fetchCountsForStatus();

        // Update the values in the DOM
        updateValue('Offered_Value', OfferCount);
        updateValue('Rejected_Value', RejectedCount);
        updateValue('Pending_Value', PendingCount)

        updateFillPercentage('Pending_Container', (getChartValue('Pending_Value') / totalInterviews) * 100);
        updateFillPercentage('Offered_Container', (getChartValue('Offered_Value') / totalInterviews) * 100);
        updateFillPercentage('Rejected_Container', (getChartValue('Rejected_Value') / totalInterviews) * 100);
    } catch (error) {
        console.error("Error updating charts:", error);
   
    }
}

async function fetchCountsForStatus() {
    try {
        // Fetch Offered count
        const offeredResponse = await fetch(`/api/interviewsByGenre?interviewType=Offered`);
        if (!offeredResponse.ok) {
            throw new Error("Failed to fetch Offered interviews");
        }
        const offeredData = await offeredResponse.json();
        OfferCount = offeredData.interviews.length; // Update global variable

        // Fetch Rejected count
        const rejectedResponse = await fetch(`/api/interviewsByGenre?interviewType=Rejected`);
        if (!rejectedResponse.ok) {
            throw new Error("Failed to fetch Rejected interviews");
        }
        const rejectedData = await rejectedResponse.json();
        RejectedCount = rejectedData.interviews.length; // Update global variable

        // Fetch Pending count
        const pendingResponse = await fetch(`/api/interviewsByGenre?interviewType=Pending`);
        if (!pendingResponse.ok) {
            throw new Error("Failed to fetch Pending interviews");
        }
        const pendingData = await pendingResponse.json();
        PendingCount = pendingData.interviews.length; // Update global variable

    
    } catch (error) {
        console.error("Error fetching counts for status:", error);
    }
}


async function updateOffers() {
    const container = document.getElementById('Offers'); // Get the div with ID 'Offers'

    if (container) {
        try {
            // Fetch the names of "Offered" interviews
            const interviewType = "Offered";
            const response = await fetch(`/api/interviewsByGenre?interviewType=${interviewType}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch ${interviewType} interviews`);
            }

            const data = await response.json(); // Parse the JSON response
            const offerNames = data.interviews; // Extract the list of interview names

            // Update the content of the container with the fetched data
            if (offerNames.length > 0) {
                container.innerHTML = `<ul>${offerNames.map(name => `<li>${name}</li>`).join('')}</ul>`;
            } else {
                container.textContent = "No offers available.";
            }
        } catch (error) {
            console.error("Error updating offers:", error);
            container.textContent = "Error fetching offers"; // Display an error message in the div
        }
    } else {
        console.error("Offers container not found in the DOM.");
    }
}

async function updateRejects() {
    const container = document.getElementById('Rejects'); // Get the div with ID 'Offers'

    if (container) {
        try {
            // Fetch the names of "Offered" interviews
            const interviewType = "Rejected";
            const response = await fetch(`/api/interviewsByGenre?interviewType=${interviewType}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch ${interviewType} interviews`);
            }

            const data = await response.json(); // Parse the JSON response
            const rejectNames = data.interviews; // Extract the list of interview names

            // Update the content of the container with the fetched data
            if (rejectNames.length > 0) {
                container.innerHTML = `<ul>${rejectNames.map(name => `<li>${name}</li>`).join('')}</ul>`;
            } else {
                container.textContent = "No offers available.";
            }
        } catch (error) {
            console.error("Error updating rejects:", error);
            container.textContent = "Error fetching offers"; // Display an error message in the div
        }
    } else {
        console.error("Reject container not found in the DOM.");
    }
}

async function updatePending() {
    const container = document.getElementById('Pending'); // Get the div with ID 'Offers'

    if (container) {
        try {
            // Fetch the names of "Offered" interviews
            const interviewType = "Pending";
            const response = await fetch(`/api/interviewsByGenre?interviewType=${interviewType}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch ${interviewType} interviews`);
            }

            const data = await response.json(); // Parse the JSON response
            const pendingNames = data.interviews; // Extract the list of interview names


            // Update the content of the container with the fetched data
            if (pendingNames.length > 0) {
                container.innerHTML = `<ul>${pendingNames.map(name => `<li>${name}</li>`).join('')}</ul>`;
            } else {
                container.textContent = "No offers available.";
            }
        } catch (error) {
            console.error("Error updating pending:", error);
            container.textContent = "Error fetching offers"; // Display an error message in the div
        }
    } else {
        console.error("Pending container not found in the DOM.");
    }
}

updateCharts();