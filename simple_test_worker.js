#!/usr/bin/env node
/**
 * Simple Test Worker - Keep the working version for basic testing
 */

import fs from 'fs/promises';
import { createWriteStream } from 'fs';
import path from 'path';
import https from 'https';

console.log('🧪 Simple Test Worker for GitHub Actions');
console.log('🎯 Testing with known BTCUSDT files');

const TEST_FILES = [
    'BTCUSDT-trades-2025-01-01.zip',
    'BTCUSDT-trades-2025-01-02.zip',
    'BTCUSDT-trades-2025-01-03.zip'
];

const CONFIG = {
    symbol: 'BTCUSDT',
    outputDir: './output',
    baseUrl: 'https://historical-data.kucoin.com/data/spot/daily/trades/BTCUSDT/',
    timeout: 30000
};

function log(message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
}

async function testDownload(filename) {
    const url = CONFIG.baseUrl + filename;
    const outputPath = path.join(CONFIG.outputDir, CONFIG.symbol, filename);
    
    return new Promise((resolve, reject) => {
        log(`📥 Testing download: ${filename}`);
        
        const request = https.get(url, { timeout: CONFIG.timeout }, (response) => {
            log(`📡 Response: ${response.statusCode} ${response.statusMessage}`);
            
            if (response.statusCode === 200) {
                const fileStream = createWriteStream(outputPath);
                let downloadedBytes = 0;
                
                response.on('data', (chunk) => {
                    downloadedBytes += chunk.length;
                });
                
                response.pipe(fileStream);
                
                fileStream.on('finish', () => {
                    fileStream.close();
                    log(`✅ Downloaded ${filename} (${downloadedBytes} bytes)`);
                    resolve({ filename, bytes: downloadedBytes, status: 'success' });
                });
                
                fileStream.on('error', (error) => {
                    log(`❌ File write error: ${error.message}`);
                    reject(error);
                });
            } else {
                log(`⚠️ File not available: ${filename} (${response.statusCode})`);
                resolve({ filename, bytes: 0, status: 'not_found' });
            }
        });
        
        request.on('error', (error) => {
            log(`❌ Request error for ${filename}: ${error.message}`);
            resolve({ filename, bytes: 0, status: 'error', error: error.message });
        });
        
        request.on('timeout', () => {
            request.destroy();
            log(`⏰ Timeout for ${filename}`);
            resolve({ filename, bytes: 0, status: 'timeout' });
        });
    });
}

async function runTest() {
    try {
        log(`🚀 Starting simple test for ${CONFIG.symbol}`);
        
        const symbolDir = path.join(CONFIG.outputDir, CONFIG.symbol);
        await fs.mkdir(symbolDir, { recursive: true });
        log(`📁 Created output directory: ${symbolDir}`);
        
        const results = [];
        
        for (const filename of TEST_FILES) {
            const result = await testDownload(filename);
            results.push(result);
        }
        
        const successCount = results.filter(r => r.status === 'success').length;
        const totalBytes = results.reduce((sum, r) => sum + r.bytes, 0);
        
        const summary = {
            symbol: CONFIG.symbol,
            testCompletedAt: new Date().toISOString(),
            filesAttempted: TEST_FILES.length,
            filesDownloaded: successCount,
            totalBytes: totalBytes,
            testResults: results,
            status: successCount > 0 ? 'success' : 'failed'
        };
        
        const summaryPath = path.join(symbolDir, 'test_summary.json');
        await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));
        
        log(`\n🎯 TEST RESULTS:`);
        log(`   • Files attempted: ${TEST_FILES.length}`);
        log(`   • Files downloaded: ${successCount}`);
        log(`   • Total bytes: ${totalBytes}`);
        log(`   • Success rate: ${(successCount/TEST_FILES.length*100).toFixed(1)}%`);
        
        if (successCount > 0) {
            log(`\n✅ TEST PASSED! GitHub Actions will work`);
            log(`📦 Files ready for artifact packaging`);
        } else {
            log(`\n❌ TEST FAILED! Need to debug the download URLs`);
        }
        
    } catch (error) {
        log(`❌ TEST ERROR: ${error.message}`);
        process.exit(1);
    }
}

runTest();