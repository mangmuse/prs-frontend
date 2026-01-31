/**
 * user_template에서 {{변수명}} 패턴을 추출
 * @example extractTemplateVariables("{{claim}} - {{source}}") // ["claim", "source"]
 */
export const extractTemplateVariables = (template: string): string[] => {
  const regex = /\{\{(\w+)\}\}/g;
  const matches = [...template.matchAll(regex)];
  const variables = matches.map((match) => match[1]);
  return [...new Set(variables)];
};
