# 🧪 KuCoin Data Collection Test

This is a **test repository** to verify the GitHub Actions workflow works with a single symbol before scaling up.

## What This Test Does

- ✅ Tests downloading BTCUSDT files from KuCoin
- ✅ Downloads **only 3 files** (to save time/bandwidth)
- ✅ Creates test summary
- ✅ Packages results as artifacts
- ✅ Uses only ~5-10 minutes of GitHub Actions time

## How to Run

1. **Go to Actions tab**
2. **Click "Test Single Symbol Collection"**  
3. **Click "Run workflow"**
4. **Leave all defaults** and click "Run workflow"

## Expected Results

The workflow will:
- Download 3 BTCUSDT trade files (~10MB total)
- Create a summary report
- Upload everything as an artifact named "btcusdt-test-results"

## What Success Looks Like

✅ **Workflow completes successfully**  
✅ **Artifact is created and downloadable**  
✅ **Contains 3 .zip files and test_summary.json**  
✅ **Proves the system works**

## Download Your Results

After the workflow completes:
1. **Click on the completed workflow run**
2. **Scroll down to "Artifacts" section**
3. **Download "btcusdt-test-results.zip"**
4. **Extract to get your trade data files**

## If This Test Works

Then you can proceed to create 3 full repositories and process all 1985 symbols at much higher speed!

## Files Downloaded

- `BTCUSDT-trades-2025-01-01.zip` (~1.8MB)
- `BTCUSDT-trades-2025-01-02.zip` (~3.4MB) 
- `BTCUSDT-trades-2025-01-03.zip` (~5.1MB)
- `test_summary.json` (results summary)

## Troubleshooting

If the test fails:
- Check the Actions logs for error messages
- Verify all files uploaded correctly
- Make sure repository is **public** (required for free GitHub Actions)
