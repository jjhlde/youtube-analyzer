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
// 정적 파일 서빙 (HTML, CSS, JS 파일들)
app.use(express.static(path.join(__dirname)));

// 루트 경로에서 index.html 제공
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});


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

// server.js에 추가할 API 엔드포인트들
// 기존 API들 뒤에 추가하세요

// ============================================
// 채널 정보 가져오기 API
// ============================================
app.get('/api/channel-info', async (req, res) => {
    console.log('📺 채널 정보 API 호출:', req.query);
    try {
        const { channelId } = req.query;
        const apiKey = process.env.YOUTUBE_API_KEY;
        
        if (!channelId || !apiKey) {
            return res.status(400).json({ error: 'channelId와 API 키가 필요합니다.' });
        }
        
        // 채널 ID가 @username 형태인지 확인
        let apiUrl;
        if (channelId.startsWith('@')) {
            // @username을 forUsername으로 검색
            const username = channelId.substring(1);
            apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&forUsername=${username}&key=${apiKey}`;
            console.log('사용자명으로 채널 검색:', username);
        } else if (channelId.length === 24 && channelId.startsWith('UC')) {
            // 일반 채널 ID로 검색
            apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&id=${channelId}&key=${apiKey}`;
            console.log('채널 ID로 검색:', channelId);
        } else {
            // 커스텀 URL이나 기타 형태인 경우 검색으로 시도
            console.log('검색으로 채널 찾기 시도:', channelId);
            const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(channelId)}&maxResults=1&key=${apiKey}`;
            
            const fetch = (await import('node-fetch')).default;
            const searchResponse = await fetch(searchUrl);
            
            if (searchResponse.ok) {
                const searchData = await searchResponse.json();
                console.log('검색 결과:', searchData);
                if (searchData.items && searchData.items.length > 0) {
                    const foundChannelId = searchData.items[0].snippet.channelId;
                    apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&id=${foundChannelId}&key=${apiKey}`;
                    console.log('검색으로 찾은 채널 ID:', foundChannelId);
                } else {
                    return res.status(404).json({ 
                        error: '채널을 찾을 수 없습니다. URL을 다시 확인해주세요.',
                        suggestion: '예시: https://www.youtube.com/@channelname 또는 정확한 채널명'
                    });
                }
            } else {
                return res.status(400).json({ 
                    error: '올바르지 않은 채널 식별자입니다.',
                    suggestion: 'URL 형태를 확인해주세요.'
                });
            }
        }
        
        console.log('채널 정보 API 요청:', apiUrl);
        
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('채널 정보 API 오류:', errorText);
            return res.status(response.status).json({ 
                error: `YouTube API 오류: ${response.status}`,
                details: errorText 
            });
        }
        
        const data = await response.json();
        console.log('채널 정보 API 응답:', data.items?.length || 0, '개 채널 정보 수신');
        
        res.json(data);
    } catch (error) {
        console.error('채널 정보 API 전체 오류:', error);
        res.status(500).json({ 
            error: '서버 오류가 발생했습니다.',
            details: error.message 
        });
    }
});

