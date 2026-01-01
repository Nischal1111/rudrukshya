# Server-Side Fix for 413 Payload Too Large Error

## Problem
The blog update endpoint is returning `413 Payload Too Large` when the request body exceeds the server's configured limit.

## Server-Side Solutions

### Option 1: Increase Body Size Limit (Express.js/Node.js)

If using Express.js, increase the body parser limit:

```javascript
// In your Express app setup
const express = require('express');
const app = express();

// Increase body size limit to 50MB (adjust as needed)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// For multipart/form-data (if using multer)
const multer = require('multer');
const upload = multer({
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  }
});
```

### Option 2: Increase Body Size Limit (Nginx)

If using Nginx as a reverse proxy, add to your server block:

```nginx
server {
    # ... other config ...
    
    client_max_body_size 50M;  # Increase from default 1M
    
    # ... rest of config ...
}
```

### Option 3: Increase Body Size Limit (Other Frameworks)

**Fastify:**
```javascript
const fastify = require('fastify')({
  bodyLimit: 50 * 1024 * 1024 // 50MB
});
```

**Koa:**
```javascript
const koaBody = require('koa-body');
app.use(koaBody({
  jsonLimit: '50mb',
  formLimit: '50mb',
  textLimit: '50mb'
}));
```

## Recommended Approach

1. **Set a reasonable limit** (e.g., 10-50MB depending on your needs)
2. **Use FormData for large content** (already implemented in frontend)
3. **Consider chunking** for very large content
4. **Optimize images** - compress before upload, use image URLs instead of base64

## Frontend Changes Made

The frontend has been updated to:
- Automatically use FormData when content is large (>500KB) or contains base64 images
- Provide better error messages for 413 errors
- Log content size for debugging

## Testing

After implementing the server-side fix:
1. Test with small content (< 1MB)
2. Test with medium content (1-10MB)
3. Test with large content (> 10MB)
4. Test with base64 images in content

## Additional Recommendations

1. **Image Optimization**: Consider uploading images separately and storing URLs instead of embedding base64
2. **Content Compression**: Implement gzip compression on the server
3. **Chunking**: For very large content, consider implementing chunked uploads
4. **Validation**: Add server-side validation to reject unreasonably large content
