declare module '@vitalets/google-translate-api' {
  export function translate(
    text: string,
    options?: {
      from?: string;
      to?: string;
      raw?: boolean;
      client?: string;
      tld?: string;
    }
  ): Promise<{
    text: string;
    from: {
      language: {
        didYouMean: boolean;
        iso: string;
      };
      text: {
        autoCorrected: boolean;
        value: string;
        didYouMean: boolean;
      };
    };
    raw: any;
  }>;
}
