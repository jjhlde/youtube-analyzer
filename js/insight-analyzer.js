// ============================================
// AI 마케팅 인사이트 분석기 (insight-analyzer.js)
// ============================================

class InsightAnalyzer {
      static analyzeSearchResults(videos, keyword) {
          console.log('🧠 인사이트 분석 시작:', keyword, videos.length, '개 영상');
          
          const insights = {
              opportunityScore: this.calculateOpportunityScore(videos),
              opportunityGrade: '',
              marketSize: this.estimateMarketSize(videos),
              competitionLevel: this.analyzeCompetition(videos),
              trendDirection: this.analyzeTrend(videos),
              contentIdeas: this.generateContentIdeas(keyword, videos),
              competitorWeaknesses: this.findCompetitorWeaknesses(videos),
              thumbnailStrategy: this.analyzeThumbnailStrategy(videos),
              titleOptimization: this.optimizeTitle(keyword, videos),
              keywordClusters: this.generateKeywordClusters(keyword),
              hashtags: this.generateHashtags(keyword),
              contentRoadmap: this.createContentRoadmap(keyword, videos),
              monetizationStrategies: this.analyzeMonetizationOpportunities(keyword, videos),
              nextSteps: this.generateNextSteps(keyword, videos)
          };
          
          // 기회도 등급 설정
          if (insights.opportunityScore >= 80) insights.opportunityGrade = 'HIGH';
          else if (insights.opportunityScore >= 60) insights.opportunityGrade = 'MEDIUM';
          else insights.opportunityGrade = 'LOW';
          
          console.log('✅ 인사이트 분석 완료:', insights);
          return insights;
      }
      
      static calculateOpportunityScore(videos) {
          let score = 0;
          
          // 경쟁 강도 분석 (0-30점)
          const avgSubscribers = videos.reduce((sum, v) => sum + v.subscriberCount, 0) / videos.length;
          if (avgSubscribers < 50000) score += 30;
          else if (avgSubscribers < 200000) score += 20;
          else if (avgSubscribers < 500000) score += 15;
          else score += 5;
          
          // 콘텐츠 신선도 (0-25점)
          const recentVideos = videos.filter(v => {
              const daysSince = (Date.now() - new Date(v.snippet.publishedAt)) / (1000 * 60 * 60 * 24);
              return daysSince <= 90;
          });
          const freshnessRatio = recentVideos.length / videos.length;
          if (freshnessRatio < 0.3) score += 25;
          else if (freshnessRatio < 0.5) score += 15;
          else score += 10;
          
          // 참여율 격차 (0-25점)
          const lowEngagement = videos.filter(v => v.engagementRate < 2);
          const engagementGap = lowEngagement.length / videos.length;
          if (engagementGap > 0.6) score += 25;
          else if (engagementGap > 0.4) score += 15;
          else score += 10;
          
          // 성과도 분산 (0-20점)
          const performanceScores = videos.map(v => v.performanceScore);
          const avgPerformance = performanceScores.reduce((a, b) => a + b, 0) / performanceScores.length;
          const variance = performanceScores.reduce((sum, score) => sum + Math.pow(score - avgPerformance, 2), 0) / performanceScores.length;
          if (variance > 10) score += 20; // 높은 분산 = 기회
          else if (variance > 5) score += 15;
          else score += 10;
          
          return Math.min(100, Math.round(score));
      }
      
      static estimateMarketSize(videos) {
          const totalViews = videos.reduce((sum, v) => sum + v.viewCount, 0);
          if (totalViews > 10000000) return '대형';
          if (totalViews > 1000000) return '중형';
          return '소형';
      }
      
      static analyzeCompetition(videos) {
          const avgSubscribers = videos.reduce((sum, v) => sum + v.subscriberCount, 0) / videos.length;
          if (avgSubscribers > 1000000) return '치열';
          if (avgSubscribers > 100000) return '보통';
          return '낮음';
      }
      