// ============================================
// 채널의 영상 목록 가져오기 API
// ============================================
// ============================================
// 채널의 영상 목록 가져오기 API
// ============================================
app.get('/api/channel-videos', async (req, res) => {
    console.log('📹 채널 영상 목록 API 호출:', req.query);
    try {
        const { channelId, maxResults = 50, order = 'date', pageToken } = req.query;
        const apiKey = process.env.YOUTUBE_API_KEY;
        
        if (!channelId || !apiKey) {
            return res.status(400).json({ error: 'channelId와 API 키가 필요합니다.' });
        }
        
        const fetch = (await import('node-fetch')).default;
        
        // 1단계: 채널 정보 가져와서 uploads 플레이리스트 ID 획득 (첫 번째 페이지일 때만)
        let uploadsPlaylistId;
        
        if (!pageToken) {
            // 첫 번째 페이지 - 채널 정보부터 가져오기
            let channelApiUrl;
            if (channelId.startsWith('@')) {
                const username = channelId.substring(1);
                channelApiUrl = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&forUsername=${username}&key=${apiKey}`;
            } else if (channelId.length === 24 && channelId.startsWith('UC')) {
                channelApiUrl = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${apiKey}`;
            } else {
                // 검색으로 채널 ID 찾기
                const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(channelId)}&maxResults=1&key=${apiKey}`;
                const searchResponse = await fetch(searchUrl);
                
                if (searchResponse.ok) {
                    const searchData = await searchResponse.json();
                    if (searchData.items && searchData.items.length > 0) {
                        const foundChannelId = searchData.items[0].snippet.channelId;
                        channelApiUrl = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${foundChannelId}&key=${apiKey}`;
                    } else {
                        return res.status(404).json({ error: '채널을 찾을 수 없습니다.' });
                    }
                } else {
                    return res.status(400).json({ error: '올바르지 않은 채널 식별자입니다.' });
                }
            }
            
            console.log('채널 contentDetails 요청:', channelApiUrl);
            
            const channelResponse = await fetch(channelApiUrl);
            
            if (!channelResponse.ok) {
                const errorText = await channelResponse.text();
                console.error('채널 정보 조회 실패:', errorText);
                return res.status(channelResponse.status).json({ 
                    error: '채널을 찾을 수 없습니다.',
                    details: errorText 
                });
            }
            
            const channelData = await channelResponse.json();
            
            if (!channelData.items || channelData.items.length === 0) {
                return res.status(404).json({ error: '채널을 찾을 수 없습니다.' });
            }
            
            uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;
            console.log('업로드 플레이리스트 ID:', uploadsPlaylistId);
        } else {
            // ★★★ pageToken이 있으면 플레이리스트 ID를 세션에서 가져와야 하는데,
            // 간단하게 channelId에서 직접 계산 ★★★
            if (channelId.startsWith('UC')) {
                uploadsPlaylistId = 'UU' + channelId.substring(2);
            } else {
                // 복잡한 경우는 에러 처리
                return res.status(400).json({ error: '페이지네이션은 채널 ID 형태에서만 지원됩니다.' });
            }
        }
        
        // 2단계: 플레이리스트의 영상 목록 가져오기
        let playlistApiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=${Math.min(maxResults, 50)}&key=${apiKey}`;
        
        if (pageToken) {
            playlistApiUrl += `&pageToken=${pageToken}`;
        }
        
        console.log('플레이리스트 아이템 요청:', playlistApiUrl);
        
        const playlistResponse = await fetch(playlistApiUrl);
        
        if (!playlistResponse.ok) {
            const errorText = await playlistResponse.text();
            console.error('플레이리스트 조회 실패:', errorText);
            return res.status(playlistResponse.status).json({ 
                error: '채널 영상 목록을 가져올 수 없습니다.',
                details: errorText 
            });
        }
        
        const playlistData = await playlistResponse.json();
        
        if (!playlistData.items || playlistData.items.length === 0) {
            return res.json({ 
                items: [], 
                pageInfo: { totalResults: 0 },
                nextPageToken: null // ★★★ nextPageToken 명시적으로 null ★★★
            });
        }
        
        // 3단계: 영상 ID들 추출
        const videoIds = playlistData.items
            .map(item => item.snippet.resourceId.videoId)
            .filter(id => id); // undefined 값 제거
        
        if (videoIds.length === 0) {
            return res.json({ 
                items: [], 
                pageInfo: { totalResults: 0 },
                nextPageToken: null 
            });
        }
        
        console.log(`${videoIds.length}개 영상 ID 추출:`, videoIds.slice(0, 5)); // 처음 5개만 로그
        
        // 4단계: 영상 상세 정보 가져오기 (배치 처리)
        const batchSize = 50;
        const allVideoItems = [];
        
        for (let i = 0; i < videoIds.length; i += batchSize) {
            const batchIds = videoIds.slice(i, i + batchSize);
            const videosApiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${batchIds.join(',')}&key=${apiKey}`;
            
            console.log(`영상 상세정보 배치 ${Math.floor(i/batchSize) + 1} 요청:`, batchIds.length, '개');
            
            try {
                const videosResponse = await fetch(videosApiUrl);
                
                if (videosResponse.ok) {
                    const videosData = await videosResponse.json();
                    if (videosData.items) {
                        allVideoItems.push(...videosData.items);
                    }
                } else {
                    console.error(`배치 ${Math.floor(i/batchSize) + 1} 실패:`, videosResponse.status);
                }
                
                // API 과부하 방지 지연
                if (i + batchSize < videoIds.length) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            } catch (batchError) {
                console.error(`배치 ${Math.floor(i/batchSize) + 1} 처리 중 오류:`, batchError);
                continue;
            }
        }
        
        // 5단계: 정렬 적용
        if (order === 'viewCount') {
            allVideoItems.sort((a, b) => 
                Number(b.statistics.viewCount || 0) - Number(a.statistics.viewCount || 0)
            );
        } else if (order === 'rating') {
            allVideoItems.sort((a, b) => {
                const aRatio = Number(a.statistics.likeCount || 0) / (Number(a.statistics.viewCount || 1));
                const bRatio = Number(b.statistics.likeCount || 0) / (Number(b.statistics.viewCount || 1));
                return bRatio - aRatio;
            });
        }
        
        // ★★★ 6단계: nextPageToken 포함해서 응답 ★★★
        const result = {
            items: allVideoItems,
            nextPageToken: playlistData.nextPageToken, // ★★★ 이 부분이 핵심! ★★★
            pageInfo: {
                totalResults: allVideoItems.length,
                resultsPerPage: allVideoItems.length
            }
        };
        
        console.log(`✅ 채널 영상 목록 완료: 총 ${allVideoItems.length}개 반환, nextPageToken: ${playlistData.nextPageToken ? 'O' : 'X'}`);
        res.json(result);
        
    } catch (error) {
        console.error('채널 영상 목록 API 전체 오류:', error);
        res.status(500).json({ 
            error: '서버 오류가 발생했습니다.',
            details: error.message 
        });
    }
});

