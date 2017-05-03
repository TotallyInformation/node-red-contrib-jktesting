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

// Module name must match this nodes html file
const moduleName = 'jktestEditableList'
const nodeVersion = require('../package.json').version

var debug = true

debug && console.log( 'node-red-contrib-' + moduleName + ' - initialising module. Module Version: ' + nodeVersion )

//const events = require('events')
//var ev = new events.EventEmitter();
//ev.setMaxListeners(0);

module.exports = function(RED) {
    'use strict'

    debug && console.log( 'node-red-contrib-' + moduleName + ' - loading module' )

    function nodeGo(config) {
        // This fn is run when NR starts and when this node instance is
        // deployed after changes to settings
        debug && console.log( 'node-red-contrib-' + moduleName + ' - Starting nodeGo, node being registered ' )

        // Create the node
        RED.nodes.createNode(this, config)

        // copy 'this' object in case we need it in context of callbacks of other functions.
        const node = this

        // Create local copies of the node configuration (as defined in the .html file)
        node.name   = config.name || ''
        node.topic  = config.topic || '' // NB: will be overwritten by msg.topic if recived

        // Track how many messages recieved (using ES6 generator function)
        node.msgCounter = rcvCounter()

        // NOTE that this nodes context variables are available from (node.context()).get('varname')
        //      The node's flow variables are available from (node.context().flow).get('varname')
        //      The global variables are available from (node.context().global).get('varname')

        // Set to true if you want additional debug output to the console
        debug = RED.settings.debug || true
       
        // If we need an http server to serve a web page
        //const app = RED.httpNode || RED.httpAdmin

        // These ONLY log to the NR console (audit is only shown when requested in NR settings)
        // RED.log.info('Some Text')
        // RED.log.audit({ 'TEST': 'An Object' })
        // These show up in the NR console AND in the NR debug window
        //this.log("Something happened");
        //this.warn("Something happened you should know about");
        //this.error("Oh no, something bad happened");
        //this.error("Oh no, something bad happened", msg);  // halts current flow, triggers catch node

        setNodeStatus( { fill: 'blue', shape: 'dot', text: 'Node Initialised' }, node )

        // handler function for node input events (when a node instance receives a msg)
        function nodeInputHandler(msg) {
            debug && RED.log.info('TEST:nodeGo:nodeInputHandler') //debug

            // If msg is null, nothing will be sent
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
            msg = inputHandler(msg, node, RED)

            // Send on the input msg to output
            node.send(msg)

        } // -- end of msg recieved processing -- //
        node.on('input', nodeInputHandler)

        // Do something when Node-RED is closing down
        // which includes when this node instance is redeployed
        // NOTE: function(done) MUST be used if needing to do async processing
        //       in close, BUT if used, done() MUST be called because Node-RED
        //       will wait otherwise.
        // node.on('close', function(done) {
        node.on('close', function() {
            debug && RED.log.info('TEST:nodeGo:on-close') //debug

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
function inputHandler(msg, node, RED) {
    msg._msgcounter = node.msgCounter.next().value // iterate counter and attach to msg
    setNodeStatus({fill: 'yellow', shape: 'dot', text: 'Message Recieved #' + msg._msgcounter}, node)

    //debug && console.dir(msg) //debug

    return msg
} // ---- End of inputHandler function ---- //

// Do any complex, custom node closure code here
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
    while(true) yield msgCounter++
}

//from: http://stackoverflow.com/a/28592528/3016654
function urlJoin() {
    const trimRegex = new RegExp('^\\/|\\/$','g')
    var paths = Array.prototype.slice.call(arguments)
    return '/'+paths.map(function(e){return e.replace(trimRegex,'')}).filter(function(e){return e}).join('/')
}

// EOF
