let investments = JSON.parse(localStorage.getItem('investments')) || [];
let investedChart, currentChart;

function saveInvestments() {
    localStorage.setItem('investments', JSON.stringify(investments));
}

Chart.register(ChartDataLabels);

function updateCharts() {
    investments = investments.filter(inv => inv.invested !== 0 || inv.current !== 0);
    saveInvestments();

    const totalInvested = investments.reduce((sum, i) => sum + i.invested, 0);
    const totalCurrent = investments.reduce((sum, i) => sum + i.current, 0);
    
    let percentChange = ((totalCurrent / totalInvested - 1) * 100).toFixed(2);
    let percentColor = percentChange >= 0 ? "var(--positive)" : "var(--negative)";
    
    document.getElementById('totalInvested').textContent = `Total: € ${totalInvested.toFixed(2)}`;
    if(isNaN(percentChange)){
        percentChange = 0;
        percentColor = 0;
    }
    document.getElementById('totalCurrent').innerHTML = `Total: € ${totalCurrent.toFixed(2)} <span style="color:${percentColor}; font-weight: bold;">(${percentChange}%)</span>`;

    if (investedChart) investedChart.destroy();
    if (currentChart) currentChart.destroy();

    const labels = investments.map(i => i.name);
    const investedData = investments.map(i => i.invested);
    const currentData = investments.map(i => i.current);
    const colors = ["#3b82f6", "#facc15", "#22c55e", "#ef4444"];

    // Configuração do plugin para mostrar percentuais
    const chartOptions = {
        plugins: {
            legend: { position: 'bottom' },
            tooltip: { callbacks: { label: (tooltipItem) => `${tooltipItem.raw.toFixed(2)} (${((tooltipItem.raw / totalInvested) * 100).toFixed(2)}%)` } },
            datalabels: {
                color: "#fff",
                formatter: (value, ctx) => {
                    let percentage = ((value / totalInvested) * 100).toFixed(2);
                    return percentage + "%";
                }
            }
        }
    };

    // Criar gráficos
    investedChart = new Chart(document.getElementById('investedChart').getContext('2d'), {
        type: 'pie',
        data: { labels, datasets: [{ data: investedData, backgroundColor: colors }] },
        options: chartOptions
    });

    currentChart = new Chart(document.getElementById('currentChart').getContext('2d'), {
        type: 'pie',
        data: { labels, datasets: [{ data: currentData, backgroundColor: colors }] },
        options: chartOptions
    });

    updateList();
}

function updateList() {
    const listElement = document.getElementById('investmentList');
    listElement.innerHTML = "";
    investments.forEach((inv, index) => {
        const percent = ((inv.current / inv.invested - 1) * 100).toFixed(2);
        const profit = (inv.current - inv.invested).toFixed(2);
        const percentColor = percent >= 0 ? 'var(--positive)' : 'var(--negative)';

        const li = document.createElement('li');
        li.innerHTML = `
            <span><strong>${inv.name}</strong>: <span style="color:${percentColor}">${percent}%</span> (€ ${profit})</span>
            <button class="remove-btn" onclick="removeInvestment(${index})">Remover</button>
        `;
        listElement.appendChild(li);
    });
}

function addInvestment() {
    const name = document.getElementById('name').value;
    const invested = parseFloat(document.getElementById('invested').value);
    const current = parseFloat(document.getElementById('current').value);

    if (!name || isNaN(invested) || isNaN(current)) {
        alert("Preencha todos os campos corretamente.");
        return;
    }

    const index = investments.findIndex(inv => inv.name === name);
    if (index !== -1) {
        investments[index].invested = invested;
        investments[index].current = current;
    } else {
        investments.push({ name, invested, current });
    }
    investments.sort((a, b) => ((b.current / b.invested) - 1) - ((a.current / a.invested) - 1));
    updateCharts();
}

function removeInvestment(index) {
    investments.splice(index, 1);
    updateCharts();
}

updateCharts();
