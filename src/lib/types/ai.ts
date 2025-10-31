export interface AiResponse {
	success: boolean;
	intent: {
		toolUsed: string;
		parameters: Record<string, any>;
	};
	data: any;
}