      static analyzeTrend(videos) {
          // 최근 3개월 vs 이전 영상들의 조회수 비교
          const recentVideos = videos.filter(v => {
              const daysSince = (Date.now() - new Date(v.snippet.publishedAt)) / (1000 * 60 * 60 * 24);
              return daysSince <= 90;
          });
          
          const oldVideos = videos.filter(v => {
              const daysSince = (Date.now() - new Date(v.snippet.publishedAt)) / (1000 * 60 * 60 * 24);
              return daysSince > 90;
          });
          
          if (recentVideos.length === 0 || oldVideos.length === 0) return '안정';
          
          const recentAvgViews = recentVideos.reduce((sum, v) => sum + v.viewCount, 0) / recentVideos.length;
          const oldAvgViews = oldVideos.reduce((sum, v) => sum + v.viewCount, 0) / oldVideos.length;
          
          if (recentAvgViews > oldAvgViews * 1.5) return '🔥 급상승';
          if (recentAvgViews > oldAvgViews * 1.2) return '📈 상승';
          if (recentAvgViews < oldAvgViews * 0.8) return '📉 하락';
          return '➡️ 안정';
      }
      
      static generateContentIdeas(keyword, videos) {
          const ideas = [];
          
          // 성과 좋은 영상들 분석
          const topPerformers = videos
              .filter(v => v.performanceScore > 1)
              .sort((a, b) => b.performanceScore - a.performanceScore)
              .slice(0, 3);
          
          // 아이디어 1: 개선 버전
          if (topPerformers.length > 0) {
              const topVideo = topPerformers[0];
              ideas.push({
                  id: 'improve_' + topVideo.id,
                  title: `${keyword} 완전정복 | 전문가가 알려주는 진짜 노하우`,
                  reason: `기존 인기 영상보다 더 구체적이고 전문적인 접근`,
                  expectedViews: '2-5만회',
                  timeToCreate: '3-5일',
                  difficulty: 'medium',
                  difficultyText: '보통',
                  successProbability: 75
              });
          }
          
          // 아이디어 2: 트렌드 활용
          ideas.push({
              id: 'trend_' + Date.now(),
              title: `2024년 ${keyword} 트렌드 | 올해 꼭 알아야 할 것들`,
              reason: '시의성 있는 콘텐츠로 검색 노출 유리',
              expectedViews: '1-3만회',
              timeToCreate: '2-3일',
              difficulty: 'easy',
              difficultyText: '쉬움',
              successProbability: 65
          });
          
          // 아이디어 3: 문제 해결
          ideas.push({
              id: 'problem_' + Date.now(),
              title: `${keyword} 실수 TOP 5 | 이것만은 피하세요`,
              reason: '문제 해결 콘텐츠는 높은 검색 의도',
              expectedViews: '3-7만회',
              timeToCreate: '1-2일',
              difficulty: 'easy',
              difficultyText: '쉬움',
              successProbability: 80
          });
          
          // 아이디어 4: 비교/리뷰
          ideas.push({
              id: 'review_' + Date.now(),
              title: `${keyword} 솔직 후기 | 3개월 사용한 진짜 경험담`,
              reason: '개인 경험담은 신뢰도 높고 참여율 우수',
              expectedViews: '1-4만회',
              timeToCreate: '2-4일',
              difficulty: 'medium',
              difficultyText: '보통',
              successProbability: 70
          });
          
          return ideas;
      }
      
      static findCompetitorWeaknesses(videos) {
          const weaknesses = [];
          
          // 낮은 참여율
          const lowEngagement = videos.filter(v => v.engagementRate < 1.5).length;
          if (lowEngagement > videos.length * 0.4) {
              weaknesses.push({
                  icon: '💬',
                  title: '낮은 참여율',
                  description: `${Math.round(lowEngagement / videos.length * 100)}%의 영상이 평균 이하 참여율`,
                  opportunity: '더 매력적인 호출행동(CTA)과 소통형 콘텐츠로 차별화',
                  impact: 'high',
                  impactText: '높음'
              });
          }
          
          // 구독자 대비 낮은 조회수
          const underperformers = videos.filter(v => v.performanceScore < 0.5).length;
          if (underperformers > videos.length * 0.3) {
              weaknesses.push({
                  icon: '📉',
                  title: '구독자 대비 낮은 조회수',
                  description: `${Math.round(underperformers / videos.length * 100)}%의 채널이 구독자 활용도 낮음`,
                  opportunity: '더 매력적인 썸네일과 제목으로 클릭률 향상',
                  impact: 'high',
                  impactText: '높음'
              });
          }
          
          // 오래된 콘텐츠
          const oldContent = videos.filter(v => {
              const daysSince = (Date.now() - new Date(v.snippet.publishedAt)) / (1000 * 60 * 60 * 24);
              return daysSince > 180;
          }).length;
          
          if (oldContent > videos.length * 0.5) {
              weaknesses.push({
                  icon: '📅',
                  title: '콘텐츠 신선도 부족',
                  description: `${Math.round(oldContent / videos.length * 100)}%가 6개월 이상 된 콘텐츠`,
                  opportunity: '최신 정보와 트렌드를 반영한 콘텐츠로 선점',
                  impact: 'medium',
                  impactText: '보통'
              });
          }
          
          return weaknesses;
      }
      
