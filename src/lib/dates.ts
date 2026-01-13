/**
 * Parse relative date strings into ISO 8601 format
 * Supports formats like "1h ago", "2d ago", "yesterday", "today"
 */
export function parseRelativeDate(input: string): string {
	const now = new Date();

	// Handle "yesterday"
	if (input.toLowerCase() === "yesterday") {
		const yesterday = new Date(now);
		yesterday.setDate(yesterday.getDate() - 1);
		yesterday.setHours(0, 0, 0, 0);
		return yesterday.toISOString();
	}

	// Handle "today"
	if (input.toLowerCase() === "today") {
		const today = new Date(now);
		today.setHours(0, 0, 0, 0);
		return today.toISOString();
	}

	// Handle relative time patterns: "1h ago", "2d ago", "3w ago", "1mo ago"
	const match = input.match(/^(\d+)(h|d|w|mo)\s*ago$/i);

	if (match) {
		const amount = Number.parseInt(match[1], 10);
		const unit = match[2].toLowerCase();

		switch (unit) {
			case "h": {
				const date = new Date(now.getTime() - amount * 60 * 60 * 1000);
				return date.toISOString();
			}
			case "d": {
				const date = new Date(now.getTime() - amount * 24 * 60 * 60 * 1000);
				return date.toISOString();
			}
			case "w": {
				const date = new Date(now.getTime() - amount * 7 * 24 * 60 * 60 * 1000);
				return date.toISOString();
			}
			case "mo": {
				const date = new Date(now);
				date.setMonth(date.getMonth() - amount);
				return date.toISOString();
			}
		}
	}

	throw new Error(
		`Invalid date format: "${input}". Use: "1h ago", "2d ago", "3w ago", "1mo ago", "yesterday", or "today"`,
	);
}
