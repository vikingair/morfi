/**
 * This file is part of morfi which is released under MIT license.
 *
 * The LICENSE file can be found in the root directory of this project.
 *
 * @flow
 */

import { _Form } from './Form';
import type { _FormData, _FormErrors, _FormValidation, _ErrorMessage, _Validator } from './Form-classes';
import { _Field } from './Field';

const Form = _Form;
const Field = _Field;

export { Form, Field };
export type FormData<V> = _FormData<V>;
export type FormErrors<V> = _FormErrors<V>;
export type FormValidation<V> = _FormValidation<V>;
export type ErrorMessage = _ErrorMessage;
export type Validator = _Validator;
