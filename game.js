// 게임 캔버스 설정
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 캐릭터 정보
const characters = {
    charizard: {
        id: 6,
        name: '리자몽',
        color: '#FF8C00',
        effectColor: '#FF4500',
        description: '강력한 불꽃 포켓몬'
    },
    pikachu: {
        id: 25,
        name: '피카츄',
        color: '#FFD700',
        effectColor: '#FFD700',
        description: '귀여운 전기 포켓몬'
    },
    squirtle: {
        id: 7,
        name: '꼬부기',
        color: '#4682B4',
        effectColor: '#00CED1',
        description: '튼튼한 물 포켓몬'
    }
};

// URL에서 선택된 캐릭터 가져오기
const urlParams = new URLSearchParams(window.location.search);
const selectedCharacter = urlParams.get('character') || 'charizard';
const currentCharacter = characters[selectedCharacter];

// 캐릭터 이미지 로드
const characterImage = new Image();
characterImage.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${currentCharacter.id}.png`;
let imageLoaded = false;

characterImage.onload = function() {
    imageLoaded = true;
    console.log(`${currentCharacter.name} 이미지 로드 완료!`);
};

characterImage.onerror = function() {
    console.log(`${currentCharacter.name} 이미지 로드 실패, 기본 그리기 사용`);
    imageLoaded = false;
};

// 사운드 재생 함수들
function playSound(soundName) {
    if (window.soundManager && window.soundManager.audioContext) {
        // 오디오 컨텍스트가 일시정지 상태면 재개
        if (window.soundManager.audioContext.state === 'suspended') {
            window.soundManager.audioContext.resume();
        }
        
        switch(soundName) {
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
        }
    }
}

// 배경음악 시작
function startBgMusic() {
    if (window.soundManager) {
        window.soundManager.startBgMusic();
    }
}

// 게임 상태
let gameState = {
    score: 0,
    lives: 2,
    gameOver: false,
    gameSpeed: 2.5,
    obstacles: [],
    powerUps: [],
    particles: [],
    specialEffectParticles: [], // 필살기 효과 파티클
    lastObstacleTime: 0,
    obstacleInterval: 2000, // 2초마다 장애물 생성
    jumpCount: 0, // 점프 횟수
    maxJumps: 2, // 최대 점프 횟수
    lastJumpTime: 0, // 마지막 점프 시간
    jumpCooldown: 600, // 점프 쿨다운 (600ms로 조정)
    specialAttackCount: 3, // 필살기 횟수
    maxSpecialAttacks: 3 // 최대 필살기 횟수
};

// 플레이어 설정
const player = {
    x: 150,
    y: canvas.height - 80,
    width: 40,
    height: 40,
    velocityY: 0,
    isJumping: false,
    jumpPower: -16,
    gravity: 0.7,
    groundY: canvas.height - 80
};

// 키보드 입력 상태
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    Space: false,
    Enter: false
};

// 키보드 이벤트 리스너
document.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.code)) {
        keys[e.code] = true;
        e.preventDefault();
    }
});

document.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.code)) {
        keys[e.code] = false;
    }
});

// 터치 이벤트 (모바일 지원)
let touchStartTime = 0;
let lastTouchTime = 0;
let touchCooldown = 0;

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault(); // 기본 터치 동작 방지
    const currentTime = Date.now();
    
    // 터치 쿨다운 체크 (200ms)
    if (currentTime - touchCooldown < 200) {
        return; // 쿨다운 중이면 무시
    }
    
    lastTouchTime = currentTime;
    touchStartTime = currentTime;
    
    // 점프 활성화 (이전 상태 초기화 후)
    keys.ArrowUp = false;
    keys.Space = false;
    setTimeout(() => {
        keys.ArrowUp = true;
        keys.Space = true;
    }, 10);
    
    // 터치 쿨다운 설정
    touchCooldown = currentTime;
});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    const currentTime = Date.now();
    
    // 짧은 터치만 점프로 인식 (300ms 이하)
    if (currentTime - touchStartTime <= 300) {
        // 점프는 touchend에서 비활성화하지 않음 (점프 함수에서 처리)
    }
    
    // 터치 종료 시 점프 키 비활성화
    keys.ArrowUp = false;
    keys.Space = false;
    
    // 필살기는 즉시 비활성화
    keys.Enter = false;
});

// 터치 이벤트 중지 (스크롤 방지)
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
});

// 모바일에서 더블 탭 줌 방지
document.addEventListener('touchstart', (e) => {
    if (e.touches.length > 1) {
        e.preventDefault();
    }
}, { passive: false });

document.addEventListener('touchend', (e) => {
    if (e.touches.length > 1) {
        e.preventDefault();
    }
}, { passive: false });

// 플레이어 점프 함수
function jump() {
    const currentTime = Date.now();
    
    // 첫 번째 점프 (바닥에서)
    if (gameState.jumpCount === 0) {
        player.velocityY = player.jumpPower;
        player.isJumping = true;
        gameState.jumpCount++;
        gameState.lastJumpTime = currentTime;
        playSound('jumpSound');
        
        // 터치 후 키 상태 초기화 (모바일용)
        setTimeout(() => {
            keys.ArrowUp = false;
            keys.Space = false;
        }, 80); // 100ms → 80ms로 조정
    }
    // 두 번째 점프 (공중에서, 쿨다운 확인)
    else if (gameState.jumpCount === 1 && 
             currentTime - gameState.lastJumpTime >= gameState.jumpCooldown) {
        player.velocityY = player.jumpPower;
        gameState.jumpCount++;
        gameState.lastJumpTime = currentTime;
        playSound('jumpSound');
        
        // 터치 후 키 상태 초기화 (모바일용)
        setTimeout(() => {
            keys.ArrowUp = false;
            keys.Space = false;
        }, 80); // 100ms → 80ms로 조정
    }
}

// 플레이어 업데이트
function updatePlayer() {
    // 점프 처리
    if (keys.ArrowUp || keys.Space) {
        jump();
    }
    
    // 중력 적용
    player.velocityY += player.gravity;
    player.y += player.velocityY;
    
    // 바닥 충돌 체크
    if (player.y >= player.groundY) {
        player.y = player.groundY;
        player.velocityY = 0;
        player.isJumping = false;
        gameState.jumpCount = 0; // 점프 카운트 리셋
    }
}

// 악당 캐릭터 클래스
class Villain {
    constructor() {
        this.width = 35 + Math.random() * 15;
        this.height = 45 + Math.random() * 25;
        this.x = canvas.width;
        this.y = canvas.height - this.height;
        this.speed = gameState.gameSpeed + Math.random() * 1;
        this.type = Math.random() < 0.4 ? 'high' : 'low';
        this.villainType = this.getRandomVillain();
        this.image = null;
        this.imageLoaded = false;
        this.loadImage();
        
        if (this.type === 'high') {
            this.y = canvas.height - this.height;
        } else {
            this.y = canvas.height - this.height;
        }
    }
    
    getRandomVillain() {
        const villains = [
            { id: 52, name: 'Meowth' },      // 나옹
            { id: 92, name: 'Gastly' },      // 고오스
            { id: 109, name: 'Koffing' },    // 독침붕
            { id: 124, name: 'Jynx' },       // 루주라
            { id: 143, name: 'Snorlax' },    // 잠만보
            { id: 149, name: 'Dragonite' },  // 망나뇽
            { id: 150, name: 'Mewtwo' }      // 뮤츠
        ];
        return villains[Math.floor(Math.random() * villains.length)];
    }
    
    loadImage() {
        this.image = new Image();
        this.image.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${this.villainType.id}.png`;
        
        this.image.onload = () => {
            this.imageLoaded = true;
        };
        
        this.image.onerror = () => {
            this.imageLoaded = false;
        };
    }
    
    update() {
        this.x -= this.speed;
    }
    
    draw() {
        if (this.imageLoaded) {
            // 실제 악당 이미지 그리기
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        } else {
            // 기본 악당 그리기
            ctx.fillStyle = '#8B0000'; // 어두운 빨간색
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // 악당 테두리
            ctx.strokeStyle = '#DC143C';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
            
            // 악당 눈 (빨간색)
            ctx.fillStyle = '#FF0000';
            ctx.beginPath();
            ctx.arc(this.x + 8, this.y + 8, 3, 0, Math.PI * 2);
            ctx.arc(this.x + this.width - 8, this.y + 8, 3, 0, Math.PI * 2);
            ctx.fill();
            
            // 악당 입 (검은색)
            ctx.fillStyle = '#000000';
            ctx.fillRect(this.x + this.width/2 - 3, this.y + this.height - 10, 6, 3);
        }
    }
}

