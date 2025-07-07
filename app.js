// API 키 고정
const FIXED_API_KEY = 'AIzaSyD2LjjcuLVmCpJ7ywanfSI1bPHd7aZ6Umk';

let allVideos = [];
let displayedVideos = [];
let channelCache = {};
let currentPageToken = '';
let nextPageToken = '';
let currentSort = { column: null, direction: 'desc' };

// 페이지 로드시 기본값 설정
document.addEventListener('DOMContentLoaded', function() {
    setDefaultDates();
});

function setDefaultDates() {
    const today = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(today.getMonth() - 1);
    
    // 날짜를 YYYY-MM-DD 형식으로 변환
    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    
    document.getElementById('publishedAfter').value = formatDate(oneMonthAgo);
    document.getElementById('publishedBefore').value = formatDate(today);
}

async function startSearch() {            
    showLoading('검색 중...');
    
    // 새 검색시 기존 데이터 초기화
    allVideos = [];
    displayedVideos = [];
    channelCache = {};
    currentPageToken = '';
    nextPageToken = '';
    
    try {
        await searchVideos();
    } catch (error) {
        showError(`검색 오류: ${error.message}`);
    }
}

async function searchVideos(pageToken = '') {
    const searchParams = {
        q: document.getElementById('searchQuery').value,
        apiKey: FIXED_API_KEY,
        order: document.getElementById('orderBy').value,
        maxResults: Math.min(50, Number(document.getElementById('maxResults').value)),
        publishedAfter: document.getElementById('publishedAfter').value ? 
            new Date(document.getElementById('publishedAfter').value).toISOString() : undefined,
        publishedBefore: document.getElementById('publishedBefore').value ? 
            new Date(document.getElementById('publishedBefore').value).toISOString() : undefined,
        regionCode: document.getElementById('regionCode').value || undefined,
        videoDuration: document.getElementById('videoDuration').value,
        pageToken: pageToken || undefined
    };
    
    // API 호출
    const url = '/api/search-all-youtube?' + new URLSearchParams(
        Object.fromEntries(Object.entries(searchParams).filter(([_, v]) => v !== undefined))
    );
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.error) {
        throw new Error(data.error.message);
    }
    
    if (!data.items || data.items.length === 0) {
        showError('검색 결과가 없습니다. 다른 조건으로 시도해보세요.');
        return;
    }
    
    // 영상 상세 정보 가져오기
    const videoIds = data.items.map(item => item.id.videoId).join(',');
    const detailsResponse = await fetch(`/api/videos-batch?videoIds=${videoIds}&apiKey=${FIXED_API_KEY}`);
    const detailsData = await detailsResponse.json();
    
    if (!detailsData.items) {
        throw new Error('영상 상세 정보를 가져올 수 없습니다.');
    }
    
    // 채널 정보 가져오기
    const channelIds = [...new Set(detailsData.items.map(item => item.snippet.channelId))];
    const newChannelIds = channelIds.filter(id => !channelCache[id]);
    
    if (newChannelIds.length > 0) {
        const channelsResponse = await fetch(`/api/channels-batch?channelIds=${newChannelIds.join(',')}&apiKey=${FIXED_API_KEY}`);
        const channelsData = await channelsResponse.json();
        
        if (channelsData.items) {
            channelsData.items.forEach(channel => {
                channelCache[channel.id] = channel;
            });
        }
    }
    
    // 데이터 처리 및 필터 적용
    const processedVideos = processVideoData(detailsData.items);
    const filteredVideos = applyFilters(processedVideos);
    
    // 결과 표시 (append = 페이지 추가 여부)
    const isAppend = pageToken !== '';
    displayResults(filteredVideos, isAppend);
    
    // 페이지네이션 설정
    nextPageToken = data.nextPageToken;
    setupPagination();
}

