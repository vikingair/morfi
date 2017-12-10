// @flow

import { _Form } from './Form';
import type { _FormData, _ErrorMessage, _Validator } from './Form-classes';
import { _Field } from './Field';

const Form = _Form;
const Field = _Field;

export { Form, Field };
export type FormData<V> = _FormData<V>;
export type ErrorMessage = _ErrorMessage;
export type Validator = _Validator;
