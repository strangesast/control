import * as Models from '../models';
import BaseAction from './base-action';

export const CONFIG_LOAD_APPLICATIONS = '[Config] LOAD_APPLICATIONS'

export class LoadApplications extends BaseAction {
  readonly type = CONFIG_LOAD_APPLICATIONS;
}

export type All = LoadApplications;

import * as Auth from './auth';
export { Auth };
