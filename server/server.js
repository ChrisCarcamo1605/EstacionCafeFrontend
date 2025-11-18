import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import cron from 'node-cron';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '.env');
console.log('Buscando .env en:', envPath);

if (fs.existsSync(envPath)) {
    console.log('Archivo .env encontrado');
    const envContent = fs.readFileSync(envPath, 'utf8');
    console.log('Contenido de .env:');
    console.log(envContent);
    
    const envConfig = dotenv.parse(envContent);
    for (const key in envConfig) {
        process.env[key] = envConfig[key];
    }
} else {
    console.log('Archivo .env NO encontrado');
}

console.log('Variables cargadas:');
console.log('   EMAIL_USER:', process.env.EMAIL_USER || 'NO CONFIGURADO');
console.log('   EMAIL_PASS:', process.env.EMAIL_PASS ? 'CONFIGURADO' : 'NO CONFIGURADO');
console.log('   EMAIL_PORT:', process.env.EMAIL_PORT || '3002');
console.log('   ALERT_EMAIL:', process.env.ALERT_EMAIL || 'NO CONFIGURADO');
console.log('   ALERT_THRESHOLD:', process.env.ALERT_THRESHOLD_PERCENTAGE || '25%');

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
    console.log('Configurando transporter con:', process.env.EMAIL_USER);
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

        console.log('Solicitando envío de correo a:', toEmail);
        console.log('Tamaño de datos Excel:', excelData?.length || 0, 'bytes');

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

        console.log('Enviando correo...');
        const result = await transporter.sendMail(mailOptions);
        console.log('Correo enviado exitosamente:', result.messageId);
        
        res.json({
            success: true,
            message: `Reporte enviado exitosamente a ${toEmail}`,
            messageId: result.messageId
        });

    } catch (error) {
        console.error('Error enviando correo:', error);
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
            subject: 'Prueba de Servicio de Correos - Estación Café',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #482E21;">Servicio de Correos Funcionando</h2>
                    <p>El servicio de envío de reportes de <strong>Estación Café</strong> está funcionando correctamente.</p>
                    <div style="background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 15px 0;">
                        <strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}
                    </div>
                </div>
            `
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('Email de prueba enviado a:', toEmail);

        res.json({
            success: true,
            message: `Email de prueba enviado a ${toEmail}`,
            messageId: result.messageId
        });

    } catch (error) {
        console.error('Error en prueba de email:', error);
        res.status(500).json({
            success: false,
            error: `Error en prueba: ${error.message}`
        });
    }
});

app.use((error, req, res, next) => {
    console.error('Error global:', error);
    res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
    });
});

// ============================================
// SISTEMA DE ALERTAS DE INVENTARIO
// ============================================

// Función para verificar inventario bajo
async function checkLowInventory() {
    try {
        const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:3484/api';
        const threshold = parseFloat(process.env.ALERT_THRESHOLD_PERCENTAGE || '25');
        const alertEmail = process.env.ALERT_EMAIL;

        if (!alertEmail) {
            console.log('No hay correo configurado para alertas');
            return;
        }

        console.log(`\nVerificando inventario (umbral: ${threshold}%)...`);

        // Obtener consumibles
        const consumablesResponse = await fetch(`${backendUrl}/consumable`);
        const consumablesData = await consumablesResponse.json();
        const consumables = consumablesData.data || [];

        // Obtener ingredientes
        const ingredientsResponse = await fetch(`${backendUrl}/ingredient`);
        const ingredientsData = await ingredientsResponse.json();
        const ingredients = ingredientsData.data || [];

        // Filtrar items con stock bajo
        const lowStockConsumables = consumables.filter(item => {
            const quantity = parseFloat(item.quantity || 0);
            return quantity > 0 && quantity <= threshold && item.active !== false;
        });

        const lowStockIngredients = ingredients.filter(item => {
            const quantity = parseFloat(item.quantity || 0);
            return quantity > 0 && quantity <= threshold;
        });

        const totalAlerts = lowStockConsumables.length + lowStockIngredients.length;

        if (totalAlerts === 0) {
            console.log('No hay alertas de inventario');
            return;
        }

        console.log(`${totalAlerts} items con stock bajo detectados`);

        // Enviar correo de alerta
        await sendInventoryAlert(lowStockConsumables, lowStockIngredients, threshold, alertEmail);

    } catch (error) {
        console.error('Error verificando inventario:', error.message);
    }
}

// Función para enviar correo de alerta
async function sendInventoryAlert(consumables, ingredients, threshold, toEmail) {
    try {
        const transporter = createTransporter();

        // Generar HTML de la tabla
        let consumablesHtml = '';
        if (consumables.length > 0) {
            consumablesHtml = `
                <h3 style="color: #d9534f; margin-top: 20px;">Consumibles con Stock Bajo</h3>
                <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
                    <thead>
                        <tr style="background-color: #f8d7da; border: 1px solid #f5c6cb;">
                            <th style="padding: 10px; text-align: left; border: 1px solid #f5c6cb;">Nombre</th>
                            <th style="padding: 10px; text-align: center; border: 1px solid #f5c6cb;">Cantidad</th>
                            <th style="padding: 10px; text-align: left; border: 1px solid #f5c6cb;">Unidad</th>
                            <th style="padding: 10px; text-align: left; border: 1px solid #f5c6cb;">Proveedor</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${consumables.map(item => `
                            <tr style="border: 1px solid #dee2e6;">
                                <td style="padding: 8px; border: 1px solid #dee2e6;"><strong>${item.name}</strong></td>
                                <td style="padding: 8px; text-align: center; border: 1px solid #dee2e6; color: #d9534f;">
                                    <strong>${item.quantity}</strong>
                                </td>
                                <td style="padding: 8px; border: 1px solid #dee2e6;">${item.unitMeasurement || 'N/A'}</td>
                                <td style="padding: 8px; border: 1px solid #dee2e6;">${item.supplier?.name || 'Sin proveedor'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }

        let ingredientsHtml = '';
        if (ingredients.length > 0) {
            ingredientsHtml = `
                <h3 style="color: #f0ad4e; margin-top: 20px;">Ingredientes con Stock Bajo</h3>
                <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
                    <thead>
                        <tr style="background-color: #fcf8e3; border: 1px solid #faebcc;">
                            <th style="padding: 10px; text-align: left; border: 1px solid #faebcc;">Nombre</th>
                            <th style="padding: 10px; text-align: center; border: 1px solid #faebcc;">Cantidad</th>
                            <th style="padding: 10px; text-align: left; border: 1px solid #faebcc;">Consumible</th>
                            <th style="padding: 10px; text-align: left; border: 1px solid #faebcc;">Producto</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${ingredients.map(item => `
                            <tr style="border: 1px solid #dee2e6;">
                                <td style="padding: 8px; border: 1px solid #dee2e6;"><strong>${item.name}</strong></td>
                                <td style="padding: 8px; text-align: center; border: 1px solid #dee2e6; color: #f0ad4e;">
                                    <strong>${item.quantity}</strong>
                                </td>
                                <td style="padding: 8px; border: 1px solid #dee2e6;">${item.consumable?.name || 'N/A'}</td>
                                <td style="padding: 8px; border: 1px solid #dee2e6;">${item.product?.name || 'N/A'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: toEmail,
            subject: `⚠️ ALERTA: Stock Bajo en Inventario - Estación Café`,
            html: `
                <div style="font-family: 'Arial', sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                    <div style="background-color: #fff; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h1 style="color: #482E21; margin: 0;">⚠️ Alerta de Inventario</h1>
                            <p style="color: #666; font-size: 16px; margin-top: 10px;">
                                Sistema de Control de Stock - Estación Café
                            </p>
                        </div>
                        
                        <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px;">
                            <p style="margin: 0; color: #856404;">
                                <strong>📊 Resumen:</strong> Se detectaron <strong>${consumables.length + ingredients.length}</strong> items 
                                con cantidad menor o igual a <strong>${threshold}</strong> unidades.
                            </p>
                        </div>

                        ${consumablesHtml}
                        ${ingredientsHtml}

                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
                            <p style="color: #666; font-size: 14px; margin: 5px 0;">
                                <strong>📅 Fecha de verificación:</strong> ${new Date().toLocaleString('es-ES')}
                            </p>
                            <p style="color: #666; font-size: 14px; margin: 5px 0;">
                                <strong>🎯 Umbral configurado:</strong> ${threshold} unidades
                            </p>
                            <p style="color: #666; font-size: 14px; margin: 5px 0;">
                                <strong>💡 Acción recomendada:</strong> Contactar a los proveedores y realizar pedidos de reabastecimiento
                            </p>
                        </div>

                        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
                            <p style="color: #999; font-size: 12px; margin: 0;">
                                Sistema de Alertas Automatizado - Estación Café<br>
                                Este correo se envía automáticamente cuando se detecta stock bajo
                            </p>
                        </div>
                    </div>
                </div>
            `
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('Correo de alerta enviado exitosamente a:', toEmail);
        console.log('   ID del mensaje:', result.messageId);

    } catch (error) {
        console.error('Error enviando correo de alerta:', error.message);
    }
}

// Endpoint para verificar inventario manualmente
app.post('/api/check-inventory', async (req, res) => {
    try {
        console.log('Verificación manual de inventario solicitada');
        await checkLowInventory();
        res.json({
            success: true,
            message: 'Verificación de inventario completada. Revisa la consola para detalles.'
        });
    } catch (error) {
        console.error('Error en verificación manual:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Endpoint para actualizar configuración de alertas
app.post('/api/alert-config', async (req, res) => {
    try {
        const { alertEmail, thresholdPercentage, checkIntervalHours } = req.body;

        const envPath = path.join(__dirname, '.env');
        let envContent = fs.readFileSync(envPath, 'utf8');

        if (alertEmail) {
            envContent = envContent.replace(
                /ALERT_EMAIL=.*/,
                `ALERT_EMAIL=${alertEmail}`
            );
            process.env.ALERT_EMAIL = alertEmail;
        }

        if (thresholdPercentage !== undefined) {
            envContent = envContent.replace(
                /ALERT_THRESHOLD_PERCENTAGE=.*/,
                `ALERT_THRESHOLD_PERCENTAGE=${thresholdPercentage}`
            );
            process.env.ALERT_THRESHOLD_PERCENTAGE = thresholdPercentage.toString();
        }

        if (checkIntervalHours !== undefined) {
            envContent = envContent.replace(
                /ALERT_CHECK_INTERVAL_HOURS=.*/,
                `ALERT_CHECK_INTERVAL_HOURS=${checkIntervalHours}`
            );
            process.env.ALERT_CHECK_INTERVAL_HOURS = checkIntervalHours.toString();
        }

        fs.writeFileSync(envPath, envContent);

        res.json({
            success: true,
            message: 'Configuración de alertas actualizada exitosamente',
            config: {
                alertEmail: process.env.ALERT_EMAIL,
                thresholdPercentage: process.env.ALERT_THRESHOLD_PERCENTAGE,
                checkIntervalHours: process.env.ALERT_CHECK_INTERVAL_HOURS
            }
        });

    } catch (error) {
        console.error('Error actualizando configuración:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Endpoint para obtener configuración actual
app.get('/api/alert-config', (req, res) => {
    res.json({
        success: true,
        config: {
            alertEmail: process.env.ALERT_EMAIL || '',
            thresholdPercentage: parseFloat(process.env.ALERT_THRESHOLD_PERCENTAGE || '25'),
            checkIntervalHours: parseFloat(process.env.ALERT_CHECK_INTERVAL_HOURS || '24')
        }
    });
});

app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Ruta no encontrada'
    });
});

app.listen(PORT, () => {
    console.log(`\nServidor de correo ejecutándose en http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
    
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        console.log('Variables de entorno cargadas correctamente');
        console.log('Servicio listo para enviar correos');
    } else {
        console.log('Variables de entorno NO configuradas');
    }

    // Configurar cron job para verificación automática
    const checkInterval = process.env.ALERT_CHECK_INTERVAL_HOURS || '24';
    console.log(`\nConfigurando verificación automática de inventario cada ${checkInterval} horas`);
    
    // Ejecutar cada X horas (por defecto 24 horas a las 8:00 AM)
    cron.schedule('0 8 * * *', () => {
        console.log('\nEjecutando verificación automática de inventario...');
        checkLowInventory();
    });

    // Ejecutar primera verificación al iniciar (opcional, después de 1 minuto)
    setTimeout(() => {
        console.log('\nEjecutando verificación inicial de inventario...');
        checkLowInventory();
    }, 60000);
    
    console.log('Sistema de alertas de inventario activado');
});