// 파워업 클래스
class PowerUp {
    constructor() {
        this.width = 20;
        this.height = 20;
        this.x = canvas.width;
        this.y = canvas.height - 100 - Math.random() * 100;
        this.speed = gameState.gameSpeed;
                    this.type = Math.random() < 0.5 ? 'life' : 'score'; // 생명 아이템 비율 증가
    }
    
    update() {
        this.x -= this.speed;
    }
    
    draw() {
        if (this.type === 'life') {
            // 하트 모양 그리기
            ctx.fillStyle = '#ff6b6b';
            ctx.beginPath();
            
            // 하트의 왼쪽 부분
            ctx.arc(this.x + this.width/4, this.y + this.height/3, this.width/4, 0, Math.PI, true);
            
            // 하트의 오른쪽 부분
            ctx.arc(this.x + this.width*3/4, this.y + this.height/3, this.width/4, 0, Math.PI, true);
            
            // 하트의 아래쪽 뾰족한 부분
            ctx.moveTo(this.x + this.width/2, this.y + this.height);
            ctx.lineTo(this.x, this.y + this.height/3);
            ctx.lineTo(this.x + this.width, this.y + this.height/3);
            ctx.closePath();
            ctx.fill();
            
            // 하트 테두리
            ctx.strokeStyle = '#ff4757';
            ctx.lineWidth = 2;
            ctx.stroke();
            
        } else {
            // 점수 아이템 (기존 사각형)
            ctx.fillStyle = '#ffa502';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // 파워업 테두리
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
    }
}

// 파티클 클래스
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 10;
        this.vy = (Math.random() - 0.5) * 10;
        this.life = 30;
        this.maxLife = 30;
        this.color = color;
        this.size = Math.random() * 3 + 1;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
        this.vy += 0.2; // 중력
    }
    
    draw() {
        const alpha = this.life / this.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.globalAlpha = 1;
    }
}

