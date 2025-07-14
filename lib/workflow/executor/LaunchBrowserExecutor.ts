import { waitFor } from '@/lib/helper/waitFor';
import { Environment, ExecutionEnvironment } from '@/types/executor';
import puppeteer from 'puppeteer';
import { LaunchBrowserTask } from '../task/LauchBrowser';
export async function LaunchBrowserExecutor(enviroment: ExecutionEnvironment<typeof LaunchBrowserTask>): Promise<boolean> {
    console.log(JSON.stringify(enviroment,null,4),'@ENV');
   try {
    const websiteUrl = enviroment.getInput('Website Url');
    console.log('@ENV2',websiteUrl);
    const browser = await puppeteer.launch({
        headless: false
    });
    enviroment.log.info('Browser sttarted successfully');
    enviroment.setBrowser(browser);
    const page = await browser.newPage();
    await page.goto(websiteUrl, { waitUntil: 'domcontentloaded' });
    enviroment.setPage(page);
    enviroment.log.info(`Open page at : ${websiteUrl}`);

    return true;
   } catch (error: any) {
     console.log(error);
     enviroment.log.error(error.message);
     return Promise.resolve(false);
   }
}