require('dotenv').config();
const Auth = require('./lib/Auth');
const readline = require('readline');

const auth = new Auth();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise((resolve) => {
        rl.question(query, resolve);
    });
}

async function showMenu() {
    console.log('\n=== Auth Testing Menu ===');
    console.log('1. Register');
    console.log('2. Login');
    console.log('3. Forgot Password');
    console.log('4. Reset Password');
    console.log('5. Exit');
    
    const choice = await question('\nSelect action (1-5): ');
    
    switch (choice) {
        case '1':
            await handleRegister();
            break;
        case '2':
            await handleLogin();
            break;
        case '3':
            await handleForgotPassword();
            break;
        case '4':
            await handleResetPassword();
            break;
        case '5':
            console.log('Exiting...');
            rl.close();
            process.exit(0);
        default:
            console.log('Invalid choice. Please try again.');
    }
    
    await showMenu();
}

async function handleRegister() {
    try {
        const email = await question('Enter email: ');
        const password = await question('Enter password: ');
        
        const result = await auth.register(email, password);
        console.log('\nRegistration successful!');
        console.log(result);
    } catch (error) {
        console.error('\nRegistration error:', error.message);
    }
}

async function handleLogin() {
    try {
        const email = await question('Enter email: ');
        const password = await question('Enter password: ');
        
        const result = await auth.login(email, password);
        console.log('\nLogin successful!');
        console.log('Token:', result.token);
        console.log('User:', result.user);
    } catch (error) {
        console.error('\nLogin error:', error.message);
    }
}

async function handleForgotPassword() {
    try {
        const email = await question('Enter email for password reset: ');
        
        console.log('\nProcessing password reset request...');
        const result = await auth.forgotPassword(email);
        
        console.log('\n=== Email Sending Results ===');
        if (result.success) {
            console.log('Status: Success ✓');
            console.log('Message ID:', result.emailInfo.messageId);
            console.log('Accepted Recipients:', result.emailInfo.accepted.join(', '));
            console.log('Server Response:', result.emailInfo.response);
        } else {
            console.log('Status: Failed ✗');
        }
        console.log('===========================\n');
    } catch (error) {
        console.error('\n=== Email Sending Error ===');
        console.error('Status: Failed ✗');
        console.error('Error Details:', error.message);
        console.error('=========================\n');
    }
}

async function handleResetPassword() {
    try {
        const token = await question('Enter reset token from email: ');
        const newPassword = await question('Enter new password: ');
        
        const result = await auth.resetPassword(token, newPassword);
        console.log('\nPassword successfully reset!');
        console.log(result);
    } catch (error) {
        console.error('\nPassword reset error:', error.message);
    }
}

console.log('Starting Auth System CLI Test...');
showMenu(); 