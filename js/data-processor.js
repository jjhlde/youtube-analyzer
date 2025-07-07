// 데이터 처리 및 계산 관련 함수들

class DataProcessor {
    static processVideoData(videos) {
        return videos.map(video => {
            const channelId = video.snippet.channelId;
            const channel = STATE.channelCache[channelId];
            
            if (!channel) return null;
            
            const subscriberCount = Number(channel.statistics.subscriberCount || 0);
            const viewCount = Number(video.statistics.viewCount || 0);
            const likeCount = Number(video.statistics.likeCount || 0);
            const commentCount = Number(video.statistics.commentCount || 0);
            const videoCount = Number(channel.statistics.videoCount || 0);
            const channelTotalViews = Number(channel.statistics.viewCount || 0);
            
            // 계산들
            const avgViewsPerVideo = videoCount > 0 ? channelTotalViews / videoCount : 0;
            const contributionScore = avgViewsPerVideo > 0 ? (viewCount / avgViewsPerVideo) * 100 : 0;
            const contributionGrade = this.getContributionGrade(contributionScore);  // 기여도 등급 추가
            const performanceScore = subscriberCount > 0 ? viewCount / subscriberCount : 0;
            const performanceMultiplier = performanceScore;
            const influenceGrade = this.getPerformanceGrade(performanceScore);
            const engagementRate = viewCount > 0 ? ((likeCount + commentCount) / viewCount) * 100 : 0;
            
            return {
                ...video,
                channel,
                subscriberCount,
                viewCount,
                likeCount,
                commentCount,
                videoCount,
                channelTotalViews,
                avgViewsPerVideo,
                contributionScore,       // 기여도 점수
                contributionGrade,       // 기여도 등급 추가
                performanceScore,
                performanceMultiplier,
                influenceGrade,
                engagementRate
            };
        }).filter(video => video !== null);
    }
    
    static getPerformanceGrade(score) {
        if (score >= CONFIG.PERFORMANCE_GRADES.GREAT) {
            return { grade: 'great', text: '최고' };
        }
        if (score >= CONFIG.PERFORMANCE_GRADES.GOOD) {
            return { grade: 'good', text: '좋음' };
        }
        if (score >= CONFIG.PERFORMANCE_GRADES.NORMAL) {
            return { grade: 'normal', text: '보통' };
        }
        if (score >= CONFIG.PERFORMANCE_GRADES.BAD) {
            return { grade: 'bad', text: '나쁨' };
        }
        return { grade: 'worst', text: '최악' };
    }
    
    static getContributionGrade(score) {
        // 기여도 등급 (채널 평균 대비 비율)
        if (score >= 500) {
            return { grade: 'great', text: '최고' };  // 5배 이상
        }
        if (score >= 200) {
            return { grade: 'good', text: '좋음' };   // 2~5배
        }
        if (score >= 100) {
            return { grade: 'normal', text: '보통' }; // 평균과 비슷 (1~2배)
        }
        if (score >= 50) {
            return { grade: 'bad', text: '나쁨' };    // 평균의 절반~평균
        }
        return { grade: 'worst', text: '최악' };     // 평균의 절반 미만
    }
    
    static applyFilters(videos) {
        const minInfluence = Number(document.getElementById('minInfluenceScore').value) || 0;
        const minViews = Number(document.getElementById('minViewCount').value) || 0;
        const maxViews = Number(document.getElementById('maxViewCount').value) || Infinity;
        const minSubs = Number(document.getElementById('minSubscribers').value) || 0;
        const maxSubs = Number(document.getElementById('maxSubscribers').value) || Infinity;
        
        return videos.filter(video => {
            return video.performanceScore >= minInfluence && 
                   video.viewCount >= minViews && 
                   video.viewCount <= maxViews &&
                   video.subscriberCount >= minSubs &&
                   video.subscriberCount <= maxSubs;
        });
    }
}

// 채널 캐시 관리
class ChannelCache {
    static async updateCache(channelIds) {
        const newChannelIds = channelIds.filter(id => !STATE.channelCache[id]);
        
        if (newChannelIds.length > 0) {
            const channelsData = await YouTubeAPI.getChannelDetails(newChannelIds);
            
            if (channelsData.items) {
                channelsData.items.forEach(channel => {
                    STATE.channelCache[channel.id] = channel;
                });
            }
        }
    }
}