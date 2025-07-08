// ============================================
// 채널 분석기 (channel-analyzer.js)
// ============================================

class ChannelAnalyzer {
      constructor() {
          this.currentChannelData = null;
          this.channelVideos = [];
          this.channelFavorites = this.loadChannelFavorites();
          this.init();
      }
      
      init() {
          this.setupEventListeners();
          this.renderFavoriteChannels();
      }
      
      setupEventListeners() {
          // 채널 URL 입력시 Enter 키 이벤트
          document.addEventListener('keypress', (e) => {
              if (e.target.id === 'channelUrl' || e.target.id === 'channelUrlMobile') {
                  if (e.key === 'Enter') {
                      this.analyzeChannel();
                  }
              }
          });
      }
      
      // 채널 분석 시작
      async analyzeChannel() {
          const isMobile = window.innerWidth <= 768;
          const suffix = isMobile ? 'Mobile' : '';
          const channelUrl = document.getElementById(`channelUrl${suffix}`).value.trim();
          
          if (!channelUrl) {
              UIUtils.showNotification('채널 URL을 입력해주세요.', 'warning');
              return;
          }
          
          try {
              UIUtils.showLoading('채널 정보를 가져오는 중...');
              
              // 채널 ID 추출
             
            const channelId = this.extractChannelId(channelUrl);
            console.log('추출된 채널 ID:', channelId);

            if (!channelId) {
            throw new Error('올바른 채널 URL을 입력해주세요. 예: https://www.youtube.com/@channelname 또는 채널명만 입력하세요.');
            }
              
              // 채널 정보 가져오기
              const channelInfo = await this.getChannelInfo(channelId);
              this.currentChannelData = channelInfo;
              
              // 채널 영상 목록 가져오기
              const videos = await this.getChannelVideos(channelId);
              this.channelVideos = videos;
              
              // UI 업데이트
              this.displayChannelInfo(channelInfo, suffix);
              this.displayChannelVideos(videos);
              
              // 분석 설정 표시
              document.getElementById(`channelSettings${suffix}`).style.display = 'block';
              
              UIUtils.showNotification(`${channelInfo.snippet.title} 채널 분석 완료! 📊`, 'success');
              
          } catch (error) {
              console.error('채널 분석 오류:', error);
              UIUtils.showError(`채널 분석 실패: ${error.message}`);
          }
      }
      
