import { common } from './common';
import { validations } from './validations';
import { errors } from './errors';
import { messages } from './messages';
import { test } from './test';
import {
  homePage,
  loginPage,
  notFoundPage,
  crashPage,
  filesPage,
} from './pages';

export const en = {
  ...common,
  validations,
  errors,
  homePage,
  loginPage,
  notFoundPage,
  crashPage,
  filesPage,
  messages,
  test,
} as const;
