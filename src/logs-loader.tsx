import utils from 'loader-utils';
import {resolve} from 'path';
import escapeStringRegexp  from 'escape-string-regexp';

const REGEX_NEWLINE = /(\r?\n)/;

const escapedRootPath = escapeStringRegexp(resolve(process.cwd()));

function createPattern(patterns: string[], customLevels: string[]) {
  const methods = [
    'error', 'warn', 'info', 'verbose', 'debug', 'silly', // npm
    'emerg', 'alert', 'crit', 'warning', 'notice', // syslog
    ...customLevels,
  ];
  // TODO: test this regexp with different patterns-customLevels combinations: "winston", "debug", etc...
  return new RegExp(`(${patterns.join('|')})(\.${methods.join('|.')})?\((.+)\);\s*$`);
}

function replacer(fileName: string, lineNumber: number) {
  return (str: string, logger: string, level: string, args: string, offset: number, s: string) => {
    const loggingArgs = args.replace(/[\(\);]+/g, '').trim().split(',').map((arg: string) => arg.trim());
    const filePath = fileName.replace(new RegExp(`^(${escapedRootPath})`), "").split('\\').map((fileNamePart: string) => fileNamePart.trim()).join('/');
    const lastArg = loggingArgs[loggingArgs.length - 1];
    return logger + level + "('" + filePath + ":" + lineNumber + ":" + lastArg + ":', " + loggingArgs.join(', ') + ");";
  }
  // console.info(J, inetpub, gasite.in.ua, src, shared, components, Library, FlexDataTable, Body, Column, index.tsx, 63, event, ('editorOnValueChange', event));
}

function LogsLoader(resourcePath: string, content: string, query: any, cb: Function) {
  try {
    let patterns: string[] = ["console"];
    let customLevels: string[] = [];
    if(typeof query === "object") {
      if(typeof query.patterns === "string") patterns = [query.patterns];
      else if(Array.isArray(query.patterns)) patterns = query.patterns;
      if(patterns.length < 1) throw new Error("MeaningfulLogsPlugin requires at least one pattern to be specified.");
      if(typeof query.customLevels === "string") customLevels = [query.customLevels];
      else if(Array.isArray(query.customLevels)) customLevels = query.customLevels;
    }
    const pattern = createPattern(patterns, customLevels);

    const newSourceCode = content
      .split(REGEX_NEWLINE)
      .map((line: string, index: number) => line.replace(pattern, replacer(resourcePath, index)))
      .join('\n');

    cb(null, newSourceCode);
  } catch (err) {
    console.error('err', err);
    cb(err);
  }
}

module.exports = function(source: string) {
  if(this.cacheable) this.cacheable();

  const query = utils.parseQuery(this.query);
  console.info('query', query);
  const resourcePath = this.resourcePath;
  console.info('resourcePath', resourcePath);

  const asyncCallback = this.async();
  const callback = asyncCallback || this.callback;

  LogsLoader(resourcePath, source, query, function(err: any, result: string) {
    if(err) return callback(err);
    callback(null, result);
  });

};