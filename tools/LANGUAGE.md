# GAME DEFINITION LANGUAGE

The game definition language is a simple macro system on top of Javascript.

It generates an instruction list and a simple machine to run the programs. All
execution state is stored in the global game state G, so that we can pause and
resume execution and store the current state in JSON.

The G state contains any global variables used by the game. It also includes
the F local execution frame.

Global game variables can be accessed via G. Local game variables pertaining to
the currently executing frame are accessed via G.F.

Any top-level directives like "function", "const", "var" and exports are passed
through as-is to the compiled source file.

# SYNTAX

The macro-language is based on space separated lists of "words". A word can be
any sequential string of non-whitespace characters. Words can also be "quoted",
( parenthesized ), { bracketed } or [ braced ]. Whitespace (including newlines)
are permitted within quoted strings.

Each line starts with a "command" that defines what it does.

The top-level commands either pass through the rest of the "line" verbatim,
such as "function" and "const" which is used to pass through plain javascript.

The two top-level commands that are special are "global" and "proc".

# VARIABLE SUBSTITUTION

To use variables in the global or local scope that is saved with the game
state, use a dollar prefix. Any variables in statements executed by $ident
syntax are treated special.

By default any $var accesses are in the local scope (G.F.foo).

# GLOBALS

The top-level "global" directive defines which globals are available (in the G
scope).

	global fee fie foe foo

Any references to these variables will now be accessed from G. By default any
other variable accesses will be to the local frame (G.F).

For example $foo will be turned into G.foo, but the local variable $egg will be
turned into G.F.egg.

# PROCEDURES

The "proc" directive defines a procedure that can be run. Inside the procedure
is a list of statements that are executed in order.

	proc arg1 arg2 ... { body }

RETURN

Stop execution of the current procedure and return to the caller.

	return

EVAL 

Include javascript to be executed directly.

	eval line()
	eval { block }

CALL

Invoke another procedure recursively.

	call foo 1 2 3

GOTO - tail-call another procedure

A tail call is equivalent to calling and returning afterwards, but a tail call
can remove the current stack frame before calling we save stack space!

	goto foo

Is a more efficient equivalent to:

	call foo
	return

IF-ELSE

The if statement allows for conditional execution. You can chain several tests
with "elseif".

	if (test) { block }
	if (test) { block } else { block }
	if (test) { block } elseif (test) { block } else { block }

WHILE

The most simple loop.

	while (test) { block }

FOR

Loop over ranges and lists with a local variable.

To loop over a simple range (inclusive):

	for i in (first) to (final) { block }

To loop over a simple range with a filtering predicate:

	for i in (first) to (final) where (test) { block }

To loop over a list use the simple for-in form. The list is not modified.

	for i in (list) { block }

And with a predicate:

	for i in (list) where (test) { block }

# WAIT, PROMPT, ACTION

Game code is run in two modes: action and prompt. Normal execution is in
"action" mode, where the program performs changes in state in response to
player actions. The other mode is "prompt" mode where the program runs briefly
to generate a list of possible user actions.

The "wait" block is the interface between these modes.

The code in a wait block is run in "prompt" mode to generate a list of possible
actions and set any view object (V) properties to present to the players. In
this mode, you should not make any modifications to the global game state. Each
action statement executed will present a possible action to the user.

When a user selects one of the presented actions, the wait block is executed
again in "action" mode, this time if an action block matches the user selected
action it will be executed. After executing the matching action block,
execution will break to the end of the wait block.

During execution of the wait block, R contains the name of the role for which
the view is being generated. This can be important in case multiple roles are
active.

The wait block is only ever executed for the active role(s). The active role is
defined by G.active. The G.active property is either the name of one of the
player roles, or an array of currently active roles. If the G.active is set to
the string "None", that signals the end of the game.

	wait (role) { prompt-and-action-block }

PROMPT and INACTIVE

The prompt statement presents a string to active roles, telling them know what
to do!

	prompt "Move a piece!"

The inactive statement presents a "Waiting for Role to ..." message to inactive
roles.

	inactive "move a piece" // becomes "Waiting for White to move a piece."

VIEW

The view statement is like 'eval' but is only executed in the "prompt" mode.
Use it to set view properties specific to the current prompt.

	view { block }

For active roles only:

	view active { block }

For inactive roles only:

	view inactive { block }

ACTION

The action statement generates or matches a user action.
It is a no-op when executed for inactive roles.

For an action that can match multiple items:

	action name (arg) { block }

To show an enabled/disabled button, pass true or false as the argument:

	action name true { block } -- an enabled button
	action name false { block } -- a disabled button

For a simple enabled button, you can also use the short form:

	action name { block }

UNDO ACTION

To make an action create an undo point, prefix with "undo":

	undo action name arg { block }

EXAMPLE

	proc test_wait {
		wait $active {
			prompt "Hello, world!"
			view {
				V.selected = $selected
			}
			action foo {
				eval console.log("clicked foo")
			}
			action bar {
				eval console.log("clicked bar")
			}
			action nope false {
				// disabled button
			}
			for i in 1 to 5 {
				action number $i {
					eval console.log("selected number " + $i)
				}
			}
		}
	}

# FRAMEWORK GLOBALS

These globals (in javascript, not in the game object) are used by the framework and exposed to users:

	var G // the game object
	var R // the current role when executing an action and when generating a view
	var V // the view object (only when generating a view)

These globals are reserved and should not be touched:

	var P // the list of procedures
	var Aa, Ag // the currently selected action being matched
	var V_inactive // to generate the inactive "waiting for" prompt

These javascript functions are defined and may be used:

	function log() // add a blank line to the game log
	function log(message) // add string to the game log

	function vm_start(proc, scope) // start running a procedure

All other javascript functions starting with "vm_" are reserved and
should not be touched!

There is one special proc that is predefined to end the game:

	proc _finish result message

# FRAMEWORK CALLBACKS

The compiler provides a basic framework for handling the game setup and
communication. You need to provide the following functions that will be invoked
by the framework.

ON_SETUP

The framework will call "on_setup" to initialize the G object for a given
scenario and options. Finish the setup by invoking the vm_start function with the
proc that runs your game logic.

	function on_setup(scenario, options) {
		G.active = "White"
		G.board = [ 
			"rnbqkbnr",
			"pppppppp",
			"--------",
			"--------",
			"--------",
			"--------",
			"PPPPPPPP",
			"RNBQKBNR",
		]
		vm_start("main")
	}

ON_VIEW

The "on_view" function fills in the V object for passing to the client.

	function on_view() {
		V.board = G.board
	}

In your play.js code, the V object will show up as the global "view" object.

ON_LOAD and ON_SAVE

The on_load and on_save functions provide entry points for preparing the G
object for saving to JSON, and for restoring it.

Typically used to convert G.active from a role string to an integer.

	const ROLE_INDEX_FROM_NAME = { "White": 0, "Black": 1 }
	const ROLE_NAME_FROM_INDEX = [ "White", "Black" ]

	function on_load() {
		G.active = ROLE_INDEX_FROM_NAME[G.active]
	}

	function on_save() {
		G.active = ROLE_NAME_FROM_INDEX[G.active]
	}

