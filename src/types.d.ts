// URL parameters
export interface URLParams {
	formId: string;
}

// Query parameters
export interface QueryParams {
	limit?: number;
	afterDate?: string;
	beforeDate?: string;
	offset?: number;
	status?: string;
	includeEditLink?: boolean;
	sort?: "asc" | "desc";
	filters?: string; // Assuming parameter is optional
}

export interface FilterClause {
	id: string;
	condition: "equals" | "does_not_equal" | "greater_than" | "less_than";
	value: number | string;
}

// Response body
export interface ResponseBody {
	responses: FormResponse[];
	totalResponses: number;
	pageCount: number;
}

export interface FormResponse {
	questions: Question[];
	calculations: Calculation[];
	urlParameters: UrlParameter[];
	quiz: Quiz | {};
	documents: Document[];
	submissionId: string;
	submissionTime: string;
	lastUpdatedAt: string;
}

export interface Question {
	id: string;
	name: string;
	/**
	 * Should create individual interfaces for each question type that correspond to a typed value, but for
	 * purposes of this exercise, we'll just use a union type for now to represent a generic question type.
	 */
	type: InputType | ChoiceType | DateTimeType | MediaType | SpecialType;
	value: string | number | null;
}

export type InputType =
	| "ShortAnswer"
	| "LongAnswer"
	| "NumberInput"
	| "EmailInput"
	| "Password"
	| "URLInput"
	| "CurrencyInput";

export type ChoiceType =
	| "Checkbox"
	| "Checkboxes"
	| "Dropdown"
	| "MultiSelect"
	| "MultipleChoice";

export type DateTimeType =
	| "DatePicker"
	| "DateRange"
	| "DateTimePicker"
	| "TimePicker";

export type MediaType = "AudioRecording" | "FileUpload" | "ImagePicker";

export type SpecialType =
	| "Address"
	| "Calcom"
	| "Calendly"
	| "Captcha"
	| "ColorPicker"
	| "LocationCoordinates"
	| "Matrix"
	| "OpinionScale"
	| "Payment"
	| "PhoneNumber"
	| "Ranking"
	| "RecordPicker"
	| "Signature"
	| "Slider"
	| "StarRating"
	| "Switch";

export interface Calculation {
	id: string;
	name: string;
	type: "number" | "text";
	value: string;
}

export interface UrlParameter {
	id: string;
	name: string;
	value: string;
}

export interface Quiz {
	score: number;
	maxScore: number;
}

export interface Document {
	[key: string]: unknown;
}

// Error response
export interface ErrorResponse {
	error: string;
}
