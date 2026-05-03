import { ExecutionEnvironment } from "@/types/executor";
import { FillInputTask } from "../task/FillInput";

export async function FillInputExecutor(enviroment: ExecutionEnvironment<typeof FillInputTask>): Promise<boolean> {
  try {
    const selector = enviroment.getInput("Selector");
    const value = enviroment.getInput("Value");
    
    if (!selector) {
      enviroment.log.error("Selector not provided");
      return false;
    }
    
    const page = enviroment.getPage();
    if (!page) {
      enviroment.log.error("Page not found");
      return false;
    }
    
    await page.type(selector, value || "");
    return true;
  } catch (error: any) {
    enviroment.log.error(error.message);
    return false;
  }
}
