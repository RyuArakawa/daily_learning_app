/**
 * Trend Radar API: AI Multi-Agent Logic (Netlify Version)
 */

exports.handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { keyword } = JSON.parse(event.body);
    if (!keyword) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Keyword is required' }) };
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const TAVILY_API_KEY = process.env.TAVILY_API_KEY;

    if (!GEMINI_API_KEY || !TAVILY_API_KEY) {
        return { statusCode: 500, body: JSON.stringify({ error: 'API keys not configured' }) };
    }

    const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    try {
        // --- STAGE 1: RESEARCHER ---
        const searchResponse = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                api_key: TAVILY_API_KEY,
                query: `${keyword} latest trends 2024`,
                search_depth: 'advanced'
            })
        });
        const searchData = await searchResponse.json();
        const searchResults = searchData.results.map(r => `- ${r.title}: ${r.url}`).join('\n');

        const researcherPrompt = `キーワードに関する最新トレンドをリサーチしてください: ${keyword}\n\n検索結果:\n${searchResults}`;

        const researchRes = await fetch(GEMINI_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: researcherPrompt }] }] })
        });
        const researchDataRes = await researchRes.json();
        const researchText = researchDataRes.candidates[0].content.parts[0].text;

        // --- STAGE 2: PROFESSOR ---
        const professorPrompt = `以下のリサーチ結果を解説し、引用元URLを明示してください:\n${researchText}`;

        const professorRes = await fetch(GEMINI_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: professorPrompt }] }] })
        });
        const professorDataRes = await professorRes.json();
        const professorText = professorDataRes.candidates[0].content.parts[0].text;

        // --- STAGE 3: TRAINER ---
        const trainerPrompt = `以下を読み、今日できる3つの具体的アクションを提案してください:\n${professorText}`;

        const trainerRes = await fetch(GEMINI_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: trainerPrompt }] }] })
        });
        const trainerDataRes = await trainerRes.json();
        const trainerText = trainerDataRes.candidates[0].content.parts[0].text;

        return {
            statusCode: 200,
            body: JSON.stringify({
                research: researchText,
                professor: professorText,
                trainer: trainerText,
                strength: 85,
                label: '🔥 High Interest'
            })
        };

    } catch (error) {
        console.error('API Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to generate insights' })
        };
    }
};
