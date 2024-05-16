import React from "react";
import type { MorfiData } from "morfi";

const sanitize = (str: string): string =>
  str.replace(/</g, "&lt;").replace(/>/g, "&gt;");

const htmlForObject = (o: { [key: string]: unknown }): string => {
  let result = '<p>{</p><div class="pre__padding"><p>';
  let firstValue = true;
  Object.keys(o).forEach((key: string) => {
    const value = o[key];
    if (value !== undefined) {
      if (!firstValue) {
        result += ",</p><p>";
      } else {
        firstValue = false;
      }
      result += `<span class="pre__prop">${key}</span>: `;
      if (value === null) {
        result += '<span class="null">null</span>';
        return;
      }
      switch (typeof value) {
        case "string":
          result += `<span class="pre__string">"${sanitize(value)}"</span>`;
          return;
        case "boolean":
          result += `<span class="pre__boolean">${String(value)}</span>`;
          return;
        case "number":
          result += `<span class="pre__number">${value}</span>`;
          return;
        default:
          result += sanitize(JSON.stringify(value) || "");
      }
    }
  });
  result += "</p></div>}";
  return result;
};

type DisplayValuesProps = { data: MorfiData<any> };

export const DisplayValues: React.FC<DisplayValuesProps> = ({ data }) => (
  <pre>
    <code dangerouslySetInnerHTML={{ __html: htmlForObject(data.values) }} />
  </pre>
);
