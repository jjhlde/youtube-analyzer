// keyword-helper.js - 안정적인 하드코딩 키워드만 사용

class KeywordHelper {
      constructor() {
          this.selectedCategory = null;
          this.init();
      }
      
      init() {
          this.setupEventListeners();
      }
      
      setupEventListeners() {
          document.addEventListener('click', (e) => {
              if (e.target.classList.contains('category-btn')) {
                  this.selectCategory(e.target.dataset.category);
              }
          });
      }
      
      selectCategory(category) {
          document.querySelectorAll('.category-btn').forEach(btn => {
              btn.classList.remove('active');
          });
          
          const selectedBtn = document.querySelector(`[data-category="${category}"]`);
          selectedBtn.classList.add('active');
          
          this.selectedCategory = category;
          this.showKeywordSuggestions(category);
      }
      
      // 검증된 하드코딩 키워드 표시
      async showKeywordSuggestions(category) {
          const suggestionsDiv = document.getElementById('keywordSuggestions');
          const categoryData = SENIOR_KEYWORDS[category];
          
          if (!categoryData) return;
          
          // 하드코딩된 키워드 사용 (안정적)
          const keywordsToShow = categoryData.keywords.slice(0, 15);
          const searchTermsToShow = categoryData.searchTerms;
          
          const html = `
              <h4>🔥 ${categoryData.category} 추천 키워드</h4>
              <p style="color: #28a745; font-size: 12px; margin-bottom: 10px;">
                  ✅ 검증된 인기 키워드 (안정적이고 빠름)
              </p>
              <div class="keyword-list">
                  ${keywordsToShow.map(keyword => 
                      `<span class="keyword-tag" onclick="keywordHelper.applyKeyword('${keyword}')">${keyword}</span>`
                  ).join('')}
              </div>
              
              <h4>🔍 추천 검색어 조합</h4>
              <div class="search-combinations">
                  ${searchTermsToShow.map(term => 
                      `<div class="combination-item" onclick="keywordHelper.applyKeyword('${term}')">
                          <span class="combination-text">${term}</span>
                          <button class="use-btn">사용</button>
                      </div>`
                  ).join('')}
              </div>
              
              <div style="margin-top: 15px; padding: 12px; background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); border-radius: 8px; border-left: 4px solid #2196f3;">
                  <h4 style="color: #1565c0; margin-bottom: 8px; font-size: 13px;">💡 Pro Tip</h4>
                  <p style="font-size: 11px; color: #1565c0; margin: 0;">
                      위 키워드들은 YouTube에서 실제로 검증된 키워드입니다.<br>
                      조합해서 사용하면 더 효과적이에요! (예: "50대 건강" + "운동법")
                  </p>
              </div>
          `;
          
          suggestionsDiv.innerHTML = html;
      }
      
      applyKeyword(keyword) {
          const searchInput = document.getElementById('searchQuery');
          searchInput.value = keyword;
          
          searchInput.style.background = '#e8f5e8';
          setTimeout(() => {
              searchInput.style.background = '';
          }, 1000);
          
          this.showNotification(`"${keyword}" 키워드가 적용되었습니다! 🎯`);
      }
      
      generateRandomKeywords() {
          const categoryData = SENIOR_KEYWORDS[this.selectedCategory || 'health'];
          const randomKeywords = categoryData.keywords
              .sort(() => Math.random() - 0.5)
              .slice(0, 12);
          
          const suggestionsDiv = document.getElementById('keywordSuggestions');
          const html = `
              <h4>🎲 랜덤 키워드</h4>
              <p style="color: #ff6b6b; font-size: 12px; margin-bottom: 10px;">
                  🎯 ${categoryData.category} 카테고리에서 랜덤 선택
              </p>
              <div class="keyword-list">
                  ${randomKeywords.map(keyword => 
                      `<span class="keyword-tag random" onclick="keywordHelper.applyKeyword('${keyword}')">${keyword}</span>`
                  ).join('')}
              </div>
              <p class="refresh-hint">💡 새로운 아이디어가 필요할 때 사용하세요!</p>
              <button class="helper-btn" onclick="keywordHelper.generateRandomKeywords()" style="margin-top: 10px; width: 100%;">
                  🔄 다시 섞기
              </button>
              
              <div style="margin-top: 15px;">
                  <button class="helper-btn" onclick="keywordHelper.generateKeywordCombinations()" style="width: 100%; background: linear-gradient(135deg, #8e24aa 0%, #ab47bc 100%);">
                      🔗 키워드 조합 생성
                  </button>
              </div>
          `;
          
          suggestionsDiv.innerHTML = html;
      }
      
