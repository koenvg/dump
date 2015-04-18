'use strict';

/**
 * The invite worker handles sending out invites when someone adds an email to their user list on webhook.
 * It first checks to see if the account has been registered, if so it simply sends a link to the login page
 * for the site, if not it sends a link to the registration page for the site.
 */

var fs = require('fs');
var firebase = require('firebase');
var colors = require('colors');
var _ = require('lodash');
var uuid = require('node-uuid');
var async = require('async');
var JobQueue = require('./jobQueue.js');
var Mailgun = require('mailgun').Mailgun;

var escapeUserId = function(userid) {
    return userid.replace(/\./g, ',1');
};

var unescapeUserId = function(userid) {
    return userid.replace(/,1/g, '.');
};

/**
 * @param  {Object}   config     Configuration options from .firebase.conf
 * @param  {Object}   logger     Object to use for logging, defaults to no-ops (deprecated)
 */
module.exports.start = function (config, logger) {
    var fromEmail = config.get('fromEmail');
    var mailgun = new Mailgun(config.get('mailgunKey')); // Mailgun for sending the emails

    var jobQueue = JobQueue.init(config);
    var self = this;
    var firebaseUrl = config.get('firebase') || '';

    this.root = new firebase('https://' + firebaseUrl +  '.firebaseio.com/management/users/');
    this.commandRoot = new firebase('https://' + firebaseUrl + '.firebaseio.com/management/commands/mail/');

    self.root.auth(config.get('firebaseSecret'), function(err) {
        if(err) {
            console.log(err.red);
            process.exit(1);
        }

        console.log('Waiting for mail'.red);

        // Wait for jobs
        jobQueue.reserveJob('mail', 'mail', function(payload, identifier, data, client, callback) {
            var fromEmail = data.from;
            var toEmail = data.to;
            var subject = data.subject;
            var message = data.message;

            sendMail(toEmail, fromEmail, subject, message);
            callback();
        });

    });

    /*
     * Sends a registration-invite email to the user. This is an email that both sends the user
     * to the registration part of the webhook site.
     *
     * @param email        The email to send the invite to
     * @param fromEmail The username (email) thats being invited, should be the same as email
     * @param siteref      The site that the user is being invited to
     */
    function sendMail(toEmail,fromEmail, subject, content) {
        console.log('Sending email');
        mailgun.sendText(fromEmail, toEmail, subject, content);
    }
};

