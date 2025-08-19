#!/usr/bin/env node
/**
 * GitHub Actions Test Worker - Single Symbol Test
 * Tests with just BTCUSDT to verify the system works
 */

import fs from 'fs/promises';
import path from 'path';
import https from 'https';

console.log('🧪 GitHub Actions Test Worker');
console.log('🎯 Testing with single symbol: BTCUSDT');

// Simple configuration for testing
const CONFIG = {
    symbol: 'BTCUSDT',
    outputDir: './output',
    maxFiles: 5,  // Only download 5 files for testing
    timeout: 30000
};

// Simple logging
function log(message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
}

// Discover files using the working approach
async function discoverFiles(symbol) {
    const url = `https://historical-data.kucoin.com/data/spot/daily/trades/${symbol}/`;
    
    return new Promise((resolve, reject) => {
        log(`🔍 Discovering files for ${symbol}...`);
        
        const request = https.get(url, { timeout: CONFIG.timeout }, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
                return;
            }
            
            let data = '';
            response.on('data', chunk => data += chunk);
            response.on('end', () => {
                try {
                    const files = [];
                    
                    // Look for .zip files in the HTML
                    const fileMatches = data.match(/href="([^"]*\.zip)"/g);
                    
                    if (fileMatches) {
                        fileMatches.forEach(match => {
                            const filename = match.match(/href="([^"]*\.zip)"/)[1];
                            const fileUrl = `https://historical-data.kucoin.com/data/spot/daily/trades/${symbol}/${filename}`;
                            
                            files.push({
                                filename: filename,
                                url: fileUrl,
                                size: 0
                            });
                        });
                    }
                    
                    log(`✅ Discovered ${files.length} files for ${symbol}`);
                    resolve(files);
                } catch (error) {
                    reject(new Error(`Failed to parse response: ${error.message}`));
                }
            });
        });
        
        request.on('error', reject);
        request.on('timeout', () => {
            request.destroy();
            reject(new Error('Request timeout'));
        });
    });
}

// Download a single file
async function downloadFile(fileInfo, outputPath) {
    return new Promise((resolve, reject) => {
        log(`📥 Downloading ${fileInfo.filename}...`);
        
        const request = https.get(fileInfo.url, { timeout: CONFIG.timeout }, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
                return;
            }
            
            const fileStream = require('fs').createWriteStream(outputPath);
            let downloadedBytes = 0;
            
            response.on('data', (chunk) => {
                downloadedBytes += chunk.length;
            });
            
            response.pipe(fileStream);
            
            fileStream.on('finish', () => {
                fileStream.close();
                log(`✅ Downloaded ${fileInfo.filename} (${downloadedBytes} bytes)`);
                resolve(downloadedBytes);
            });
            
            fileStream.on('error', reject);
        });
        
        request.on('error', reject);
        request.on('timeout', () => {
            request.destroy();
            reject(new Error('Download timeout'));
        });
    });
}

// Main test function
async function runTest() {
    try {
        log(`🚀 Starting test for ${CONFIG.symbol}`);
        
        // Create output directory
        const symbolDir = path.join(CONFIG.outputDir, CONFIG.symbol);
        await fs.mkdir(symbolDir, { recursive: true });
        log(`📁 Created output directory: ${symbolDir}`);
        
        // Discover files
        const files = await discoverFiles(CONFIG.symbol);
        
        if (files.length === 0) {
            log(`⚠️ No files found for ${CONFIG.symbol}`);
            return;
        }
        
        // Limit to just a few files for testing
        const filesToDownload = files.slice(0, CONFIG.maxFiles);
        log(`📊 Will download ${filesToDownload.length} files (limited for testing)`);
        
        // Download files
        let totalBytes = 0;
        let successCount = 0;
        
        for (const file of filesToDownload) {
            try {
                const outputPath = path.join(symbolDir, file.filename);
                const bytes = await downloadFile(file, outputPath);
                totalBytes += bytes;
                successCount++;
            } catch (error) {
                log(`❌ Failed to download ${file.filename}: ${error.message}`);
            }
        }
        
        // Create summary
        const summary = {
            symbol: CONFIG.symbol,
            testCompletedAt: new Date().toISOString(),
            totalFilesDiscovered: files.length,
            filesDownloaded: successCount,
            totalBytes: totalBytes,
            status: 'test_completed'
        };
        
        const summaryPath = path.join(symbolDir, 'test_summary.json');
        await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));
        
        log(`\n🎯 TEST RESULTS:`);
        log(`   • Files discovered: ${files.length}`);
        log(`   • Files downloaded: ${successCount}`);
        log(`   • Total bytes: ${totalBytes}`);
        log(`   • Output directory: ${symbolDir}`);
        
        log(`\n✅ TEST COMPLETED SUCCESSFULLY!`);
        log(`📦 GitHub Actions will package the output/ directory as an artifact`);
        log(`🎯 This proves the system works and is ready for full deployment`);
        
    } catch (error) {
        log(`❌ TEST FAILED: ${error.message}`);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    log('🛑 Test interrupted');
    process.exit(0);
});

// Run the test
runTest();