function processVideoData(videos) {
    return videos.map(video => {
        const channelId = video.snippet.channelId;
        const channel = channelCache[channelId];
        
        if (!channel) return null;
        
        const subscriberCount = Number(channel.statistics.subscriberCount || 0);
        const viewCount = Number(video.statistics.viewCount || 0);
        const likeCount = Number(video.statistics.likeCount || 0);
        const commentCount = Number(video.statistics.commentCount || 0);
        const videoCount = Number(channel.statistics.videoCount || 0);
        const channelTotalViews = Number(channel.statistics.viewCount || 0);
        
        // 수정된 계산들
        // 기여도: 채널 평균 조회수 대비 해당 영상의 성과 비율
        const avgViewsPerVideo = videoCount > 0 ? channelTotalViews / videoCount : 0;
        const contributionScore = avgViewsPerVideo > 0 ? (viewCount / avgViewsPerVideo) * 100 : 0;
        
        // 성과도: 구독자 기반 노출 대비 실제 성과 (영상 조회수 / 구독자 수)
        const performanceScore = subscriberCount > 0 ? viewCount / subscriberCount : 0;
        
        // 성과도 배율: 성과도와 동일하지만 표현 방식
        const performanceMultiplier = performanceScore;
        
        // 콘텐츠 영향력 지수: 성과도를 등급으로 분류 (수정된 기준)
        const influenceGrade = getPerformanceGrade(performanceScore);
        
        // 댓글 참여율: (좋아요 + 댓글) / 조회수 * 100
        const engagementRate = viewCount > 0 ? ((likeCount + commentCount) / viewCount) * 100 : 0;
        
        return {
            ...video,
            channel,
            subscriberCount,
            viewCount,
            likeCount,
            commentCount,
            videoCount,
            channelTotalViews,
            avgViewsPerVideo,        // 평균 조회수 (디버깅용)
            contributionScore,       // 기여도 (수정됨)
            performanceScore,        // 성과도
            performanceMultiplier,   // 성과도 배율
            influenceGrade,          // 콘텐츠 영향력 지수 (수정됨)
            engagementRate
        };
    }).filter(video => video !== null);
}

function applyFilters(videos) {
    const minInfluence = Number(document.getElementById('minInfluenceScore').value) || 0;
    const minViews = Number(document.getElementById('minViewCount').value) || 0;
    const maxViews = Number(document.getElementById('maxViewCount').value) || Infinity;
    const minSubs = Number(document.getElementById('minSubscribers').value) || 0;
    const maxSubs = Number(document.getElementById('maxSubscribers').value) || Infinity;
    
    return videos.filter(video => {
        return video.performanceScore >= minInfluence && 
               video.viewCount >= minViews && 
               video.viewCount <= maxViews &&
               video.subscriberCount >= minSubs &&
               video.subscriberCount <= maxSubs;
    });
}

// 수정된 등급 함수
function getPerformanceGrade(score) {
    if (score >= 15) return { grade: 'excellent', text: '최고' };
    if (score >= 4) return { grade: 'good', text: '좋음' };
    if (score >= 1) return { grade: 'average', text: '보통' };
    return { grade: 'poor', text: '나쁨' };
}

function displayResults(videos, append = false) {
    const resultsContent = document.getElementById('results-content');
    const resultsCount = document.getElementById('results-count');
    
    if (videos.length === 0 && !append) {
        resultsContent.innerHTML = '<div class="error">필터 조건에 맞는 영상이 없습니다.</div>';
        resultsCount.textContent = '결과 없음';
        return;
    }
    
    if (append) {
        // 기존 리스트에 추가
        displayedVideos = [...displayedVideos, ...videos];
    } else {
        // 새로운 검색 결과
        displayedVideos = [...videos];
    }
    
    resultsCount.textContent = `${displayedVideos.length}개 영상 발견`;
    
    if (!append || !document.querySelector('.results-table')) {
        // 테이블 헤더 생성 (처음이거나 새 검색)
        createTableHeader();
    }
    
    // 테이블 바디 업데이트
    updateTableBody();
}

function createTableHeader() {
    const resultsContent = document.getElementById('results-content');
    
    const tableHtml = `
        <table class="results-table">
            <thead>
                <tr>
                    <th onclick="sortBy('thumbnail')">썸네일</th>
                    <th onclick="sortBy('channelTitle')">채널명<span class="sort-indicator"></span></th>
                    <th onclick="sortBy('title')">영상제목<span class="sort-indicator"></span></th>
                    <th onclick="sortBy('publishedAt')">게시일<span class="sort-indicator"></span></th>
                    <th onclick="sortBy('subscriberCount')">구독자수<span class="sort-indicator"></span></th>
                    <th onclick="sortBy('viewCount')">조회수<span class="sort-indicator"></span></th>
                    <th onclick="sortBy('contributionScore')">기여도(%)<span class="sort-indicator"></span></th>
                    <th onclick="sortBy('performanceScore')">성과도<span class="sort-indicator"></span></th>
                    <th onclick="sortBy('influenceGrade')">영향력지수<span class="sort-indicator"></span></th>
                    <th onclick="sortBy('duration')">영상길이<span class="sort-indicator"></span></th>
                    <th onclick="sortBy('likeCount')">좋아요<span class="sort-indicator"></span></th>
                    <th onclick="sortBy('commentCount')">댓글/참여율<span class="sort-indicator"></span></th>
                    <th onclick="sortBy('videoCount')">채널총영상<span class="sort-indicator"></span></th>
                </tr>
            </thead>
            <tbody id="table-body">
            </tbody>
        </table>
    `;
    
    resultsContent.innerHTML = tableHtml;
}

