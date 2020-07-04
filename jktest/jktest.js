/**
 * Copyright (c) 2020 Julian Knight (Totally Information)
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

'use strict'

/** The HTML file defines the settings and help information for this node type
 *  The JS file defines the processing for each instance of this node type
 **/

// THIS OUTER SECTION IS EXECUTED ONLY ONCE AS NODE-RED IS LOADING

const nodeVersion = require('../package.json').version

// Node name must match this nodes html file name AND the nodeType in the html file
const nodeName = 'jktest'

// Set to false to prevent debugging output
var debug = true

//debug && console.log( 'node-red-contrib-' + nodeName + ' - initialising module. Module Version: ' + nodeVersion )

// Keep track of how many times each instance of this node is deployed
const deployments = {}

//const events = require('events')
//var ev = new events.EventEmitter();
//ev.setMaxListeners(0);

// THIS FUNCTION IS EXECUTED ONLY ONCE AS NODE-RED IS LOADING
module.exports = function(RED) {
    'use strict'
    //debug && RED.log.debug( 'node-red-contrib-' + nodeName + ' - loading module' )

    /** Settings that can be set in settings.js and that are shared with the node editor
     *  @see https://nodered.org/docs/creating-nodes/node-js#custom-node-settings
     *  Also must contain any credentials used in the admin ui in a ... credentials: {} ... object
     *  @see https://nodered.org/docs/creating-nodes/credentials
     **/
    const nodeSettings = {
        'settings': {
            'jktestNodeEnv': { 'value': process.env.NODE_ENV, 'exportable': true }
        },
    }

    /** RED, parent object set by Node-RED
     * @external RED
     * @see https://nodered.org/docs/creating-nodes/node-js
     **/

    /** The node's instance definition.
     * THIS FUNCTION IS RUN ON (RE)DEPLOYMENT - FOR EACH INSTANCE OF THIS NODE TYPE
     *                         --------------            --------
     *
     * this/node var is rebuilt on every redeployment
     *
     * @param {object} config - The config vars defined in the matching html file used in the admin interface
     *
     * node.xxx != var xxx - though the way that NR processes this fn makes them very similar in this case.
     *                       node.xxx vars would be accessible wherever the node object is referenced.
     *                       var xxx vars are only accessible inside this function.
     */
    function nodeGo(config) {

        debug && RED.log.debug( 'node-red-contrib-' + nodeName + ' - Starting nodeGo, node instance being deployed ' )

        // Create the node instance
        RED.nodes.createNode(this, config)

        // copy 'this' object in case we need it in context of callbacks of other functions.
        const node = this

        /** Create local copies of the node configuration (as defined in the .html file)
         *  NB: Best to use defaults here as well as in the html file for safety
         **/
        node.name   = config.name || ''
        node.topic  = config.topic || '' // NB: will be overwritten by msg.topic if received

        // example configuration node - config node with 3 fields
        let configObj = RED.nodes.getNode(config.server)
        node.server = configObj.protocol + '://' + configObj.host
        if ( configObj.port !== '' ) node.server += ':' + configObj.port

        /** Built-in attributes:
         *    node.id // the node instance unique id, also available as config.id
         *    node.type // the module name
         **/

        /** Use this if you want to see what keys (properties) are available in either the config or node objects
         *    console.dir(Object.keys(config))
         *    console.dir(Object.keys(node))
         **/

        /** Access context/flow/global variables
         *  NB: context vars are reset on node, flow and full redeployments - eventually, context vars may get a persistence mechanism
         *    node.context().get('varname')
         *    node.context().set('varname', someContent)
         *  NB: flow and global vars are NOT reset on any kind of redeployment
         *    node.context().flow.get('varname')
         *    node.context().global.get('varname')
         **/

        // Track how many messages recieved (using ES6 generator function) - not essential but nice for tracking
        node.msgCounter = rcvCounter()

        // Set to true if you want additional debug output to the console
        debug = RED.settings.debug || true

        // Keep track of the number of times each instance is deployed.
        // The initial deployment = 1
        if ( deployments.hasOwnProperty(node.id) ) {
            deployments[node.id]++
        } else {
            deployments[node.id] = 1
        }

        debug && RED.log.debug(
            'node-red-contrib-' + nodeName + ', # Deployments: ' + deployments[node.id] +
            ', node.ID: ' + node.id + ', node.type: ' + node.type +
            ', Instance Name: ' + node.name)

        /** If we need an Express app server to serve a web page
         *    const app = RED.httpNode || RED.httpAdmin
         *  If we just need the http server
         *    const httpServer = RED.server
         **/

        /** These ONLY log to the NR console (audit is only shown when requested in NR settings)
         *    RED.log.info('Some Text') // also info, log, warn, error, trace, debug
         *    RED.log.audit({ 'TEST': 'An Object' })
         *  These show up in the NR console AND in the NR debug window
         *    this.log("Something happened");
         *    this.warn("Something happened you should know about");
         *    this.error("Oh no, something bad happened");
         *    this.error("Oh no, something bad happened", msg);  // halts current flow, triggers catch node
         **/

        // Set a status line under the node instance in the admin interface
        setNodeStatus( { fill: 'blue', shape: 'dot', text: 'Node Initialised' }, node )

        /** Handler function for node input events (when a node instance receives a msg)
         * @param {Object} msg - The input msg object
         **/
        function nodeInputHandler(msg) {
            debug && RED.log.debug('TEST:nodeGo:nodeInputHandler') //debug

            // If msg is null, nothing will be sent
            if ( msg === null ) return

            // if msg isn't an object
            // NOTE: This is paranoid and shouldn't be possible!
            if ( typeof msg !== 'object' ) {
                // Force msg to be an object with payload of original msg
                msg = { 'payload': msg }
            }

            // Add topic from node config if present and not present in msg
            if ( !(msg.hasOwnProperty('topic')) || msg.topic === '' ) {
                if ( node.topic !== '' ) msg.topic = node.topic
                else msg.topic = 'TEST/' + nodeName
            }

            // Keep this fn small for readability so offload
            // any further, more customised code to another fn
            inputHandler(msg, node, RED)

        } // -- end of msg received processing -- //

        // Whenever the node instance receives a msg, the function is triggered
        node.on('input', nodeInputHandler)

        /** Do something when Node-RED is closing down
         *  which includes when this node instance is redeployed
         *  NOTE: function(done) MUST be used if needing to do async processing
         *        in close, BUT if used, done() MUST be called because Node-RED
         *        will wait otherwise and timeout with an error after 15 sec.
         **/
        node.on('close', function(removed, done) {
            debug && RED.log.debug('TEST:nodeGo:on-close') //debug

            // Tidy up the event listener (that listens for new msg's)
            node.removeListener('input', nodeInputHandler)

            // Do any complex close processing here if needed - MUST BE LAST
            // the function MUST also process done()
            processClose(removed, done, node, RED)

        }) // --- End of on close --- //

    } // ---- End of nodeGo (initialised node instance) ---- //

    /** Register the node by name. This must be called before overriding any of the node functions.
     * @param {string} nodeName - Name used in the matching html file that defines the admin ui
     * @param {function} nodeGo - Name of the function that provides the processing for each instance of this node type
     * @param {Object=} nodeSettings - An optional object defining settings that can be set in Node-RED's settings.js file. @see https://nodered.org/docs/creating-nodes/node-js#exposing-settings-to-the-editor
     **/
    RED.nodes.registerType(nodeName, nodeGo, nodeSettings)
    //RED.nodes.registerType(nodeName, nodeGo, { credentials: { username: {type:"text"}, password: {type:"password"} } })

} // ---- End of module.exports ---- //

