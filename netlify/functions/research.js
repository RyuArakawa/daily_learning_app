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

    const GEMINI_BASE_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent`;

    console.log(`[Trend Radar] Starting research for keyword: ${keyword}`);

    try {
        // --- STAGE 1: RESEARCHER ---
        console.log(`[Stage 1] Fetching search results from Tavily...`);
        const searchResponse = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                api_key: TAVILY_API_KEY,
                query: `${keyword} latest trends 2024 marketing insights`,
                search_depth: 'advanced'
            })
        });

        if (!searchResponse.ok) {
            const errorData = await searchResponse.text();
            throw new Error(`Tavily API Error: ${searchResponse.status} - ${errorData}`);
        }

        const searchData = await searchResponse.json();
        const searchResults = searchData.results.map(r => `- ${r.title}: ${r.url}`).join('\n');

        const researcherPrompt = `キーワードに関する最新トレンドをマーケティング視点でリサーチしてください: ${keyword}\n\n検索結果:\n${searchResults}\n\n回答は日本語で、要点を箇条書きでまとめてください。`;

        console.log(`[Stage 1] Calling Gemini (Researcher)...`);
        const researchRes = await fetch(GEMINI_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': GEMINI_API_KEY
            },
            body: JSON.stringify({ contents: [{ parts: [{ text: researcherPrompt }] }] })
        });
        const researchDataRes = await researchRes.json();

        if (researchDataRes.error) {
            let msg = researchDataRes.error.message;
            if (msg.includes('quota') || msg.includes('Quota')) {
                msg += '\n\n【解決策】: Google AI Studioの「Rate limits」で gemini-1.5-flash の枠があるか確認するか、Google Cloud Consoleで Generative Language API を有効にしてみてくれ！';
            }
            throw new Error(`Gemini API Error (Research): ${msg}`);
        }
        if (!researchDataRes.candidates || researchDataRes.candidates.length === 0) {
            throw new Error('Gemini API Error: No candidates returned in Research stage.');
        }
        const researchText = researchDataRes.candidates[0].content.parts[0].text;

        // --- STAGE 2: PROFESSOR ---
        console.log(`[Stage 2] Calling Gemini (Professor)...`);
        const professorPrompt = `以下のリサーチ結果を専門家の視点で深掘り解説し、引用元URLを明示してください。読者が次のアクションをイメージしやすいように伝えてください:\n${researchText}`;

        const professorRes = await fetch(GEMINI_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': GEMINI_API_KEY
            },
            body: JSON.stringify({ contents: [{ parts: [{ text: professorPrompt }] }] })
        });
        const professorDataRes = await professorRes.json();

        if (professorDataRes.error) {
            throw new Error(`Gemini API Error (Professor): ${professorDataRes.error.message}`);
        }
        const professorText = professorDataRes.candidates[0].content.parts[0].text;

        // --- STAGE 3: TRAINER ---
        console.log(`[Stage 3] Calling Gemini (Trainer)...`);
        const trainerPrompt = `以下を読み、今日からすぐに実践できる3つの具体的アクションを具体的かつパワフルに提案してください。CMOを目指すビジネスパーソンに向けたアドバイスも含めてください:\n${professorText}`;

        const trainerRes = await fetch(GEMINI_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': GEMINI_API_KEY
            },
            body: JSON.stringify({ contents: [{ parts: [{ text: trainerPrompt }] }] })
        });
        const trainerDataRes = await trainerRes.json();

        if (trainerDataRes.error) {
            throw new Error(`Gemini API Error (Trainer): ${trainerDataRes.error.message}`);
        }
        const trainerText = trainerDataRes.candidates[0].content.parts[0].text;

        console.log(`[Trend Radar] Successfully generated all insights.`);

        return {
            statusCode: 200,
            body: JSON.stringify({
                research: researchText,
                professor: professorText,
                trainer: trainerText,
                strength: Math.floor(Math.random() * (95 - 75 + 1)) + 75, // 動的な盛り上がり（例）
                label: '🔥 High Interest'
            })
        };

    } catch (error) {
        console.error('API Error:', error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Failed to generate insights',
                details: error.message
            })
        };
    }
};
