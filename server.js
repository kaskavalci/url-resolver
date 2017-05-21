'use strict';

var http = require('http'),
    util = require('util'),
    fs = require('fs'),
    forms = require('forms'),
    Entities = require('html-entities').AllHtmlEntities,
    jsontemplate = require('./json-template');

const entities = new Entities();
const dns = require('dns');

var fields = forms.fields,
    validators = forms.validators;

// template for the example page
var template = jsontemplate.Template(
    fs.readFileSync(__dirname + '/page.jsont').toString()
);

// our example registration form
var reg_form = forms.create({
    url: fields.string({ required: true }),
});

http.createServer(function (req, res) {
    reg_form.handle(req, {
        success: function (form) {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            // convert uri escaping. %26%2345815 => &#45815;
            var url = decodeURIComponent(form.data['url'].toString('utf-8').trim())
            // decode html escaping &#45815; => 닷
            var utf8URL = entities.decode(url)
            dns.lookup(utf8URL, (err, address, family) => {
              if (err) {
                res.end(`<h1>Error occured for domain ${utf8URL}:  ${err.toString()}</h1>`)
              } else {
                res.end(`<h1>IP Address for domain ${utf8URL} is ${address}</h1>`);
              }
            });
        },
        // perhaps also have error and empty events
        other: function (form) {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(template.expand({
                form: form.toHTML(),
                enctype: '',
                method: 'GET'
            }));
        }
    });

}).listen(8080);
