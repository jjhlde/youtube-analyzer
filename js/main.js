// ============================================
// YouTube 분석기 메인 클래스 (향상된 버전)
// ============================================

class YouTubeAnalyzer {
    static currentFilters = null; // 현재 필터 상태 저장
    static infiniteScrollEnabled = true;
    static isLoadingMore = false;
    static handleScroll = null; // 스크롤 핸들러 참조 저장
    
    static async init() {
        // 기본값 설정
        UIUtils.setDefaultDates();
        
        // 이벤트 리스너 등록
        this.setupEventListeners();
    }
    
    static setupEventListeners() {
        // PC/모바일 검색창 모두에 Enter 키 이벤트 등록
        const searchInputs = ['searchQuery', 'searchQueryMobile'];
        searchInputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        YouTubeAnalyzer.startSearch();
                    }
                });
            }
        });
        
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
        const isMobile = window.innerWidth <= 768;
        const resultsContainer = isMobile ? 
            document.querySelector('.results-area .results-container') :
            document.querySelector('.content-area .results-container');
        
        // 분석 상태 초기화
        window.analysisAvailable = false;
        window.currentAnalysisData = null;
        
        if (!isMobile) {
            // PC용 탭 HTML 구조 생성
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
        } else {
            // 모바일용은 단순 구조 유지
            const simpleHTML = `
                <div class="results-header">
                    <h3>검색 결과</h3>
                    <div id="results-count-mobile">검색을 시작해주세요</div>
                </div>
                
                <div id="results-content-mobile"></div>
                
                <div id="pagination-mobile" class="pagination"></div>
            `;
            
            resultsContainer.innerHTML = simpleHTML;
        }
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
        if (!analysisTabBtn) return; // 모바일에서는 탭이 없을 수 있음
        
        const tabBadge = analysisTabBtn.querySelector('.tab-badge');
        
        analysisTabBtn.classList.remove('disabled');
        analysisTabBtn.disabled = false;
        if (tabBadge) {
            tabBadge.textContent = '준비완료';
            tabBadge.style.background = '#28a745';
        }
        
        window.analysisAvailable = true;
        
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
        if (analysisPanel) {
            analysisPanel.innerHTML = this.createAnalysisHTML(analysisData);
        }
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
        const isMobile = window.innerWidth <= 768;
        const suffix = isMobile ? 'Mobile' : '';
        
        return `
            <div class="analysis-results">
                <div class="analysis-header">
                    <h2>📊 키워드 분석 결과</h2>
                    <div class="analysis-meta">
                        <span>검색어: "${document.getElementById(`searchQuery${suffix}`).value}"</span>
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
                                <div class="tip-item">🎬 정보전달형: "${document.getElementById(`searchQuery${suffix}`).value} 완전정복" 시리즈</div>
                                <div class="tip-item">📖 썰채널형: "${document.getElementById(`searchQuery${suffix}`).value}에 대한 충격적인 진실" 스타일</div>
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
        const isMobile = window.innerWidth <= 768;
        const suffix = isMobile ? 'Mobile' : '';
        
        const analysisText = `
유튜브 키워드 분석 결과

검색어: ${document.getElementById(`searchQuery${suffix}`).value}
분석일시: ${new Date().toLocaleString()}

=== 기본 통계 ===
- 총 영상 수: ${STATE.displayedVideos.length}개
- 평균 조회수: ${Math.round(STATE.displayedVideos.reduce((sum, v) => sum + v.viewCount, 0) / STATE.displayedVideos.length).toLocaleString()}회
- 평균 구독자: ${Math.round(STATE.displayedVideos.reduce((sum, v) => sum + v.subscriberCount, 0) / STATE.displayedVideos.length).toLocaleString()}명

