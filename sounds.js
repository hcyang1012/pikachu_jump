// Web Audio API를 사용한 사운드 생성
class SoundManager {
    constructor() {
        this.audioContext = null;
        this.sounds = {};
        this.bgMusicStopped = false;
        this.init();
    }

    init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            // 오디오 컨텍스트가 일시정지 상태일 수 있으므로 재개
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
        } catch (e) {
            console.log('Web Audio API를 지원하지 않습니다:', e);
        }
    }

    // 점프 사운드 생성
    createJumpSound() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }

    // 충돌 사운드 생성
    createCollisionSound() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.2);
    }

    // 파워업 사운드 생성
    createPowerUpSound() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.15);
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.15);
    }
    
    // 불꽃 방사 사운드 생성
    createFireBlastSound() {
        if (!this.audioContext) return;
        
        // 여러 개의 오실레이터로 불꽃 효과
        for (let i = 0; i < 3; i++) {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(200 + i * 100, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(400 + i * 100, this.audioContext.currentTime + 0.3);
            
            gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
            
            oscillator.start(this.audioContext.currentTime + i * 0.1);
            oscillator.stop(this.audioContext.currentTime + 0.3 + i * 0.1);
        }
    }
    
    // 번개 사운드 생성
    createThunderSound() {
        if (!this.audioContext) return;
        
        // 높은 주파수의 번개 효과
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.2);
        
        // 추가 번개 효과
        setTimeout(() => {
            const oscillator2 = this.audioContext.createOscillator();
            const gainNode2 = this.audioContext.createGain();
            
            oscillator2.connect(gainNode2);
            gainNode2.connect(this.audioContext.destination);
            
            oscillator2.frequency.setValueAtTime(600, this.audioContext.currentTime);
            oscillator2.frequency.exponentialRampToValueAtTime(150, this.audioContext.currentTime + 0.15);
            
            gainNode2.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gainNode2.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
            
            oscillator2.start(this.audioContext.currentTime);
            oscillator2.stop(this.audioContext.currentTime + 0.15);
        }, 100);
    }
    
    // 물대포 사운드 생성
    createHydroPumpSound() {
        if (!this.audioContext) return;
        
        // 물이 퍼지는 효과
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.4);
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.4);
        
        // 물 방울 효과
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const oscillator2 = this.audioContext.createOscillator();
                const gainNode2 = this.audioContext.createGain();
                
                oscillator2.connect(gainNode2);
                gainNode2.connect(this.audioContext.destination);
                
                oscillator2.frequency.setValueAtTime(400 + i * 50, this.audioContext.currentTime);
                oscillator2.frequency.exponentialRampToValueAtTime(200 + i * 50, this.audioContext.currentTime + 0.2);
                
                gainNode2.gain.setValueAtTime(0.1, this.audioContext.currentTime);
                gainNode2.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
                
                oscillator2.start(this.audioContext.currentTime);
                oscillator2.stop(this.audioContext.currentTime + 0.2);
            }, i * 50);
        }
    }

    // 게임오버 사운드 생성
    createGameOverSound() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.5);
        
        gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.5);
    }

    // 배경음악 생성 (반복)
    createBgMusic() {
        if (!this.audioContext || this.bgMusicStopped) return;
        
        let currentTime = this.audioContext.currentTime;
        
        // 메인 멜로디
        const mainNotes = [
            523, 659, 784, 1047, 784, 659,  // C5, E5, G5, C6, G5, E5
            523, 659, 784, 1047, 784, 659,  // 반복
            784, 1047, 1319, 1568, 1319, 1047,  // G5, C6, E6, G6, E6, C6
            523, 659, 784, 1047, 784, 659   // 다시 기본 멜로디
        ];
        
        // 베이스 라인
        const bassNotes = [
            131, 165, 196, 262, 196, 165,  // C3, E3, G3, C4, G3, E3
            131, 165, 196, 262, 196, 165,  // 반복
            196, 262, 330, 392, 330, 262,  // G3, C4, E4, G4, E4, C4
            131, 165, 196, 262, 196, 165   // 다시 기본 멜로디
        ];
        
        // 메인 멜로디 재생
        const mainOsc = this.audioContext.createOscillator();
        const mainGain = this.audioContext.createGain();
        mainOsc.connect(mainGain);
        mainGain.connect(this.audioContext.destination);
        
        mainNotes.forEach((freq, index) => {
            mainOsc.frequency.setValueAtTime(freq, currentTime + index * 0.3);
        });
        
        mainGain.gain.setValueAtTime(0.015, currentTime);
        mainOsc.start(currentTime);
        mainOsc.stop(currentTime + mainNotes.length * 0.3);
        
        // 베이스 라인 재생
        const bassOsc = this.audioContext.createOscillator();
        const bassGain = this.audioContext.createGain();
        bassOsc.connect(bassGain);
        bassGain.connect(this.audioContext.destination);
        
        bassNotes.forEach((freq, index) => {
            bassOsc.frequency.setValueAtTime(freq, currentTime + index * 0.3);
        });
        
        bassGain.gain.setValueAtTime(0.01, currentTime);
        bassOsc.start(currentTime);
        bassOsc.stop(currentTime + bassNotes.length * 0.3);
        
        // 반복 재생 (중지되지 않았을 때만)
        if (!this.bgMusicStopped) {
            setTimeout(() => {
                this.createBgMusic();
            }, mainNotes.length * 300);
        }
    }

    // 사운드 재생 함수들
    playJump() {
        this.createJumpSound();
    }

    playCollision() {
        this.createCollisionSound();
    }

    playPowerUp() {
        this.createPowerUpSound();
    }

    playGameOver() {
        this.createGameOverSound();
    }
    
    // 캐릭터별 필살기 사운드
    playFireBlast() {
        this.createFireBlastSound();
    }
    
    playThunder() {
        this.createThunderSound();
    }
    
    playHydroPump() {
        this.createHydroPumpSound();
    }

    startBgMusic() {
        // 배경음악 비활성화
        return;
    }

    stopBgMusic() {
        this.bgMusicStopped = true;
    }
}

// 전역 사운드 매니저 인스턴스 생성
window.soundManager = new SoundManager();

// 전역 사운드 재생 함수
function playSound(soundName) {
    if (window.soundManager) {
        switch (soundName) {
            case 'jumpSound':
                window.soundManager.playJump();
                break;
            case 'collisionSound':
                window.soundManager.playCollision();
                break;
            case 'powerUpSound':
                window.soundManager.playPowerUp();
                break;
            case 'gameOverSound':
                window.soundManager.playGameOver();
                break;
            case 'fireBlast':
                window.soundManager.playFireBlast();
                break;
            case 'thunder':
                window.soundManager.playThunder();
                break;
            case 'hydroPump':
                window.soundManager.playHydroPump();
                break;
        }
    }
} 