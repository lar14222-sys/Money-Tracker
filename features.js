const AppFeatures = {
    renderSummaryChart(catData) {
        const ctx = document.getElementById('summaryChart').getContext('2d');
        
        let labels = Object.keys(catData);
        let values = Object.values(catData);

        if (window.myChart instanceof Chart) {
            window.myChart.destroy();
        }

        if (labels.length === 0) {
            labels = ['ยังไม่มีรายจ่าย'];
            values = [1];
        }

        window.myChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: [
                        '#e74c3c', '#3498db', '#f1c40f', '#2ecc71', '#9b59b6', '#e67e22', '#1abc9c'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                    },
                    title: {
                        display: true,
                        text: 'สัดส่วนรายจ่ายตามหมวดหมู่'
                    }
                }
            }
        });
    }
};
