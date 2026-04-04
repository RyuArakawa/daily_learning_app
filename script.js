document.addEventListener('DOMContentLoaded', () => {
    const keywordInput = document.getElementById('keyword-input');
    const searchBtn = document.getElementById('search-btn');
    const resultsArea = document.getElementById('results-area');
    const trendGauge = document.getElementById('trend-gauge');
    const trendLabel = document.getElementById('trend-label');
    const copyBtn = document.getElementById('copy-btn');

    // Search Logic
    searchBtn.addEventListener('click', async () => {
        const keyword = keywordInput.value.trim();
        if (!keyword) {
            alert('キーワードを入力してください！🌊');
            return;
        }

        // Show results area and start loading state
        resultsArea.hidden = false;
        searchBtn.disabled = true;
        searchBtn.innerHTML = 'Analyzing Wave...';

        try {
            console.log(`Searching for: ${keyword}`);

            const response = await fetch('/.netlify/functions/research', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ keyword })
            });

            if (!response.ok) throw new Error('API Request failed');

            const data = await response.json();

            // Update UI with real data (using marked for markdown rendering)
            document.getElementById('research-output').innerHTML = marked.parse(data.research);
            document.getElementById('professor-output').innerHTML = marked.parse(data.professor);
            document.getElementById('trainer-output').innerHTML = marked.parse(data.trainer);

            // Update Gauge & Labels
            trendGauge.style.width = `${data.strength}%`;
            trendLabel.innerText = data.label;

            // Scroll to results
            resultsArea.scrollIntoView({ behavior: 'smooth' });

        } catch (error) {
            console.error('Error fetching insights:', error);
            alert('波の読み取りに失敗したぜ...。APIキーの設定を確認してみてくれ！🤘');
        } finally {
            searchBtn.disabled = false;
            searchBtn.innerHTML = 'Ride the Wave';
        }
    });

    // Copy to Clipboard
    copyBtn.addEventListener('click', () => {
        const content = `
# Trend Radar Insights: ${keywordInput.value}
## Stage 1: Researcher
${document.getElementById('research-output').innerText}
## Stage 2: Professor
${document.getElementById('professor-output').innerText}
## Stage 3: Trainer
${document.getElementById('trainer-output').innerText}
        `.trim();

        navigator.clipboard.writeText(content).then(() => {
            alert('Markdownをコピーしたぜ！📋');
        });
    });
});
