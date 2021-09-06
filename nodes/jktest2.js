/** A simple template for defining custom nodes
 * Destructured to make for easier and more consistent logic.
 */
'use strict'

/** --- Type Defs ---
 * @typedef {import('../typedefs.js').runtimeRED} runtimeRED
 * @typedef {import('../typedefs.js').runtimeNodeConfig} runtimeNodeConfig
 * @typedef {import('../typedefs.js').runtimeNode} runtimeNode
 * typedef {import('../typedefs.js').myNode} myNode
 */

//#region ----- Module level variables ---- //

/** Main (module) variables - acts as a configuration object
 *  that can easily be passed around.
 */
const mod = {
    /** @type {runtimeRED} Reference to the master RED instance */
    RED: undefined,
    /** @type {string} Custom Node Name - has to match with html file and package.json `red` section */
    nodeName: 'jktest2',

    // Add anything else here that you may wish
    // to access from any function.
    // Having one object also makes it much easier
    // to pass this to external modules as needed.
}

//#endregion ----- Module level variables ---- //

//#region ----- Module-level support functions ----- //

/** 1a) Runs once when Node-RED (re)starts or when the node package is first added */
function moduleSetup() {
    // As a module-level named function, it will inherit `mod` and other module-level variables
    //const RED = mod.RED

    console.log('>>>=[1a]=>>> [moduleSetup] Startng')

    // Do stuff here that only needs doing once
    // Don't forget to push anything that might be needed by other functions and modules
    // into the `mod` variable so that it is easily accessible and can be passed on.
}

/** 3) Run whenever a node instance receives a new input msg
 * NOTE: `this` context is still the parent (nodeInstance).
 * See https://nodered.org/blog/2019/09/20/node-done 
 * @param {object} msg The msg object received.
 * @param {Function} send Per msg send function, node-red v1+
 * @param {Function} done Per msg finish function, node-red v1+
 */
function inputMsgHandler(msg, send, done) {
    // As a module-level named function, it will inherit `mod` and other module-level variables

    // If you need it - or just use mod.RED if you prefer:
    //const RED = mod.RED

    console.log('>>>=[3]=>>> [inputMsgHandler] Startng', msg) //, this)
    send(msg)
    done()
}

/** 2) This is run when an actual instance of our node is committed to a flow
 * @param {runtimeNodeConfig} config The Node-RED node instance config object
 */
function nodeInstance(config) {
    // As a module-level named function, it will inherit `mod` and other module-level variables

    // If you need it - which you will here - or just use mod.RED if you prefer:
    const RED = mod.RED

    console.log('>>>=[2]=>>> [nodeInstance] Startng')
    //console.log('>>>=[2a]=>>>', config)

    // Create the node instance - `this` can only be referenced AFTER here
    RED.nodes.createNode(this, config) 

    // Transfer config items from the Editor panel to the runtime
    this.name = config.name
    this.topic = config.topic

    /** Handle incoming msg's - note that the handler fn inherits `this`
     *  The inputMsgHandler function is executed every time this instance
     *  of the node receives a msg in a flow.
     */
    this.on('input', inputMsgHandler)


    /** Put things here if you need to do anything when a node instance is removed
     * Or if Node-RED is shutting down.
     * Note the use of an arrow function, ensures that the function keeps the
     * same `this` context and so has access to all of the node instance properties.
     */
    this.on('close', (removed, done) => { 
        console.log('>>>=[4]=>>> [nodeInstance:close] Closing. Removed?: ', removed)
        

        // Give Node-RED a clue when you have finished (more important if your shutdown
        // process includes an async task, make sure done() is executed when the async
        // task completes, not when this function ends).
        done()
    })

    /** Properties of `this`
     * Methods: updateWires(wires), context(), on(event,callback), emit(event,...args), removeListener(name,listener), removeAllListeners(name), close(removed)
     *          send(msg), receive(msg), log(msg), warn(msg), error(logMessage,msg), debug(msg), trace(msg), metric(eventname, msg, metricValue), status(status)
     * Other: credentials, id, type, z, wires, x, y
     * + any props added manually from config, typically at least name and topic
     */
    //console.log('>>>=[2b]=>>>', this)
}

//#endregion ----- Module-level support functions ----- //

/** 1) Complete module definition for our Node. This is where things actually start.
 * @param {runtimeRED} RED The Node-RED runtime object
 */
function Test2(RED) {
    // As a module-level named function, it will inherit `mod` and other module-level variables

    // Save a reference to the RED runtime for convenience
    // This allows you to access it from any other function
    // defined above.
    mod.RED = RED

    // Add function calls here for setup that only needs doing
    // once. Node-RED loads this once no matter how many instances
    // of you node you add to flows.
    moduleSetup() // (1a)

    // Register a new instance of the specified node type (2)
    RED.nodes.registerType(mod.nodeName, nodeInstance)
}

// Export the module definition (1), this is consumed by Node-RED on startup.
module.exports = Test2

//EOF
