declare module 'xlsx' {
  export const utils: {
    json_to_sheet: (data: Record<string, unknown>[]) => unknown;
    book_new: () => unknown;
    book_append_sheet: (wb: unknown, sheet: unknown, name: string) => void;
  };
  export function write(workbook: unknown, opts: { type: string; bookType: string }): string;
}