// 필살기 효과 파티클 클래스
class SpecialEffectParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 20;
        this.vy = (Math.random() - 0.5) * 20;
        this.life = 60;
        this.maxLife = 60;
        this.size = Math.random() * 8 + 4;
        this.rotation = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.2;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
        this.rotation += this.rotationSpeed;
        this.vx *= 0.98; // 저항
        this.vy *= 0.98;
    }
    
    draw() {
        const alpha = this.life / this.maxLife;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // 불꽃 모양 그리기
        ctx.fillStyle = '#FF4500';
        ctx.beginPath();
        ctx.moveTo(0, -this.size);
        ctx.lineTo(-this.size/2, 0);
        ctx.lineTo(0, this.size);
        ctx.lineTo(this.size/2, 0);
        ctx.closePath();
        ctx.fill();
        
        // 내부 하이라이트
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.moveTo(0, -this.size/2);
        ctx.lineTo(-this.size/4, 0);
        ctx.lineTo(0, this.size/2);
        ctx.lineTo(this.size/4, 0);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }
}

// 충돌 감지 함수
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// 악당 생성
function spawnVillain() {
    const currentTime = Date.now();
    if (currentTime - gameState.lastObstacleTime > gameState.obstacleInterval) {
        gameState.obstacles.push(new Villain());
        gameState.lastObstacleTime = currentTime;
        // 점수에 따라 간격 조정 (최소 1초, 최대 3초)
        gameState.obstacleInterval = Math.max(1000, 2000 - (gameState.score / 100) * 100);
    }
}