      // ★★★ 새로운 기능 - 키워드 조합 생성 ★★★
      generateKeywordCombinations() {
          const categoryData = SENIOR_KEYWORDS[this.selectedCategory || 'health'];
          const baseKeywords = categoryData.keywords.slice(0, 8);
          const ageTargets = ['50대', '60대', '70대', '시니어', '중년'];
          const contentTypes = ['완전정복', '총정리', '가이드', '팁', '방법', '비결'];
          
          const combinations = [];
          
          // 연령대 + 키워드 조합
          baseKeywords.slice(0, 4).forEach(keyword => {
              const age = ageTargets[Math.floor(Math.random() * ageTargets.length)];
              combinations.push(`${age} ${keyword}`);
          });
          
          // 키워드 + 콘텐츠 타입 조합
          baseKeywords.slice(0, 4).forEach(keyword => {
              const type = contentTypes[Math.floor(Math.random() * contentTypes.length)];
              combinations.push(`${keyword} ${type}`);
          });
          
          const suggestionsDiv = document.getElementById('keywordSuggestions');
          const html = `
              <h4>🔗 스마트 키워드 조합</h4>
              <p style="color: #8e24aa; font-size: 12px; margin-bottom: 10px;">
                  🎯 더 구체적이고 타겟팅된 검색어 조합
              </p>
              <div class="keyword-list">
                  ${combinations.map(combo => 
                      `<span class="keyword-tag" onclick="keywordHelper.applyKeyword('${combo}')" style="background: linear-gradient(135deg, #8e24aa 0%, #ab47bc 100%);">${combo}</span>`
                  ).join('')}
              </div>
              
              <div style="margin-top: 15px;">
                  <button class="helper-btn" onclick="keywordHelper.generateKeywordCombinations()" style="width: 100%; background: linear-gradient(135deg, #8e24aa 0%, #ab47bc 100%);">
                      🔄 새로운 조합 생성
                  </button>
              </div>
              
              <div style="margin-top: 10px; padding: 10px; background: #f3e5f5; border-radius: 6px; border-left: 3px solid #8e24aa;">
                  <p style="font-size: 11px; color: #6a1b9a; margin: 0;">
                      💡 조합 키워드는 경쟁이 적고 타겟팅이 정확해서 더 효과적입니다!
                  </p>
              </div>
          `;
          
          suggestionsDiv.innerHTML = html;
      }
      
      // ★★★ 수정된 분석 함수 - 탭 구조 확인 후 처리 ★★★
      analyzeCurrentResults() {
          if (!STATE.displayedVideos || STATE.displayedVideos.length === 0) {
              this.showNotification('먼저 검색 결과가 있어야 분석할 수 있습니다.', 'warning');
              return;
          }
          
          // 기존 탭 구조가 있는지 확인
          const existingTabs = document.querySelector('.results-tabs');
          
          if (existingTabs) {
              // 탭 구조가 있는 경우: 분석 결과만 업데이트하고 분석 탭으로 전환
              console.log('기존 탭 구조 발견 - 분석 패널만 업데이트');
              this.updateAnalysisPanel();
              YouTubeAnalyzer.switchResultTab('analysis');
          } else {
              // 탭 구조가 없는 경우: 전체 분석 결과 표시 (기존 방식)
              console.log('탭 구조 없음 - 전체 분석 화면 표시');
              this.showAnalysisResults();
          }
      }
      