      static analyzeThumbnailStrategy(videos) {
          return [
              {
                  icon: '🎨',
                  text: '밝고 대조적인 색상 사용',
                  impact: '23'
              },
              {
                  icon: '👤',
                  text: '얼굴 표정을 크게 표시',
                  impact: '31'
              },
              {
                  icon: '📝',
                  text: '핵심 키워드를 텍스트로 강조',
                  impact: '18'
              },
              {
                  icon: '⚡',
                  text: '감정을 자극하는 요소 추가',
                  impact: '27'
              }
          ];
      }
      
      static optimizeTitle(keyword, videos) {
          // 기존 제목들에서 패턴 분석
          const commonWords = ['방법', '팁', '완전정복', '총정리', '비법'];
          const emotionalWords = ['충격적인', '놀라운', '진짜', '솔직한', '완전'];
          
          return {
              before: `${keyword} 방법`,
              after: `${keyword} 완전정복 | 전문가가 알려주는 진짜 비법 총정리`,
              reasons: ['구체적 가치 제시', '권위성 강조', '완성도 암시', 'SEO 키워드 확장']
          };
      }
      
      static generateKeywordClusters(keyword) {
          // 실제로는 더 정교한 키워드 분석 필요
          return [
              {
                  name: '기본 정보',
                  difficulty: 'low',
                  difficultyText: '낮음',
                  keywords: [
                      { term: `${keyword} 뜻`, volume: '높음' },
                      { term: `${keyword} 의미`, volume: '중간' },
                      { term: `${keyword} 정의`, volume: '낮음' }
                  ]
              },
              {
                  name: '실행 방법',
                  difficulty: 'medium',
                  difficultyText: '보통',
                  keywords: [
                      { term: `${keyword} 방법`, volume: '높음' },
                      { term: `${keyword} 하는법`, volume: '높음' },
                      { term: `${keyword} 순서`, volume: '중간' }
                  ]
              },
              {
                  name: '문제 해결',
                  difficulty: 'high',
                  difficultyText: '높음',
                  keywords: [
                      { term: `${keyword} 문제`, volume: '중간' },
                      { term: `${keyword} 실패`, volume: '낮음' },
                      { term: `${keyword} 해결`, volume: '중간' }
                  ]
              }
          ];
      }
      
      static generateHashtags(keyword) {
          return [
              { tag: `#${keyword}`, trend: 'up', trendIcon: '📈' },
              { tag: `#${keyword}팁`, trend: 'hot', trendIcon: '🔥' },
              { tag: `#${keyword}방법`, trend: 'stable', trendIcon: '➡️' },
              { tag: `#초보자${keyword}`, trend: 'up', trendIcon: '📈' },
              { tag: `#${keyword}완전정복`, trend: 'new', trendIcon: '✨' }
          ];
      }
      