// 파워업 생성
function spawnPowerUp() {
    if (Math.random() < 0.005) { // 점수 아이템 확률 증가
        gameState.powerUps.push(new PowerUp());
    }
}

// 선택된 캐릭터 그리기 함수
function drawCharacter(x, y, width, height) {
    if (imageLoaded) {
        // 실제 캐릭터 이미지 그리기 (투명 배경)
        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(characterImage, x, y, width, height);
        ctx.restore();
        
        // 캐릭터 효과 (점프할 때)
        if (player.isJumping) {
            ctx.fillStyle = currentCharacter.effectColor;
            ctx.beginPath();
            ctx.arc(x - 3, y + height/2, 2, 0, Math.PI * 2);
            ctx.arc(x + width + 3, y + height/2, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    } else {
        // 이미지 로드 실패 시 기본 그리기 (캐릭터별 스타일)
        // 캐릭터 몸체
        ctx.fillStyle = currentCharacter.color;
        ctx.beginPath();
        ctx.arc(x + width/2, y + height/2, width/2, 0, Math.PI * 2);
        ctx.fill();
        
        // 캐릭터 테두리
        ctx.strokeStyle = currentCharacter.effectColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x + width/2, y + height/2, width/2, 0, Math.PI * 2);
        ctx.stroke();
        
        // 캐릭터별 특별한 특징
        if (selectedCharacter === 'charizard') {
            // 리자몽 날개
            ctx.fillStyle = '#FF6347';
            ctx.beginPath();
            ctx.moveTo(x + width/2 - 8, y - 5);
            ctx.lineTo(x + width/2 + 8, y - 5);
            ctx.lineTo(x + width/2, y - 20);
            ctx.closePath();
            ctx.fill();
        } else if (selectedCharacter === 'pikachu') {
            // 피카츄 귀
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.moveTo(x + width/2 - 6, y - 5);
            ctx.lineTo(x + width/2 + 6, y - 5);
            ctx.lineTo(x + width/2, y - 18);
            ctx.closePath();
            ctx.fill();
        } else if (selectedCharacter === 'squirtle') {
            // 꼬부기 등껍질
            ctx.fillStyle = '#2F4F4F';
            ctx.beginPath();
            ctx.arc(x + width/2, y + height/2, width/3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // 캐릭터 눈
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(x + 12, y + 12, 3, 0, Math.PI * 2);
        ctx.arc(x + 23, y + 12, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // 캐릭터 눈 하이라이트
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(x + 11, y + 11, 1, 0, Math.PI * 2);
        ctx.arc(x + 22, y + 11, 1, 0, Math.PI * 2);
        ctx.fill();
        
        // 캐릭터 효과 (점프할 때)
        if (player.isJumping) {
            ctx.fillStyle = currentCharacter.effectColor;
            ctx.beginPath();
            ctx.arc(x - 3, y + height/2, 2, 0, Math.PI * 2);
            ctx.arc(x + width + 3, y + height/2, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// 필살기 함수
function specialAttack() {
    if (gameState.specialAttackCount > 0) {
        gameState.specialAttackCount--;
        
        // 화면 전체에 필살기 효과 파티클 생성
        for (let i = 0; i < 50; i++) {
            gameState.specialEffectParticles.push(new SpecialEffectParticle(
                Math.random() * canvas.width,
                Math.random() * canvas.height
            ));
        }
        
        // 화면의 모든 악당 파괴
        gameState.obstacles.forEach((obstacle, index) => {
            // 파괴 파티클 생성
            for (let i = 0; i < 15; i++) {
                gameState.particles.push(new Particle(
                    obstacle.x + obstacle.width/2,
                    obstacle.y + obstacle.height/2,
                    '#FF4500'
                ));
            }
        });
        
        // 악당 배열 비우기
        gameState.obstacles = [];
        
        // 필살기 효과음 재생
        playSound('powerUpSound');
        
        // 점수 추가
        gameState.score += 100;
        
        // 화면 깜빡임 효과
        createScreenFlash();
    }
}

// 화면 깜빡임 효과
function createScreenFlash() {
    const flashOverlay = document.createElement('div');
    flashOverlay.style.position = 'absolute';
    flashOverlay.style.top = '0';
    flashOverlay.style.left = '0';
    flashOverlay.style.width = '100%';
    flashOverlay.style.height = '100%';
    flashOverlay.style.backgroundColor = 'rgba(255, 69, 0, 0.3)';
    flashOverlay.style.pointerEvents = 'none';
    flashOverlay.style.zIndex = '1000';
    flashOverlay.style.transition = 'opacity 0.2s ease-out';
    
    document.querySelector('.game-container').appendChild(flashOverlay);
    
    setTimeout(() => {
        flashOverlay.style.opacity = '0';
        setTimeout(() => {
            flashOverlay.remove();
        }, 200);
    }, 100);
}

// 파티클 생성
function createParticles(x, y, color, count = 10) {
    for (let i = 0; i < count; i++) {
        gameState.particles.push(new Particle(x, y, color));
    }
}

// 게임 업데이트
function updateGame() {
    if (gameState.gameOver) return;
    
    // 플레이어 업데이트
    updatePlayer();
    
    // 필살기 처리
    if (keys.Enter) {
        specialAttack();
        keys.Enter = false; // 한 번만 실행되도록
    }
    
    // 악당 생성 및 업데이트
    spawnVillain();
    gameState.obstacles.forEach((obstacle, index) => {
        obstacle.update();
        
        // 화면 밖으로 나간 장애물 제거
        if (obstacle.x + obstacle.width < 0) {
            gameState.obstacles.splice(index, 1);
            gameState.score += 10;
        }
        
        // 플레이어와 악당 충돌 체크
        if (checkCollision(player, obstacle)) {
            gameState.lives--;
            createParticles(player.x + player.width/2, player.y + player.height/2, currentCharacter.effectColor); // 캐릭터별 색상
            gameState.obstacles.splice(index, 1);
            playSound('collisionSound');
            
            if (gameState.lives <= 0) {
                gameOver();
            }
        }
    });
    
    // 파워업 생성 및 업데이트
    spawnPowerUp();
    gameState.powerUps.forEach((powerUp, index) => {
        powerUp.update();
        
        // 화면 밖으로 나간 파워업 제거
        if (powerUp.x + powerUp.width < 0) {
            gameState.powerUps.splice(index, 1);
        }
        
        // 플레이어와 파워업 충돌 체크
        if (checkCollision(player, powerUp)) {
            if (powerUp.type === 'life') {
                gameState.lives = Math.min(gameState.lives + 1, 5);
                createParticles(player.x + player.width/2, player.y + player.height/2, '#2ed573');
            } else {
                gameState.score += 50;
                createParticles(player.x + player.width/2, player.y + player.height/2, currentCharacter.effectColor); // 캐릭터별 색상
            }
            gameState.powerUps.splice(index, 1);
            playSound('powerUpSound');
        }
    });
    
    // 파티클 업데이트
    gameState.particles.forEach((particle, index) => {
        particle.update();
        if (particle.life <= 0) {
            gameState.particles.splice(index, 1);
        }
    });
    
    // 필살기 효과 파티클 업데이트
    gameState.specialEffectParticles.forEach((particle, index) => {
        particle.update();
        if (particle.life <= 0) {
            gameState.specialEffectParticles.splice(index, 1);
        }
    });
    
    // 게임 속도 증가 (더 점진적으로)
    if (gameState.score % 1000 === 0 && gameState.score > 0) {
        gameState.gameSpeed += 0.3;
    }
    
    // UI 업데이트
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('lives').textContent = gameState.lives;
    document.getElementById('jumps').textContent = gameState.maxJumps - gameState.jumpCount;
    document.getElementById('specialAttacks').textContent = gameState.specialAttackCount;
    
    // 필살기 버튼 상태 업데이트
    const specialAttackBtn = document.querySelector('.special-attack-btn');
    if (specialAttackBtn) {
        specialAttackBtn.disabled = gameState.specialAttackCount <= 0;
    }
}

// 게임 렌더링
function renderGame() {
    // 배경 그라데이션
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#98FB98');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 구름 그리기
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    for (let i = 0; i < 5; i++) {
        const x = (Date.now() * 0.01 + i * 200) % (canvas.width + 100) - 50;
        const y = 50 + i * 30;
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.arc(x + 25, y, 25, 0, Math.PI * 2);
        ctx.arc(x + 50, y, 20, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // 선택된 캐릭터 그리기
    drawCharacter(player.x, player.y, player.width, player.height);
    
    // 악당 그리기
    gameState.obstacles.forEach(obstacle => obstacle.draw());
    
    // 파워업 그리기
    gameState.powerUps.forEach(powerUp => powerUp.draw());
    
    // 파티클 그리기
    gameState.particles.forEach(particle => particle.draw());
    
    // 필살기 효과 파티클 그리기
    gameState.specialEffectParticles.forEach(particle => particle.draw());
    
    // 바닥 그리기
    ctx.fillStyle = '#2f3542';
    ctx.fillRect(0, canvas.height - 20, canvas.width, 20);
}

// 게임 오버 함수
function gameOver() {
    gameState.gameOver = true;
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('gameOver').style.display = 'block';
    playSound('gameOverSound');
}

// 게임 재시작 함수
function restartGame() {
    gameState = {
        score: 0,
        lives: 2,
        gameOver: false,
        gameSpeed: 2.5,
        obstacles: [],
        powerUps: [],
        particles: [],
        specialEffectParticles: [],
        lastObstacleTime: 0,
        obstacleInterval: 2000,
        jumpCount: 0,
        maxJumps: 2,
        lastJumpTime: 0,
                    jumpCooldown: 600,
        specialAttackCount: 3,
        maxSpecialAttacks: 3
    };
    
    player.y = player.groundY;
    player.velocityY = 0;
    player.isJumping = false;
    
    document.getElementById('gameOver').style.display = 'none';
}

// 필살기 버튼 클릭 함수
function triggerSpecialAttack() {
    if (gameState.specialAttackCount > 0) {
        specialAttack();
    }
}

// 캐릭터 선택 페이지로 이동
function selectCharacter() {
    window.location.href = 'index.html';
}

// 게임 루프
function gameLoop() {
    updateGame();
    renderGame();
    requestAnimationFrame(gameLoop);
}

// 모바일 감지 및 가이드 표시
function detectMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
           window.innerWidth <= 768;
}

// 모바일에서만 가이드 표시
if (detectMobile()) {
    const mobileGuide = document.getElementById('mobileGuide');
    if (mobileGuide) {
        mobileGuide.style.display = 'block';
        // 5초 후 가이드 숨기기
        setTimeout(() => {
            mobileGuide.style.display = 'none';
        }, 5000);
    }
}

// 게임 시작
setTimeout(() => {
    gameLoop();
}, 100); // 100ms 지연으로 사운드 시스템 완전 초기화 