// senior-keywords.js - 보강된 키워드 데이터

const SENIOR_KEYWORDS = {
      // 건강 관련 (가장 높은 관심도)
      health: {
          category: "건강",
          keywords: [
              "고혈압", "당뇨", "관절염", "치매예방", "뇌졸중", "혈관건강",
              "골다공증", "백내장", "녹내장", "심장건강", "콜레스테롤",
              "혈당관리", "운동법", "스트레칭", "걷기운동", "수영",
              "건강검진", "영양제", "비타민", "오메가3", "프로바이오틱스",
              "면역력", "수면건강", "불면증", "건강식단", "저염식",
              "혈압약", "당뇨약", "건강관리", "병원", "의사", "한의원",
              "혈압약 부작용", "당뇨 초기증상", "관절 운동", "치매 초기증상",
              "무릎 아픔", "어깨 통증", "허리 디스크", "목 디스크", "손목 터널증후군",
              "오십견", "류마티스", "통풍", "근육 경련", "신장 건강"
          ],
          searchTerms: [
              "50대 건강", "60대 건강", "70대 건강", "중년 건강",
              "시니어 운동", "어르신 건강", "노인 건강", "중장년 건강",
              "50대 운동법", "60대 다이어트", "시니어 헬스케어"
          ]
      },
      
      // 재정/투자 관련
      finance: {
          category: "재정관리",
          keywords: [
              "연금", "국민연금", "퇴직연금", "개인연금", "노후준비",
              "노후자금", "재테크", "적금", "예금", "펀드", "주식",
              "부동산", "전세", "월세", "주택연금", "리버스모기지",
              "상속", "증여", "세금", "건강보험", "의료보험", "실버보험",
              "노후설계", "자산관리", "투자", "은퇴", "은퇴준비",
              "용돈벌이", "부업", "알바", "시니어일자리", "취업",
              "기초연금", "연금수령", "절세", "세금절약", "보험정리",
              "금융사기", "투자사기", "보이스피싱", "스마트뱅킹", "인터넷뱅킹"
          ],
          searchTerms: [
              "50대 재테크", "60대 투자", "노후자금", "은퇴준비",
              "시니어 투자", "중년 재정관리", "노후 돈", "연금 늘리기"
          ]
      },
      
      // 취미/여가 관련
      hobby: {
          category: "취미여가",
          keywords: [
              "등산", "산행", "낚시", "바둑", "장기", "화투", "고스톱",
              "정원가꾸기", "텃밭", "화분기르기", "원예", "분재",
              "서예", "그림그리기", "노래교실", "댄스", "요가", "태극권",
              "여행", "국내여행", "해외여행", "캠핑", "펜션", "온천",
              "독서", "도서관", "박물관", "전시회", "공연", "콘서트",
              "요리", "베이킹", "반찬만들기", "김치", "장아찌", "된장",
              "사진", "카메라", "스마트폰", "컴퓨터", "인터넷", "유튜브",
              "골프", "탁구", "수영", "자전거", "산책", "조깅", "헬스",
              "악기연주", "피아노", "기타", "하모니카", "합창", "밴드활동"
          ],
          searchTerms: [
              "시니어 취미", "중년 취미", "50대 취미", "60대 취미",
              "노인 여가", "어르신 활동", "실버 취미", "시니어 클럽"
          ]
      },
      
      // 가족/관계 관련
      family: {
          category: "가족관계",
          keywords: [
              "손자", "손녀", "며느리", "사위", "육아", "육아법",
              "결혼", "이혼", "재혼", "황혼이혼", "가족갈등",
              "부부관계", "노년부부", "소통", "대화법", "갈등해결",
              "자녀교육", "손자교육", "용돈", "생활비", "가계부",
              "독거", "혼자살기", "외로움", "우울", "친구만들기",
              "동호회", "모임", "교회", "절", "종교", "봉사활동",
              "시어머니", "시아버지", "고부갈등", "장남", "차남", "상속문제",
              "명절스트레스", "제사", "차례", "가족여행", "효도"
          ],
          searchTerms: [
              "손자 육아", "며느리 관계", "시니어 관계", "중년 부부",
              "노년 가족", "어르신 고민", "가족 소통", "고부갈등 해결"
          ]
      },
      
      // 일상생활 관련
      lifestyle: {
          category: "일상생활",
          keywords: [
              "스마트폰", "카카오톡", "인터넷쇼핑", "배달음식", "키오스크",
              "교통카드", "지하철", "버스", "택시", "병원예약", "온라인뱅킹",
              "청소", "세탁", "정리정돈", "미니멀라이프", "단순생활",
              "식사준비", "장보기", "마트", "시장", "온라인쇼핑", "쿠팡",
              "생활용품", "가전제품", "리모컨", "TV", "에어컨", "난방",
              "안전", "보안", "사기예방", "보이스피싱", "개인정보보호",
              "배달앱", "카드결제", "무인계산대", "ATM", "QR코드", "앱설치",
              "와이파이", "인터넷", "유튜브 보기", "네이버", "구글", "검색"
          ],
          searchTerms: [
              "시니어 스마트폰", "어르신 인터넷", "중년 생활",
              "50대 일상", "노인 안전", "실버 라이프", "시니어 디지털"
          ]
      },
      
      // 정보채널 (팩트 기반)
      info_channel: {
          category: "정보채널",
          keywords: [
              "정부정책", "복지혜택", "연금정보", "건강보험", "세금정보",
              "부동산정책", "의료정보", "생활정보", "경제뉴스", "시사해설",
              "정책설명", "제도안내", "신청방법", "혜택정보", "최신정책",
              "기초연금", "국민연금", "건강검진", "의료비지원", "주거급여",
              "교통카드할인", "문화누리카드", "노인장기요양", "치매국가책임제",
              "기초생활수급", "의료급여", "장애인복지", "노인복지", "경로우대",
              "시니어할인", "공공요금", "전기요금", "가스요금", "통신비", "보조금"
          ],
          searchTerms: [
              "시니어 정책", "50대 혜택", "60대 정보", "어르신 지원",
              "중년 정책 정보", "노후 준비 정보", "정부 복지 혜택", "복지제도"
          ]
      },
      
      // 썰채널 (스토리텔링)  
      story_channel: {
          category: "썰채널",
          keywords: [
              "옛날이야기", "추억", "그때그시절", "역사미스터리", "실화",
              "사건사고", "미제사건", "도시전설", "옛날연예인", "과거이야기",
              "충격적인", "진짜이야기", "숨겨진진실", "뒷이야기", "비하인드",
              "전설", "미스터리", "범죄", "옛날TV", "옛날영화", "트로트",
              "가요", "배우", "가수", "개그맨", "방송사고", "스캔들",
              "70년대", "80년대", "90년대", "추억의명곡", "옛날드라마", "만화",
              "학창시절", "군대이야기", "첫사랑", "결혼이야기", "육아썰", "직장생활"
          ],
          searchTerms: [
              "실제 있었던 일", "충격적인 실화", "과거 사건 재조명",
              "옛날 연예계", "추억의 그 시절", "역사 속 진실",
              "그때 그 사건", "미스터리한 사건", "숨겨진 이야기", "세대 공감"
          ]
      }
  };
  
  // 키워드 분석기 클래스
  class SeniorKeywordAnalyzer {
      constructor() {
          this.trendingTopics = [];
          this.competitionAnalysis = {};
      }
      
      // 시니어 관련 키워드인지 확인
      isSeniorRelated(title, description = '') {
          const content = (title + ' ' + description).toLowerCase();
          const seniorIndicators = [
              '50대', '60대', '70대', '중년', '시니어', '어르신', '노인',
              '노후', '은퇴', '퇴직', '실버', '중장년', '황혼'
          ];
          
          return seniorIndicators.some(indicator => content.includes(indicator));
      }
      
      // 카테고리별 키워드 매칭
      categorizeContent(title, description = '') {
          const content = (title + ' ' + description).toLowerCase();
          const categories = [];
          
          Object.entries(SENIOR_KEYWORDS).forEach(([key, data]) => {
              const matchCount = data.keywords.filter(keyword => 
                  content.includes(keyword.toLowerCase())
              ).length;
              
              if (matchCount > 0) {
                  categories.push({
                      category: data.category,
                      matchCount: matchCount,
                      relevance: matchCount / data.keywords.length
                  });
              }
          });
          
          return categories.sort((a, b) => b.matchCount - a.matchCount);
      }
      
      // 떡상 가능성 분석
      analyzeTrendPotential(video) {
          const score = {
              viewGrowth: 0,      // 조회수 대비 성장 가능성
              competition: 0,     // 경쟁 강도
              engagement: 0,      // 참여도
              seasonality: 0,     // 계절성
              total: 0
          };
          
          // 조회수 대비 구독자 비율 (바이럴 가능성)
          if (video.performanceScore > 5) score.viewGrowth += 30;
          else if (video.performanceScore > 2) score.viewGrowth += 20;
          else if (video.performanceScore > 1) score.viewGrowth += 10;
          
          // 참여도 점수
          if (video.engagementRate > 5) score.engagement += 25;
          else if (video.engagementRate > 3) score.engagement += 15;
          else if (video.engagementRate > 1) score.engagement += 10;
          
          // 경쟁 강도 (낮을수록 좋음)
          const categories = this.categorizeContent(video.snippet.title, video.snippet.description);
          if (categories.length > 0) {
              // 복합 주제일수록 경쟁 낮음
              score.competition = Math.min(25, categories.length * 8);
          }
          
          // 최근성 보너스
          const daysSincePublished = (Date.now() - new Date(video.snippet.publishedAt)) / (1000 * 60 * 60 * 24);
          if (daysSincePublished < 7) score.seasonality += 15;
          else if (daysSincePublished < 30) score.seasonality += 10;
          
          score.total = score.viewGrowth + score.competition + score.engagement + score.seasonality;
          
          return score;
      }
      
      // 추천 키워드 생성
      generateRecommendedKeywords(category = null) {
          if (category && SENIOR_KEYWORDS[category]) {
              return SENIOR_KEYWORDS[category].keywords
                  .sort(() => Math.random() - 0.5)  // 랜덤 섞기
                  .slice(0, 10);  // 상위 10개
          }
          
          // 전체 카테고리에서 랜덤 추천
          const allKeywords = Object.values(SENIOR_KEYWORDS)
              .flatMap(data => data.keywords);
          
          return allKeywords
              .sort(() => Math.random() - 0.5)
              .slice(0, 15);
      }
      
      // 경쟁 분석
      analyzeCompetition(searchResults, keyword) {
          const analysis = {
              totalVideos: searchResults.length,
              avgViews: 0,
              avgSubscribers: 0,
              competitionLevel: 'low',
              opportunities: []
          };
          
          if (searchResults.length > 0) {
              analysis.avgViews = searchResults.reduce((sum, video) => sum + video.viewCount, 0) / searchResults.length;
              analysis.avgSubscribers = searchResults.reduce((sum, video) => sum + video.subscriberCount, 0) / searchResults.length;
              
              // 경쟁 강도 판단
              if (analysis.avgSubscribers > 1000000) analysis.competitionLevel = 'high';
              else if (analysis.avgSubscribers > 100000) analysis.competitionLevel = 'medium';
              else analysis.competitionLevel = 'low';
              
              // 기회 요소 찾기
              const lowPerformers = searchResults.filter(video => video.performanceScore < 1);
              if (lowPerformers.length > searchResults.length * 0.3) {
                  analysis.opportunities.push('많은 영상들의 성과가 낮아 진입 기회 있음');
              }
              
              const recentGaps = searchResults.filter(video => {
                  const daysSince = (Date.now() - new Date(video.snippet.publishedAt)) / (1000 * 60 * 60 * 24);
                  return daysSince > 30;
              });
              
              if (recentGaps.length > searchResults.length * 0.5) {
                  analysis.opportunities.push('최근 콘텐츠가 부족하여 타이밍 좋음');
              }
          }
          
          return analysis;
      }
  }
  
  // 전역 인스턴스
  const seniorAnalyzer = new SeniorKeywordAnalyzer();