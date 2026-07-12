import { loadEnvFile } from 'node:process';
loadEnvFile('.env.local');

console.log('USER:', process.env.SMTP_USER);
console.log('PASS:', process.env.SMTP_PASS);
console.log('PASS LENGTH:', process.env.SMTP_PASS ? process.env.SMTP_PASS.length : 0);
