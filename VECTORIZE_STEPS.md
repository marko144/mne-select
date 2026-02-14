# Convert Montenegro Coastline PNG to Vector SVG

## Prerequisites

Your PNG is already extracted at: `/Users/markobabic/LocalDev/mne-select/montenegro_coastline.png`

## Step 1: Fix Homebrew Permissions (if needed)

```bash
# Run this first to fix brew permissions
sudo chown -R $(whoami) /opt/homebrew
```

## Step 2: Install Vectorization Tools

```bash
# Install potrace (vectorization) and imagemagick (image processing)
brew install potrace imagemagick
```

## Step 3: Convert PNG to Vector SVG

```bash
# Navigate to project directory
cd /Users/markobabic/LocalDev/mne-select

# Method A: Simple conversion (good for clean outlines)
potrace montenegro_coastline.png -s -o montenegro_vector_clean.svg

# Method B: Better quality with preprocessing
convert montenegro_coastline.png -threshold 50% -negate montenegro_bw.bmp
potrace montenegro_bw.bmp -s -o montenegro_vector_clean.svg -t 2

# Method C: High detail (keeps more curves)
convert montenegro_coastline.png -threshold 50% -negate montenegro_bw.bmp
potrace montenegro_bw.bmp -s -o montenegro_vector_clean.svg --turdsize 2 --alphamax 1
```

## Step 4: Copy to Public Folder

```bash
# Copy the generated SVG to your app
cp montenegro_vector_clean.svg apps/guests/public/illustrations/montenegro_coastline_vector.svg

# Or if you want to keep original, backup first
cp apps/guests/public/illustrations/montenegro_coastline_vector.svg apps/guests/public/illustrations/montenegro_coastline_vector_old.svg
cp montenegro_vector_clean.svg apps/guests/public/illustrations/montenegro_coastline_vector.svg
```

## Step 5: Test the New SVG

Refresh your browser and check:
1. Does the coastline look correct?
2. Does the animation work (drawing effect)?
3. Check console for path lengths

## Troubleshooting

### If vectorization looks messy:

Try different threshold values:
```bash
# Lighter threshold (keeps more detail)
convert montenegro_coastline.png -threshold 40% -negate montenegro_bw.bmp
potrace montenegro_bw.bmp -s -o montenegro_vector_clean.svg

# Darker threshold (cleaner but less detail)
convert montenegro_coastline.png -threshold 60% -negate montenegro_bw.bmp
potrace montenegro_bw.bmp -s -o montenegro_vector_clean.svg
```

### If the SVG is too complex (huge file):

Simplify it:
```bash
# More aggressive simplification
potrace montenegro_bw.bmp -s -o montenegro_vector_clean.svg -t 10 --opttolerance 0.5
```

### If you get "command not found":

```bash
# Check if tools are installed
which potrace
which convert

# If not found, ensure brew path is correct
echo $PATH

# Add brew to path if needed
export PATH="/opt/homebrew/bin:$PATH"
```

## Quick Command (All-in-One)

```bash
cd /Users/markobabic/LocalDev/mne-select && \
convert montenegro_coastline.png -threshold 50% -negate montenegro_bw.bmp && \
potrace montenegro_bw.bmp -s -o montenegro_vector_clean.svg --turdsize 2 && \
cp montenegro_vector_clean.svg apps/guests/public/illustrations/montenegro_coastline_vector.svg && \
echo "✅ Vector SVG created and copied!"
```

## Expected Result

After successful conversion:
- File: `montenegro_vector_clean.svg`
- Size: ~10-100KB (depends on complexity)
- Type: Actual vector with `<path>` elements
- Animatable: YES!

Then refresh browser to see the real Montenegro coastline animating!
