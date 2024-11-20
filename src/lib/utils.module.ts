import { NgModule } from '@angular/core';
import { UtilsComponent } from './utils.component';
import * as _ from 'underscore';

export function alphabetize(...parameters: any[]): any {
  if (typeof parameters[0] === 'string') {
    // if this method is supplied as a callback to Array.sort
    const a = parameters[0];
    const b = parameters[1];
    if (a > b) return 1;
    if (a < b) return -1;
    return 0;
  } else {
    // if we're sorting a list with a supplied key to alphabetize
    const list = parameters[0];
    const property = parameters[1];
    list.sort((a: any, b: any) => {
      if (a[property] > b[property]) return 1;
      if (a[property] < b[property]) return -1;
      return 0;
    });
    return list;
  }
}

export function clone(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  return JSON.parse(JSON.stringify(obj));
}

export function convertToEST(date: string): string {
  const gmtDate = new Date(date + " GMT");
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'America/New_York',
    year: "numeric",
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true
  };
  
  const formatter = new Intl.DateTimeFormat('en-US', options);
  return formatter.format(gmtDate);
}

export function dateStrings(date?: Date) {
  date = date || new Date();
  return {
    year: date.getFullYear(),
    month: (date.getMonth() + 1).toString().padStart(2, '0'),
    date: date.getDate().toString().padStart(2, '0'),
    time: `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`,
    seconds: date.getSeconds().toString().padStart(2, '0'),
  };
}

export function delay(method: () => void, ms: number = 0): number {
  return window.setTimeout(method, ms);
}

