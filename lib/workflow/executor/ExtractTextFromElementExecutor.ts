import { ExecutionEnvironment } from '@/types/executor';
import { ExtractTextFromElementTask } from '../task/ExtractTextFromElement';
import * as cheerio from 'cheerio';
export async function ExtractTextFromElementExecutor(environment: ExecutionEnvironment<typeof ExtractTextFromElementTask>): Promise<boolean> {
  console.log(JSON.stringify(environment, null, 4), '@ENV');
  try {
    const selector = environment.getInput('Selector');
    if (!selector) {
      console.log('Selector is null');
      environment.log.error("Selecttor is not provider");
      // environment.log.warn("Selecttor is not provider");
      return false;
    }
    const html = environment.getInput('HTML');
    if (!html) {
      console.log('HTML is null');
      environment.log.error("HTML is not define");
      return false;
    }
    const $ = cheerio.load(html);
    const element = $(selector);
    if (!element) {
      console.log('Element Not Found');
      environment.log.error("Element Not Found");
      return false;
    }
    const extractedText = $.text(element);
    if (!extractedText) {
      console.log('Text is null')
      environment.log.error("Text is null");
      return false;
    }
    environment.log.info('Extract text successfully');

    environment.setOutput('Extracted Text ', extractedText);
    return true;
  } catch (error: any) {
    console.log(error);
    environment.log.error(error.message);
    return Promise.resolve(false);
  }
}