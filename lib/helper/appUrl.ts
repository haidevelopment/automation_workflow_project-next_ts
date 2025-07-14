export function getAppUrl(path:string){
    const appUrl = process.env.NEXT_PUBLIC_DOMAIN;
    return `${appUrl}${path}`;
}