export function download(content: string, name: string, extension: string = 'csv') {
  const blob = new Blob([content]);
  name = kebab(name);

  if ((window.navigator as any).msSaveOrOpenBlob) (window.navigator as any).msSaveBlob(blob, `${name}.${extension}`);
  else {
    const a = window.document.createElement('a');
    a.href = window.URL.createObjectURL(blob);
    a.download = `${name}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}

export function empty(e: any): boolean {
  return falsy(e);
}

export function enumKeys<O extends object, K extends keyof O = keyof O>(obj: O): K[] {
    return Object.keys(obj).filter(k => Number.isNaN(+k)) as K[];
}

export function enumValues<O extends object, K extends keyof O = keyof O>(obj: O): any[] {
    const output = []
    for (const value of enumKeys(obj)) {
      output.push(obj[value]);    
    }
    return output as any[];
}

export function falsy(e: any): boolean {
  if (typeof e === 'string' && trim(e).match(/^false$/i)) return true;
  if (typeof e === 'string') return _.isEmpty(e.replace(/\s+/gim, ''));
  if (typeof e === 'boolean') return e === false;
  if (!isNaN(parseInt(e, 10))) return e === 0;
  return _.isEmpty(e);
}

export function focus(selector: string): number {
  const element = document.querySelector(selector) as HTMLElement;
  if(!element || !element.focus) return 0;
  return delay(() => element.focus());
}

export function getLargestRemainder(values: number[], desiredSum: number) {
  let sum = 0;
  let valueParts = values.map((value: number, index: number) => {
    const integerValue = value || 0;
    sum += integerValue;
    return {
      integer: integerValue,
      decimal: value % 1,
      originalIndex: index,
    };
  });

  if (sum !== desiredSum && sum) {
    valueParts = valueParts.sort((a, b) => b.decimal - a.decimal);

    const diff = desiredSum - sum;
    let i = 0;

    while (i < diff) {
      valueParts[i].integer++;
      i++;
    }
  }

  return valueParts.sort((a, b) => a.originalIndex - b.originalIndex).map((p) => p.integer);
}

export function getparams(requestedProperty?: string): any {
  const vars = {} as any;
  const parts = window.location.href.replace(/[?&#]+([^=&]+)=([^&]*)/gi, ((m: any, key: string, value: any) => {
    vars[key] = value;
  }) as any);

  for (const prop in vars) {
    if (vars[prop].toLowerCase() === 'true') vars[prop] = true;
    else if (vars[prop].toLowerCase() === 'false') vars[prop] = false;
    else if (!isNaN(parseFloat(vars[prop])) && !vars[prop].match(/[^0-9]+/gim)) vars[prop] = parseFloat(vars[prop]);
  }

  if (requestedProperty) return vars[requestedProperty];
  return vars;
}

export function isset(e: any): boolean {
  return truthy(e);
}

export function kebab(e: string): string {
  if (_.isEmpty(e)) return e;
  return e.toLowerCase().replace(/\s+/gim, '-').replace(/_/g, '-').replace(/-+/g, '-');
}

export function paginate(method: (offset: number, limit: number) => any, offset: number, limit: number, key: string, output: any[] = [], callback?: (allRows:any[], newRows: any[]) => void, prevResolve?: (result: any) => void) {
    return new Promise(async (resolve: (result: any) => void, reject: (result: any) => void) => {
      let response;
      try {
        response = await method(offset, limit);
      } catch(e: any) {
        reject(e);
      }
      
      output = output.concat(response[key]);
      
      if(callback) callback(output, response[key]);
      
      if(response.nextPage) {
        await paginate(method, response.nextPage, limit, key, output, callback, prevResolve ?? resolve)
      } else {
        (prevResolve ?? resolve)(output);
      }
      
    });
}

export function prepareSearchString(value: string): string {
    if(!value) return "";
    return value.toLowerCase().replace(/\s+/gim,"");
}

export function replaceItem(array: any[], item: any, key: string = 'id', position: string = 'current'): any {
  const lookup = {} as any;
  lookup[key] = item[key];

  const oldItem = _.findWhere(array, lookup);

  if (!oldItem) {
    array.unshift(item);
    return item;
  }

  const index = array.indexOf(oldItem);

  if (position === 'first') {
    array.splice(index, 1);
    array.unshift(item);
  } else {
    array.splice(index, 1, item);
  }

  return item;
}

export function sleep(duration: number = 0) {
  return new Promise((resolve: (value: any) => void) => {
    delay(() => resolve(duration), duration);
  });
}

export function snakecase(e: string): string {
  if (_.isEmpty(e)) return e;
  return e.toLowerCase().replace(/\s+/gim, '_').replace(/-/g, '_').replace(/_+/g, '_');
}

export function tick(returnValue?: any): Promise<any> {
  return new Promise((resolve: (response: any) => void, reject: (response: any) => void) => {
    delay(() => resolve(returnValue));
  });
}

export function timestamp(date?: Date, includeTime: boolean = true): string {
  const info = dateStrings(date);
  const time = ` ${info.time}:${info.seconds}`;
  return `${info.year}-${info.month}-${info.date}${includeTime ? time : ''}`;
}

export function trace(...parameters: any[]) {
  if (!getparams().debug) return;

  for (let i = 0, count = parameters.length; i < count; i++) {
    // tslint:disable-next-line
    console.log(parameters[i]);
  }
}

export function trim(e: string): string {
  if (_.isEmpty(e)) return e;
  return e.replace(/^\s+/, '').replace(/\s+$/, '');
}

export function truthy(e: any): boolean {
  return !falsy(e);
}

export function validateEmail(email: string | null): RegExpMatchArray | null {
  if (!email) return null;

  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    );
}

export function viewport(el: HTMLElement, percentVisible: number = 100): boolean {
  const rect = el.getBoundingClientRect();
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;

  return !(
    Math.floor(100 - ((rect.top >= 0 ? 0 : rect.top) / +-(rect.height / 1)) * 100) < percentVisible ||
    Math.floor(100 - ((rect.bottom - windowHeight) / rect.height) * 100) < percentVisible
  );
}

export function password(length): string {
  const upperCaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowerCaseChars = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const specialChars = '!@#$%^&*()-_=+[]{}|;:,.<>?';
  length = length ?? 8;

  // Ensure each type of character appears at least once
  const password = [
    upperCaseChars[Math.floor(Math.random() * upperCaseChars.length)], // One uppercase
    lowerCaseChars[Math.floor(Math.random() * lowerCaseChars.length)], // One lowercase
    numbers[Math.floor(Math.random() * numbers.length)], // One number
    specialChars[Math.floor(Math.random() * specialChars.length)], // One special char
  ];

  // Pool of all allowed characters for remaining password characters
  const allChars = upperCaseChars + lowerCaseChars + numbers + specialChars;

  // Fill the rest of the password length (64 characters) with random characters
  for (let i = password.length; i < length; i++) {
    password.push(allChars[Math.floor(Math.random() * allChars.length)]);
  }

  // Shuffle the password array to ensure randomness, then join it into a string
  const randomPassword = password.sort(() => Math.random() - 0.5).join('');
  return randomPassword;
}



@NgModule({
  declarations: [
  ],
  imports: [
  ],
  exports: [
  ]
})
export class UtilsModule { }
