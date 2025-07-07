// API 호출 관련 함수들

class YouTubeAPI {
    static async searchAllVideos(searchParams, pageToken = '') {
        const params = {
            ...searchParams,
            
            pageToken: pageToken || undefined
        };
        
        // undefined 값 제거
        const cleanParams = Object.fromEntries(
            Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '')
        );
        
        const url = CONFIG.ENDPOINTS.SEARCH_ALL + '?' + new URLSearchParams(cleanParams);
        
        console.log('API 요청 URL:', url);
        console.log('전송 파라미터:', cleanParams);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API 응답 에러:', response.status, errorText);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error.message);
        }
        
        return data;
    }
    
    // ★★★ 수정된 getVideoDetails - 50개씩 배치 처리 ★★★
    static async getVideoDetails(videoIds) {
        
        
        // videoIds가 문자열이면 배열로 변환
        const videoIdArray = Array.isArray(videoIds) ? videoIds : videoIds.split(',');
        
        console.log(`📹 영상 상세정보 요청: 총 ${videoIdArray.length}개`);
        
        // YouTube API는 한 번에 최대 50개까지만 처리 가능
        const batchSize = 50;
        const allItems = [];
        
        // 50개씩 배치로 나누어 처리
        for (let i = 0; i < videoIdArray.length; i += batchSize) {
            const batchIds = videoIdArray.slice(i, i + batchSize);
            const batchString = batchIds.join(',');
            
            console.log(`📦 배치 ${Math.floor(i/batchSize) + 1}: ${batchIds.length}개 처리 중...`);
            
            const url = `${CONFIG.ENDPOINTS.VIDEOS_BATCH}?videoIds=${batchString}`;
            
            try {
                const response = await fetch(url);
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`❌ 배치 ${Math.floor(i/batchSize) + 1} 오류:`, response.status, errorText);
                    throw new Error(`배치 ${Math.floor(i/batchSize) + 1} 실패: HTTP ${response.status}`);
                }
                
                const data = await response.json();
                
                if (!data.items) {
                    console.warn(`⚠️ 배치 ${Math.floor(i/batchSize) + 1}: items가 없음`);
                    continue;
                }
                
                allItems.push(...data.items);
                console.log(`✅ 배치 ${Math.floor(i/batchSize) + 1} 완료: ${data.items.length}개 수신`);
                
                // API 과부하 방지를 위한 지연 (마지막 배치가 아닐 때만)
                if (i + batchSize < videoIdArray.length) {
                    console.log('⏳ API 과부하 방지 대기 중...');
                    await new Promise(resolve => setTimeout(resolve, 200));
                }
                
            } catch (error) {
                console.error(`💥 배치 ${Math.floor(i/batchSize) + 1} 처리 중 오류:`, error);
                // 하나의 배치가 실패해도 다음 배치는 계속 처리
                continue;
            }
        }
        
        console.log(`🎉 전체 영상 상세정보 수집 완료: ${allItems.length}개`);
        
        // 원래 응답 형태로 반환
        return {
            items: allItems,
            pageInfo: {
                totalResults: allItems.length,
                resultsPerPage: allItems.length
            }
        };
    }
    
    static async getChannelDetails(channelIds) {
        
        
        // channelIds가 배열이 아니면 배열로 변환
        const channelIdArray = Array.isArray(channelIds) ? channelIds : [channelIds];
        
        console.log(`📺 채널 정보 요청: 총 ${channelIdArray.length}개`);
        
        // 채널도 50개씩 배치 처리 (안전을 위해)
        const batchSize = 50;
        const allItems = [];
        
        for (let i = 0; i < channelIdArray.length; i += batchSize) {
            const batchIds = channelIdArray.slice(i, i + batchSize);
            const batchString = batchIds.join(',');
            
            console.log(`📦 채널 배치 ${Math.floor(i/batchSize) + 1}: ${batchIds.length}개 처리 중...`);
            
            const url = `${CONFIG.ENDPOINTS.CHANNELS_BATCH}?channelIds=${batchString}`;
            
            try {
                const response = await fetch(url);
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`❌ 채널 배치 ${Math.floor(i/batchSize) + 1} 오류:`, response.status, errorText);
                    throw new Error(`채널 배치 ${Math.floor(i/batchSize) + 1} 실패: HTTP ${response.status}`);
                }
                
                const data = await response.json();
                
                if (data.items) {
                    allItems.push(...data.items);
                    console.log(`✅ 채널 배치 ${Math.floor(i/batchSize) + 1} 완료: ${data.items.length}개 수신`);
                }
                
                // API 과부하 방지
                if (i + batchSize < channelIdArray.length) {
                    await new Promise(resolve => setTimeout(resolve, 200));
                }
                
            } catch (error) {
                console.error(`💥 채널 배치 ${Math.floor(i/batchSize) + 1} 처리 중 오류:`, error);
                continue;
            }
        }
        
        console.log(`🎉 전체 채널 정보 수집 완료: ${allItems.length}개`);
        
        return {
            items: allItems
        };
    }
    
    static async getVideoCaptions(videoId) {
        
        const url = `${CONFIG.ENDPOINTS.VIDEO_CAPTIONS}?videoId=${videoId}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        return data;
    }
}

// ★★★ 모바일 대응 추가된 검색 파라미터 빌더 ★★★
class SearchParamsBuilder {
    static buildFromForm() {
        // 모바일/PC 감지
        const isMobile = window.innerWidth <= 768;
        const suffix = isMobile ? 'Mobile' : '';
        
        const searchQuery = document.getElementById(`searchQuery${suffix}`).value.trim();
        
        if (!searchQuery) {
            throw new Error('검색어를 입력해주세요.');
        }
        
        // longform 처리
        const videoDurationElement = document.getElementById(`videoDuration${suffix}`);
        if (videoDurationElement && videoDurationElement.value === 'longform') {
            videoDurationElement.value = 'any';  // API에는 보내지 않음
        }
        
        const params = {
            q: searchQuery,
            order: document.getElementById(`orderBy${suffix}`).value,
            maxResults: Math.min(100, Number(document.getElementById(`maxResults${suffix}`).value) || 50),
            regionCode: document.getElementById(`regionCode${suffix}`).value || undefined,
            videoDuration: document.getElementById(`videoDuration${suffix}`).value
        };
        
        // 날짜 파라미터 처리
        const publishedAfterElement = document.getElementById(`publishedAfter${suffix}`);
        const publishedBeforeElement = document.getElementById(`publishedBefore${suffix}`);
        
        if (publishedAfterElement && publishedAfterElement.value) {
            params.publishedAfter = new Date(publishedAfterElement.value).toISOString();
        }
        
        if (publishedBeforeElement && publishedBeforeElement.value) {
            // 종료일은 하루 끝 시간으로 설정 (23:59:59)
            const endDate = new Date(publishedBeforeElement.value);
            endDate.setHours(23, 59, 59, 999);
            params.publishedBefore = endDate.toISOString();
        }
        
        // videoDuration이 'any'면 제거
        if (params.videoDuration === 'any') {
            delete params.videoDuration;
        }
        
        // regionCode가 빈 문자열이면 제거
        if (!params.regionCode) {
            delete params.regionCode;
        }
        
        console.log('구성된 검색 파라미터:', params);
        
        return params;
    }
    
    // 파라미터 검증
    static validateParams(params) {
        if (!params.q || params.q.length < 1) {
            throw new Error('검색어는 최소 1글자 이상이어야 합니다.');
        }
        
        if (params.maxResults && (params.maxResults < 1 || params.maxResults > 100)) {
            throw new Error('결과 개수는 1-100 사이여야 합니다.');
        }
        
        // 날짜 순서 검증
        if (params.publishedAfter && params.publishedBefore) {
            const afterDate = new Date(params.publishedAfter);
            const beforeDate = new Date(params.publishedBefore);
            
            if (afterDate >= beforeDate) {
                throw new Error('시작 날짜는 종료 날짜보다 이전이어야 합니다.');
            }
        }
        
        return true;
    }
}