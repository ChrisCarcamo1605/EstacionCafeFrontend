import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '.env');
console.log('🔍 Buscando .env en:', envPath);

if (fs.existsSync(envPath)) {
    console.log('✅ Archivo .env encontrado');
    const envContent = fs.readFileSync(envPath, 'utf8');
    console.log('📄 Contenido de .env:');
    console.log(envContent);
    
    const envConfig = dotenv.parse(envContent);
    for (const key in envConfig) {
        process.env[key] = envConfig[key];
    }
} else {
    console.log('❌ Archivo .env NO encontrado');
}

console.log('🔐 Variables cargadas:');
console.log('   EMAIL_USER:', process.env.EMAIL_USER || 'NO CONFIGURADO');
console.log('   EMAIL_PASS:', process.env.EMAIL_PASS ? 'CONFIGURADO' : 'NO CONFIGURADO');
console.log('   EMAIL_PORT:', process.env.EMAIL_PORT || '3002');

const app = express();
const PORT = process.env.EMAIL_PORT || 3003;

app.use(cors({
    origin: ['http://localhost:4321', 'http://localhost:3000', 'http://localhost:3002', 'http://127.0.0.1:4321'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

const createTransporter = () => {
    console.log('🔧 Configurando transporter con:', process.env.EMAIL_USER);
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        service: 'Email Service - Estación Café',
        timestamp: new Date().toISOString(),
        port: PORT,
        email_configured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS),
        email_user: process.env.EMAIL_USER || 'No configurado'
    });
});

app.post('/api/send-report', async (req, res) => {
    try {
        const { toEmail, subject, message, filename, excelData } = req.body;

        console.log('📤 Solicitando envío de correo a:', toEmail);
        console.log('📏 Tamaño de datos Excel:', excelData?.length || 0, 'bytes');

        if (!toEmail || !excelData) {
            return res.status(400).json({
                success: false,
                error: 'Faltan datos requeridos: toEmail y excelData'
            });
        }

        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            return res.status(500).json({
                success: false,
                error: 'Configuración de email no encontrada. Verifica el archivo .env'
            });
        }

        const transporter = createTransporter();

        const fileBuffer = Buffer.from(excelData, 'base64');

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: toEmail,
            subject: subject || '📊 Reporte de Ventas - Estación Café',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #482E21;">📊 Reporte de Ventas - Estación Café</h2>
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        ${(message || '').replace(/\n/g, '<br>')}
                    </div>
                    <p style="color: #666; font-size: 14px;">
                        <strong>Fecha de envío:</strong> ${new Date().toLocaleString('es-ES')}<br>
                        <strong>Sistema:</strong> Reportes Automatizados - Estación Café
                    </p>
                </div>
            `,
            attachments: [
                {
                    filename: filename || 'reporte_ventas.xlsx',
                    content: fileBuffer,
                    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                }
            ]
        };

        console.log('📨 Enviando correo...');
        const result = await transporter.sendMail(mailOptions);
        console.log('✅ Correo enviado exitosamente:', result.messageId);
        
        res.json({
            success: true,
            message: `Reporte enviado exitosamente a ${toEmail}`,
            messageId: result.messageId
        });

    } catch (error) {
        console.error('❌ Error enviando correo:', error);
        res.status(500).json({
            success: false,
            error: `Error al enviar el correo: ${error.message}`
        });
    }
});

app.post('/api/test-email', async (req, res) => {
    try {
        const { toEmail } = req.body;

        if (!toEmail) {
            return res.status(400).json({
                success: false,
                error: 'Falta el email de destino'
            });
        }

        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            return res.status(500).json({
                success: false,
                error: 'Configuración de email no encontrada'
            });
        }

        const transporter = createTransporter();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: toEmail,
            subject: '✅ Prueba de Servicio de Correos - Estación Café',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #482E21;">✅ Servicio de Correos Funcionando</h2>
                    <p>El servicio de envío de reportes de <strong>Estación Café</strong> está funcionando correctamente.</p>
                    <div style="background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 15px 0;">
                        <strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}
                    </div>
                </div>
            `
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('✅ Email de prueba enviado a:', toEmail);

        res.json({
            success: true,
            message: `Email de prueba enviado a ${toEmail}`,
            messageId: result.messageId
        });

    } catch (error) {
        console.error('❌ Error en prueba de email:', error);
        res.status(500).json({
            success: false,
            error: `Error en prueba: ${error.message}`
        });
    }
});

app.use((error, req, res, next) => {
    console.error('❌ Error global:', error);
    res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
    });
});

app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Ruta no encontrada'
    });
});

app.listen(PORT, () => {
    console.log(`\n🚀 Servidor de correo ejecutándose en http://localhost:${PORT}`);
    console.log(`📧 Health check: http://localhost:${PORT}/api/health`);
    
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        console.log('✅ Variables de entorno cargadas correctamente');
        console.log('📧 Servicio listo para enviar correos');
    } else {
        console.log('❌ Variables de entorno NO configuradas');
    }
});