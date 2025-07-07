// UI 유틸리티 함수들

class UIUtils {
    // 날짜 관련
    static setDefaultDates() {
        const today = new Date();
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(today.getMonth() - 1);
        
        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };
        
        // PC용 요소들
        const pcAfter = document.getElementById('publishedAfter');
        const pcBefore = document.getElementById('publishedBefore');
        
        // 모바일용 요소들
        const mobileAfter = document.getElementById('publishedAfterMobile');
        const mobileBefore = document.getElementById('publishedBeforeMobile');
        
        const defaultAfter = formatDate(oneMonthAgo);
        const defaultBefore = formatDate(today);
        
        if (pcAfter) pcAfter.value = defaultAfter;
        if (pcBefore) pcBefore.value = defaultBefore;
        if (mobileAfter) mobileAfter.value = defaultAfter;
        if (mobileBefore) mobileBefore.value = defaultBefore;
    }
    
    // 포맷팅 함수들
    static formatNumber(num) {
        if (num >= 100000000) {
            return (num / 100000000).toFixed(1) + '억';
        } else if (num >= 10000000) {
            return Math.floor(num / 10000000) + '천만';
        } else if (num >= 1000000) {
            return Math.floor(num / 1000000) + '백만';
        } else if (num >= 100000) {
            return Math.floor(num / 100000) + '십만';
        } else if (num >= 10000) {
            return (num / 10000).toFixed(1).replace('.0', '') + '만';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1).replace('.0', '') + '천';
        }
        return num.toLocaleString();
    }
    
    static formatDate(dateString) {
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
    
    static formatDuration(duration) {
        if (!duration) return '시간 정보 없음';
        
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
    
    static parseDuration(duration) {
        if (!duration) return 0;
        
        const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        if (!match) return 0;
        
        const hours = parseInt(match[1] || 0);
        const minutes = parseInt(match[2] || 0);
        const seconds = parseInt(match[3] || 0);
        
        return hours * 3600 + minutes * 60 + seconds;
    }
    
    // 링크 관련
    static openVideo(videoUrl) {
        window.open(videoUrl, '_blank');
    }
    
    static generateCaptionUrl(videoId) {
        return CONFIG.EXTERNAL_URLS.CAPTION_DOWNLOADER + CONFIG.EXTERNAL_URLS.YOUTUBE_VIDEO + videoId;
    }
    
    // UI 상태 관리
    static showLoading(message) {
        const isMobile = window.innerWidth <= 768;
        const resultsContent = isMobile ? 
            document.getElementById('results-content-mobile') :
            document.getElementById('results-content');
        
        if (!resultsContent) return;
        
        if (document.querySelector('.results-table') || document.querySelector('.mobile-card-container')) {
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'loading';
            loadingDiv.textContent = message;
            loadingDiv.id = 'loading-message';
            
            const existingLoading = document.getElementById('loading-message');
            if (existingLoading) {
                existingLoading.remove();
            }
            
            resultsContent.appendChild(loadingDiv);
        } else {
            resultsContent.innerHTML = `<div class="loading">${message}</div>`;
        }
        
        const countElement = isMobile ? 
            document.getElementById('results-count-mobile') :
            document.getElementById('results-count');
            
        if (countElement) {
            countElement.textContent = '로딩 중...';
        }
    }
    
    static showError(message) {
        const isMobile = window.innerWidth <= 768;
        const resultsContent = isMobile ? 
            document.getElementById('results-content-mobile') :
            document.getElementById('results-content');
            
        const countElement = isMobile ? 
            document.getElementById('results-count-mobile') :
            document.getElementById('results-count');
        
        if (resultsContent) {
            resultsContent.innerHTML = `<div class="error">${message}</div>`;
        }
        
        if (countElement) {
            countElement.textContent = '오류 발생';
        }
    }
    
    static updateResultsCount(count) {
        const isMobile = window.innerWidth <= 768;
        const countElement = isMobile ? 
            document.getElementById('results-count-mobile') :
            document.getElementById('results-count');
            
        if (countElement) {
            countElement.textContent = `${count}개 영상 발견`;
        }
    }
    
    // ★★★ 새로운 함수 - 알림 표시 ★★★
    static showNotification(message, type = 'success') {
        // 기존 알림 제거
        const existing = document.querySelector('.ui-notification');
        if (existing) existing.remove();
        
        const notification = document.createElement('div');
        notification.className = `ui-notification notification-${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            ${type === 'success' ? 'background: #10b981;' : ''}
            ${type === 'warning' ? 'background: #f59e0b;' : ''}
            ${type === 'info' ? 'background: #3b82f6;' : ''}
            ${type === 'error' ? 'background: #ef4444;' : ''}
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    // 필터 초기화
    static resetFilters() {
        // PC용 요소들 초기화
        const pcElements = {
            searchQuery: '',
            orderBy: 'date',
            maxResults: '50',
            regionCode: 'KR',
            videoDuration: 'any',
            minInfluenceScore: '',
            minViewCount: '',
            maxViewCount: '',
            minSubscribers: '',
            maxSubscribers: ''
        };
        
        // 모바일용 요소들 초기화
        const mobileElements = {
            searchQueryMobile: '',
            orderByMobile: 'date',
            maxResultsMobile: '50',
            regionCodeMobile: 'KR',
            videoDurationMobile: 'any',
            minInfluenceScoreMobile: '',
            minViewCountMobile: '',
            maxViewCountMobile: '',
            minSubscribersMobile: '',
            maxSubscribersMobile: ''
        };
        
        // PC 요소들 설정
        Object.entries(pcElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.value = value;
            }
        });
        
        // 모바일 요소들 설정
        Object.entries(mobileElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.value = value;
            }
        });
        
        // 날짜 기본값 설정
        this.setDefaultDates();
    }
}

// 전역 함수: 카드 접기/펼치기
function toggleCard(header) {
    const content = header.nextElementSibling;
    const icon = header.querySelector('.collapse-icon');
    
    if (content.classList.contains('collapsed')) {
        content.classList.remove('collapsed');
        header.classList.remove('collapsed');
        if (icon) icon.textContent = '▼';
    } else {
        content.classList.add('collapsed');
        header.classList.add('collapsed');
        if (icon) icon.textContent = '▶';
    }
}