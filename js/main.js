// 메인 애플리케이션 로직

class YouTubeAnalyzer {
    static async init() {
        // 기본값 설정
        UIUtils.setDefaultDates();
        
        // 이벤트 리스너 등록
        this.setupEventListeners();
    }
    
    static setupEventListeners() {
        // 검색창에서 Enter 키 입력시 검색 실행
        const searchInput = document.getElementById('searchQuery');
        if (searchInput) {
            searchInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    YouTubeAnalyzer.startSearch();
                }
            });
        }
        
        // 모달 외부 클릭시 닫기
        const modal = document.getElementById('captionModal');
        if (modal) {
            modal.addEventListener('click', function(e) {
                if (e.target === this) {
                    modal.style.display = 'none';
                }
            });
        }
    }
    
    static async startSearch() {
        try {
            // 검색 파라미터 구성 및 검증
            const searchParams = SearchParamsBuilder.buildFromForm();
            SearchParamsBuilder.validateParams(searchParams);
            
            UIUtils.showLoading('검색 중...');
            
            // 새 검색시 기존 데이터 초기화
            resetState();
            
            // 결과 탭 초기화 (분석 결과 탭 숨기기)
            this.initializeResultTabs();
            
            await this.searchVideos();
        } catch (error) {
            console.error('검색 시작 오류:', error);
            UIUtils.showError(`검색 오류: ${error.message}`);
        }
    }
    
    // ★★★ 새로운 함수 - 결과 탭 초기화 ★★★
    static initializeResultTabs() {
        const resultsContainer = document.querySelector('.results-container');
        
        // 분석 상태 초기화
        window.analysisAvailable = false;
        window.currentAnalysisData = null;
        
        // 탭 HTML 구조 생성
        const tabsHTML = `
            <div class="results-tabs">
                <button class="results-tab-btn active" data-tab="search" onclick="YouTubeAnalyzer.switchResultTab('search')">
                    <span class="tab-icon">📊</span>
                    <span class="tab-text">검색결과</span>
                </button>
                <button class="results-tab-btn disabled" data-tab="analysis" onclick="YouTubeAnalyzer.switchResultTab('analysis')" disabled>
                    <span class="tab-icon">📈</span>
                    <span class="tab-text">분석결과</span>
                    <span class="tab-badge">대기중</span>
                </button>
            </div>
            
            <div class="results-tab-content">
                <div class="tab-panel active" id="search-results-panel">
                    <div class="results-header">
                        <h3>검색 결과</h3>
                        <div id="results-count">검색을 시작해주세요</div>
                    </div>
                    
                    <div id="results-content"></div>
                    
                    <div id="pagination" class="pagination"></div>
                </div>
                
                <div class="tab-panel" id="analysis-results-panel">
                    <!-- 분석 결과는 나중에 동적으로 생성 -->
                </div>
            </div>
        `;
        
        resultsContainer.innerHTML = tabsHTML;
    }
    
    // ★★★ 새로운 함수 - 결과 탭 전환 ★★★
    static switchResultTab(tabName) {
        // 탭 버튼 상태 변경
        document.querySelectorAll('.results-tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // 탭 패널 상태 변경
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        
        if (tabName === 'search') {
            document.getElementById('search-results-panel').classList.add('active');
        } else if (tabName === 'analysis') {
            document.getElementById('analysis-results-panel').classList.add('active');
            
            // 분석 결과가 없으면 자동 생성
            if (!window.currentAnalysisData) {
                this.generateAnalysisResults();
            }
        }
    }
    
    // ★★★ 수정된 함수 - 분석 탭 활성화하지만 검색결과 탭 유지 ★★★
    static enableAnalysisTab() {
        const analysisTabBtn = document.querySelector('[data-tab="analysis"]');
        const tabBadge = analysisTabBtn.querySelector('.tab-badge');
        
        analysisTabBtn.classList.remove('disabled');
        analysisTabBtn.disabled = false;
        tabBadge.textContent = '준비완료';
        tabBadge.style.background = '#28a745';
        
        window.analysisAvailable = true;
        
        // ★★★ 수정: 자동으로 분석 탭으로 전환하지 않고 검색결과 탭 유지 ★★★
        console.log('분석 탭이 활성화되었습니다. 검색결과 탭을 유지합니다.');
    }
    
    // ★★★ 수정된 함수 - 분석 결과 생성 ★★★
    static generateAnalysisResults() {
        if (!STATE.displayedVideos || STATE.displayedVideos.length === 0) {
            return;
        }
        
        // 기존 keywordHelper의 분석 로직 사용
        const analysisData = this.performAnalysis();
        window.currentAnalysisData = analysisData;
        
        // 분석 결과 패널에 HTML 삽입
        const analysisPanel = document.getElementById('analysis-results-panel');
        analysisPanel.innerHTML = this.createAnalysisHTML(analysisData);
    }
    
    // ★★★ 새로운 함수 - 분석 수행 ★★★
    static performAnalysis() {
        // 각 영상의 떡상 가능성 분석
        const analyzedVideos = STATE.displayedVideos.map(video => ({
            ...video,
            trendScore: seniorAnalyzer.analyzeTrendPotential(video),
            categories: seniorAnalyzer.categorizeContent(video.snippet.title, video.snippet.description),
            isSeniorRelated: seniorAnalyzer.isSeniorRelated(video.snippet.title, video.snippet.description)
        }));
        
        // 시니어 관련 영상들만 필터링
        const seniorVideos = analyzedVideos.filter(v => v.isSeniorRelated);
        
        // 상위 떡상 가능성 영상들
        const topTrendVideos = analyzedVideos
            .sort((a, b) => b.trendScore.total - a.trendScore.total)
            .slice(0, 5);
        
        // 카테고리별 분포
        const categoryStats = {};
        seniorVideos.forEach(video => {
            video.categories.forEach(cat => {
                if (!categoryStats[cat.category]) {
                    categoryStats[cat.category] = { count: 0, avgScore: 0, totalScore: 0 };
                }
                categoryStats[cat.category].count++;
                categoryStats[cat.category].totalScore += video.trendScore.total;
            });
        });
        
        Object.keys(categoryStats).forEach(category => {
            categoryStats[category].avgScore = 
                categoryStats[category].totalScore / categoryStats[category].count;
        });
        
        // 기회 분석
        const gapAnalysis = this.analyzeGaps(analyzedVideos);
        
        return {
            analyzedVideos,
            seniorVideos,
            topTrendVideos,
            categoryStats,
            gapAnalysis
        };
    }
    
    // ★★★ 새로운 함수 - 기회 분석 ★★★
    static analyzeGaps(analyzedVideos) {
        const gaps = [];
        const opportunities = [];
        
        // 성과도가 낮은 영상들이 많은 키워드들
        const lowPerformanceVideos = analyzedVideos.filter(v => v.performanceScore < 1);
        
        // 최근 콘텐츠가 부족한 주제들
        const oldContentVideos = analyzedVideos.filter(v => {
            const daysSince = (Date.now() - new Date(v.snippet.publishedAt)) / (1000 * 60 * 60 * 24);
            return daysSince > 30;
        });
        
        if (lowPerformanceVideos.length > analyzedVideos.length * 0.4) {
            gaps.push('현재 검색 결과의 많은 영상들이 저성과 → 진입 기회 있음');
            opportunities.push('고품질 콘텐츠로 차별화 가능');
        }
        
        if (oldContentVideos.length > analyzedVideos.length * 0.6) {
            gaps.push('최근 30일 내 콘텐츠 부족 → 타이밍 좋음');
            opportunities.push('최신 정보로 승부');
        }
        
        // 구독자는 많지만 조회수가 낮은 채널들
        const underperformingChannels = analyzedVideos.filter(v => 
            v.subscriberCount > 100000 && v.performanceScore < 0.5
        );
        
        if (underperformingChannels.length > 0) {
            gaps.push(`대형 채널들도 고전하는 주제 → 콘텐츠 품질로 승부 가능`);
            opportunities.push('콘텐츠 품질로 역전 가능');
        }
        
        const html = `
            <div class="gap-analysis">
                ${gaps.length > 0 ? 
                    gaps.map(gap => `<div class="gap-item">✅ ${gap}</div>`).join('') :
                    '<div class="gap-item">❌ 현재 검색어는 경쟁이 치열합니다. 다른 키워드를 시도해보세요.</div>'
                }
            </div>
        `;
        
        return { html, opportunities };
    }
    
    // ★★★ 새로운 함수 - 분석 HTML 생성 ★★★
    static createAnalysisHTML(data) {
        const { analyzedVideos, topTrendVideos, categoryStats, gapAnalysis } = data;
        
        return `
            <div class="analysis-results">
                <div class="analysis-header">
                    <h2>📊 키워드 분석 결과</h2>
                    <div class="analysis-meta">
                        <span>검색어: "${document.getElementById('searchQuery').value}"</span>
                    </div>
                </div>
                
                <!-- 기본 통계 요약 -->
                <div class="analysis-accordion">
                    <div class="accordion-item">
                        <div class="accordion-header active" onclick="YouTubeAnalyzer.toggleAccordion(this)">
                            <span class="accordion-icon">📈</span>
                            <span class="accordion-title">기본 통계 요약</span>
                            <span class="accordion-arrow">▼</span>
                        </div>
                        <div class="accordion-content active">
                            <div class="stats-grid">
                                <div class="stat-card">
                                    <div class="stat-number">${STATE.displayedVideos.length}</div>
                                    <div class="stat-label">총 영상 수</div>
                                </div>
                                <div class="stat-card">
                                    <div class="stat-number">${Math.round(STATE.displayedVideos.reduce((sum, v) => sum + v.viewCount, 0) / STATE.displayedVideos.length).toLocaleString()}</div>
                                    <div class="stat-label">평균 조회수</div>
                                </div>
                                <div class="stat-card">
                                    <div class="stat-number">${Math.round(STATE.displayedVideos.reduce((sum, v) => sum + v.subscriberCount, 0) / STATE.displayedVideos.length).toLocaleString()}</div>
                                    <div class="stat-label">평균 구독자수</div>
                                </div>
                                <div class="stat-card">
                                    <div class="stat-number">${(STATE.displayedVideos.reduce((sum, v) => sum + v.performanceScore, 0) / STATE.displayedVideos.length).toFixed(1)}배</div>
                                    <div class="stat-label">평균 성과도</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 떡상 가능성 TOP 5 -->
                    <div class="accordion-item">
                        <div class="accordion-header" onclick="YouTubeAnalyzer.toggleAccordion(this)">
                            <span class="accordion-icon">🏆</span>
                            <span class="accordion-title">떡상 가능성 TOP 5</span>
                            <span class="accordion-arrow">▶</span>
                        </div>
                        <div class="accordion-content">
                            <div class="trend-ranking">
                                ${topTrendVideos.map((video, index) => {
                                    const thumbnail = video.snippet.thumbnails?.medium?.url || video.snippet.thumbnails?.default?.url;
                                    const videoUrl = `https://www.youtube.com/watch?v=${video.id}`;
                                    return `
                                        <div class="trend-item" onclick="window.open('${videoUrl}', '_blank')" style="cursor: pointer;">
                                            <span class="rank">${index + 1}</span>
                                            <img src="${thumbnail}" alt="썸네일" class="trend-thumbnail">
                                            <div class="trend-info">
                                                <div class="trend-title">${video.snippet.title.substring(0, 45)}...</div>
                                                <div class="trend-score">떡상점수: ${video.trendScore.total.toFixed(1)}점</div>
                                                <div class="trend-channel">${video.channel.snippet.title}</div>
                                                <div class="trend-views">조회수: ${video.viewCount.toLocaleString()}회</div>
                                            </div>
                                            <span class="trend-total">${video.trendScore.total.toFixed(0)}점</span>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    </div>
                    
                    <!-- 카테고리별 경쟁 현황 -->
                    <div class="accordion-item">
                        <div class="accordion-header" onclick="YouTubeAnalyzer.toggleAccordion(this)">
                            <span class="accordion-icon">📊</span>
                            <span class="accordion-title">카테고리별 경쟁 현황</span>
                            <span class="accordion-arrow">▶</span>
                        </div>
                        <div class="accordion-content">
                            <div class="category-stats">
                                ${Object.entries(categoryStats).map(([category, stats]) => `
                                    <div class="category-stat">
                                        <span class="category-name">${category}</span>
                                        <span class="category-count">${stats.count}개</span>
                                        <span class="category-score">평균 ${stats.avgScore.toFixed(1)}점</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    
                    <!-- 발견된 기회 -->
                    <div class="accordion-item">
                        <div class="accordion-header" onclick="YouTubeAnalyzer.toggleAccordion(this)">
                            <span class="accordion-icon">🎯</span>
                            <span class="accordion-title">발견된 기회</span>
                            <span class="accordion-arrow">▶</span>
                        </div>
                        <div class="accordion-content">
                            ${gapAnalysis.html}
                        </div>
                    </div>
                    
                    <!-- 추천 전략 -->
                    <div class="accordion-item">
                        <div class="accordion-header" onclick="YouTubeAnalyzer.toggleAccordion(this)">
                            <span class="accordion-icon">💡</span>
                            <span class="accordion-title">추천 전략</span>
                            <span class="accordion-arrow">▶</span>
                        </div>
                        <div class="accordion-content">
                            <div class="strategy-tips">
                                <div class="tip-item">🎬 정보전달형: "${document.getElementById('searchQuery').value} 완전정복" 시리즈</div>
                                <div class="tip-item">📖 썰채널형: "${document.getElementById('searchQuery').value}에 대한 충격적인 진실" 스타일</div>
                                <div class="tip-item">👥 타겟팅: 50-70대 + 해당 주제에 관심있는 자녀 세대</div>
                                <div class="tip-item">🎯 차별화: ${gapAnalysis.opportunities.length > 0 ? gapAnalysis.opportunities[0] : '고품질 콘텐츠로 승부'}</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="analysis-actions">
                    <button class="analysis-btn" onclick="YouTubeAnalyzer.exportAnalysis()">📋 분석 결과 복사</button>
                </div>
            </div>
        `;
    }
    
    // 아코디언 토글 함수
    static toggleAccordion(header) {
        const content = header.nextElementSibling;
        const arrow = header.querySelector('.accordion-arrow');
        
        if (content.classList.contains('active')) {
            content.classList.remove('active');
            arrow.textContent = '▶';
            header.classList.remove('active');
        } else {
            content.classList.add('active');
            arrow.textContent = '▼';
            header.classList.add('active');
        }
    }
    
    // 분석 결과 내보내기
    static exportAnalysis() {
        const analysisText = `
유튜브 키워드 분석 결과

검색어: ${document.getElementById('searchQuery').value}
분석일시: ${new Date().toLocaleString()}

=== 기본 통계 ===
- 총 영상 수: ${STATE.displayedVideos.length}개
- 평균 조회수: ${Math.round(STATE.displayedVideos.reduce((sum, v) => sum + v.viewCount, 0) / STATE.displayedVideos.length).toLocaleString()}회
- 평균 구독자: ${Math.round(STATE.displayedVideos.reduce((sum, v) => sum + v.subscriberCount, 0) / STATE.displayedVideos.length).toLocaleString()}명

=== 추천 콘텐츠 아이디어 ===
정보전달형: "${document.getElementById('searchQuery').value} 완전정복" 시리즈
썰채널형: "${document.getElementById('searchQuery').value}의 숨겨진 진실" 스타일

=== 타겟 연령대 ===
주타겟: 50-70세
부타겟: 해당 주제 관심 자녀세대 (30-50세)

분석 도구: 유튜브 콘텐츠 분석기
        `;
        
        navigator.clipboard.writeText(analysisText).then(() => {
            UIUtils.showNotification('분석 결과가 클립보드에 복사되었습니다! 📋', 'success');
        }).catch(() => {
            // 클립보드 복사 실패시 텍스트 영역으로 표시
            const textarea = document.createElement('textarea');
            textarea.value = analysisText;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            
            UIUtils.showNotification('분석 결과가 복사되었습니다! 📋', 'success');
        });
    }
    
    static async searchVideos(pageToken = '') {
        try {
            // 검색 파라미터 구성
            const searchParams = SearchParamsBuilder.buildFromForm();
            
            console.log('검색 시작:', searchParams);
            
            // API 호출
            const data = await YouTubeAPI.searchAllVideos(searchParams, pageToken);
            
            if (!data.items || data.items.length === 0) {
                UIUtils.showError('검색 결과가 없습니다. 다른 조건으로 시도해보세요.');
                return;
            }
            
            console.log(`${data.items.length}개의 영상을 찾았습니다.`);
            
            // 영상 상세 정보 가져오기
            const videoIds = data.items.map(item => item.id.videoId).join(',');
            console.log('영상 상세정보 요청:', videoIds);
            
            const detailsData = await YouTubeAPI.getVideoDetails(videoIds);
            console.log(`${detailsData.items.length}개의 영상 상세정보를 가져왔습니다.`);
            
            // 채널 정보 가져오기
            const channelIds = [...new Set(detailsData.items.map(item => item.snippet.channelId))];
            console.log(`${channelIds.length}개의 고유 채널 정보 요청`);
            
            await ChannelCache.updateCache(channelIds);
            
            // 데이터 처리 및 필터 적용
            const processedVideos = DataProcessor.processVideoData(detailsData.items);
            console.log(`${processedVideos.length}개의 영상 데이터 처리 완료`);
            
            const filteredVideos = DataProcessor.applyFilters(processedVideos);
            console.log(`필터 적용 후 ${filteredVideos.length}개의 영상`);
            
            // 결과 표시
            const isAppend = pageToken !== '';
            this.displayResults(filteredVideos, isAppend);
            
            // 페이지네이션 설정
            STATE.nextPageToken = data.nextPageToken;
            this.setupPagination();
            
            // 분석 탭 활성화 (검색 결과가 있을 때)
            if (filteredVideos.length > 0) {
                this.enableAnalysisTab();
            }
            
        } catch (error) {
            console.error('검색 중 오류:', error);
            
            // 구체적인 오류 메시지 제공
            let errorMessage = '검색 중 오류가 발생했습니다.';
            
            if (error.message.includes('400')) {
                errorMessage = '검색 조건이 올바르지 않습니다. 검색어와 날짜를 확인해주세요.';
            } else if (error.message.includes('403')) {
                errorMessage = 'API 사용량 초과 또는 권한 문제입니다. 잠시 후 다시 시도해주세요.';
            } else if (error.message.includes('500')) {
                errorMessage = '서버 오류입니다. 잠시 후 다시 시도해주세요.';
            } else if (error.message.includes('Network')) {
                errorMessage = '네트워크 연결을 확인해주세요.';
            }
            
            UIUtils.showError(errorMessage);
        }
    }
    
    static displayResults(videos, append = false) {
        const resultsContent = document.getElementById('results-content');
        
        if (videos.length === 0 && !append) {
            resultsContent.innerHTML = '<div class="error">필터 조건에 맞는 영상이 없습니다.</div>';
            document.getElementById('results-count').textContent = '결과 없음';
            return;
        }
        
        if (append) {
            // 기존 리스트에 추가
            STATE.displayedVideos = [...STATE.displayedVideos, ...videos];
        } else {
            // 새로운 검색 결과
            STATE.displayedVideos = [...videos];
        }
        
        UIUtils.updateResultsCount(STATE.displayedVideos.length);
        
        if (!append || !document.querySelector('.results-table')) {
            // 테이블 헤더 생성 (처음이거나 새 검색)
            TableManager.createHeader();
        }
        
        // 테이블 바디 업데이트
        TableManager.updateBody();
    }
    
    static setupPagination() {
        const paginationDiv = document.getElementById('pagination');
        let html = '';
        
        if (STATE.nextPageToken) {
            html += '<button onclick="YouTubeAnalyzer.loadNextPage()">다음 페이지</button>';
        }
        
        paginationDiv.innerHTML = html;
    }
    
    static async loadNextPage() {
        if (!STATE.nextPageToken) return;
        
        UIUtils.showLoading('다음 페이지 로딩 중...');
        await this.searchVideos(STATE.nextPageToken);
    }
}

// 전역 함수들 (HTML에서 호출하기 위해)
function startSearch() {
    YouTubeAnalyzer.startSearch();
}

function resetFilters() {
    UIUtils.resetFilters();
}

// DOM 로드 완료시 초기화
document.addEventListener('DOMContentLoaded', function() {
    YouTubeAnalyzer.init();
});