const puppeteer = require('puppeteer-core');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const bot = new TelegramBot(process.env.BOT_TOKEN);
const PRODUCT_URL = 'https://www.onenessboutique.com/products/fear-of-god-essentials-bonded-nylon-soccer-shorts-in-desert-sand-160ho244377f';
const ORIGINAL_PRICE = 90;

async function checkDiscount() {
  const browser = await puppeteer.launch({
    executablePath: '/opt/render/project/.render/chrome/opt/google/chrome/chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.goto(PRODUCT_URL, { waitUntil: 'networkidle2' });

  await page.waitForSelector('input[value="XL"]');
  await page.click('input[value="XL"]');
  await page.waitForSelector('button[name="add"]');
  await page.click('button[name="add"]');
  await page.waitForTimeout(2000);
  await page.goto('https://www.onenessboutique.com/checkout', { waitUntil: 'networkidle2' });

  const priceText = await page.$eval('.payment-due__price', el => el.textContent);
  const currentPrice = parseFloat(priceText.replace(/[^0-9.]/g, ''));

  if (currentPrice < ORIGINAL_PRICE) {
    bot.sendMessage(process.env.CHAT_ID, `💸 세일 발견! 현재 가격은 $${currentPrice}`);
  }

  await browser.close();
}

checkDiscount();
setInterval(checkDiscount, 10 * 60 * 1000);
