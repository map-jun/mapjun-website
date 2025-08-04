// DOM 요소
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const loginModal = document.getElementById('loginModal');
const signupModal = document.getElementById('signupModal');
const closeBtns = document.querySelectorAll('.close');

// 모달 열기/닫기 기능
loginBtn.addEventListener('click', () => {
    loginModal.style.display = 'block';
});

signupBtn.addEventListener('click', () => {
    signupModal.style.display = 'block';
});

closeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.target.closest('.modal').style.display = 'none';
    });
});

window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});

// 로그인 폼 처리
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    // 실제 구현 시 서버와 통신
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: formData.get('email'),
                password: formData.get('password')
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token);
            loginModal.style.display = 'none';
            updateAuthUI(true);
        } else {
            alert('로그인에 실패했습니다.');
        }
    } catch (error) {
        console.error('로그인 오류:', error);
        alert('로그인 중 오류가 발생했습니다.');
    }
});

// 회원가입 폼 처리
document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    
    if (password !== confirmPassword) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
    }
    
    try {
        const response = await fetch('/api/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: formData.get('name'),
                email: formData.get('email'),
                password: password
            })
        });
        
        if (response.ok) {
            alert('회원가입이 완료되었습니다!');
            signupModal.style.display = 'none';
            loginModal.style.display = 'block';
        } else {
            alert('회원가입에 실패했습니다.');
        }
    } catch (error) {
        console.error('회원가입 오류:', error);
        alert('회원가입 중 오류가 발생했습니다.');
    }
});

// 네이버 로그인 연동
function naverLogin() {
    // 네이버 로그인 API 연동
    const naverLogin = new naver.LoginWithNaverId({
        clientId: "YOUR_CLIENT_ID",
        callbackUrl: "http://www.mapjun.com/callback",
        isPopup: false,
        loginButton: {color: "green", type: 3, height: 50}
    });
    
    naverLogin.getLoginStatus(function (status) {
        if (status) {
            const user = naverLogin.user;
            // 사용자 정보 처리
            handleNaverLogin(user);
        } else {
            naverLogin.login();
        }
    });
}

function naverSignup() {
    naverLogin(); // 동일한 프로세스
}

// 네이버페이 결제
function purchase() {
    const isLoggedIn = localStorage.getItem('token');
    
    if (!isLoggedIn) {
        alert('먼저 로그인해주세요.');
        loginModal.style.display = 'block';
        return;
    }
    
    // 네이버페이 결제 초기화
    const oPay = Naver.Pay.create({
        mode: 'production', // 실제 서비스에서는 'production'
        clientId: 'YOUR_NAVER_PAY_CLIENT_ID'
    });
    
    // 결제 정보 설정
    const paymentInfo = {
        merchantPayKey: 'ORDER_' + Date.now(),
        productName: '대학원 입시 완벽 가이드',
        totalPayAmount: 29900,
        taxScopeAmount: 29900,
        taxExScopeAmount: 0,
        returnUrl: 'http://www.mapjun.com/payment/complete'
    };
    
    // 결제 요청
    oPay.open(paymentInfo);
}

// UI 업데이트 함수
function updateAuthUI(isLoggedIn) {
    const authButtons = document.querySelector('.auth-buttons');
    
    if (isLoggedIn) {
        authButtons.innerHTML = `
            <span>환영합니다!</span>
            <button class="btn-secondary" onclick="logout()">로그아웃</button>
        `;
    } else {
        authButtons.innerHTML = `
            <button id="loginBtn" class="btn-secondary">로그인</button>
            <button id="signupBtn" class="btn-primary">회원가입</button>
        `;
    }
}

// 로그아웃
function logout() {
    localStorage.removeItem('token');
    updateAuthUI(false);
    location.reload();
}

// 페이지 로드 시 로그인 상태 확인
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token) {
        updateAuthUI(true);
    }
});

// 스크롤 애니메이션
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255,255,255,0.95)';
        header.style.backdropFilter = 'blur(10px)';
    } else {
        header.style.background = '#fff';
        header.style.backdropFilter = 'none';
    }
});
