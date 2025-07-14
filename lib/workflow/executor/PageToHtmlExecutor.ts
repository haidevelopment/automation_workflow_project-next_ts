import { ExecutionEnvironment } from '@/types/executor';
import { PageToHtmlTask } from '../task/PageToHtml';
export async function PageToHtmlExecutor (environment: ExecutionEnvironment<typeof PageToHtmlTask>): Promise<boolean> {
    console.log(JSON.stringify(environment,null,4),'@ENV');
   try {
     const html = await environment.getPage()!.content();
     environment.setOutput('HTML',html);
     console.log('@html',html);
     environment.log.info('Get HTML from page successfully');

    return true;
   } catch (error:any) {
     console.log(error);
     environment.log.error(error.message);
     return Promise.resolve(false);
   }
}