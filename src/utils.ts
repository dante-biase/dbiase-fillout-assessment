import { Question, FilterClause } from "./types";

export const isNumberInput = (
	question: Question,
	filter: FilterClause
): boolean => {
	return (
		question.type === "NumberInput" &&
		typeof question.value === "number" &&
		typeof filter.value === "number"
	);
};

export const isDateTimeInput = (
	question: Question,
	filter: FilterClause
): boolean => {
	return (
		new Set([
			"DatePicker",
			"DateRange",
			"DateTimePicker",
			"TimePicker",
		]).has(question.type) &&
		Boolean(Date.parse(question.value as string)) &&
		Boolean(Date.parse(filter.value as string))
	);
};