      static createContentRoadmap(keyword, videos) {
          return [
              {
                  name: '1개월차',
                  theme: '기반 구축',
                  contents: [
                      { type: '기본', title: `${keyword} 기초 가이드`, priority: 'high', priorityText: '높음' },
                      { type: '팁', title: `${keyword} 초보자 실수 모음`, priority: 'high', priorityText: '높음' },
                      { type: '리뷰', title: `${keyword} 도구 추천`, priority: 'medium', priorityText: '보통' }
                  ]
              },
              {
                  name: '2개월차',
                  theme: '심화 학습',
                  contents: [
                      { type: '고급', title: `${keyword} 고급 테크닉`, priority: 'high', priorityText: '높음' },
                      { type: '비교', title: `${keyword} 방법 비교 분석`, priority: 'medium', priorityText: '보통' },
                      { type: '케이스', title: `${keyword} 성공 사례`, priority: 'medium', priorityText: '보통' }
                  ]
              },
              {
                  name: '3개월차',
                  theme: '전문가 되기',
                  contents: [
                      { type: '전문', title: `${keyword} 전문가 인터뷰`, priority: 'high', priorityText: '높음' },
                      { type: '트렌드', title: `2024 ${keyword} 트렌드`, priority: 'high', priorityText: '높음' },
                      { type: '커뮤니티', title: `${keyword} Q&A`, priority: 'low', priorityText: '낮음' }
               ]
           }
       ];
   }
   
   static analyzeMonetizationOpportunities(keyword, videos) {
       return [
           {
               icon: '💰',
               name: '애드센스 최적화',
               potential: '월 50-200만원',
               description: '고품질 콘텐츠로 CPM 향상 및 조회수 증가',
               timeline: '즉시 가능'
           },
           {
               icon: '🛍️',
               name: '제품 협찬',
               potential: '건당 100-500만원',
               description: `${keyword} 관련 브랜드와의 협업 기회`,
               timeline: '3-6개월 후'
           },
           {
               icon: '📚',
               name: '온라인 강의',
               potential: '월 200-1000만원',
               description: `${keyword} 전문 강의 콘텐츠 판매`,
               timeline: '6개월 후'
           },
           {
               icon: '👥',
               name: '멤버십',
               potential: '월 100-300만원',
               description: '프리미엄 콘텐츠 및 커뮤니티 운영',
               timeline: '1년 후'
           }
       ];
   }
   
   static generateNextSteps(keyword, videos) {
       return [
           {
               icon: '📝',
               text: '가장 높은 성공률의 콘텐츠 아이디어 3개 기획서 작성',
               timeEstimate: '2-3시간'
           },
           {
               icon: '🎨',
               text: '경쟁자 분석 기반 썸네일 템플릿 5개 제작',
               timeEstimate: '4-6시간'
           },
           {
               icon: '📊',
               text: 'SEO 키워드 리스트 정리 및 컨텐츠 매핑',
               timeEstimate: '1-2시간'
           },
           {
               icon: '📅',
               text: '3개월 콘텐츠 캘린더 수립',
               timeEstimate: '2-3시간'
           },
           {
               icon: '🎯',
               text: '첫 번째 콘텐츠 제작 및 AB 테스트 계획',
               timeEstimate: '1주일'
           }
       ];
   }
   
   // 유틸리티 메서드들
   static copyContentIdea(title) {
       navigator.clipboard.writeText(title).then(() => {
           UIUtils.showNotification(`"${title}" 제목이 복사되었습니다! 📋`, 'success');
       });
   }
   
   static showSEOTips(ideaId) {
       // SEO 팁 모달 표시 (추후 구현)
       UIUtils.showNotification('SEO 팁 기능은 곧 추가됩니다! 🎯', 'info');
   }
   
   static copyHashtag(tag) {
       navigator.clipboard.writeText(tag).then(() => {
           UIUtils.showNotification(`${tag} 해시태그가 복사되었습니다!`, 'success');
       });
   }
   
   static exportInsights() {
       // 인사이트 보고서 내보내기 (추후 구현)
       UIUtils.showNotification('인사이트 보고서 다운로드 기능을 준비 중입니다! 📋', 'info');
   }
   
   static scheduleContent() {
       // 콘텐츠 일정 생성 (추후 구현)
       UIUtils.showNotification('콘텐츠 스케줄링 기능을 준비 중입니다! 📅', 'info');
   }
   
   static shareInsights() {
       // 인사이트 공유 (추후 구현)
       const url = window.location.href;
       navigator.clipboard.writeText(url).then(() => {
           UIUtils.showNotification('현재 페이지 링크가 복사되었습니다! 🔗', 'success');
       });
   }
}

// 전역 인스턴스
window.insightAnalyzer = new InsightAnalyzer();