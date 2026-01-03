// تطبيق Mouse Streaming Hub
class MouseStreamApp {
    constructor() {
        this.channels = [];
        this.currentChannel = null;
        this.hls = null;
        this.favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        this.chatMessages = [];
        this.theme = localStorage.getItem('theme') || 'dark';
        this.currentQuality = 'auto';
        
        this.init();
    }

    init() {
        // تهيئة التطبيق
        this.initTheme();
        this.loadChannels();
        this.initVideoPlayer();
        this.bindEvents();
        this.showWelcomeModal();
        this.updateOnlineCount();
        
        // تحميل بيانات التخزين المحلي
        this.loadFromStorage();
        
        // محاكاة المستخدمين المتصلين
        setInterval(() => this.updateOnlineCount(), 30000);
    }

    initTheme() {
        document.body.classList.toggle('dark', this.theme === 'dark');
        document.body.classList.toggle('light', this.theme === 'light');
        
        const themeIcon = document.querySelector('#theme-toggle i');
        themeIcon.className = this.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    toggleTheme() {
        this.theme = this.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', this.theme);
        this.initTheme();
    }

    loadChannels() {
        // قائمة القنوات
        this.channels = [
            {
                id: 1,
                name: "beIN MAX 1 4K",
                category: "sports",
                quality: "4K",
                url: "http://fr.ottv.pro/live/4476647188407159/4476647188407159/432904.m3u8",
                logo: "https://cdn-icons-png.flaticon.com/512/732/732221.png",
                isLive: true
            },
            {
                id: 2,
                name: "beIN MAX 2 FHD",
                category: "sports",
                quality: "FHD",
                url: "http://fr.ottv.pro/live/4476647188407159/4476647188407159/432903.m3u8",
                logo: "https://cdn-icons-png.flaticon.com/512/732/732221.png",
                isLive: true
            },
            {
                id: 3,
                name: "EL BILAD TV",
                category: "general",
                quality: "HD",
                url: "http://fr.ottv.pro/live/4476647188407159/4476647188407159/351100.m3u8",
                logo: "🇩🇿",
                isLive: true
            },
            {
                id: 4,
                name: "Action Movies UK",
                category: "movies",
                quality: "FHD",
                url: "https://54045f0c40fd442c8b06df076aaf1e85.mediatailor.eu-west-1.amazonaws.com/v1/master/0547f18649bd788bec7b67b746e47670f558b6b2/production-LiveChannel-6065/master.m3u8",
                logo: "🎬",
                isLive: true
            },
            {
                id: 5,
                name: "Comedy Movies",
                category: "movies",
                quality: "HD",
                url: "https://9be783d652cd4b099cf63e1dc134c4a3.mediatailor.eu-west-1.amazonaws.com/v1/master/0547f18649bd788bec7b67b746e47670f558b6b2/production-LiveChannel-6181/master.m3u8",
                logo: "😂",
                isLive: true
            },
            {
                id: 6,
                name: "Drama Movies",
                category: "movies",
                quality: "HD",
                url: "https://fee09fd665814f51b939b6d106cf5f66.mediatailor.eu-west-1.amazonaws.com/v1/master/0547f18649bd788bec7b67b746e47670f558b6b2/production-LiveChannel-6093/master.m3u8",
                logo: "🎭",
                isLive: true
            },
            {
                id: 7,
                name: "Top Movies",
                category: "movies",
                quality: "FHD",
                url: "https://0145451975a64b35866170fd2e8fa486.mediatailor.eu-west-1.amazonaws.com/v1/master/0547f18649bd788bec7b67b746e47670f558b6b2/production-LiveChannel-5987/master.m3u8",
                logo: "🏆",
                isLive: true
            },
            {
                id: 8,
                name: "ALGERIE 6",
                category: "general",
                quality: "SD",
                url: "http://fr.ottv.pro/live/4476647188407159/4476647188407159/327314.m3u8",
                logo: "🇩🇿",
                isLive: true
            }
        ];

        this.renderChannels();
    }

    renderChannels(filter = 'all') {
        const container = document.getElementById('channels-container');
        container.innerHTML = '';
        
        const filteredChannels = filter === 'all' 
            ? this.channels 
            : this.channels.filter(ch => ch.category === filter);
        
        filteredChannels.forEach(channel => {
            const isFavorite = this.favorites.includes(channel.id);
            const isActive = this.currentChannel?.id === channel.id;
            
            const channelCard = document.createElement('div');
            channelCard.className = `channel-card p-4 fade-in ${isActive ? 'active' : ''}`;
            channelCard.innerHTML = `
                <div class="flex items-center justify-between mb-3">
                    <div class="text-2xl">${channel.logo}</div>
                    <div class="flex space-x-2">
                        <button onclick="app.toggleFavorite(${channel.id})" 
                                class="p-1 ${isFavorite ? 'text-yellow-400' : 'text-gray-400'} hover:text-yellow-300">
                            <i class="fas ${isFavorite ? 'fa-star' : 'fa-star'}"></i>
                        </button>
                        <span class="text-xs bg-${channel.quality === '4K' ? 'purple' : channel.quality === 'FHD' ? 'blue' : 'green'}-900/50 px-2 py-1 rounded">
                            ${channel.quality}
                        </span>
                    </div>
                </div>
                <h4 class="font-bold text-sm mb-2 truncate">${channel.name}</h4>
                <div class="flex items-center justify-between text-xs text-gray-400 mb-3">
                    <span>${channel.category === 'sports' ? 'رياضة' : channel.category === 'movies' ? 'أفلام' : 'عام'}</span>
                    <span class="flex items-center ${channel.isLive ? 'text-red-400' : 'text-gray-500'}">
                        <span class="w-2 h-2 rounded-full ${channel.isLive ? 'bg-red-500 animate-pulse' : 'bg-gray-500'} mr-1"></span>
                        ${channel.isLive ? 'مباشر' : 'غير متاح'}
                    </span>
                </div>
                <button onclick="app.playChannel(${channel.id})" 
                        class="w-full py-2 bg-gradient-to-r from-cyan-700 to-blue-700 hover:from-cyan-600 hover:to-blue-600 rounded-lg text-sm font-bold transition">
                    <i class="fas fa-play mr-2"></i>تشغيل
                </button>
            `;
            
            container.appendChild(channelCard);
        });
    }

    initVideoPlayer() {
        this.videoPlayer = document.getElementById('video-player');
        
        // معالجة الأخطاء
        this.videoPlayer.addEventListener('error', (e) => {
            console.error('Video error:', e);
            this.showPlayerMessage('حدث خطأ في تحميل الفيديو', 'error');
        });
        
        // تحديث حالة التشغيل
        this.videoPlayer.addEventListener('playing', () => {
            document.getElementById('player-status').textContent = 'جاري التشغيل';
            document.getElementById('player-status').className = 'text-sm bg-green-900/30 px-3 py-1 rounded-full';
        });
        
        this.videoPlayer.addEventListener('pause', () => {
            document.getElementById('player-status').textContent = 'متوقف';
            document.getElementById('player-status').className = 'text-sm bg-yellow-900/30 px-3 py-1 rounded-full';
        });
    }

    playChannel(channelId) {
        const channel = this.channels.find(ch => ch.id === channelId);
        if (!channel) return;
        
        this.currentChannel = channel;
        
        // تحديث واجهة المستخدم
        document.getElementById('current-channel').textContent = channel.name;
        document.getElementById('player-status').textContent = 'جارٍ التحميل...';
        document.getElementById('player-status').className = 'text-sm bg-blue-900/30 px-3 py-1 rounded-full';
        
        // تحديث قسم "جاري التشغيل"
        document.getElementById('now-playing').innerHTML = `
            <div class="flex items-center space-x-4">
                <div class="text-3xl">${channel.logo}</div>
                <div class="text-right">
                    <h4 class="font-bold text-lg">${channel.name}</h4>
                    <p class="text-gray-300 text-sm">${channel.category === 'sports' ? 'قناة رياضية' : 'قناة أفلام'}</p>
                    <p class="text-cyan-400 text-xs mt-1">${channel.quality} • مباشر</p>
                </div>
            </div>
            <div class="mt-4">
                <button onclick="app.toggleFavorite(${channel.id})" class="px-4 py-2 bg-yellow-900/30 hover:bg-yellow-800/30 rounded-lg">
                    <i class="fas ${this.favorites.includes(channel.id) ? 'fa-heart text-red-400' : 'fa-heart text-gray-400'}"></i>
                    ${this.favorites.includes(channel.id) ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
                </button>
            </div>
        `;
        
        // إخفاء رسالة الترحيب في المشغل
        document.getElementById('player-overlay').style.display = 'none';
        
        // تشغيل القناة باستخدام HLS
        this.playHLS(channel.url);
        
        // تحديث عرض القنوات
        this.renderChannels();
        
        // إضافة رسالة في الشات
        this.addSystemMessage(`بدأ تشغيل قناة ${channel.name}`);
    }

    playHLS(url) {
        if (this.hls) {
            this.hls.destroy();
        }
        
        if (Hls.isSupported()) {
            this.hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            
            this.hls.loadSource(url);
            this.hls.attachMedia(this.videoPlayer);
            
            this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
                this.videoPlayer.play();
            });
            
            this.hls.on(Hls.Events.ERROR, (event, data) => {
                console.error('HLS error:', data);
                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            this.showPlayerMessage('خطأ في الشبكة، جاري إعادة المحاولة...', 'error');
                            this.hls.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            this.showPlayerMessage('خطأ في الوسائط', 'error');
                            this.hls.recoverMediaError();
                            break;
                        default:
                            this.hls.destroy();
                            this.showPlayerMessage('خطأ غير معروف', 'error');
                            break;
                    }
                }
            });
        } else if (this.videoPlayer.canPlayType('application/vnd.apple.mpegurl')) {
            // دعم Safari
            this.videoPlayer.src = url;
            this.videoPlayer.addEventListener('loadedmetadata', () => {
                this.videoPlayer.play();
            });
        } else {
            this.showPlayerMessage('المتصفح غير مدعوم لتشغيل هذا النوع من الفيديو', 'error');
        }
    }

    toggleFavorite(channelId) {
        const index = this.favorites.indexOf(channelId);
        if (index > -1) {
            this.favorites.splice(index, 1);
        } else {
            this.favorites.push(channelId);
        }
        
        localStorage.setItem('favorites', JSON.stringify(this.favorites));
        this.renderFavorites();
        this.renderChannels();
    }

    renderFavorites() {
        const container = document.getElementById('favorites-list');
        container.innerHTML = '';
        
        if (this.favorites.length === 0) {
            container.innerHTML = `
                <div class="text-center py-4 text-gray-400">
                    <i class="fas fa-heart text-xl mb-2 block"></i>
                    أضف قنواتك المفضلة هنا
                </div>
            `;
            return;
        }
        
        this.favorites.forEach(favId => {
            const channel = this.channels.find(ch => ch.id === favId);
            if (channel) {
                const favItem = document.createElement('div');
                favItem.className = 'flex items-center justify-between p-3 bg-black/30 rounded-lg hover:bg-black/40 cursor-pointer';
                favItem.onclick = () => this.playChannel(channel.id);
                favItem.innerHTML = `
                    <div class="flex items-center space-x-3">
                        <div class="text-xl">${channel.logo}</div>
                        <div class="text-right">
                            <h4 class="font-bold text-sm">${channel.name}</h4>
                            <p class="text-gray-400 text-xs">${channel.quality}</p>
                        </div>
                    </div>
                    <button onclick="event.stopPropagation(); app.toggleFavorite(${channel.id})" 
                            class="text-yellow-400 hover:text-yellow-300">
                        <i class="fas fa-star"></i>
                    </button>
                `;
                container.appendChild(favItem);
            }
        });
    }

    sendMessage() {
        const input = document.getElementById('message-input');
        const message = input.value.trim();
        
        if (!message) return;
        
        this.addChatMessage('user', message);
        input.value = '';
        
        // محاكاة ردود من مستخدمين آخرين
        if (Math.random() > 0.7) {
            setTimeout(() => {
                const responses = [
                    'شكراً على المشاركة!',
                    'أي قناة تشاهدها الآن؟',
                    'جودة البث رائعة اليوم',
                    'هل تحب هذا النوع من القنوات؟'
                ];
                const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                this.addChatMessage('other', randomResponse);
            }, 1000 + Math.random() * 2000);
        }
    }

    addChatMessage(sender, text) {
        const container = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        
        const isUser = sender === 'user';
        messageDiv.className = `flex ${isUser ? 'justify-end' : 'justify-start'} fade-in`;
        messageDiv.innerHTML = `
            <div class="max-w-[80%] ${isUser ? 'bg-gradient-to-l from-cyan-900/50 to-blue-900/50' : 'bg-gray-900/50'} rounded-2xl p-3 border ${isUser ? 'border-cyan-500/30' : 'border-gray-700/30'}">
                <div class="text-xs ${isUser ? 'text-cyan-300' : 'text-yellow-300'} mb-1">
                    ${isUser ? 'أنت' : 'مستخدم'}
                </div>
                <div class="text-sm">${text}</div>
                <div class="text-xs text-gray-500 text-left mt-1">
                    ${new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
        `;
        
        container.appendChild(messageDiv);
        container.scrollTop = container.scrollHeight;
        
        // حفظ الرسائل (محدودة)
        this.chatMessages.push({ sender, text, time: new Date() });
        if (this.chatMessages.length > 50) {
            this.chatMessages.shift();
        }
    }

    addSystemMessage(text) {
        const container = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        
        messageDiv.className = 'flex justify-center fade-in';
        messageDiv.innerHTML = `
            <div class="bg-gray-900/70 rounded-full px-4 py-2 border border-gray-700/50">
                <div class="text-xs text-gray-400">📢 ${text}</div>
            </div>
        `;
        
        container.appendChild(messageDiv);
        container.scrollTop = container.scrollHeight;
    }

    updateOnlineCount() {
        const count = Math.floor(Math.random() * 20) + 5; // محاكاة عدد المستخدمين
        document.getElementById('online-count').textContent = `${count} متصل`;
    }

    showWelcomeModal() {
        setTimeout(() => {
            document.getElementById('splash-screen').style.display = 'none';
            document.getElementById('app').classList.remove('hidden');
            document.getElementById('welcome-modal').classList.remove('hidden');
            
            // تحميل شريط التحميل
            let width = 0;
            const interval = setInterval(() => {
                width += 2;
                document.getElementById('loading-bar').style.width = `${width}%`;
                if (width >= 100) clearInterval(interval);
            }, 30);
        }, 1500);
    }

    closeWelcomeModal() {
        document.getElementById('welcome-modal').classList.add('hidden');
        this.addSystemMessage('مرحباً بك في منصة MOUSE STREAM!');
    }

    showPlayerMessage(text, type = 'info') {
        const overlay = document.getElementById('player-overlay');
        overlay.innerHTML = `
            <div class="text-center p-8">
                <div class="text-4xl mb-4 ${type === 'error' ? 'text-red-400' : 'text-cyan-400'}">
                    ${type === 'error' ? '❌' : '⏳'}
                </div>
                <h3 class="text-xl font-bold mb-2">${text}</h3>
                <button onclick="app.retryPlayback()" class="mt-4 px-6 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-full">
                    إعادة المحاولة
                </button>
            </div>
        `;
        overlay.style.display = 'flex';
    }

    retryPlayback() {
        if (this.currentChannel) {
            this.playChannel(this.currentChannel.id);
        }
    }

    playSampleVideo() {
        // فيديو تجريبي
        const sampleUrl = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';
        this.playHLS(sampleUrl);
        
        document.getElementById('current-channel').textContent = 'فيديو تجريبي';
        document.getElementById('player-status').textContent = 'تجربة تشغيل';
        document.getElementById('player-overlay').style.display = 'none';
        
        this.addSystemMessage('بدأ تشغيل فيديو تجريبي');
    }

    showFullscreen() {
        const player = document.getElementById('video-player');
        if (player.requestFullscreen) {
            player.requestFullscreen();
        } else if (player.webkitRequestFullscreen) {
            player.webkitRequestFullscreen();
        } else if (player.mozRequestFullScreen) {
            player.mozRequestFullScreen();
        }
    }

    filterChannels(category) {
        this.renderChannels(category);
    }

    loadMoreChannels() {
        // محاكاة تحميل المزيد من القنوات
        this.addSystemMessage('جارٍ تحميل المزيد من القنوات...');
        
        setTimeout(() => {
            this.addSystemMessage('تم تحميل القنوات الإضافية');
        }, 1000);
    }

    toggleQuality() {
        const qualities = ['auto', 'SD', 'HD', 'FHD', '4K'];
        const currentIndex = qualities.indexOf(this.currentQuality);
        this.currentQuality = qualities[(currentIndex + 1) % qualities.length];
        
        this.addSystemMessage(`تم تغيير جودة التشغيل إلى: ${this.currentQuality}`);
        
        if (this.currentChannel && this.hls) {
            // في تطبيق حقيقي، هنا يتم تغيير جودة التشغيل
        }
    }

    toggleSubtitles() {
        this.addSystemMessage('الترجمة غير متاحة لهذه القناة حالياً');
    }

    bindEvents() {
        // ربط الأحداث
        document.getElementById('theme-toggle').addEventListener('click', () => this.toggleTheme());
        
        document.getElementById('message-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
        
        // تكبير/تصغير الفيديو
        this.videoPlayer.addEventListener('dblclick', () => this.showFullscreen());
        
        // حفظ البيانات عند إغلاق الصفحة
        window.addEventListener('beforeunload', () => this.saveToStorage());
    }

    loadFromStorage() {
        this.renderFavorites();
    }

    saveToStorage() {
        // يمكن إضافة المزيد من البيانات للحفظ
    }
}

// تهيئة التطبيق عند تحميل الصفحة
let app;
window.addEventListener('DOMContentLoaded', () => {
    app = new MouseStreamApp();
    
    // جعل التطبيق متاحاً في النطاق العام
    window.app = app;
});