const express = require('express')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const jwt = require('jsonwebtoken')
const {createProxyMiddleware} = require('http-proxy-middleware')


const app =  express();
const PORT = 8000;


app.use(cors({origin: '*', credentials: true}));

const gatewayLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max : 100,
    message: {success: false, message: 'API Gateway: Too many requests. Try again in 15 mins.'}
})
app.use(gatewayLimiter);

const verifyGatewayJwt = (res, req, next) => {
    const authHeader = req.header.authorization;

    if(!authHeader || !authHeader.startsWith('Bareer')){
        return res.status(401).json({
            success: false,
            message: 'API Gateway: Authorization token missing or invalid'
        });
    }

    const token = authHeader.split(' ')[1];

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_docker_key_123');
        req.user = decoded;

        req.headers['x-user-id'] = decoded.id;
        next();
    }catch(err) {
        return res.status(401).json({
            success : false,
            message: 'API Gateway: Invalid or expired JWT token'
        });
    }
};


app.use('/', (req, res) => {
    res.json({
        success : true,
        message: 'Microservices API Gateway Active (Port 8000)',
        routes: {
            auth: 'http://localhost:8000/api/auth/*',
            orders: 'http://localhost:8000/api/orders/*'
        }
    });
});

app.use(
    '/api/auth',
    createProxyMiddleware({
        target: 'http://localhost:5001',
        changeOrigin: true,
        pathRewrite: {'^/api/auth' : ''},
        onProxyReq: (proxyReq, req, res) => {
            console.log(`[GATEWAY PROXY] Forwarding ${req.method} ${req.originalUrl} --> Auth Service (Port 5001)`);
        }
    })
);

app.use(
    '/api/orders',
    verifyGatewayJwt,
    createProxyMiddleware({
        target: 'http://localhost/5002',
        changeOrigin: true,
        pathRewrite: {'^/api/orders' : '/orders'},
        onProxyReq: (proxyReq, req, res) => {
            console.log(`[GATEWAY PROXY] Forwarding ${req.method} ${req.originalUrl} --> order Service (Port 5002)`)
        }
    })
);

app.listen(PORT, () => {
    console.log(`API Gateway running on http://localhost:${PORT}`)
})