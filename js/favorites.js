// 즐겨찾기 관리 시스템

class FavoritesManager {
      static STORAGE_KEY = 'youtube_analyzer_favorites';
      
      // 즐겨찾기 불러오기
      static getFavorites() {
          try {
              const favorites = localStorage.getItem(this.STORAGE_KEY);
              return favorites ? JSON.parse(favorites) : [];
          } catch {
              return [];
          }
      }
      
      // 즐겨찾기 저장
      static saveFavorites(favorites) {
          try {
              localStorage.setItem(this.STORAGE_KEY, JSON.stringify(favorites));
              return true;
          } catch {
              console.error('즐겨찾기 저장 실패');
              return false;
          }
      }
      
      // 즐겨찾기 추가
      static addFavorite(video) {
          const favorites = this.getFavorites();
          const favorite = {
              id: video.id,
              title: video.snippet.title,
              channelTitle: video.channel.snippet.title,
              channelId: video.channel.id,
              viewCount: video.viewCount,
              subscriberCount: video.subscriberCount,
              performanceScore: video.performanceScore,
              contributionGrade: video.contributionGrade,
              influenceGrade: video.influenceGrade,
              thumbnail: video.snippet.thumbnails?.medium?.url,
              addedAt: new Date().toISOString(),
              tags: []
          };
          
          // 중복 체크
          if (!favorites.find(f => f.id === video.id)) {
              favorites.unshift(favorite);
              this.saveFavorites(favorites);
              this.updateFavoriteButtons();
              this.showNotification('즐겨찾기에 추가되었습니다! ⭐');
              return true;
          } else {
              this.showNotification('이미 즐겨찾기에 있습니다!', 'warning');
              return false;
          }
      }
      
      // 즐겨찾기 제거
      static removeFavorite(videoId) {
          const favorites = this.getFavorites();
          const filtered = favorites.filter(f => f.id !== videoId);
          this.saveFavorites(filtered);
          this.updateFavoriteButtons();
          this.showNotification('즐겨찾기에서 제거되었습니다!', 'info');
      }
      
      // 즐겨찾기 여부 확인
      static isFavorite(videoId) {
          const favorites = this.getFavorites();
          return favorites.some(f => f.id === videoId);
      }
      
      // 태그 추가
      static addTag(videoId, tag) {
          const favorites = this.getFavorites();
          const favorite = favorites.find(f => f.id === videoId);
          if (favorite && !favorite.tags.includes(tag)) {
              favorite.tags.push(tag);
              this.saveFavorites(favorites);
          }
      }
      
      // 태그로 필터링
      static filterByTag(tag) {
          const favorites = this.getFavorites();
          return favorites.filter(f => f.tags.includes(tag));
      }
      
      // 즐겨찾기 버튼 업데이트
      static updateFavoriteButtons() {
          document.querySelectorAll('.favorite-btn').forEach(btn => {
              const videoId = btn.dataset.videoId;
              const isFav = this.isFavorite(videoId);
              btn.innerHTML = isFav ? '⭐' : '☆';
              btn.classList.toggle('favorited', isFav);
              btn.title = isFav ? '즐겨찾기 제거' : '즐겨찾기 추가';
          });
      }
      
      // 알림 표시
      static showNotification(message, type = 'success') {
          // 기존 알림 제거
          const existing = document.querySelector('.notification');
          if (existing) existing.remove();
          
          const notification = document.createElement('div');
          notification.className = `notification notification-${type}`;
          notification.textContent = message;
          
          // 스타일
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
          
          // 3초 후 제거
          setTimeout(() => {
              notification.style.animation = 'slideOutRight 0.3s ease';
              setTimeout(() => notification.remove(), 300);
          }, 3000);
      }
      
      // 즐겨찾기 모달 열기
      static openFavoritesModal() {
          const favorites = this.getFavorites();
          const modal = this.createFavoritesModal(favorites);
          document.body.appendChild(modal);
      }
      
