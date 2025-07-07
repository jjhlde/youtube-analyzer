// table-manager.js 수정 버전 (무한 스크롤 지원)

class TableManager {
    static createHeader() {
        const resultsContent = document.getElementById('results-content');
        
        const tableHtml = `
            <table class="results-table">
                <thead>
                    <tr>
                        <th onclick="TableManager.sortBy('thumbnail')">썸네일</th>
                        <th onclick="TableManager.sortBy('channelTitle')">채널명<span class="sort-indicator"></span></th>
                        <th onclick="TableManager.sortBy('title')">영상제목<span class="sort-indicator"></span></th>
                        <th onclick="TableManager.sortBy('publishedAt')">게시일<span class="sort-indicator"></span></th>
                        <th onclick="TableManager.sortBy('subscriberCount')">구독자수<span class="sort-indicator"></span></th>
                        <th onclick="TableManager.sortBy('viewCount')">조회수<span class="sort-indicator"></span></th>
                        <th onclick="TableManager.sortBy('contributionScore')" class="tooltip">
                            기여도<span class="sort-indicator"></span>
                            <span class="tooltiptext">
                                <strong>📊 기여도 계산 방식</strong><br><br>
                                <strong>공식:</strong> (영상 조회수 ÷ 채널 평균 조회수) × 100<br><br>
                                <strong>등급 기준:</strong><br>
                                <div class="tooltip-grade great">최고</div> 500% 이상 (5배)<br>
                                <div class="tooltip-grade good">좋음</div> 200~500% (2~5배)<br>
                                <div class="tooltip-grade normal">보통</div> 100~200% (1~2배)<br>
                                <div class="tooltip-grade bad">나쁨</div> 50~100% (0.5~1배)<br>
                                <div class="tooltip-grade worst">최악</div> 50% 미만 (0.5배 미만)<br><br>
                                채널 평균 대비 해당 영상의 성과
                            </span>
                        </th>
                        <th onclick="TableManager.sortBy('performanceScore')" class="tooltip">
                            성과도<span class="sort-indicator"></span>
                            <span class="tooltiptext">
                                <strong>🎯 성과도 계산 방식</strong><br><br>
                                <strong>공식:</strong> 영상 조회수 ÷ 구독자 수<br><br>
                                <strong>의미:</strong> 구독자 기반 노출 대비 실제 성과<br><br>
                                <strong>예시:</strong><br>
                                • 구독자 10만명, 조회수 50만회<br>
                                • 성과도 = 50만 ÷ 10만 = 5배<br><br>
                                높을수록 구독자 이외 유입이 많음
                            </span>
                        </th>
                        <th onclick="TableManager.sortBy('influenceGrade')" class="tooltip">
                            영향력지수<span class="sort-indicator"></span>
                            <span class="tooltiptext">
                                <strong>⭐ 영향력 지수 등급</strong><br><br>
                                <div class="tooltip-grade great">최고</div> 100배 이상<br>
                                <div class="tooltip-grade good">좋음</div> 10~100배<br>
                                <div class="tooltip-grade normal">보통</div> 1~10배<br>
                                <div class="tooltip-grade bad">나쁨</div> 0.5~1배<br>
                                <div class="tooltip-grade worst">최악</div> 0.5배 미만<br><br>
                                성과도를 기준으로 한 5단계 등급
                            </span>
                        </th>
                        <th onclick="TableManager.sortBy('duration')" class="duration-column">영상길이<span class="sort-indicator"></span></th>
                        <th onclick="TableManager.sortBy('likeCount')" class="likes-column">좋아요<span class="sort-indicator"></span></th>
                        <th onclick="TableManager.sortBy('commentCount')">댓글/참여율<span class="sort-indicator"></span></th>
                        <th onclick="TableManager.sortBy('videoCount')" class="video-count-column">채널총영상<span class="sort-indicator"></span></th>
                    </tr>
                </thead>
                <tbody id="table-body">
                </tbody>
            </table>
        `;
        
        resultsContent.innerHTML = tableHtml;
    }
    
    static updateBody() {
        const tableBody = document.getElementById('table-body');
        tableBody.innerHTML = '';
        this.appendTableRows(STATE.displayedVideos);
    }
    
