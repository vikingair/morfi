import React from 'react';
import type { FormData } from '../../../src';

const sanitize = (str: string): string => str.replace(/</g, '&lt;').replace(/>/g, '&gt;');

const htmlForObject = (o: { [key: string]: unknown }): string => {
    let result = '<p>{</p><div class="ml-3"><p>';
    let firstValue = true;
    Object.keys(o).forEach((key: string) => {
        const value = o[key];
        if (value !== undefined) {
            if (!firstValue) {
                result += ',</p><p>';
            } else {
                firstValue = false;
            }
            result += `<span class="prop">${key}</span>: `;
            if (value === null) {
                result += '<span class="null">null</span>';
                return;
            }
            switch (typeof value) {
                case 'string':
                    result += `<span class="string">"${sanitize(value)}"</span>`;
                    return;
                case 'boolean':
                    result += `<span class="boolean">${String(value)}</span>`;
                    return;
                case 'number':
                    result += `<span class="number">${value}</span>`;
                    return;
                default:
                    result += sanitize(JSON.stringify(value) || '');
            }
        }
    });
    result += '</p></div>}';
    return result;
};

type DisplayValuesProps = { data: FormData<any> };

export const DisplayValues: React.FC<DisplayValuesProps> = ({ data }) => (
    <pre>
        <code dangerouslySetInnerHTML={{ __html: htmlForObject(data.values) }} />
    </pre>
);