function updateTableBody() {
    const tableBody = document.getElementById('table-body');
    let html = '';
    
    displayedVideos.forEach(video => {
        const thumbnail = video.snippet.thumbnails?.medium?.url || video.snippet.thumbnails?.default?.url;
        const duration = formatDuration(video.contentDetails?.duration);
        const videoUrl = `https://www.youtube.com/watch?v=${video.id}`;
        const channelUrl = `https://www.youtube.com/channel/${video.channel.id}`;
        
        html += `
            <tr>
                <td class="thumbnail-cell">
                    <img src="${thumbnail}" alt="썸네일" loading="lazy" onclick="openVideo('${videoUrl}')">
                    <div class="duration-badge">${duration}</div>
                </td>
                <td class="channel-cell">
                    <a href="${channelUrl}" target="_blank" class="channel-link">${video.channel.snippet.title}</a>
                </td>
                <td class="title-cell">
                    <div class="video-title">${video.snippet.title}</div>
                    <a href="${generateCaptionUrl(video.id)}" target="_blank" class="captions-btn">📝 자막</a>
                </td>
                <td class="date-cell">${formatDate(video.snippet.publishedAt)}</td>
                <td class="number-cell">${formatNumber(video.subscriberCount)}</td>
                <td class="number-cell">${formatNumber(video.viewCount)}</td>
                <td class="number-cell">${video.contributionScore.toFixed(1)}%</td>
                <td class="number-cell">${video.performanceScore.toFixed(1)}배</td>
                <td>
                    <span class="grade-cell grade-${video.influenceGrade.grade}">
                        ${video.influenceGrade.text}
                    </span>
                </td>
                <td class="date-cell">${duration}</td>
                <td class="number-cell">${formatNumber(video.likeCount)}</td>
                <td class="combined-cell">
                    <div class="main-value">${formatNumber(video.commentCount)}</div>
                    <div class="sub-value">${video.engagementRate.toFixed(1)}%</div>
                </td>
                <td class="number-cell">${formatNumber(video.videoCount)}</td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
}

function sortBy(column) {
    // 정렬 방향 결정
    if (currentSort.column === column) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.column = column;
        currentSort.direction = 'desc';
    }
    
    // 정렬 실행
    displayedVideos.sort((a, b) => {
        let valueA, valueB;
        
        switch(column) {
            case 'channelTitle':
                valueA = a.channel.snippet.title.toLowerCase();
                valueB = b.channel.snippet.title.toLowerCase();
                break;
            case 'title':
                valueA = a.snippet.title.toLowerCase();
                valueB = b.snippet.title.toLowerCase();
                break;
            case 'publishedAt':
                valueA = new Date(a.snippet.publishedAt);
                valueB = new Date(b.snippet.publishedAt);
                break;
            case 'subscriberCount':
                valueA = a.subscriberCount;
                valueB = b.subscriberCount;
                break;
            case 'viewCount':
                valueA = a.viewCount;
                valueB = b.viewCount;
                break;
            case 'contributionScore':
                valueA = a.contributionScore;
                valueB = b.contributionScore;
                break;
            case 'performanceScore':
                valueA = a.performanceScore;
                valueB = b.performanceScore;
                break;
            case 'performanceMultiplier':
                valueA = a.performanceMultiplier;
                valueB = b.performanceMultiplier;
                break;
            case 'influenceGrade':
                const gradeOrder = { 'poor': 1, 'average': 2, 'good': 3, 'excellent': 4 };
                valueA = gradeOrder[a.influenceGrade.grade];
                valueB = gradeOrder[b.influenceGrade.grade];
                break;
            case 'duration':
                valueA = parseDuration(a.contentDetails?.duration);
                valueB = parseDuration(b.contentDetails?.duration);
                break;
            case 'likeCount':
                valueA = a.likeCount;
                valueB = b.likeCount;
                break;
            case 'commentCount':
                valueA = a.commentCount;
                valueB = b.commentCount;
                break;
            case 'engagementRate':
                valueA = a.engagementRate;
                valueB = b.engagementRate;
                break;
            case 'videoCount':
                valueA = a.videoCount;
                valueB = b.videoCount;
                break;
            default:
                return 0;
        }
        
        if (currentSort.direction === 'asc') {
            return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
        } else {
            return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
        }
    });
    
    // 정렬 표시 업데이트
    updateSortIndicators();
    
    // 테이블 다시 그리기
    updateTableBody();
}

function updateSortIndicators() {
    // 모든 정렬 표시 초기화
    document.querySelectorAll('.sort-indicator').forEach(indicator => {
        indicator.textContent = '';
    });
    
    // 현재 정렬된 컬럼에 표시
    const currentHeader = document.querySelector(`th[onclick="sortBy('${currentSort.column}')"] .sort-indicator`);
    if (currentHeader) {
        currentHeader.textContent = currentSort.direction === 'asc' ? '↑' : '↓';
    }
}

function parseDuration(duration) {
    if (!duration) return 0;
    
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    
    const hours = parseInt(match[1] || 0);
    const minutes = parseInt(match[2] || 0);
    const seconds = parseInt(match[3] || 0);
    
    return hours * 3600 + minutes * 60 + seconds;
}

function setupPagination() {
    const paginationDiv = document.getElementById('pagination');
    let html = '';
    
    if (nextPageToken) {
        html += '<button onclick="loadNextPage()">다음 페이지</button>';
    }
    
    paginationDiv.innerHTML = html;
}

async function loadNextPage() {
    if (!nextPageToken) return;
    
    showLoading('다음 페이지 로딩 중...');
    await searchVideos(nextPageToken);
}

// 새 함수: 영상 열기
function openVideo(videoUrl) {
    window.open(videoUrl, '_blank');
}

// 새 함수: 자막 다운로드 URL 생성
function generateCaptionUrl(videoId) {
    // Downsub.com을 사용한 자막 다운로드 링크
    return `https://downsub.com/?url=https://www.youtube.com/watch?v=${videoId}`;
}

// 자막 모달 함수는 이제 사용하지 않지만 혹시 모르니 유지
async function loadCaptions(videoId) {
    // 직접 자막 다운로드 사이트로 이동
    const captionUrl = generateCaptionUrl(videoId);
    window.open(captionUrl, '_blank');
}

function closeCaptionModal() {
    document.getElementById('captionModal').style.display = 'none';
}

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1일 전';
    if (diffDays < 7) return `${diffDays}일 전`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)}주 전`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)}개월 전`;
    return `${Math.ceil(diffDays / 365)}년 전`;
}

