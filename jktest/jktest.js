/**
 * Copyright (c) 2017 Julian Knight (Totally Information)
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

// THIS OUTER SECTION IS EXECUTED ONLY ONCE AS NODE-RED IS LOADING

// Module name must match this nodes html file
const moduleName = 'jktest'
const nodeVersion = require('../package.json').version

var debug = true

//debug && console.log( 'node-red-contrib-' + moduleName + ' - initialising module. Module Version: ' + nodeVersion )

// Keep track of how many times each instance of this node is deployed
const deployments = {}

//const events = require('events')
//var ev = new events.EventEmitter();
//ev.setMaxListeners(0);

// THIS FUNCTION IS EXECUTED ONLY ONCE AS NODE-RED IS LOADING
module.exports = function(RED) {
    'use strict'
    //debug && RED.log.debug( 'node-red-contrib-' + moduleName + ' - loading module' )

    function nodeGo(config) {
        /**
         * THIS FUNCTION IS RUN ON (RE)DEPLOYMENT - FOR EACH INSTANCE OF THIS NODE TYPE
         *                         --------------            --------
         * 
         * this/node is rebuilt on every redeployment
         * 
         * param config (object) - the config vars defined in the matching html file used in the admin interface
         * 
         * node.xxx != var xxx - though the way that NR processes this fn makes them very similar in this case.
         *                       node.xxx vars would be accessible wherever the node object is referenced.
         *                       var xxx vars are only accessible inside this function.
         */

        debug && RED.log.debug( 'node-red-contrib-' + moduleName + ' - Starting nodeGo, node instance being deployed ' )

        // Create the node instance
        RED.nodes.createNode(this, config)

        // copy 'this' object in case we need it in context of callbacks of other functions.
        const node = this

        // Create local copies of the node configuration (as defined in the .html file)
        node.name   = config.name || ''
        node.topic  = config.topic || '' // NB: will be overwritten by msg.topic if recived

        // Built-in attributes:
        // node.id // the node instance unique id, also available as config.id
        // node.type // the module name

        // Track how many messages recieved (using ES6 generator function) - not essential but nice for tracking
        node.msgCounter = rcvCounter()

        // NOTE that this nodes CONTEXT variables are available from node.context().get('varname')
        //      The node's FLOW variables are available from node.context().flow.get('varname')
        //      The GLOBAL variables are available from node.context().global.get('varname')

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
            'node-red-contrib-' + moduleName + ', # Deployments: ' + deployments[node.id] + 
            ', node.ID: ' + node.id + ', node.type: ' + node.type + 
            ', Instance Name: ' + node.name)

        /** Use this if you want to see what keys (properties) are available in either the config or node objects
         *    console.dir(Object.keys(config))
         *    console.dir(Object.keys(node))
         **/

        /** Access context/flow/global variables
         *    node.context().get('varname')
         *    node.context().set('varname', someContent)
         *    node.context().flow.get('varname')
         *    node.context().global.get('varname')
         **/

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

        setNodeStatus( { fill: 'blue', shape: 'dot', text: 'Node Initialised' }, node )

        // handler function for node input events (when a node instance receives a msg)
        function nodeInputHandler(msg) {
            debug && RED.log.debug('TEST:nodeGo:nodeInputHandler') //debug

            // If msg is null, nothing will be sent, add config.topic if needed
            if ( msg !== null ) {
                // if msg isn't null and isn't an object
                // NOTE: This is paranoid and shouldn't be possible!
                if ( typeof msg !== 'object' ) {
                    // Force msg to be an object with payload of original msg
                    msg = { 'payload': msg }
                }
                // Add topic from node config if present and not present in msg
                if ( !(msg.hasOwnProperty('topic')) || msg.topic === '' ) {
                    if ( node.topic !== '' ) msg.topic = node.topic
                }
            }

            // Keep this fn small for readability so offload
            // any further, more customised code to another fn
            inputHandler(msg, node, RED)

        } // -- end of msg recieved processing -- //
        node.on('input', nodeInputHandler)

        // Do something when Node-RED is closing down
        // which includes when this node instance is redeployed
        // NOTE: function(done) MUST be used if needing to do async processing
        //       in close, BUT if used, done() MUST be called because Node-RED
        //       will wait otherwise.
        // node.on('close', function(done) {
        node.on('close', function() {
            debug && RED.log.debug('TEST:nodeGo:on-close') //debug

            // Resolve for async callbacks (done must be the sole param in fn define) ...
            //done()

            // Tidy up the event listener (that listens for new msg's)
            node.removeListener('input', nodeInputHandler)

            // Do any complex close processing here if needed - MUST BE LAST
            processClose(null, node, RED) // swap with below if needing async
            //processClose(done, node, RED)

        }) // --- End of on close --- //

    } // ---- End of nodeGo (initialised node instance) ---- //

    // Register the node by name. This must be called before overriding any of the node functions.
    RED.nodes.registerType(moduleName, nodeGo)
    //RED.nodes.registerType(moduleName, nodeGo, { credentials: { username: {type:"text"}, password: {type:"password"} } })
}

// ========== UTILITY FUNCTIONS ================ //

// Complex, custom code when processing an incoming msg should go here
// Needs to return the msg object
// - use RED.util.getMessageProperty(msg,expr) to get any element of the msg
//   as this lets you retrieve deep info such as msg.payload.sub.deep
// - use RED.util.setMessageProperty(msg,prop,value,createMissing) to set an element on the msg
// - use RED.comms.publish('A message to admin') to send a message to the admin interface
function inputHandler(msg, node, RED) {
    var msgCount = node.msgCounter.next().value
    RED.util.setMessageProperty(msg, '_msgcounter', msgCount, false) // iterate counter and attach to msg
    setNodeStatus({fill: 'yellow', shape: 'dot', text: 'Message Recieved #' + msgCount}, node)

    //debug && console.dir(msg) //debug

    // Send on the input msg to output
    node.send(msg)

} // ---- End of inputHandler function ---- //

// Do any complex, custom node closure code here
// e.g. remove websocket connections
function processClose(done = null, node, RED) {
    setNodeStatus({fill: 'red', shape: 'ring', text: 'CLOSED'}, node)

    // This should be executed last if present. `done` is the data returned from the 'close'
    // event and is used to resolve async callbacks to allow Node-RED to close
    if (done) done()
} // ---- End of processClose function ---- //

// Simple fn to set a node status in the admin interface
// fill: red, green, yellow, blue or grey
// shape: ring or dot
function setNodeStatus( status, node ) {
    if ( typeof status !== 'object' ) status = {fill: 'grey', shape: 'ring', text: status}

    node.status(status)
}

// Use an ES6 generator function to track how many messages have been recieved since the last
// restart of NR or redeploy of this node instance. 
// This is obviously TOTALLY OVERKILL since a simple variable would have done just as well but hey, gotta start somewhere, right? ;-)
function* rcvCounter() {
    var msgCounter = 1 // start counting from 1
    while(true) yield msgCounter++ // keeps going forever!
}

//from: http://stackoverflow.com/a/28592528/3016654
function urlJoin() {
    const trimRegex = new RegExp('^\\/|\\/$','g')
    var paths = Array.prototype.slice.call(arguments)
    return '/'+paths.map(function(e){return e.replace(trimRegex,'')}).filter(function(e){return e}).join('/')
}

// EOF