// ============================================
// 채널 검색 API (채널명으로 검색)
// ============================================
app.get('/api/search-channels', async (req, res) => {
    console.log('🔍 채널 검색 API 호출:', req.query);
    try {
        const { q, maxResults = 10 } = req.query;
        const apiKey = process.env.YOUTUBE_API_KEY;
        
        if (!q || !apiKey) {
            return res.status(400).json({ error: '검색어(q)와 API 키가 필요합니다.' });
        }
        
        const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(q)}&maxResults=${maxResults}&key=${apiKey}`;
        
        console.log('채널 검색 API 요청:', apiUrl);
        
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('채널 검색 API 오류:', errorText);
            return res.status(response.status).json({ 
                error: `YouTube API 오류: ${response.status}`,
                details: errorText 
            });
        }
        
        const data = await response.json();
        
        // 검색된 채널들의 상세 정보도 함께 가져오기
        if (data.items && data.items.length > 0) {
            const channelIds = data.items.map(item => item.snippet.channelId).join(',');
            
            const detailsUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelIds}&key=${apiKey}`;
            
            try {
                const detailsResponse = await fetch(detailsUrl);
                if (detailsResponse.ok) {
                    const detailsData = await detailsResponse.json();
                    
                    // 검색 결과와 상세 정보 병합
                    data.items = data.items.map(searchItem => {
                        const detailItem = detailsData.items.find(detail => 
                            detail.id === searchItem.snippet.channelId
                        );
                        return {
                            ...searchItem,
                            statistics: detailItem?.statistics || {},
                            snippet: {
                                ...searchItem.snippet,
                                ...detailItem?.snippet
                            }
                        };
                    });
                }
            } catch (detailError) {
                console.warn('채널 상세 정보 가져오기 실패:', detailError);
            }
        }
        
        console.log(`채널 검색 완료: ${data.items?.length || 0}개 채널 발견`);
        res.json(data);
        
    } catch (error) {
        console.error('채널 검색 API 전체 오류:', error);
        res.status(500).json({ 
            error: '서버 오류가 발생했습니다.',
            details: error.message
        });
    }
});

// ============================================
// 서버 시작 부분 업데이트 (기존 app.listen 수정)
// ============================================

// 기존 app.listen을 다음과 같이 수정하세요:
app.listen(PORT, () => {
    console.log(`🚀 서버가 실행되었습니다: http://localhost:${PORT}`);
    console.log('브라우저에서 위 주소로 접속하세요!');
    console.log('★★★ 등록된 API 엔드포인트:');
    console.log('- GET /api/search-all-youtube (YouTube 검색)');
    console.log('- GET /api/videos-batch (영상 상세정보 배치)'); 
    console.log('- GET /api/channels-batch (채널 정보 배치)');
    console.log('- GET /api/video-captions (영상 자막)');
    console.log('- GET /api/channel-info (채널 정보) ⭐ 새로 추가');
    console.log('- GET /api/channel-videos (채널 영상 목록) ⭐ 새로 추가');
    console.log('- GET /api/search-channels (채널 검색) ⭐ 새로 추가');
    console.log('');
    console.log('🎯 새로운 기능:');
    console.log('   📺 채널 URL 분석 및 즐겨찾기');
    console.log('   🔄 필터 값 유지 (다음 페이지)');
    console.log('   📜 무한 스크롤 자동 로딩');
});