    // ★★★ 새로운 함수 - 테이블에 행 추가 (무한 스크롤용) ★★★
    static appendTableRows(videos) {
        const tableBody = document.getElementById('table-body');
        let html = '';
        
        videos.forEach(video => {
            html += this.generateTableRow(video);
        });
        
        tableBody.insertAdjacentHTML('beforeend', html);
        
        // 즐겨찾기 버튼 상태 업데이트
        FavoritesManager.updateFavoriteButtons();
    }
    
    // ★★★ 새로운 함수 - 테이블 행 HTML 생성 ★★★
    static generateTableRow(video) {
        const thumbnail = video.snippet.thumbnails?.medium?.url || video.snippet.thumbnails?.default?.url;
        const duration = UIUtils.formatDuration(video.contentDetails?.duration);
        const videoUrl = CONFIG.EXTERNAL_URLS.YOUTUBE_VIDEO + video.id;
        const channelUrl = CONFIG.EXTERNAL_URLS.YOUTUBE_CHANNEL + video.channel.id;
        const captionUrl = UIUtils.generateCaptionUrl(video.id);
        
        return `
            <tr>
                <td class="thumbnail-cell">
                    <img src="${thumbnail}" alt="썸네일" loading="lazy" onclick="UIUtils.openVideo('${videoUrl}')">
                    <div class="duration-badge">${duration}</div>
                </td>
                <td class="channel-cell">
                    <a href="${channelUrl}" target="_blank" class="channel-link">${video.channel.snippet.title}</a>
                    <div style="margin-top: 5px;">
                        <button class="favorite-btn" data-video-id="${video.id}" 
                                onclick="FavoritesManager.isFavorite('${video.id}') ? FavoritesManager.removeFavorite('${video.id}') : FavoritesManager.addFavorite(STATE.displayedVideos.find(v => v.id === '${video.id}'))"
                                style="background: none; border: none; font-size: 16px; cursor: pointer; padding: 2px;">
                            ${FavoritesManager.isFavorite(video.id) ? '⭐' : '☆'}
                        </button>
                    </div>
                </td>
                <td class="title-cell">
                    <div class="video-title">${video.snippet.title}</div>
                    <div style="margin-top: 5px;">
                        <a href="${captionUrl}" target="_blank" class="captions-btn">📝 자막</a>
                    </div>
                </td>
                <td class="date-cell">${UIUtils.formatDate(video.snippet.publishedAt)}</td>
                <td class="number-cell">${UIUtils.formatNumber(video.subscriberCount)}</td>
                <td class="number-cell">${UIUtils.formatNumber(video.viewCount)}</td>
                <td>
                    <span class="grade-cell grade-${video.contributionGrade.grade}">
                        ${video.contributionGrade.text}
                    </span>
                </td>
                <td class="number-cell">${video.performanceScore.toFixed(1)}배</td>
                <td>
                    <span class="grade-cell grade-${video.influenceGrade.grade}">
                        ${video.influenceGrade.text}
                    </span>
                </td>
                <td class="date-cell duration-column">${duration}</td>
                <td class="number-cell compact-number likes-column">${UIUtils.formatNumber(video.likeCount)}</td>
                <td class="combined-cell">
                    <div class="main-value">${UIUtils.formatNumber(video.commentCount)}</div>
                    <div class="sub-value">${video.engagementRate.toFixed(1)}%</div>
                </td>
                <td class="number-cell compact-number video-count-column">${UIUtils.formatNumber(video.videoCount)}</td>
            </tr>
        `;
    }
    
    static sortBy(column) {
        // 정렬 방향 결정
        if (STATE.currentSort.column === column) {
            STATE.currentSort.direction = STATE.currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            STATE.currentSort.column = column;
            STATE.currentSort.direction = 'desc';
        }
        
        // 정렬 실행
        STATE.displayedVideos.sort((a, b) => {
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
                    const contributionGradeOrder = { 'worst': 1, 'bad': 2, 'normal': 3, 'good': 4, 'great': 5 };
                    valueA = contributionGradeOrder[a.contributionGrade.grade];
                    valueB = contributionGradeOrder[b.contributionGrade.grade];
                    break;
                case 'performanceScore':
                    valueA = a.performanceScore;
                    valueB = b.performanceScore;
                    break;
                case 'influenceGrade':
                    const gradeOrder = { 'worst': 1, 'bad': 2, 'normal': 3, 'good': 4, 'great': 5 };
                    valueA = gradeOrder[a.influenceGrade.grade];
                    valueB = gradeOrder[b.influenceGrade.grade];
                    break;
                case 'duration':
                    valueA = UIUtils.parseDuration(a.contentDetails?.duration);
                    valueB = UIUtils.parseDuration(b.contentDetails?.duration);
                    break;
                case 'likeCount':
                    valueA = a.likeCount;
                    valueB = b.likeCount;
                    break;
                case 'commentCount':
                    valueA = a.commentCount;
                    valueB = b.commentCount;
                    break;
                case 'videoCount':
                    valueA = a.videoCount;
                    valueB = b.videoCount;
                    break;
                default:
                    return 0;
            }
            
            if (STATE.currentSort.direction === 'asc') {
                return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
            } else {
                return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
            }
        });
        
