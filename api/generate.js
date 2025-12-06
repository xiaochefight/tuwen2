// api/generate.js
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

export default async function handler(req, res) {
  // 1. 允许小程序跨域访问
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { inputText, style } = req.body; 

  let browser = null;

  try {
    // 2. 启动无头浏览器
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    
    // 设置画布大小 (375x600 是手机常见比例，2倍图保证清晰)
    await page.setViewport({ width: 375, height: 600, deviceScaleFactor: 2 });

    // 3. 定义样式 (根据前端传来的 style 变换颜色)
    const isDark = style === 'CYBERPUNK' || style === 'ELEGANT_LUXURY';
    const bgColor = isDark ? '#000000' : '#ffffff';
    const textColor = isDark ? '#ffffff' : '#333333';
    const borderColor = isDark ? '#00ff00' : '#333333';

    // 构建 HTML
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { margin: 0; padding: 0; font-family: sans-serif; background: ${bgColor}; box-sizing: border-box;}
            .container { padding: 40px; height: 600px; box-sizing: border-box; display: flex; flex-direction: column; }
            .card { 
                border: 2px solid ${borderColor}; 
                flex: 1;
                padding: 30px; 
                border-radius: 20px; 
                display: flex;
                flex-direction: column;
            }
            h1 { color: ${textColor}; text-align: center; margin-bottom: 30px; border-bottom: 1px solid ${borderColor}; padding-bottom: 20px;}
            .content { 
                font-size: 22px; 
                line-height: 1.8; 
                color: ${textColor}; 
                white-space: pre-wrap; 
                flex: 1;
            }
            .footer { text-align: center; color: #888; font-size: 14px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="card">
              <h1>Magic Card</h1>
              <div class="content">${inputText || '暂无内容'}</div>
              <div class="footer">长按识别二维码</div>
            </div>
          </div>
        </body>
      </html>
    `;

    await page.setContent(htmlContent);

    // 4. 截图并返回 Base64
    const screenshot = await page.screenshot({ 
      type: 'png', 
      encoding: 'base64',
      fullPage: false 
    });

    res.status(200).json({ 
      success: true, 
      image: `data:image/png;base64,${screenshot}` 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Image generation failed' });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