=== 추천 콘텐츠 아이디어 ===
정보전달형: "${document.getElementById(`searchQuery${suffix}`).value} 완전정복" 시리즈
썰채널형: "${document.getElementById(`searchQuery${suffix}`).value}의 숨겨진 진실" 스타일

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
    
    // ★★★ 필터 값 유지 기능이 포함된 검색 함수 ★★★
    static async searchVideos(pageToken = '') {
        try {
            // 첫 번째 검색이면 현재 필터 저장
            if (!pageToken) {
                this.currentFilters = SearchParamsBuilder.buildFromForm();
                SearchParamsBuilder.validateParams(this.currentFilters);
                resetState();
                this.initializeResultTabs();
            }
            
            // 저장된 필터 사용 (pageToken이 있으면 다음 페이지)
            const searchParams = this.currentFilters || SearchParamsBuilder.buildFromForm();
            
            console.log('검색 시작:', searchParams, 'pageToken:', pageToken);
            
            // API 호출
            const data = await YouTubeAPI.searchAllVideos(searchParams, pageToken);
            
            if (!data.items || data.items.length === 0) {
                if (!pageToken) {
                    UIUtils.showError('검색 결과가 없습니다. 다른 조건으로 시도해보세요.');
                }
                return;
            }
            
            console.log(`${data.items.length}개의 영상을 찾았습니다.`);
            
            // 영상 상세 정보 가져오기
            const videoIds = data.items.map(item => item.id.videoId).join(',');
            const detailsData = await YouTubeAPI.getVideoDetails(videoIds);
            
            // 채널 정보 가져오기
            const channelIds = [...new Set(detailsData.items.map(item => item.snippet.channelId))];
            await ChannelCache.updateCache(channelIds);
            
            // 데이터 처리 및 필터 적용
            const processedVideos = DataProcessor.processVideoData(detailsData.items);
            const filteredVideos = DataProcessor.applyFilters(processedVideos);
            
            // 결과 표시
            const isAppend = pageToken !== '';
            this.displayResults(filteredVideos, isAppend);
            
            // 페이지네이션 설정
            STATE.nextPageToken = data.nextPageToken;
            this.setupPagination();
            
            // 무한 스크롤 설정
            if (!pageToken) {
                this.setupInfiniteScroll();
            }
            
            // 분석 탭 활성화
            if (filteredVideos.length > 0) {
                this.enableAnalysisTab();
            }
            
            // 로딩 완료
            this.isLoadingMore = false;
            
        } catch (error) {
            console.error('검색 중 오류:', error);
            this.isLoadingMore = false;
            
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
    
    // ============================================
    // 무한 스크롤 구현
    // ============================================
    
    static setupInfiniteScroll() {
        // 기존 이벤트 리스너 제거
        if (this.handleScroll) {
            document.removeEventListener('scroll', this.handleScroll);
        }
        
        // 새 이벤트 리스너 추가
        this.handleScroll = this.throttle(() => {
            if (!this.infiniteScrollEnabled || this.isLoadingMore || !STATE.nextPageToken) {
                return;
            }
            
            const scrollPosition = window.innerHeight + window.scrollY;
            const documentHeight = document.documentElement.offsetHeight;
            const threshold = 300; // 하단에서 300px 전에 로드 시작
            
            if (scrollPosition >= documentHeight - threshold) {
                this.loadMoreResults();
            }
        }, 200);
        
        document.addEventListener('scroll', this.handleScroll);
    }
    
    static async loadMoreResults() {
        if (this.isLoadingMore || !STATE.nextPageToken) return;
        
        this.isLoadingMore = true;
        
        // 로딩 표시
        const isMobile = window.innerWidth <= 768;
        const resultsContent = isMobile ? 
            document.getElementById('results-content-mobile') :
            document.getElementById('results-content');
            
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'infinite-scroll-loading';
        loadingDiv.innerHTML = `
            <div style="text-align: center; padding: 20px; color: #666;">
                <div class="loading-spinner"></div>
                <p>더 많은 결과를 불러오는 중...</p>
            </div>
        `;
        loadingDiv.id = 'infinite-loading';
        
        resultsContent.appendChild(loadingDiv);
        
        try {
            await this.searchVideos(STATE.nextPageToken);
        } catch (error) {
            console.error('무한 스크롤 로딩 오류:', error);
            UIUtils.showNotification('추가 결과를 불러오는데 실패했습니다.', 'error');
        } finally {
            // 로딩 표시 제거
            const loadingElement = document.getElementById('infinite-loading');
            if (loadingElement) {
                loadingElement.remove();
            }
        }
    }
    
    // 쓰로틀링 함수
    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }
    
    // 무한 스크롤 토글
    static toggleInfiniteScroll() {
        this.infiniteScrollEnabled = !this.infiniteScrollEnabled;
        
        if (this.infiniteScrollEnabled) {
            UIUtils.showNotification('무한 스크롤이 활성화되었습니다.', 'success');
            this.setupInfiniteScroll();
        } else {
            UIUtils.showNotification('무한 스크롤이 비활성화되었습니다.', 'info');
            if (this.handleScroll) {
                document.removeEventListener('scroll', this.handleScroll);
            }
        }
        
        // 페이지네이션 버튼 업데이트
        this.setupPagination();
    }
    
    static displayResults(videos, append = false) {
        const isMobile = window.innerWidth <= 768;
        const resultsContent = isMobile ? 
            document.getElementById('results-content-mobile') :
            document.getElementById('results-content');
        
        if (videos.length === 0 && !append) {
            resultsContent.innerHTML = '<div class="error">필터 조건에 맞는 영상이 없습니다.</div>';
            const countElement = isMobile ? 
                document.getElementById('results-count-mobile') :
                document.getElementById('results-count');
            countElement.textContent = '결과 없음';
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
        
        // 모바일에서는 카드 레이아웃, 데스크톱에서는 테이블 레이아웃
        if (isMobile) {
            if (append) {
                // 모바일 카드 추가
                TableManager.appendMobileCards(videos);
            } else {
                // 새로운 모바일 카드 리스트
                TableManager.createMobileCardList();
            }
        } else {
            if (!append || !document.querySelector('.results-table')) {
                TableManager.createHeader();
            }
            if (append) {
                // 테이블에 행 추가
                TableManager.appendTableRows(videos);
            } else {
                // 새로운 테이블 바디
                TableManager.updateBody();
            }
        }
    }
    
    static setupPagination() {
        const isMobile = window.innerWidth <= 768;
        const paginationDiv = isMobile ? 
            document.getElementById('pagination-mobile') :
            document.getElementById('pagination');
        
        let html = '';
        
        // 무한 스크롤 토글 버튼
        html += `
            <div class="pagination-controls">
                <button onclick="YouTubeAnalyzer.toggleInfiniteScroll()" class="scroll-toggle-btn">
                    ${this.infiniteScrollEnabled ? '📜 무한스크롤 OFF' : '📜 무한스크롤 ON'}
                </button>
        `;
        
        // 다음 페이지 버튼 (무한 스크롤이 꺼져있을 때만 표시)
        if (STATE.nextPageToken && !this.infiniteScrollEnabled) {
            html += '<button onclick="YouTubeAnalyzer.loadNextPage()" class="next-page-btn">다음 페이지</button>';
        }
        
        html += '</div>';
        
        paginationDiv.innerHTML = html;
    }
    
    static async loadNextPage() {
        if (!STATE.nextPageToken) return;
        
        UIUtils.showLoading('다음 페이지 로딩 중...');
        await this.searchVideos(STATE.nextPageToken);
    }
}

// ★★★ 전역 함수들 (HTML에서 호출하기 위해) ★★★
window.startSearch = function() {
    console.log('startSearch 함수 호출됨');
    YouTubeAnalyzer.startSearch();
};

window.resetFilters = function() {
    console.log('resetFilters 함수 호출됨');
    UIUtils.resetFilters();
};

// 추가 전역 함수들
window.switchTab = function(tabName) {
    console.log('Switching to tab:', tabName);
    
    const isMobile = window.innerWidth <= 768;
    const suffix = isMobile ? '-mobile' : '';
    
    // 모든 탭 버튼과 컨텐츠 비활성화
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // 선택된 탭 활성화
    const targetButton = document.querySelector(`[data-tab="${tabName}"]`);
    const targetContent = document.getElementById(`${tabName}-tab${suffix}`);
    
    if (targetButton && targetContent) {
        // 같은 data-tab을 가진 모든 버튼 활성화 (PC/모바일 동기화)
        document.querySelectorAll(`[data-tab="${tabName}"]`).forEach(btn => {
            btn.classList.add('active');
        });
        targetContent.classList.add('active');
        console.log('Tab switched successfully');
    } else {
        console.error('Tab elements not found:', tabName);
    }
};

window.toggleCard = function(header) {
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
};

// DOM 로드 완료시 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM 로드 완료, 초기화 시작');
    
    // 전역 함수들이 정의되었는지 확인
    console.log('startSearch 함수 존재:', typeof window.startSearch);
    console.log('resetFilters 함수 존재:', typeof window.resetFilters);
    console.log('switchTab 함수 존재:', typeof window.switchTab);
    
    YouTubeAnalyzer.init();
    
    // 페이지 로드 후 기본 탭 설정
    setTimeout(() => {
        switchTab('search');
    }, 100);
});