/** ========== UTILITY FUNCTIONS ==============
 *  Don't forget to pass msg, node, RED, etc.
 *  as arguments because these functions are
 *  outside the scope of the exports function
 *  =========================================== */

/** Complex, custom code when processing an incoming msg should go here
 *  Needs to output the msg object (if needed) before ending.
 *  - use RED.util.getMessageProperty(msg,expr) to get any element of the msg
 *      as this lets you retrieve deep info such as msg.payload.sub.deep.
 *  - use RED.util.setMessageProperty(msg,prop,value,createMissing) to set an element on the msg,
 *      it will fill in any missing intermediate properties.
 *  - use RED.comms.publish('A message to admin') to send a message to the admin interface,
 *      appears as a pop-over message box at the top of the screen.
 * @param {Object} msg  - The incoming msg object
 * @param {Object} node - The node definition object
 * @param {Object} RED  - The RED object from Node-RED
 **/
function inputHandler(msg, node, RED) {
    var msgCount = node.msgCounter.next().value
    RED.util.setMessageProperty(msg, '_msgcounter', msgCount, false) // iterate counter and attach to msg
    setNodeStatus({fill: 'yellow', shape: 'dot', text: 'Message Recieved #' + msgCount}, node)

    //debug && console.dir(msg) //debug

    // Simple example adding the node configuration data to the output message
    msg.config = {
        'name': node.name,
        'server': node.server
    }

    // Send on the input msg to output
    node.send(msg)

} // ---- End of inputHandler function ---- //

/** Do any complex, custom node closure code here
 *  e.g. remove websocket connections
 * @param {boolean=} removed - True if the node instance has been removed (@since v0.17)
 * @param {any=} done - An internal function if needing async processing or null otherwise
 * @param {Object} node - The node definition object
 * @param {Object} RED  - The RED object from Node-RED
 **/
function processClose(removed = null, done = null, node, RED) {
    setNodeStatus({fill: 'red', shape: 'ring', text: 'CLOSED'}, node)

    if ( removed ) {
        debug && RED.log.debug('TEST:processClose:node instance removed') //debug
    } else {
        debug && RED.log.debug('TEST:processClose:node instance restarted/deployed') //debug
    }

    // This should be executed last if present. `done` is the data returned from the 'close'
    // event and is used to resolve async callbacks to allow Node-RED to close
    if (done) done()
} // ---- End of processClose function ---- //

/** Simple fn to set a node status in the admin interface
 * @param {string|Object} status - Status object. If a string, will be turned into a default status object
 * @param {Object} node - The node definition object
 *  fill: red, green, yellow, blue or grey
 *  shape: ring or dot
 **/
function setNodeStatus( status, node ) {
    if ( typeof status !== 'object' ) status = {fill: 'grey', shape: 'ring', text: status}

    node.status(status)
}

/** Use an ES6 generator function to track how many messages have been received since the last
 *  restart of NR or redeploy of this node instance.
 *  This is obviously TOTALLY OVERKILL since a simple variable would have done just as well but hey, gotta start somewhere, right? ;-)
 **/
function* rcvCounter() {
    var msgCounter = 1 // start counting from 1
    while(true) yield msgCounter++ // keeps going forever!
}

/** Join any number of string arguments into a valid URL format
 *  @see http://stackoverflow.com/a/28592528/3016654
 *  @param {Array.string} urls - a list of strings to join
 **/
function urlJoin() {
    const trimRegex = new RegExp('^\\/|\\/$','g')
    var paths = Array.prototype.slice.call(arguments)
    return '/'+paths.map(function(e){return e.replace(trimRegex,'')}).filter(function(e){return e}).join('/')
}

// EOF
