// To - Do
// add errors for functions

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

function updateTotalInterviews(total) {
    const totalElements = document.querySelectorAll('.Total_Interviews');
    totalElements.forEach(element => {
        element.textContent = total; 
    });
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

updateTotalInterviews(7);
updateValue('Pending_Value', 2);
updateValue('Offered_Value', 3);
updateValue('Rejected_Value', 2);
updateFillPercentage('Pending_Container', (getChartValue('Pending_Value')/getTotalInterviews()) * 100);
updateFillPercentage('Offered_Container', (getChartValue('Offered_Value')/getTotalInterviews()) * 100);
updateFillPercentage('Rejected_Container', (getChartValue('Rejected_Value')/getTotalInterviews()) * 100);