      // 즐겨찾기 모달 생성
      static createFavoritesModal(favorites) {
            const modal = document.createElement('div');
            modal.className = 'favorites-modal';
            modal.innerHTML = `
                <div class="favorites-content">
                    <div class="favorites-header">
                        <h2>⭐ 즐겨찾기 (${favorites.length})</h2>
                        <button class="close-btn" onclick="this.closest('.favorites-modal').remove()">&times;</button>
                    </div>
                    <div class="favorites-body">
                        ${favorites.length > 0 ? this.renderFavoritesList(favorites) : '<p class="no-favorites">아직 즐겨찾기가 없습니다.</p>'}
                    </div>
                </div>
            `;
            
            // 모달 스타일 추가 (닫기 버튼 스타일 개선)
            const style = document.createElement('style');
            style.textContent = `
                .favorites-modal {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.7);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 10000;
                }
                .favorites-content {
                    background: white;
                    width: 90%;
                    max-width: 800px;
                    max-height: 80vh;
                    border-radius: 12px;
                    overflow: hidden;
                }
                .favorites-header {
                    padding: 20px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    position: relative;
                }
                .favorites-header h2 {
                    margin: 0;
                    font-size: 18px;
                }
                .favorites-header .close-btn {
                    background: rgba(255,255,255,0.2);
                    border: 2px solid rgba(255,255,255,0.3);
                    color: white;
                    font-size: 24px;
                    font-weight: bold;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                    line-height: 1;
                }
                .favorites-header .close-btn:hover {
                    background: rgba(255,255,255,0.3);
                    border-color: rgba(255,255,255,0.5);
                    transform: scale(1.1);
                }
                .favorites-body {
                    padding: 20px;
                    max-height: 60vh;
                    overflow-y: auto;
                }
                .favorite-item {
                    display: flex;
                    gap: 15px;
                    padding: 15px;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    margin-bottom: 10px;
                }
                .favorite-thumbnail {
                    width: 120px;
                    height: 68px;
                    object-fit: cover;
                    border-radius: 4px;
                }
                .favorite-info {
                    flex: 1;
                }
                .favorite-title {
                    font-weight: bold;
                    margin-bottom: 5px;
                }
                .favorite-stats {
                    font-size: 12px;
                    color: #666;
                }
                .favorite-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                }
                .no-favorites {
                    text-align: center;
                    color: #666;
                    font-style: italic;
                    padding: 40px;
                }
                @keyframes slideInRight {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); }
                    to { transform: translateX(100%); }
                }
            `;
            document.head.appendChild(style);
            
            // 모달 배경 클릭시 닫기 기능 추가
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    modal.remove();
                }
            });
            
            return modal;
        }
      
      // 즐겨찾기 리스트 렌더링
      static renderFavoritesList(favorites) {
          return favorites.map(fav => `
              <div class="favorite-item">
                  <img src="${fav.thumbnail}" alt="썸네일" class="favorite-thumbnail">
                  <div class="favorite-info">
                      <div class="favorite-title">${fav.title}</div>
                      <div class="favorite-stats">
                          채널: ${fav.channelTitle} | 
                          조회수: ${UIUtils.formatNumber(fav.viewCount)} | 
                          구독자: ${UIUtils.formatNumber(fav.subscriberCount)} |
                          성과도: ${fav.performanceScore.toFixed(1)}배
                      </div>
                  </div>
                  <div class="favorite-actions">
                      <button onclick="UIUtils.openVideo('https://www.youtube.com/watch?v=${fav.id}')" 
                              style="background: #dc2626; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                          영상보기
                      </button>
                      <button onclick="FavoritesManager.removeFavorite('${fav.id}'); this.closest('.favorites-modal').remove();" 
                              style="background: #6b7280; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                          제거
                      </button>
                  </div>
              </div>
          `).join('');
      }
  }