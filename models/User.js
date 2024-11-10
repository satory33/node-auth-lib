const db = require('../lib/db');

class User {
    static async findByEmail(email) {
        const [rows] = await db.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        return rows[0];
    }

    static async create(userData) {
        const [result] = await db.execute(
            'INSERT INTO users (email, password) VALUES (?, ?)',
            [userData.email, userData.password]
        );
        return result.insertId;
    }

    static async updateResetToken(email, token, expires) {
        await db.execute(
            'UPDATE users SET reset_password_token = ?, reset_password_expires = ? WHERE email = ?',
            [token, expires, email]
        );
    }

    static async findByResetToken(token) {
        const [rows] = await db.execute(
            'SELECT * FROM users WHERE reset_password_token = ? AND reset_password_expires > NOW()',
            [token]
        );
        return rows[0];
    }

    static async updatePassword(userId, password) {
        await db.execute(
            'UPDATE users SET password = ?, reset_password_token = NULL, reset_password_expires = NULL WHERE id = ?',
            [password, userId]
        );
    }
}

module.exports = User; 