function formatDuration(duration) {
    if (!duration) return '시간 정보 없음';
    
    // ISO 8601 duration 파싱 (PT1M30S 형식)
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return '시간 정보 없음';
    
    const hours = parseInt(match[1] || 0);
    const minutes = parseInt(match[2] || 0);
    const seconds = parseInt(match[3] || 0);
    
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

function resetFilters() {
    document.getElementById('searchQuery').value = '';
    document.getElementById('orderBy').value = 'date';
    document.getElementById('maxResults').value = 50;
    document.getElementById('regionCode').value = 'KR';
    document.getElementById('videoDuration').value = 'any';
    document.getElementById('minInfluenceScore').value = '';
    document.getElementById('minViewCount').value = '';
    document.getElementById('maxViewCount').value = '';
    document.getElementById('minSubscribers').value = '';
    document.getElementById('maxSubscribers').value = '';
    
    // 날짜도 기본값으로 재설정
    setDefaultDates();
}

function showLoading(message) {
    const resultsContent = document.getElementById('results-content');
    
    // 기존 테이블이 있으면 유지하고 로딩 메시지만 추가
    if (document.querySelector('.results-table')) {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading';
        loadingDiv.textContent = message;
        loadingDiv.id = 'loading-message';
        
        // 기존 로딩 메시지 제거
        const existingLoading = document.getElementById('loading-message');
        if (existingLoading) {
            existingLoading.remove();
        }
        
        resultsContent.appendChild(loadingDiv);
    } else {
        resultsContent.innerHTML = `<div class="loading">${message}</div>`;
    }
    
    document.getElementById('results-count').textContent = '로딩 중...';
}

function showError(message) {
    document.getElementById('results-content').innerHTML = `
        <div class="error">${message}</div>
    `;
    document.getElementById('results-count').textContent = '오류 발생';
}

// 모달 외부 클릭시 닫기
document.getElementById('captionModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeCaptionModal();
    }
});