      // ★★★ 새로운 함수 - 분석 패널만 업데이트 ★★★
      updateAnalysisPanel() {
          const analysisPanel = document.getElementById('analysis-results-panel');
          if (!analysisPanel) {
              console.error('분석 패널을 찾을 수 없습니다.');
              return;
          }
          
          // 분석 데이터 생성
          const analysisData = YouTubeAnalyzer.performAnalysis();
          window.currentAnalysisData = analysisData;
          
          // 분석 패널에 HTML 삽입
          analysisPanel.innerHTML = YouTubeAnalyzer.createAnalysisHTML(analysisData);
          
          // 분석 탭 활성화 (이미 활성화되어 있을 수 있지만 안전하게)
          const analysisTabBtn = document.querySelector('[data-tab="analysis"]');
          if (analysisTabBtn) {
              analysisTabBtn.classList.remove('disabled');
              analysisTabBtn.disabled = false;
              const tabBadge = analysisTabBtn.querySelector('.tab-badge');
              if (tabBadge) {
                  tabBadge.textContent = '준비완료';
                  tabBadge.style.background = '#28a745';
              }
          }
          
          this.showNotification('분석 결과가 업데이트되었습니다! 📊', 'success');
      }
      
      // ★★★ 기존 함수 - 전체 분석 결과 표시 (탭 구조 없을 때) ★★★
      showAnalysisResults() {
          const resultsContainer = document.querySelector('.results-container');
          
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
          
          const html = `
              <div class="analysis-results">
                  <div class="analysis-header">
                      <h2>📊 키워드 분석 결과</h2>
                      <div class="analysis-meta">
                          <span>검색어: "${document.getElementById('searchQuery').value}"</span>
                          <button class="back-to-results-btn" onclick="keywordHelper.backToResults()">
                              🔙 검색 결과로 돌아가기
                          </button>
                      </div>
                  </div>
                  
                  <!-- 기본 통계 요약 -->
                  <div class="analysis-accordion">
                      <div class="accordion-item">
                          <div class="accordion-header active" onclick="keywordHelper.toggleAccordion(this)">
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
                          <div class="accordion-header" onclick="keywordHelper.toggleAccordion(this)">
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
                          <div class="accordion-header" onclick="keywordHelper.toggleAccordion(this)">
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
                          <div class="accordion-header" onclick="keywordHelper.toggleAccordion(this)">
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
                          <div class="accordion-header" onclick="keywordHelper.toggleAccordion(this)">
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
                      <button class="analysis-btn" onclick="keywordHelper.exportAnalysis()">📋 분석 결과 복사</button>
                      <button class="analysis-btn" onclick="keywordHelper.backToResults()">🔙 검색 결과로 돌아가기</button>
                  </div>
              </div>
          `;
          
          resultsContainer.innerHTML = html;
      }
      
      // 아코디언 토글 함수
      toggleAccordion(header) {
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
      
      // 검색 결과로 돌아가기
      backToResults() {
          // 원래 검색 결과 테이블 복원
          const resultsContainer = document.querySelector('.results-container');
          
          const html = `
              <div class="results-header">
                  <h3>검색 결과</h3>
                  <div id="results-count">${STATE.displayedVideos.length}개 영상 발견</div>
              </div>
              
              <div id="results-content"></div>
              
              <div id="pagination" class="pagination"></div>
          `;
          
          resultsContainer.innerHTML = html;
          
          // 테이블 다시 생성
          TableManager.createHeader();
          TableManager.updateBody();
      }
      
      // 기회 분석
      analyzeGaps(analyzedVideos) {
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
      
      exportAnalysis() {
          // 분석 결과를 텍스트로 정리해서 클립보드에 복사
          const analysisText = `
  유튜브 시니어 키워드 분석 결과
  
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
              this.showNotification('분석 결과가 클립보드에 복사되었습니다! 📋', 'success');
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
              
              this.showNotification('분석 결과가 복사되었습니다! 📋', 'success');
          });
      }
      
      showNotification(message, type = 'success') {
          // 기존 알림 제거
          const existing = document.querySelector('.keyword-notification');
          if (existing) existing.remove();
          
          const notification = document.createElement('div');
          notification.className = `keyword-notification notification-${type}`;
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
          `;
          
          document.body.appendChild(notification);
          
          setTimeout(() => {
              notification.style.animation = 'slideOutRight 0.3s ease';
              setTimeout(() => notification.remove(), 300);
          }, 3000);
      }
  }
  
  // 키워드 도우미 인스턴스 생성
  const keywordHelper = new KeywordHelper();