const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');  // 이 줄 추가
require('dotenv').config();

const app = express();

// 미들웨어
app.use(cors());
app.use(express.json());

// 정적 파일 설정 수정 - public 대신 현재 폴더(__dirname)를 사용
app.use(express.static(__dirname));

// 메인 페이지 라우트 추가
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// MongoDB 연결
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// 사용자 스키마
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    naverID: { type: String },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// 주문 스키마
const orderSchema = new mongoose.Schema({
    userEmail: { type: String, required: true },
    productName: { type: String, required: true },
    amount: { type: Number, required: true },
    paymentStatus: { type: String, default: 'pending' },
    orderDate: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

// 회원가입 API
app.post('/api/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // 이메일 중복 확인
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: '이미 존재하는 이메일입니다.' });
        }
        
        // 비밀번호 해싱
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // 새 사용자 생성
        const user = new User({
            name,
            email,
            password: hashedPassword
        });
        
        await user.save();
        res.status(201).json({ message: '회원가입이 완료되었습니다.' });
        
    } catch (error) {
        res.status(500).json({ error: '회원가입 중 오류가 발생했습니다.' });
    }
});

// 로그인 API
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // 사용자 확인
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: '잘못된 이메일 또는 비밀번호입니다.' });
        }
        
        // 비밀번호 확인
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: '잘못된 이메일 또는 비밀번호입니다.' });
        }
        
        // JWT 토큰 생성
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.json({ token, user: { name: user.name, email: user.email } });
        
    } catch (error) {
        res.status(500).json({ error: '로그인 중 오류가 발생했습니다.' });
    }
});

// 결제 완료 처리 API
app.post('/api/payment/complete', async (req, res) => {
    try {
        const { userEmail, paymentData } = req.body;
        
        // 주문 생성
        const order = new Order({
            userEmail,
            productName: '대학원 입시 완벽 가이드',
            amount: 29900,
            paymentStatus: 'completed'
        });
        
        await order.save();
        
        // 이메일 발송 로직 (실제 구현 필요)
        // sendDownloadEmail(userEmail, order._id);
        
        res.json({ message: '결제가 완료되었습니다.' });
        
    } catch (error) {
        res.status(500).json({ error: '결제 처리 중 오류가 발생했습니다.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});
