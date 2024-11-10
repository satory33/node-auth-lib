const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const User = require('../models/User');

class Auth {
    constructor(config = {}) {
        this.jwtSecret = config.jwtSecret || 'your-secret-key';
        this.jwtExpiration = config.jwtExpiration || '24h';
        this.saltRounds = config.saltRounds || 10;
        
        // SMTP configuration
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        // Async SMTP verification that doesn't block
        this.verifySMTP();
    }

    async verifySMTP() {
        try {
            const success = await this.transporter.verify();
            if (success) {
                console.log('SMTP connection verified successfully');
            }
        } catch (error) {
            console.error('SMTP verification failed:', error.message);
        }
    }

    async register(email, password) {
        try {
            // Проверка существования пользователя
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                throw new Error('User already exists');
            }

            // Хеширование пароля
            const hashedPassword = await bcrypt.hash(password, this.saltRounds);

            // Создание пользователя
            const userId = await User.create({
                email,
                password: hashedPassword
            });

            return { success: true, userId };
        } catch (error) {
            throw error;
        }
    }

    async login(email, password) {
        try {
            // Поиск пользователя
            const user = await User.findByEmail(email);
            if (!user) {
                throw new Error('User not found');
            }

            // Проверка пароля
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                throw new Error('Invalid password');
            }

            // Создание JWT токена
            const token = jwt.sign(
                { userId: user.id, email: user.email },
                this.jwtSecret,
                { expiresIn: this.jwtExpiration }
            );

            return { token, user: { id: user.id, email: user.email } };
        } catch (error) {
            throw error;
        }
    }

    async forgotPassword(email) {
        try {
            const user = await User.findByEmail(email);
            if (!user) {
                throw new Error('User not found');
            }

            const resetToken = crypto.randomBytes(32).toString('hex');
            const expires = new Date(Date.now() + 3600000); // 1 hour

            await User.updateResetToken(email, resetToken, expires);

            const resetUrl = `http://your-domain.com/reset-password?token=${resetToken}`;
            const mailOptions = {
                from: `"Auth System" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'Password Reset Request',
                html: `
                    <h1>Password Reset Request</h1>
                    <p>You received this email because you requested a password reset.</p>
                    <p>Click the link below to reset your password:</p>
                    <a href="${resetUrl}" style="
                        padding: 10px 20px;
                        background-color: #4CAF50;
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                        display: inline-block;
                        margin: 10px 0;
                    ">Reset Password</a>
                    <p>Or use this reset token:</p>
                    <p style="
                        background-color: #f5f5f5;
                        padding: 10px;
                        border-radius: 5px;
                        font-family: monospace;
                        margin: 10px 0;
                    ">${resetToken}</p>
                    <p>If you didn't request a password reset, please ignore this email.</p>
                    <p>This link and token will expire in 1 hour.</p>
                `
            };

            const isDebugMode = process.env.SMTP_DEBUG === 'true';

            if (isDebugMode) {
                console.log('\nAttempting to send email...');
                console.log('SMTP Configuration:', {
                    host: process.env.EMAIL_HOST,
                    port: process.env.EMAIL_PORT,
                    secure: process.env.EMAIL_SECURE === 'true',
                    user: process.env.EMAIL_USER
                });
            }

            try {
                const info = await this.transporter.sendMail(mailOptions);
                
                if (isDebugMode) {
                    console.log('\nEmail sent successfully!');
                    console.log('Message ID:', info.messageId);
                    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
                    console.log('Accepted:', info.accepted);
                    console.log('Rejected:', info.rejected);
                    console.log('Pending:', info.pending);
                    console.log('Response:', info.response);
                }
                
                return { 
                    success: true, 
                    message: 'Reset password email sent',
                    emailInfo: {
                        messageId: info.messageId,
                        accepted: info.accepted,
                        response: info.response
                    }
                };
            } catch (emailError) {
                if (isDebugMode) {
                    console.error('\nSMTP Error Details:');
                    console.error('Code:', emailError.code);
                    console.error('Command:', emailError.command);
                    console.error('Response:', emailError.response);
                    console.error('ResponseCode:', emailError.responseCode);
                    console.error('Original Error:', emailError.original);
                }
                throw new Error(`Failed to send email: ${emailError.message}`);
            }
        } catch (error) {
            throw error;
        }
    }

    async resetPassword(token, newPassword) {
        try {
            // Поиск пользователя по токену
            const user = await User.findByResetToken(token);
            if (!user) {
                throw new Error('Invalid or expired reset token');
            }

            // Хеширование нового пароля
            const hashedPassword = await bcrypt.hash(newPassword, this.saltRounds);

            // Обновление пароля
            await User.updatePassword(user.id, hashedPassword);

            return { success: true, message: 'Password successfully reset' };
        } catch (error) {
            throw error;
        }
    }

    // Вспомогательный метод для проверки JWT токена
    verifyToken(token) {
        try {
            return jwt.verify(token, this.jwtSecret);
        } catch (error) {
            throw new Error('Invalid token');
        }
    }
}

module.exports = Auth; 