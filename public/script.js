// To - Do
// add errors for functions

let UserId = null

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

        updateValue('Pending_Value', 2);
        updateValue('Offered_Value', 3);
        updateValue('Rejected_Value', 2);

        updateFillPercentage('Pending_Container', (getChartValue('Pending_Value') / totalInterviews) * 100);
        updateFillPercentage('Offered_Container', (getChartValue('Offered_Value') / totalInterviews) * 100);
        updateFillPercentage('Rejected_Container', (getChartValue('Rejected_Value') / totalInterviews) * 100);
    } catch (error) {
        console.error("Error updating charts:", error);
    }
}

updateCharts();