'use strict';

const _         = require('lodash');
const fs        = require('fs');
const co        = require('co');
const got       = require('got');

const API_URL = 'https://api.top-serveurs.net/v1/servers/';
const URL = 'https://minecraft.top-serveurs.net/';

module.exports = (context) => {
  const shell = context.shell;
  const logger = context.logger;

  function* queryServer(query) {
    const query_enc = encodeURIComponent(query);
    const url = API_URL +  'search?game=minecraft&keywords=' + query_enc;
    let result = (yield got(url)).body;

    result = JSON.parse(result);
    if (result['data']) {
      return result['data'].map(x => x);
    }
    return null;
  }

  function* search(query, res) {
    const query_trim = query.trim();
    if (query_trim.length === 0)
      return res.add({
        id: 'help',
        payload: 'help',
        title: 'Help - minecraft.top-serveurs.net',
        desc: 'Type "/minecraft Server name" for find Minecraft servers'
      });

    const query_enc = encodeURIComponent(query);

    if (query_enc.length > 0) {
      let results = yield* queryServer(query_trim);
      results = _.reject(results, (x) => x === query_trim);
      results = _.take(results, 20).map((x) => {
        return {
          id: x['slug'],
          payload: 'open',
          title: x['name'],
          desc: x['short_description']
        };
      });
      return res.add(results);
    }
  }


  function execute(id, payload) {
    if (payload != 'open')
      return ;
    return shell.openExternal(URL + id);
  }

  return { search: co.wrap(search), execute };
};