      // 채널 ID 추출
      // 채널 ID 추출
      extractChannelId(url) {
            console.log('입력된 URL:', url);
            
            // URL 정리 (여분의 파라미터 제거)
            const cleanUrl = url.split('?')[0].split('#')[0];
            console.log('정리된 URL:', cleanUrl);
            
            // 다양한 형태의 채널 URL 지원
            const patterns = [
            // @핸들 방식 (http/https 모두 지원)
            /(?:https?:\/\/)?(?:www\.)?youtube\.com\/@([a-zA-Z0-9_.-]+)/,
            // 채널 ID 방식
            /(?:https?:\/\/)?(?:www\.)?youtube\.com\/channel\/([a-zA-Z0-9_-]+)/,
            // 커스텀 URL 방식
            /(?:https?:\/\/)?(?:www\.)?youtube\.com\/c\/([a-zA-Z0-9_.-]+)/,
            // 사용자명 방식 (구형)
            /(?:https?:\/\/)?(?:www\.)?youtube\.com\/user\/([a-zA-Z0-9_.-]+)/,
            // 짧은 URL 형태도 지원
            /(?:https?:\/\/)?youtu\.be\/channel\/([a-zA-Z0-9_-]+)/
            ];
            
            for (let i = 0; i < patterns.length; i++) {
            const pattern = patterns[i];
            const match = cleanUrl.match(pattern);
            if (match) {
                  console.log(`✅ 패턴 ${i+1} 매칭 성공:`, pattern, '→ 결과:', match[1]);
                  return match[1];
            }
            }
            
            // 패턴이 없으면 입력값에서 URL 부분 제거 후 반환 (채널명 검색 시도)
            const cleanChannelName = url.replace(/(?:https?:\/\/)?(?:www\.)?youtube\.com\//, '').trim();
            console.log('❌ 패턴 매칭 실패, 채널명으로 검색 시도:', cleanChannelName);
            
            // 빈 문자열이면 null 반환
            if (!cleanChannelName) {
            return null;
            }
            
            return cleanChannelName;
      }
      
      // 채널 정보 가져오기
      async getChannelInfo(channelId) {
          const response = await fetch(`/api/channel-info?channelId=${channelId}`);
          if (!response.ok) {
              throw new Error('채널 정보를 가져올 수 없습니다.');
          }
          const data = await response.json();
          
          if (!data.items || data.items.length === 0) {
              throw new Error('채널을 찾을 수 없습니다.');
          }
          
          return data.items[0];
      }
      
      // 채널 영상 목록 가져오기
      async getChannelVideos(channelId) {
          const isMobile = window.innerWidth <= 768;
          const suffix = isMobile ? 'Mobile' : '';
          const maxResults = document.getElementById(`channelMaxResults${suffix}`)?.value || 50;
          const order = document.getElementById(`channelOrder${suffix}`)?.value || 'date';
          
          const response = await fetch(`/api/channel-videos?channelId=${channelId}&maxResults=${maxResults}&order=${order}`);
          if (!response.ok) {
              throw new Error('채널 영상 목록을 가져올 수 없습니다.');
          }
          const data = await response.json();
          return data.items || [];
      }
      
      // 채널 정보 표시
      displayChannelInfo(channelInfo, suffix) {
          const channelInfoCard = document.getElementById(`channelInfo${suffix}`);
          const channelDetails = document.getElementById(`channelDetails${suffix}`);
          
          const subscriberCount = channelInfo.statistics.subscriberCount;
          const videoCount = channelInfo.statistics.videoCount;
          const viewCount = channelInfo.statistics.viewCount;
          const thumbnail = channelInfo.snippet.thumbnails.medium?.url;
          
          channelDetails.innerHTML = `
              <div class="channel-summary">
                  <div class="channel-avatar">
                      <img src="${thumbnail}" alt="${channelInfo.snippet.title}" class="channel-thumbnail">
                  </div>
                  <div class="channel-stats">
                      <h3 class="channel-name">${channelInfo.snippet.title}</h3>
                      <div class="channel-metrics">
                          <div class="metric">
                              <span class="metric-label">구독자</span>
                              <span class="metric-value">${UIUtils.formatNumber(subscriberCount)}</span>
                          </div>
                          <div class="metric">
                              <span class="metric-label">영상 수</span>
                              <span class="metric-value">${UIUtils.formatNumber(videoCount)}</span>
                          </div>
                          <div class="metric">
                              <span class="metric-label">총 조회수</span>
                              <span class="metric-value">${UIUtils.formatNumber(viewCount)}</span>
                          </div>
                      </div>
                      <div class="channel-actions">
                          <button class="channel-favorite-btn" onclick="channelAnalyzer.toggleChannelFavorite('${channelInfo.id}')">
                              ${this.isChannelFavorite(channelInfo.id) ? '⭐ 즐겨찾기 해제' : '☆ 즐겨찾기 추가'}
                          </button>
                      </div>
                  </div>
              </div>
          `;
          
          channelInfoCard.style.display = 'block';
      }
      
      // 채널 영상 목록 표시
      displayChannelVideos(videos) {
          // 기존 검색 결과를 채널 영상으로 대체
          STATE.allVideos = videos;
          STATE.displayedVideos = videos;
          
          // 채널 정보를 캐시에 추가
          if (this.currentChannelData) {
              STATE.channelCache[this.currentChannelData.id] = this.currentChannelData;
          }
          
          // 데이터 처리
          const processedVideos = DataProcessor.processVideoData(videos);
          STATE.displayedVideos = processedVideos;
          
          // 결과 표시
          UIUtils.updateResultsCount(processedVideos.length);
          
          const isMobile = window.innerWidth <= 768;
          if (isMobile) {
              TableManager.createMobileCardList();
          } else {
              TableManager.createHeader();
              TableManager.updateBody();
          }
          
          // 분석 탭도 활성화 (main.js의 함수 사용)
          if (typeof YouTubeAnalyzer !== 'undefined' && YouTubeAnalyzer.enableAnalysisTab) {
              YouTubeAnalyzer.enableAnalysisTab();
          }
      }
      
      // 채널 즐겨찾기 관리
      loadChannelFavorites() {
          try {
              const favorites = localStorage.getItem('youtube_analyzer_channel_favorites');
              return favorites ? JSON.parse(favorites) : [];
          } catch {
              return [];
          }
      }
      
      saveChannelFavorites() {
          try {
              localStorage.setItem('youtube_analyzer_channel_favorites', JSON.stringify(this.channelFavorites));
              return true;
          } catch {
              console.error('채널 즐겨찾기 저장 실패');
              return false;
          }
      }
      
      isChannelFavorite(channelId) {
          return this.channelFavorites.some(fav => fav.id === channelId);
      }
      
      toggleChannelFavorite(channelId) {
          if (this.isChannelFavorite(channelId)) {
              this.removeChannelFavorite(channelId);
          } else {
              this.addChannelFavorite(channelId);
          }
      }
      
      addChannelFavorite(channelId) {
          if (!this.currentChannelData || this.currentChannelData.id !== channelId) {
              UIUtils.showNotification('채널 정보를 먼저 불러와주세요.', 'warning');
              return;
          }
          
          const favorite = {
              id: this.currentChannelData.id,
              title: this.currentChannelData.snippet.title,
              thumbnail: this.currentChannelData.snippet.thumbnails.medium?.url,
              subscriberCount: this.currentChannelData.statistics.subscriberCount,
              videoCount: this.currentChannelData.statistics.videoCount,
              addedAt: new Date().toISOString()
          };
          
          this.channelFavorites.unshift(favorite);
          this.saveChannelFavorites();
          this.updateChannelFavoriteButtons();
          this.renderFavoriteChannels();
          
          UIUtils.showNotification('채널이 즐겨찾기에 추가되었습니다! ⭐', 'success');
      }
      
      removeChannelFavorite(channelId) {
          this.channelFavorites = this.channelFavorites.filter(fav => fav.id !== channelId);
          this.saveChannelFavorites();
          this.updateChannelFavoriteButtons();
          this.renderFavoriteChannels();
          
          UIUtils.showNotification('채널이 즐겨찾기에서 제거되었습니다.', 'info');
      }
      
      updateChannelFavoriteButtons() {
          document.querySelectorAll('.channel-favorite-btn').forEach(btn => {
              const channelId = this.currentChannelData?.id;
              if (channelId) {
                  const isFav = this.isChannelFavorite(channelId);
                  btn.textContent = isFav ? '⭐ 즐겨찾기 해제' : '☆ 즐겨찾기 추가';
              }
          });
      }
      
      renderFavoriteChannels() {
          const favoriteChannelsPC = document.getElementById('favoriteChannels');
          const favoriteChannelsMobile = document.getElementById('favoriteChannelsMobile');
          
          const html = this.generateFavoriteChannelsHTML();
          
          if (favoriteChannelsPC) favoriteChannelsPC.innerHTML = html;
          if (favoriteChannelsMobile) favoriteChannelsMobile.innerHTML = html;
      }
      
      generateFavoriteChannelsHTML() {
          if (this.channelFavorites.length === 0) {
              return '<p class="no-favorites">아직 즐겨찾기 채널이 없습니다.</p>';
          }
          
          return this.channelFavorites.map(channel => `
              <div class="favorite-channel-item" onclick="channelAnalyzer.loadFavoriteChannel('${channel.id}')">
                  <img src="${channel.thumbnail}" alt="${channel.title}" class="favorite-channel-thumbnail">
                  <div class="favorite-channel-info">
                      <div class="favorite-channel-title">${channel.title}</div>
                      <div class="favorite-channel-stats">
                          구독자 ${UIUtils.formatNumber(channel.subscriberCount)} | 
                          영상 ${UIUtils.formatNumber(channel.videoCount)}개
                      </div>
                  </div>
                  <button class="remove-favorite-channel" onclick="event.stopPropagation(); channelAnalyzer.removeChannelFavorite('${channel.id}')">×</button>
              </div>
          `).join('');
      }
      
      // 즐겨찾기 채널 불러오기
      async loadFavoriteChannel(channelId) {
          const favorite = this.channelFavorites.find(fav => fav.id === channelId);
          if (!favorite) return;
          
          const isMobile = window.innerWidth <= 768;
          const suffix = isMobile ? 'Mobile' : '';
          
          // URL 입력창에 채널 ID 설정
          document.getElementById(`channelUrl${suffix}`).value = `https://www.youtube.com/channel/${channelId}`;
          
          // 채널 분석 실행
          await this.analyzeChannel();
      }
  }
  
  // 전역 인스턴스 생성
  const channelAnalyzer = new ChannelAnalyzer();