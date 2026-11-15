export interface ClientErrorLogSummary {
    name: string;
    messageLength?: number;
    stackFrames?: number;
}

export interface ClientComponentStackSummary {
    componentStackFrames: number;
}

export interface UnsafeUrlLogSummary {
    redacted: true;
    length: number;
    protocol: string;
}

export const summarizeClientErrorForLog = (error: unknown): ClientErrorLogSummary => {
    if (error instanceof Error) {
        return {
            name: error.name || 'Error',
            messageLength: error.message.length,
            stackFrames: error.stack?.split('\n').filter(Boolean).length,
        };
    }

    return { name: typeof error };
};

export const summarizeClientComponentStackForLog = (
    componentStack: string | null | undefined
): ClientComponentStackSummary => ({
    componentStackFrames: componentStack?.split('\n').filter(Boolean).length ?? 0,
});

export const summarizeUnsafeUrlForLog = (url: string): UnsafeUrlLogSummary => {
    const protocolMatch = url.match(/^\s*([a-z][a-z0-9+.-]*:)/i);

    return {
        redacted: true,
        length: url.length,
        protocol: protocolMatch?.[1]?.toLowerCase() ?? 'unknown',
    };
};
