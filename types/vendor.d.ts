declare module "docx-preview" {
  export function renderAsync(
    data: ArrayBuffer | Uint8Array,
    bodyContainer: HTMLElement,
    styleContainer?: HTMLElement,
    options?: any
  ): Promise<void>;
}
