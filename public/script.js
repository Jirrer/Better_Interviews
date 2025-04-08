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
    const companyContainer = document.getElementById('Offers'); // Container for company names
    const dateContainer = document.getElementById('OffersDate'); // Container for dates

    if (companyContainer && dateContainer) {
        try {
            const interviewType = "Offered";
            const response = await fetch(`/api/interviewsByGenre?interviewType=${interviewType}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch ${interviewType} interviews`);
            }

            const data = await response.json(); // Parse the JSON response
            const interviews = data.interviews; // Extract the list of interviews

            // Update the content of the containers with the fetched data
            if (interviews.length > 0) {
                // Populate company names
                companyContainer.innerHTML = `<ul>${interviews
                    .map(interview => `<li>${interview.companyName}</li>`)
                    .join('')}</ul>`;

                // Populate dates
                dateContainer.innerHTML = `<ul>${interviews
                    .map(interview => `<li>${interview.date}</li>`)
                    .join('')}</ul>`;
            } else {
                companyContainer.textContent = "No offers available.";
                dateContainer.textContent = "No dates available.";
            }
        } catch (error) {
            console.error("Error updating offers:", error);
            companyContainer.textContent = "Error fetching offers"; // Display an error message in the company container
            dateContainer.textContent = "Error fetching dates"; // Display an error message in the date container
        }
    } else {
        console.error("One or both containers not found in the DOM.");
    }
}

async function updateRejects() {
    const companyContainer = document.getElementById('Rejects'); 
    const dateContainer = document.getElementById('RejectedDate'); 

    if (companyContainer && dateContainer) {
        try {
            // Fetch the names of "Offered" interviews
            const interviewType = "Rejected";
            const response = await fetch(`/api/interviewsByGenre?interviewType=${interviewType}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch ${interviewType} interviews`);
            }

            const data = await response.json(); // Parse the JSON response
            const interviews = data.interviews; // Extract the list of interview names

            // Update the content of the container with the fetched data
            if (interviews.length > 0) {
                companyContainer.innerHTML = `<ul>${interviews
                    .map(interview => `<li>${interview.companyName}</li>`)
                    .join('')}</ul>`;

                // Populate dates
                dateContainer.innerHTML = `<ul>${interviews
                    .map(interview => `<li>${interview.date}</li>`)
                    .join('')}</ul>`;
            } else {
                container.textContent = "No offers available.";
            }
        } catch (error) {
            console.error("Error updating rejects:", error);
            container.textContent = "Error fetching rejects"; 
        }
    } else {
        console.error("Reject container not found in the DOM.");
    }
}

async function updatePending() {
    const companyContainer = document.getElementById('Pending');
    const dateContainer = document.getElementById('PendingDate'); 

    if (companyContainer && dateContainer) {
        try {
            // Fetch the names of "Offered" interviews
            const interviewType = "Pending";
            const response = await fetch(`/api/interviewsByGenre?interviewType=${interviewType}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch ${interviewType} interviews`);
            }

            const data = await response.json(); // Parse the JSON response
            const interviews = data.interviews; // Extract the list of interview names


            // Update the content of the container with the fetched data
            if (interviews.length > 0) {
                companyContainer.innerHTML = `<ul>${interviews
                    .map(interview => `<li>${interview.companyName}</li>`)
                    .join('')}</ul>`;

                // Populate dates
                dateContainer.innerHTML = `<ul>${interviews
                    .map(interview => `<li>${interview.date}</li>`)
                    .join('')}</ul>`;
            } else {
                container.textContent = "No offers available.";
            }
        } catch (error) {
            console.error("Error updating pending:", error);
            container.textContent = "Error fetching pending"; // Display an error message in the div
        }
    } else {
        console.error("Pending container not found in the DOM.");
    }
}

updateCharts();