# 🧪 KuCoin Data Collection Test

This is a **test repository** to verify the GitHub Actions workflow works with a single symbol before scaling up.

## What This Test Does

- ✅ Tests discovery of BTCUSDT files
- ✅ Downloads **only 5 files** (to save time/bandwidth)
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
- Discover BTCUSDT trade files
- Download the first 5 files (limited for testing)
- Create a summary report
- Upload everything as an artifact named "btcusdt-test-results"

## What Success Looks Like

✅ **Workflow completes successfully**  
✅ **Artifact is created and downloadable**  
✅ **Contains .zip files and summary.json**  
✅ **Proves the system works**

## If This Test Works

Then you can proceed to create 3 full repositories and process all 1985 symbols at much higher speed!

## Troubleshooting

If the test fails:
- Check the Actions logs for error messages
- Verify all files uploaded correctly
- Make sure repository is **public** (required for free GitHub Actions)
