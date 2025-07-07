// 설정 및 상수
const CONFIG = {
        
    // API 엔드포인트
    ENDPOINTS: {
        SEARCH_ALL: '/api/search-all-youtube',
        VIDEOS_BATCH: '/api/videos-batch',
        CHANNELS_BATCH: '/api/channels-batch',
        VIDEO_CAPTIONS: '/api/video-captions',
        TRENDING_KEYWORDS: '/api/trending-keywords'  // 새로 추가
    },
    
    // UI 설정
    TABLE: {
        MAX_RESULTS_PER_REQUEST: 100,
        DEFAULT_RESULTS: 100
    },
    
    // 등급 기준
    PERFORMANCE_GRADES: {
        GREAT: 100,
        GOOD: 10,
        NORMAL: 1,
        BAD: 0.5
    },
    
    CONTRIBUTION_GRADES: {
        GREAT: 500,
        GOOD: 200,
        NORMAL: 100,
        BAD: 50
    },
    
    // 외부 서비스 URL
    EXTERNAL_URLS: {
        CAPTION_DOWNLOADER: 'https://downsub.com/?url=',
        YOUTUBE_VIDEO: 'https://www.youtube.com/watch?v=',
        YOUTUBE_CHANNEL: 'https://www.youtube.com/channel/'
    }
};

// 전역 상태 관리
const STATE = {
    allVideos: [],
    displayedVideos: [],
    channelCache: {},
    currentPageToken: '',
    nextPageToken: '',
    currentSort: { column: null, direction: 'desc' }
};

// 상태 초기화 함수
function resetState() {
    STATE.allVideos = [];
    STATE.displayedVideos = [];
    STATE.channelCache = {};
    STATE.currentPageToken = '';
    STATE.nextPageToken = '';
}