        // 정렬 표시 업데이트
        this.updateSortIndicators();
        
        // 테이블 다시 그리기
        this.updateBody();
    }
    
    static updateSortIndicators() {
        // 모든 정렬 표시 초기화
        document.querySelectorAll('.sort-indicator').forEach(indicator => {
            indicator.textContent = '';
        });
        
        // 현재 정렬된 컬럼에 표시
        const currentHeader = document.querySelector(`th[onclick="TableManager.sortBy('${STATE.currentSort.column}')"] .sort-indicator`);
        if (currentHeader) {
            currentHeader.textContent = STATE.currentSort.direction === 'asc' ? '↑' : '↓';
        }
    }

    // ★★★ 모바일 카드 리스트 생성 ★★★
    static createMobileCardList() {
        const resultsContent = document.getElementById('results-content-mobile');
        resultsContent.innerHTML = '<div class="mobile-card-container" id="mobile-card-container"></div>';
        this.appendMobileCards(STATE.displayedVideos);
    }
    
    // ★★★ 새로운 함수 - 모바일 카드 추가 (무한 스크롤용) ★★★
    static appendMobileCards(videos) {
        const container = document.getElementById('mobile-card-container');
        if (!container) {
            // 컨테이너가 없으면 새로 생성
            this.createMobileCardList();
            return;
        }
        
        let html = '';
        videos.forEach(video => {
            html += this.generateMobileCard(video);
        });
        
        container.insertAdjacentHTML('beforeend', html);
        
        // 즐겨찾기 버튼 상태 업데이트
        FavoritesManager.updateFavoriteButtons();
    }
    
    // ★★★ 새로운 함수 - 모바일 카드 HTML 생성 ★★★
    static generateMobileCard(video) {
        const thumbnail = video.snippet.thumbnails?.medium?.url || video.snippet.thumbnails?.default?.url;
        const duration = UIUtils.formatDuration(video.contentDetails?.duration);
        const videoUrl = CONFIG.EXTERNAL_URLS.YOUTUBE_VIDEO + video.id;
        const channelUrl = CONFIG.EXTERNAL_URLS.YOUTUBE_CHANNEL + video.channel.id;
        
        return `
            <div class="mobile-video-card" onclick="UIUtils.openVideo('${videoUrl}')">
                <div class="card-thumbnail">
                    <img src="${thumbnail}" alt="썸네일" loading="lazy">
                    <div class="card-duration">${duration}</div>
                </div>
                <div class="card-info">
                    <div class="card-title">${video.snippet.title}</div>
                    <div class="card-channel">${video.channel.snippet.title}</div>
                    <div class="card-stats">
                        <span>조회수 ${UIUtils.formatNumber(video.viewCount)}</span>
                        <span>구독자 ${UIUtils.formatNumber(video.subscriberCount)}</span>
                    </div>
                    <div class="card-grades">
                        <span class="grade-badge grade-${video.influenceGrade.grade}">${video.influenceGrade.text}</span>
                        <span class="performance-score">${video.performanceScore.toFixed(1)}배</span>
                    </div>
                </div>
                <button class="card-favorite" data-video-id="${video.id}" 
                        onclick="event.stopPropagation(); FavoritesManager.isFavorite('${video.id}') ? FavoritesManager.removeFavorite('${video.id}') : FavoritesManager.addFavorite(STATE.displayedVideos.find(v => v.id === '${video.id}'))"
                        style="background: rgba(255,255,255,0.9); border: none; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 16px; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                    ${FavoritesManager.isFavorite(video.id) ? '⭐' : '☆'}
                </button>
            </div>
        `;
    }
}