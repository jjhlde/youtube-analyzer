require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// CORS 설정
app.use(cors());
app.use(express.json());

// ★★★ API 엔드포인트들을 먼저 정의 ★★★



// ★★★ 전체 유튜브 검색 API (디버깅 강화) ★★★
/* ---------------------------
    YouTube 검색 (search)
---------------------------- */
app.get('/api/search-all-youtube', async (req, res) => {
    console.log('🔍 검색 API 호출됨:', req.query);
    
    try {
        const { 
            q, order = 'relevance', maxResults = 50,
            publishedAfter, publishedBefore, regionCode,
            videoDuration = 'any', pageToken
        } = req.query;
        const apiKey = process.env.YOUTUBE_API_KEY;

        if (!q) return res.status(400).json({ error: '검색어가 필요합니다.' });
        if (!apiKey) return res.status(400).json({ error: 'API 키가 필요합니다.' });

        const requestedResults = Math.min(Number(maxResults), 100);
        const firstBatchSize = Math.min(requestedResults, 50);

        let apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&order=${order}&maxResults=${firstBatchSize}&key=${apiKey}`;
        if (q) apiUrl += `&q=${encodeURIComponent(q)}`;
        if (publishedAfter) apiUrl += `&publishedAfter=${publishedAfter}`;
        if (publishedBefore) apiUrl += `&publishedBefore=${publishedBefore}`;
        if (regionCode) apiUrl += `&regionCode=${regionCode}`;
        if (videoDuration !== 'any') apiUrl += `&videoDuration=${videoDuration}`;
        if (pageToken) apiUrl += `&pageToken=${pageToken}`;

        console.log('🌐 YouTube API URL:', apiUrl);

        const fetch = (await import('node-fetch')).default;
        const firstResponse = await fetch(apiUrl);
        if (!firstResponse.ok) {
            const errorText = await firstResponse.text();
            return res.status(firstResponse.status).json({
                error: `YouTube API 오류: ${firstResponse.status} ${firstResponse.statusText}`,
                details: errorText
            });
        }

        const firstData = await firstResponse.json();
        let allItems = firstData.items || [];
        let finalNextPageToken = firstData.nextPageToken;

        if (requestedResults > 50 && firstData.nextPageToken && allItems.length >= firstBatchSize) {
            console.log('🔄 두 번째 페이지 요청 중...');
            const secondBatchSize = Math.min(requestedResults - firstBatchSize, 50);
            let secondApiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&order=${order}&maxResults=${secondBatchSize}&key=${apiKey}&pageToken=${firstData.nextPageToken}`;
            if (q) secondApiUrl += `&q=${encodeURIComponent(q)}`;
            if (publishedAfter) secondApiUrl += `&publishedAfter=${publishedAfter}`;
            if (publishedBefore) secondApiUrl += `&publishedBefore=${publishedBefore}`;
            if (regionCode) secondApiUrl += `&regionCode=${regionCode}`;
            if (videoDuration !== 'any') secondApiUrl += `&videoDuration=${videoDuration}`;

            try {
                const secondResponse = await fetch(secondApiUrl);
                if (secondResponse.ok) {
                    const secondData = await secondResponse.json();
                    if (secondData.items) {
                        allItems = [...allItems, ...secondData.items];
                        finalNextPageToken = secondData.nextPageToken;
                    }
                }
            } catch (error) {
                console.error('⚠️ 두 번째 요청 실패:', error.message);
            }
        }

        const result = {
            ...firstData,
            items: allItems,
            nextPageToken: finalNextPageToken,
            pageInfo: {
                ...firstData.pageInfo,
                resultsPerPage: allItems.length
            }
        };

        console.log(`✅ 검색 완료: 총 ${allItems.length}개 반환`);
        res.json(result);

    } catch (error) {
        console.error('💥 검색 API 전체 오류:', error);
        res.status(500).json({
            error: '검색 중 오류 발생',
            details: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// 기본 영상 정보 가져오기
app.get('/api/videos', async (req, res) => {
    try {
        const { videoId } = req.query;
        const apiKey = process.env.YOUTUBE_API_KEY;
        const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${apiKey}`;
        
        console.log('영상 API 요청:', apiUrl);
        
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        res.json(data);
    } catch (error) {
        console.error('API 오류:', error);
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});

// 기본 채널 정보 가져오기
app.get('/api/channels', async (req, res) => {
    try {
        const { channelId } = req.query;
        const apiKey = process.env.YOUTUBE_API_KEY;
        const apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${apiKey}`;
        
        console.log('채널 API 요청:', apiUrl);
        
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        res.json(data);
    } catch (error) {
        console.error('API 오류:', error);
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});

// 여러 영상의 상세 정보 한 번에 가져오기
app.get('/api/videos-batch', async (req, res) => {
    console.log('📹 영상 배치 API 호출:', req.query);
    try {
        const { videoIds } = req.query;
        const apiKey = process.env.YOUTUBE_API_KEY;
        if (!videoIds) {
            return res.status(400).json({ error: 'videoIds와 apiKey가 필요합니다.' });
        }
        
        const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoIds}&key=${apiKey}`;
        
        console.log('영상 배치 API 요청:', apiUrl);
        
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('영상 배치 API 오류:', errorText);
            return res.status(response.status).json({ error: errorText });
        }
        
        const data = await response.json();
        console.log('영상 배치 API 응답:', data.items?.length || 0, '개 영상 정보 수신');
        
        res.json(data);
    } catch (error) {
        console.error('영상 배치 API 오류:', error);
        res.status(500).json({ error: '서버 오류가 발생했습니다.', details: error.message });
    }
});

// 여러 채널 정보 한번에 가져오기
app.get('/api/channels-batch', async (req, res) => {
    console.log('📺 채널 배치 API 호출:', req.query);
    try {
        const { channelIds } = req.query;
        const apiKey = process.env.YOUTUBE_API_KEY;
        
        if (!channelIds) {
            return res.status(400).json({ error: 'channelIds와 apiKey가 필요합니다.' });
        }
        
        const apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelIds}&key=${apiKey}`;
        
        console.log('채널 배치 API 요청:', apiUrl);
        
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('채널 배치 API 오류:', errorText);
            return res.status(response.status).json({ error: errorText });
        }
        
        const data = await response.json();
        console.log('채널 배치 API 응답:', data.items?.length || 0, '개 채널 정보 수신');
        
        res.json(data);
    } catch (error) {
        console.error('채널 배치 API 오류:', error);
        res.status(500).json({ error: '서버 오류가 발생했습니다.', details: error.message });
    }
});

// 영상 자막 가져오기
app.get('/api/video-captions', async (req, res) => {
    try {
        const { videoId } = req.query;
        const apiKey = process.env.YOUTUBE_API_KEY;
        const apiUrl = `https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId=${videoId}&key=${apiKey}`;
        
        console.log('자막 목록 API 요청:', apiUrl);
        
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        res.json(data);
    } catch (error) {
        console.error('API 오류:', error);
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});

// ★★★ 정적 파일 서빙 (API 이후에 배치) ★★★

// CSS 파일 직접 서빙
app.get('/styles.css', (req, res) => {
    res.setHeader('Content-Type', 'text/css');
    res.sendFile(path.join(__dirname, 'styles.css'));
});

// favicon 처리 (404 에러 방지)
app.get('/favicon.ico', (req, res) => {
    res.status(204).end();
});

// 개별 JS 파일들 직접 서빙
app.get('/js/config.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.sendFile(path.join(__dirname, 'js', 'config.js'));
});

app.get('/js/ui-utils.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.sendFile(path.join(__dirname, 'js', 'ui-utils.js'));
});

app.get('/js/favorites.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.sendFile(path.join(__dirname, 'js', 'favorites.js'));
});

app.get('/js/senior-keywords.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.sendFile(path.join(__dirname, 'js', 'senior-keywords.js'));
});

app.get('/js/keyword-helper.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.sendFile(path.join(__dirname, 'js', 'keyword-helper.js'));
});

app.get('/js/api.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.sendFile(path.join(__dirname, 'js', 'api.js'));
});

app.get('/js/data-processor.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.sendFile(path.join(__dirname, 'js', 'data-processor.js'));
});

app.get('/js/table-manager.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.sendFile(path.join(__dirname, 'js', 'table-manager.js'));
});

app.get('/js/main.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.sendFile(path.join(__dirname, 'js', 'main.js'));
});

// 기본 정적 파일 서빙
app.use(express.static('.'));

// 기본 페이지 제공
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`🚀 서버가 실행되었습니다: http://localhost:${PORT}`);
    console.log('브라우저에서 위 주소로 접속하세요!');
    console.log('★★★ 등록된 API 엔드포인트:');
    console.log('- GET /api/trending-keywords (확장된 테스트 데이터)');
    console.log('- GET /api/search-all-youtube (디버깅 강화)');
    console.log('- GET /api/videos-batch (디버깅 강화)'); 
    console.log('- GET /api/channels-batch (디버깅 강화)');
    console.log('- GET /api/video-captions');
});