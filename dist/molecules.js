(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Molecules = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*
  smiles.js

  Description : parse SMILES chemical line notation
  Imports     : periodic_table
  Exports     : grammar, tokenize, decode

*/

/*
  Imports
*/

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _slicedToArray(arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }

var _referenceElements = require('./../reference/elements');

var _referenceElements2 = _interopRequireDefault(_referenceElements);

/*
  Variable    : grammar
  Description : regular expressions for SMILES grammar

  Fields
    type : token category
    term : SMILES symbol
    tag  : SMILES definition
    expression : regular expression
*/

var grammar = [{ type: 'atom', term: 'H', tag: 'H', expression: /(?=[A-Z])H(?=[^efgos]|$)([0-9]?)+/g }, { type: 'atom', term: 'D', tag: 'H', expression: /(?=[A-Z])D(?=[^bsy]|$)([0-9]?)+/g }, { type: 'atom', term: 'He', tag: 'He', expression: /He/g }, { type: 'atom', term: 'Li', tag: 'Li', expression: /Li/g }, { type: 'atom', term: 'Be', tag: 'Be', expression: /Be/g }, { type: 'atom', term: 'B', tag: 'B', expression: /B(?=[^aehikr]|$)/g }, { type: 'atom', term: 'C', tag: 'C', expression: /C(?=[^adeflmnorsu]|$)/g }, { type: 'atom', term: 'N', tag: 'N', expression: /N(?=[^abdeiop]|$)/g }, { type: 'atom', term: 'O', tag: 'O', expression: /O(?=[^s]|$)/g }, { type: 'atom', term: 'F', tag: 'F', expression: /F(?=[^elmr]|$)/g }, { type: 'atom', term: 'Ne', tag: 'Ne', expression: /Ne/g }, { type: 'atom', term: 'Na', tag: 'Na', expression: /Na/g }, { type: 'atom', term: 'Mg', tag: 'Mg', expression: /Mg/g }, { type: 'atom', term: 'Al', tag: 'Al', expression: /Al/g }, { type: 'atom', term: 'Si', tag: 'Si', expression: /Si/g }, { type: 'atom', term: 'P', tag: 'P', expression: /P(?=[^abdmortu]|$)/g }, { type: 'atom', term: 'S', tag: 'S', expression: /S(?=[^bcegimnr]|$)/g }, { type: 'atom', term: 'Cl', tag: 'Cl', expression: /Cl/g }, { type: 'atom', term: 'Ar', tag: 'Ar', expression: /Ar/g }, { type: 'atom', term: 'As', tag: 'As', expression: /As/g }, { type: 'atom', term: 'Se', tag: 'Se', expression: /Se/g }, { type: 'atom', term: 'Br', tag: 'Br', expression: /Br/g }, { type: 'atom', term: 'I', tag: 'I', expression: /I(?=[^nr]|$)/g }, { type: 'atom', term: '*', tag: '*', expression: /[*]/g }, { type: 'atom', term: 'b', tag: 'B', expression: /b(?=[^e]|$)/g }, { type: 'atom', term: 'c', tag: 'C', expression: /c(?=[^l]|$)/g }, { type: 'atom', term: 'n', tag: 'N', expression: /n(?=[^ae]|$)/g }, { type: 'atom', term: 'o', tag: 'O', expression: /o(?=[^s]|$)/g }, { type: 'atom', term: 'p', tag: 'P', expression: /p/g }, { type: 'atom', term: 's', tag: 'S', expression: /s(?=[^ei]|$)/g }, { type: 'atom', term: 'se', tag: 'Se', expression: /se/g }, { type: 'bond', term: '-', tag: 'single', expression: /(?=([^0-9]))[-](?=[^0-9-\]])/g }, { type: 'bond', term: '=', tag: 'double', expression: /[=]/g }, { type: 'bond', term: '#', tag: 'triple', expression: /[#]/g }, { type: 'bond', term: '(', tag: 'branch', expression: /[(]/g }, { type: 'bond', term: ')', tag: 'branch', expression: /[)]/g }, { type: 'bond', term: '%', tag: 'ring', expression: /(?=[^+-])(?:[a-zA-Z]{1,2}[@]{1,2})?(?:[a-zA-Z]|[a-zA-Z]*.?[\]])[%]?\d+(?=([^+]|$))/g }, { type: 'bond', term: '.', tag: 'dot', expression: /(?:[A-Z][+-]?[\[])?[.]/g }, { type: 'property', term: '+', tag: 'charge', expression: /[a-zA-Z]{1,2}[0-9]*[+]+[0-9]*(?=[\]])/g }, { type: 'property', term: '-', tag: 'charge', expression: /[a-zA-Z]{1,2}[0-9]*[-]+[0-9]*(?=[\]])/g }, { type: 'property', term: 'n', tag: 'isotope', expression: /(?:[\[])[0-9]+[A-Z]{1,2}(?=.?[^\[]*[\]])/g }, { type: 'property', term: 'S', tag: 'chiral', expression: /[A-Z][a-z]?[@](?![A-Z]{2}[0-9]+|[@])/g }, { type: 'property', term: 'R', tag: 'chiral', expression: /[A-Z][a-z]?[@]{2}(?![A-Z]{2}[0-9]+)/g }];

/*
  Method    : tokenize
  Description : parse input string with SMILES grammar

  Syntax
    { tokens } = tokenize(input)

  Arguments
    input : SMILES encoded string

  Output
    { tokens } : array of token objects

  Examples
    { tokens123 } = tokenize('CC(=O)CC')
    { tokensABC } = tokenize('c1cccc1')
*/

function tokenize(input) {
    var tokens = arguments[1] === undefined ? [] : arguments[1];

    // Parse input with SMILES grammar
    for (var i = 0, ii = grammar.length; i < ii; i++) {

        var token = grammar[i];
        var text = [];

        // Check input for match
        while (text = token.expression.exec(input)) {

            // Update tokens
            tokens.push({
                index: text.index,
                type: token.type,
                term: text[0],
                tag: token.tag
            });
        }
    }

    // Sort tokens by index
    tokens.sort(function (a, b) {
        if (a.index < b.index) {
            return -1;
        }
        if (a.index > b.index) {
            return +1;
        }
        return 0;
    });

    // Clean tokens
    for (var i = 0, ii = tokens.length; i < ii; i++) {

        // Extract token values
        var _tokens$i = tokens[i];
        var term = _tokens$i.term;
        var tag = _tokens$i.tag;

        // Check for multi-digit ring number
        if (tag === 'ring') {

            // Extract ring number
            var id = tokens[i].term.match(/[0-9]+/g);

            if (id !== null) {
                id = id[0];
            } else {
                continue;
            }

            if (id.length > 1) {

                var exception = 0;

                // Check for matching ring number
                for (var j = 0, jj = tokens.length; j < jj; j++) {

                    if (i === j || tokens[j].tag !== 'ring') {
                        continue;
                    }

                    // Extract ring number
                    var id2 = tokens[j].term.match(/[0-9]+/g);

                    if (id2 !== null) {
                        id2 = id2[0];
                    } else {
                        continue;
                    }

                    // Compare ring numbers
                    if (id === id2) {
                        exception = 1;
                        break;
                    }
                }

                // Match found
                if (exception === 1) {
                    continue;
                }

                // Token information
                var prefix = tokens[i].term.match(/[a-zA-Z]/g)[0],
                    index = tokens[i].index,
                    type = tokens[i].type,
                    _tag = tokens[i].tag;

                // Parse ring number
                for (var j = 0, jj = id.length; j < jj; j++) {

                    // Create new token
                    tokens.splice(i + 1, 0, {
                        index: index + j,
                        type: type,
                        term: prefix + id.substr(j, j + 1),
                        tag: _tag
                    });
                }

                // Remove original token
                tokens.splice(i, 1);
            }
        }
    }

    return { tokens: tokens };
}

/*
  Method    : decode
  Description : convert SMILES tokens into atoms (nodes) and bonds (edges)

  Syntax
    { atoms, bonds } = decode(tokens)

  Arguments
    tokens : array of tokens obtained from the output of 'tokenize'

  Output
    { atoms, bonds} : array of atom/bonds describing connectivity and properties

  Examples
    { atoms: atomsABC, bonds: bondsABC } = decode(mytokensABC)
    { atoms: atoms123, bonds: bonds123 } = decode(tokens123)
*/

function decode(tokens) {

    function validateTokens(tokens) {

        // Check input type
        if (typeof tokens !== 'object') {
            console.log('Error: Tokens must be of type "object"');
            return false;
        } else if (tokens.tokens !== undefined) {
            tokens = tokens.tokens;
        }

        // Check tokens for required fields
        var fields = ['index', 'type', 'term', 'tag'];

        for (var i = 0, ii = tokens.length; i < ii; i++) {

            // Compare fields
            var match = compare(fields, Object.keys(tokens[i]));

            // Check for invalid token
            if (match.reduce(function (a, b) {
                return a + b;
            }) < 4) {
                console.log('Error: Invalid token at index "' + i + '"');
                return false;
            }
        }

        return tokens;
    }

    function readTokens(tokens) {
        var atoms = arguments[1] === undefined ? {} : arguments[1];
        var bonds = arguments[2] === undefined ? {} : arguments[2];
        var properties = arguments[3] === undefined ? {} : arguments[3];
        var keys = arguments[4] === undefined ? {} : arguments[4];

        var newKey = function newKey(x) {
            return x.toString();
        };

        // Parse tokens by category
        for (var i = 0, ii = tokens.length; i < ii; i++) {

            // Extract token values
            var _tokens$i2 = tokens[i];
            var type = _tokens$i2.type;
            var term = _tokens$i2.term;
            var tag = _tokens$i2.tag;
            var index = _tokens$i2.index;
            var key = newKey(index);

            // Categorize tokens
            switch (type) {

                case 'atom':
                    atoms[key] = addAtom(key, tag, term);
                    break;

                case 'bond':
                    bonds[key] = addBond(key, tag, term);
                    break;

                case 'property':
                    properties[key] = { id: key, name: tag, value: term };
                    break;
            }
        }

        // Check number of atoms
        if (atoms.length < 1) {
            console.log('Error: Could not find atoms');
            return false;
        }

        // Extract token keys
        keys.all = [];

        for (var i = 0, ii = tokens.length; i < ii; i++) {
            keys.all[i] = newKey(tokens[i].index);
        }

        // Extract token keys by category
        keys.atoms = Object.keys(atoms);
        keys.bonds = Object.keys(bonds);
        keys.properties = Object.keys(properties);

        return [atoms, bonds, properties, keys];
    }

    function defaultAtoms(atoms, keys) {

        for (var i = 0, ii = keys.atoms.length; i < ii; i++) {

            var _atomID = keys.atoms[i];

            // Check element
            if (_referenceElements2['default'][atoms[_atomID].name] === undefined) {
                continue;
            }

            // Element information
            var element = _referenceElements2['default'][atoms[_atomID].name];

            // Exception: deuterium
            if (atoms[_atomID].value === 'D') {
                element = _referenceElements2['default'][atoms[_atomID].value];
            }

            // Element properties
            atoms[_atomID].group = element.group;
            atoms[_atomID].protons = element.protons;
            atoms[_atomID].neutrons = element.neutrons;
            atoms[_atomID].electrons = element.electrons;

            // Bond properties
            atoms[_atomID].bonds = {
                id: [],
                atoms: [],
                electrons: 0
            };

            // Other properties
            atoms[_atomID].properties = {
                chiral: 0,
                charge: 0,
                aromatic: 0
            };

            // Check aromatic
            if (atoms[_atomID].value === atoms[_atomID].value.toLowerCase()) {
                atoms[_atomID].properties.aromatic = 1;
            }
        }

        return atoms;
    }

    function customAtoms(atoms, properties, keys) {

        for (var i = 0, ii = keys.properties.length; i < ii; i++) {

            var propID = keys.properties[i];

            // Retrieve properties
            var _properties$propID = properties[propID];
            var _name = _properties$propID.name;
            var value = _properties$propID.value;

            switch (_name) {

                case 'chiral':

                    if (atoms[propID] !== undefined) {
                        atoms[propID].properties.chiral = value.slice(value.indexOf('@'));
                        break;
                    }

                    break;

                case 'isotope':

                    // Determine neutrons, atomID
                    var neutrons = value.match(/[0-9]+/g),
                        atomID = 1 + neutrons.toString().length + parseInt(propID);

                    // Check value
                    if (neutrons > 0 && neutrons < 250 && atoms[atomID] !== undefined) {

                        // Subtract protons
                        neutrons = neutrons - atoms[atomID].protons;

                        if (neutrons > 0) {
                            atoms[atomID].neutrons = neutrons;
                            break;
                        }
                    }

                    break;

                case 'charge':

                    // Determine charge sign (positive/negative)
                    var sign = value.indexOf('+') !== -1 ? 1 : -1;

                    // Check numeric charge (e.g. '3+')
                    var charge = value.match(/(?:[^H])[0-9]+/g);

                    if (charge !== null && atoms[propID] !== undefined) {
                        charge = charge[0].substr(1);
                        atoms[propID].properties.charge = charge * sign;
                        break;
                    }

                    // Check symbolic charge (e.g. '+++')
                    charge = value.match(/([+]+|[-]+)/g);

                    if (charge !== null && atoms[propID] !== undefined) {
                        atoms[propID].properties.charge = charge[0].length * sign;
                        break;
                    }

                    break;
            }
        }

        return atoms;
    }

    function explicitBonds(atoms, bonds, keys) {

        if (keys.bonds.length === 0 || keys.bonds.length === undefined) {
            return [atoms, bonds, keys];
        }

        // Add bonds
        for (var i = 0, ii = keys.bonds.length; i < ii; i++) {

            // Retrieve bond key
            var bondID = keys.bonds[i];

            // Retrieve source/target atoms
            var sourceAtom = atoms[previousAtom(bondID, keys.all, atoms)],
                targetAtom = atoms[nextAtom(bondID, keys.all, atoms)];

            // Determine index values
            var bondIndex = keys.all.indexOf(bondID),
                sourceIndex = 0,
                targetIndex = 0;

            if (sourceAtom !== undefined && sourceAtom !== null) {
                sourceIndex = keys.atoms.indexOf(sourceAtom.id);

                // Check for hydrogen
                if ((bonds[bondID].name === 'double' || bonds[bondID].name === 'triple') && sourceAtom.name === 'H') {

                    while ((sourceAtom.name === 'H' || atoms[keys.atoms[sourceIndex]] === undefined) && sourceIndex > -1) {
                        sourceAtom = atoms[keys.atoms[sourceIndex]];
                        sourceIndex -= 1;
                    }
                }

                sourceIndex = keys.all.indexOf(sourceAtom.id);
            }

            if (targetAtom !== undefined && targetAtom !== null) {
                targetIndex = keys.all.indexOf(targetAtom.id);
            }

            if (sourceIndex < 0) {
                continue;
            }

            // Check for exceptions
            var exceptions = 0;

            if (targetIndex > bondIndex && bondIndex > sourceIndex) {

                // Check previous bond
                if (bonds[keys.all[bondIndex - 1]] !== undefined) {

                    var bond1 = bonds[keys.all[bondIndex - 1]].value,
                        bond2 = bonds[bondID].value;

                    // Exception: bond symbol follows branch end
                    if ((bond1 === ')' || bond1 === '(') && (bond2 === '-' || bond2 === '=' || bond2 === '#' || bond2 === '.')) {
                        exceptions = 1;
                    }
                }
            }

            // Bond type
            switch (bonds[bondID].name) {

                case 'single':
                    if (exceptions === 1 || sourceAtom === undefined || targetAtom === undefined) {
                        continue;
                    }
                    bonds[bondID].order = 1;
                    bonds[bondID].atoms = [sourceAtom.id, targetAtom.id];
                    break;

                case 'double':
                    if (exceptions === 1 || sourceAtom === undefined || targetAtom === undefined) {
                        continue;
                    } else if (targetAtom.name === 'H') {
                        continue;
                    }

                    bonds[bondID].order = 2;
                    bonds[bondID].atoms = [sourceAtom.id, targetAtom.id];
                    break;

                case 'triple':
                    if (exceptions === 1 || sourceAtom === undefined || targetAtom === undefined) {
                        continue;
                    } else if (targetAtom.name === 'H') {
                        continue;
                    }

                    bonds[bondID].order = 3;
                    bonds[bondID].atoms = [sourceAtom.id, targetAtom.id];
                    break;

                case 'dot':
                    if (exceptions === 1 || sourceAtom === undefined || targetAtom === undefined) {
                        continue;
                    }
                    bonds[bondID].order = 0;
                    //bonds[bondID].atoms = [sourceAtom.id, targetAtom.id];
                    break;

                case 'branch':

                    // Keys before/after branch
                    var keysBefore = keys.all.slice(0, bondIndex).reverse(),
                        keysAfter = keys.all.slice(bondIndex + 1, keys.all.length);

                    // Branch type
                    switch (bonds[bondID].value) {

                        // Start branch
                        case '(':

                            // Find start of branch
                            for (var j = 0, jj = keysBefore.length, skip = 0; j < jj; j++) {

                                // Determine source atom
                                sourceAtom = atoms[keysBefore[j]];

                                // Update bond
                                if (sourceAtom !== undefined && sourceAtom.name !== 'H' && skip === 0) {

                                    // Default bond properties
                                    var bondOrder = 1;

                                    // Check aromatic ring
                                    if (sourceAtom.properties.aromatic === 1 && targetAtom.properties.aromatic === 1) {
                                        bondOrder = 1.5;
                                    }

                                    bonds[bondID].order = bondOrder;
                                    bonds[bondID].atoms = [sourceAtom.id, targetAtom.id];
                                    break;
                                }

                                // Check for nested branch
                                else if (bonds[keysBefore[j]] !== undefined) {

                                    switch (bonds[keysBefore[j]].value) {
                                        case ')':
                                            skip++;break;
                                        case '(':
                                            skip--;break;
                                    }
                                }
                            }

                            // Find target atom
                            for (var j = 0, jj = keysAfter.length, bondOrder = bonds[bondID].order, skip = 0; j < jj; j++) {

                                // Update bond order
                                if (bonds[keysAfter[j]] !== undefined && skip === 0) {

                                    switch (bonds[keysAfter[j]].value) {
                                        case '-':
                                            bondOrder = 1;break;
                                        case '=':
                                            bondOrder = 2;break;
                                        case '#':
                                            bondOrder = 3;break;
                                        case '.':
                                            bondOrder = 0;break;
                                    }
                                }

                                // Update bond order
                                if (skip === 0) {
                                    bonds[bondID].order = bondOrder;
                                    break;
                                }

                                // Check for nested branch
                                else if (bonds[keysAfter[j]] !== undefined) {

                                    switch (bonds[keysAfter[j]].value) {
                                        case ')':
                                            skip--;break;
                                        case '(':
                                            skip++;break;
                                    }
                                }
                            }

                            break;

                        // End branch
                        case ')':

                            // Find start of branch
                            for (var j = 0, jj = keysBefore.length, skip = 1; j < jj; j++) {

                                // Retrieve source atom
                                sourceAtom = atoms[keysBefore[j]];

                                // Update bond
                                if (sourceAtom !== undefined && sourceAtom.name !== 'H' && skip === 0) {

                                    // Default bond properties
                                    var bondOrder = 1;

                                    // Check aromatic ring
                                    if (sourceAtom.properties.aromatic === 1) {
                                        bondOrder = 1.5;
                                    }

                                    bonds[bondID].order = bondOrder;
                                    bonds[bondID].atoms[0] = sourceAtom.id;
                                    break;
                                }

                                // Check for nested branch
                                else if (bonds[keysBefore[j]] !== undefined) {

                                    switch (bonds[keysBefore[j]].value) {
                                        case ')':
                                            skip++;break;
                                        case '(':
                                            skip--;break;
                                    }
                                }
                            }

                            // Find end of branch
                            for (var j = 0, jj = keysAfter.length, bondOrder = bonds[bondID].order, skip = 0; j < jj; j++) {

                                // Retrieve target atom
                                targetAtom = atoms[keysAfter[j]];

                                // Update bond
                                if (bonds[keysAfter[j]] !== undefined && skip === 0) {

                                    switch (bonds[keysAfter[j]].value) {
                                        case '-':
                                            bondOrder = 1;break;
                                        case '=':
                                            bondOrder = 2;break;
                                        case '#':
                                            bondOrder = 3;break;
                                        case '.':
                                            bondOrder = 0;break;
                                    }
                                }

                                // Update bond
                                if (targetAtom !== undefined && skip === 0) {

                                    // Check aromatic ring
                                    if (targetAtom.properties.aromatic === 1) {
                                        bondOrder = 1.5;
                                    }

                                    bonds[bondID].order = bondOrder;
                                    bonds[bondID].atoms[1] = targetAtom.id;
                                    break;
                                }

                                // Check for nested branch
                                else if (bonds[keysAfter[j]] !== undefined) {

                                    switch (bonds[keysAfter[j]].value) {
                                        case ')':
                                            skip--;break;
                                        case '(':
                                            skip++;break;
                                    }
                                }
                            }

                            break;
                    }

                    break;

                case 'ring':

                    var sourceID = bonds[bondID].value.match(/[0-9]+/g);

                    // Keys before/after ring token
                    var bondsBefore = keys.bonds.slice(0, keys.bonds.indexOf(bondID)),
                        bondsAfter = keys.bonds.slice(keys.bonds.indexOf(bondID), keys.bonds.length);

                    // Check keys after ring token
                    for (var j = 1, jj = bondsAfter.length; j < jj; j++) {

                        if (bonds[bondsAfter[j]].name !== 'ring') {
                            continue;
                        }

                        var targetID = bonds[bondsAfter[j]].value.match(/[0-9]+/g),
                            _targetIndex = bondsAfter[j],
                            _sourceIndex = bondID;

                        if (sourceID !== null && targetID !== null && sourceID[0] === targetID[0]) {

                            while (atoms[_sourceIndex] === undefined && _sourceIndex >= -1) {
                                _sourceIndex -= 1;
                            }
                            while (atoms[_targetIndex] === undefined && _targetIndex >= -1) {
                                _targetIndex -= 1;
                            }

                            if (_sourceIndex === -1 || _targetIndex === -1) {
                                break;
                            }

                            // Update bond
                            var bondOrder = 1;

                            // Check aromatic
                            if (atoms[_sourceIndex].properties.aromatic === 1 && atoms[_targetIndex].properties.aromatic === 1) {
                                bondOrder = 1.5;
                            }
                            bonds[bondID].order = bondOrder;
                            bonds[bondID].atoms = [_sourceIndex.toString(), _targetIndex.toString()];

                            break;
                        }

                        // Check keys before ring token
                        if (j === bondsAfter.length - 1) {

                            // Find matching ring atom
                            for (var k = 0, kk = bondsBefore.length; k < kk; k++) {

                                if (bonds[bondsAfter[j]].name !== 'ring') {
                                    continue;
                                }

                                var _targetID = bonds[bondsBefore[k]].value.match(/[0-9]+/g),
                                    _targetIndex2 = bondID,
                                    _sourceIndex2 = bondsBefore[k];

                                if (sourceID !== null && _targetID !== null && sourceID[0] === _targetID[0]) {

                                    // Determine atom index
                                    while (atoms[_sourceIndex2] === undefined && _sourceIndex2 >= -1) {
                                        _sourceIndex2 -= 1;
                                    }
                                    while (atoms[_targetIndex2] === undefined && _targetIndex2 >= -1) {
                                        _targetIndex2 -= 1;
                                    }

                                    if (_sourceIndex2 === -1 || _targetIndex2 === -1) {
                                        break;
                                    }

                                    // Update bond
                                    var bondOrder = 1;

                                    // Check aromatic
                                    if (atoms[_sourceIndex2].properties.aromatic === 1 && atoms[_targetIndex2].properties.aromatic === 1) {
                                        bondOrder = 1.5;
                                    }

                                    bonds[bondID].order = bondOrder;
                                    bonds[bondID].atoms = [_sourceIndex2.toString(), _targetIndex2.toString()];

                                    break;
                                }
                            }
                        }
                    }

                    break;
            }
        }

        // Remove duplicate bonds
        for (var i = 0; i < keys.bonds.length; i++) {

            // Check for empty key
            if (keys.bonds[i] === undefined) {
                keys.bonds.splice(i, 1);
                i--;
                continue;
            }

            // Check for empty bond
            if (bonds[keys.bonds[i]].atoms.length !== 2) {
                delete bonds[keys.bonds[i]];
                keys.bonds.splice(i, 1);
                i--;
                continue;
            }

            if (i === keys.bonds.length - 1) {
                continue;
            }

            // Extract bonds after index
            var _bondsAfter = keys.bonds.slice(i, keys.bonds.length);

            // Check for duplicate/empty bonds
            for (var j = 0, jj = _bondsAfter.length; j < jj; j++) {

                if (j === 0) {
                    continue;
                }

                // Bond keys
                var bondID = _bondsAfter[j],
                    a = bonds[keys.bonds[i]],
                    b = bonds[bondID];

                if (a === undefined || b === undefined) {
                    continue;
                }

                // Compare atom keys
                if (a.atoms[0] === b.atoms[0] && a.atoms[1] === b.atoms[1] || a.atoms[0] === b.atoms[1] && a.atoms[1] === b.atoms[0]) {

                    // Duplicate ring bond
                    if (a.name === 'ring' && b.name === 'ring') {
                        delete bonds[bondID];
                        keys.bonds.splice(keys.bonds.indexOf(bondID), 1);
                    }

                    // Duplicate branching bonds
                    else if (a.name === 'branch' && (b.name === 'single' || b.name === 'double' || b.name === 'triple')) {
                        delete bonds[keys.bonds[i]];
                        keys.bonds.splice(i, 1);
                    } else if ((a.name === 'single' || a.name === 'double' || a.name === 'triple') && b.name === 'branch') {
                        delete bonds[bondID];
                        keys.bonds.splice(keys.bonds.indexOf(bondID), 1);
                    }

                    // Other duplicate bonds
                    else {
                        delete bonds[keys.bonds[i]];
                        keys.bonds.splice(i, 1);
                    }

                    i--;
                    break;
                }
            }
        }

        // Add bond references to all atoms
        for (var i = 0, ii = keys.bonds.length; i < ii; i++) {

            // Bond key
            var bondID = keys.bonds[i];

            // Atom keys
            var _sourceID = bonds[bondID].atoms[0],
                targetID = bonds[bondID].atoms[1];

            if (_sourceID === undefined || targetID === undefined) {
                continue;
            }

            // Add bond reference to atom
            atoms[_sourceID].bonds.id.push(bondID);
            atoms[targetID].bonds.id.push(bondID);

            atoms[_sourceID].bonds.atoms.push(targetID);
            atoms[targetID].bonds.atoms.push(_sourceID);

            atoms[_sourceID].bonds.electrons += bonds[bondID].order;
            atoms[targetID].bonds.electrons += bonds[bondID].order;
        }

        return [atoms, bonds, keys];
    }

    function implicitBonds(atoms, bonds, keys) {

        // Calculate valence electrons
        var valence = function valence(group) {
            var electrons = arguments[1] === undefined ? 18 : arguments[1];

            if (group <= 2) {
                return 2;
            } else if (group > 2 && group <= 12) {
                return 12;
            } else if (group > 12 && group <= 18) {
                return 18;
            }
        };

        // Adjust for charge
        var charge = function charge(electrons, _charge) {
            if (_charge > 0) {
                return electrons -= _charge;
            }
        };

        // Adjust for row
        var checkRow = function checkRow(group, protons, electrons) {
            if (group > 12 && protons > 10 && electrons <= 0) {
                return electrons += 4;
            } else {
                return electrons;
            }
        };

        // Update atoms/bonds
        var updateAtoms = function updateAtoms(sourceID, targetID, bondID, bondOrder) {

            atoms[sourceID].bonds.id.push(bondID);
            atoms[targetID].bonds.id.push(bondID);

            atoms[sourceID].bonds.atoms.push(targetID);
            atoms[targetID].bonds.atoms.push(sourceID);

            atoms[sourceID].bonds.electrons += bondOrder;
            atoms[targetID].bonds.electrons += bondOrder;
        };

        // Add bonds between adjacent atoms
        for (var i = 0, ii = keys.atoms.length - 1; i < ii; i++) {

            // Retrieve atoms
            var sourceAtom = atoms[keys.atoms[i]],
                targetAtom = atoms[keys.atoms[i + 1]];

            // Check for hydrogen
            var sourceIndex = i;

            while ((sourceAtom.name === 'H' || atoms[keys.atoms[sourceIndex]] === undefined) && sourceIndex > -1) {
                sourceAtom = atoms[keys.atoms[sourceIndex]];
                sourceIndex -= 1;
            }

            if (sourceIndex === -1) {
                continue;
            }

            var sourceTotal = charge(valence(sourceAtom.group) - sourceAtom.bonds.electrons, sourceAtom.properties.charge),
                targetTotal = charge(valence(targetAtom.group) - targetAtom.bonds.electrons, targetAtom.properties.charge);

            // Check atoms for exceptions
            sourceTotal = checkRow(sourceTotal);
            targetTotal = checkRow(targetTotal);

            if (sourceTotal <= 0 || targetTotal <= 0) {
                continue;
            }

            // Check if bond exists
            if (sourceAtom.bonds.atoms.indexOf(targetAtom.id) !== -1) {
                continue;
            }

            // Determine number of tokens between source/target atoms
            var n = keys.all.indexOf(targetAtom.id) - keys.all.indexOf(sourceAtom.id),
                exceptions = 0;

            // Check for tokens preventing implicit bond
            if (n > 1) {

                // Extract all keys between source/target atoms
                var keysBetween = keys.all.slice(keys.all.indexOf(sourceAtom.id) + 1, keys.all.indexOf(targetAtom.id));

                // Check for bond symbol
                for (var j = 0, jj = keysBetween.length; j < jj; j++) {
                    if (bonds[keysBetween[j]] === undefined) {
                        exceptions += 0;
                    } else if (bonds[keysBetween[j]].name !== 'ring') {
                        exceptions += 1;
                    }
                }
            }

            if (exceptions === 0) {

                // Assign new bond key
                var bondID = sourceAtom.name + sourceAtom.id + (targetAtom.name + targetAtom.id),
                    bondName = 'single',
                    bondValue = sourceAtom.name + targetAtom.name,
                    bondOrder = 1;

                // Check aromatic atoms
                if (sourceAtom.properties.aromatic === 1 && targetAtom.properties.aromatic === 1) {
                    bondName = 'aromatic';
                    bondOrder = 1.5;
                }

                // Update bonds
                keys.bonds.push(bondID);
                bonds[bondID] = addBond(bondID, bondName, bondValue, bondOrder, [sourceAtom.id, targetAtom.id]);

                // Update atoms
                updateAtoms(sourceAtom.id, targetAtom.id, bondID, bondOrder);
            }
        }

        // Add implicit hydrogen
        var H = _referenceElements2['default'].H;

        var update = function update(x, sourceID, sourceName) {

            var bondID = 'H' + (x + 1) + sourceName + sourceID;
            var targetID = bondID;

            atoms[targetID] = addAtom(targetID, 'H', 'H', H.group, H.protons, H.neutrons, H.electrons);
            bonds[bondID] = addBond(bondID, 'H', 'H', 1, [sourceID, targetID]);

            atoms[sourceID].bonds.id.push(bondID);
            atoms[sourceID].bonds.atoms.push(targetID);
            atoms[sourceID].bonds.electrons += 1;

            atoms[targetID].bonds.id.push(bondID);
            atoms[targetID].bonds.atoms.push(sourceID);
            atoms[targetID].bonds.electrons += 1;
        };

        for (var i = 0, ii = keys.atoms.length; i < ii; i++) {

            // Retrieve atoms
            var sourceAtom = atoms[keys.atoms[i]];

            // Check atom group
            if (sourceAtom.group < 13 && sourceAtom.group > 1) {
                continue;
            }

            var bondCount = sourceAtom.bonds.atoms.length;

            // Exception: explicit number of hydrogen
            if (sourceAtom.name !== 'H' && bondCount > 0) {

                for (var j = 0, jj = bondCount; j < jj; j++) {

                    // Retrieve target atom
                    var targetID = sourceAtom.bonds.atoms[j],
                        targetAtom = atoms[targetID];

                    // Check for hydrogen
                    if (targetAtom.name === 'H') {

                        // Check for value
                        var count = parseInt(targetAtom.value.match(/[0-9]+/g));

                        // Add hydrogen if electrons are available
                        if (count > 1 && count < sourceAtom.electrons) {

                            // Add hydrogen
                            for (var k = 0, kk = count - 1; k < kk; k++) {
                                update(k, sourceAtom.id, sourceAtom.name);
                            }
                        }
                    }
                }
            }

            // Exception: single uncharged hydrogen atom
            else if (sourceAtom.name === 'H' && sourceAtom.properties.charge === 0 && bondCount === 0) {
                update(i, sourceAtom.id, sourceAtom.name);
            }

            var total = 18 - sourceAtom.group - sourceAtom.bonds.electrons,
                _charge2 = sourceAtom.properties.charge;

            if (total <= 0 || sourceAtom.group === 1) {
                continue;
            }

            // Positive charge
            if (_charge2 > 0) {
                total -= _charge2;
            }

            // Negitive charge
            else if (_charge2 < 0) {
                total += _charge2;

                // Exception: lone pair
                if (total === 1) {
                    total -= 1;
                    atoms[sourceAtom.id].bonds.electrons += 1;
                }
            }

            if (total <= 0) {
                continue;
            }

            // Add hydrogen
            for (var j = 0, jj = total; j < jj; j++) {

                // Check aromatic
                if (sourceAtom.properties.aromatic === 1 && j > 1) {
                    continue;
                }

                update(j, sourceAtom.id, sourceAtom.name);
            }
        }

        return [atoms, bonds, keys];
    }

    function clean(atoms, bonds) {

        var atomID = Object.keys(atoms),
            bondID = Object.keys(bonds);

        for (var i = 0, ii = bondID.length; i < ii; i++) {

            // Re-label bond value
            var source = atoms[bonds[bondID[i]].atoms[0]],
                target = atoms[bonds[bondID[i]].atoms[1]],
                order = bonds[bondID[i]].order;

            // Format: source element + bond order + target element (e.g. C1C, C2O, O1H)
            bonds[bondID[i]].value = source.name + order + target.name;
        }

        var getID = function getID(name, i) {
            return name + (i + 1);
        };

        var setID = function setID(obj, a, b) {
            if (obj.hasOwnProperty(a)) {
                obj[b] = obj[a];
                delete obj[a];
            }
        };

        // Re-label atom id
        for (var i = 0, ii = atomID.length; i < ii; i++) {

            var oldID = atomID[i],
                newID = getID(atoms[oldID].name, i);

            // Set ID
            atoms[oldID].id = newID;

            // Update bond pointers
            for (var j = 0, jj = atoms[oldID].bonds.id.length; j < jj; j++) {

                var key = atoms[oldID].bonds.id[j],
                    index = bonds[key].atoms.indexOf(oldID);

                if (index !== -1) {
                    bonds[key].atoms[index] = newID;
                }

                key = atoms[oldID].bonds.atoms[j];
                index = atoms[key].bonds.atoms.indexOf(oldID);

                if (index !== -1) {
                    atoms[key].bonds.atoms[index] = newID;
                }
            }

            setID(atoms, oldID, newID);
        }

        return [atoms, bonds];
    }

    var atoms = undefined,
        bonds = undefined,
        properties = undefined,
        keys = undefined;

    // 1. Validate tokens
    tokens = validateTokens(tokens);

    if (!tokens) {
        return false;
    }

    // 2. Categorize tokens

    var _readTokens = readTokens(tokens);

    var _readTokens2 = _slicedToArray(_readTokens, 4);

    atoms = _readTokens2[0];
    bonds = _readTokens2[1];
    properties = _readTokens2[2];
    keys = _readTokens2[3];

    // 3. Add atoms
    atoms = defaultAtoms(atoms, keys);
    atoms = customAtoms(atoms, properties, keys);

    // 4. Add bonds

    var _explicitBonds = explicitBonds(atoms, bonds, keys);

    var _explicitBonds2 = _slicedToArray(_explicitBonds, 3);

    atoms = _explicitBonds2[0];
    bonds = _explicitBonds2[1];
    keys = _explicitBonds2[2];

    var _implicitBonds = implicitBonds(atoms, bonds, keys);

    var _implicitBonds2 = _slicedToArray(_implicitBonds, 3);

    atoms = _implicitBonds2[0];
    bonds = _implicitBonds2[1];
    keys = _implicitBonds2[2];

    // 5. Clean atoms/bonds

    var _clean = clean(atoms, bonds);

    var _clean2 = _slicedToArray(_clean, 2);

    atoms = _clean2[0];
    bonds = _clean2[1];

    return { atoms: atoms, bonds: bonds };
}

/*
  Method      : compare
  Description : compare values across two arrays
*/

function compare(a, b) {
    var ab = arguments[2] === undefined ? [] : arguments[2];

    for (var i = 0, ii = a.length; i < ii; i++) {
        ab[i] = b.indexOf(a[i]) > -1 ? 1 : 0;
    }

    return ab;
}

/*
  Method      : addAtom
  Description : return new atom
*/

function addAtom(id, name, value) {
    var group = arguments[3] === undefined ? 0 : arguments[3];
    var protons = arguments[4] === undefined ? 0 : arguments[4];
    var neutrons = arguments[5] === undefined ? 0 : arguments[5];
    var electrons = arguments[6] === undefined ? 0 : arguments[6];

    return {

        // Atom name
        id: id,
        name: name,
        value: value,

        // Atom propeties
        group: group,
        protons: protons,
        neutrons: neutrons,
        electrons: electrons,

        // Bond properties
        bonds: {
            id: [],
            atoms: [],
            electrons: 0
        },

        // Other properties
        properties: {
            chiral: 0,
            charge: 0,
            aromatic: 0
        }
    };
}

/*
  Method      : addBond
  Description : return new bond
*/

function addBond(id, name, value) {
    var order = arguments[3] === undefined ? 0 : arguments[3];
    var atoms = arguments[4] === undefined ? [] : arguments[4];

    return {

        //Bond name
        id: id,
        name: name,
        value: value,

        // Bond properties
        order: order,
        atoms: atoms
    };
}

/*
  Method      : nextAtom
  Description : find key of next atom in array
*/

function nextAtom(start, keys, atoms) {

    var index = keys.indexOf(start);

    if (index !== -1) {
        keys = keys.slice(index, keys.length);

        for (var i = 1, ii = keys.length; i < ii; i++) {
            if (atoms[keys[i]] !== undefined) {
                return keys[i];
            }
        }
    }

    return null;
}

/*
  Method      : previousAtom
  Description : find key of previous atom in array
*/

function previousAtom(start, keys, atoms) {

    if (start === '0' && atoms['0'] !== undefined) {
        return '0';
    }

    var index = keys.indexOf(start);

    if (index !== -1) {
        keys = keys.slice(0, index).reverse();

        for (var i = 0, ii = keys.length; i < ii; i++) {
            if (atoms[keys[i]] !== undefined) {
                return keys[i];
            }
        }
    }

    return null;
}

/*
  Exports
*/

exports.grammar = grammar;
exports.tokenize = tokenize;
exports.decode = decode;
},{"./../reference/elements":4}],2:[function(require,module,exports){
/*
  topology.js

  Description : chemical graph matrices and molecular topological indexes
  Exports     : adjacencyMatrix, distanceMatrix, wienerIndex, hyperwienerIndex

*/

/*
  Method      : adjacencyMatrix
  Description : return adjacency matrix of non-hydrogen atoms

  Syntax
    { header, adjacency } = adjacencyMatrix(molecule)

  Input
    molecule : object containing atoms and bonds

  Output
    header    : atom identifier
    adjacency : adjacency matrix

  Examples
    { header: id, adjacency: adj } = adjacencyMatrix(mol123)
    { header: names, adjacency: matrix } = adjacencyMatrix(molABC)
    { header: header123, adjacency: data123 } = adjacencyMatrix(myMolecule)
*/

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
function adjacencyMatrix(molecule) {
    var header = arguments[1] === undefined ? [] : arguments[1];
    var adjacency = arguments[2] === undefined ? [] : arguments[2];

    if (typeof molecule !== 'object' || molecule.atoms === undefined) {
        return null;
    }

    var keys = Object.keys(molecule.atoms);

    // Extract non-hydrogen atoms
    for (var i = 0, ii = keys.length; i < ii; i++) {

        if (molecule.atoms[keys[i]].name !== 'H') {
            header.push(molecule.atoms[keys[i]].id);
        }
    }

    // Fill adjacency matrix
    adjacency = Matrix(header.length);

    for (var i = 0, ii = header.length; i < ii; i++) {
        var source = molecule.atoms[header[i]];

        for (var j = 0, jj = source.bonds.atoms.length; j < jj; j++) {
            var target = molecule.atoms[source.bonds.atoms[j]],
                index = header.indexOf(target.id);

            if (target.name !== 'H' && index > 0) {
                adjacency[i][index] = 1;
                adjacency[index][i] = 1;
            }
        }
    }

    return { header: header, adjacency: adjacency };
}

/*
  Method      : distanceMatrix
  Description : return matrix of shortest paths between non-hydrogen atoms

  Syntax
    { header, distance } = distanceMatrix(adjacency)

  Input
    adjacency : adjacency matrix

  Output
    header   : atom identifier
    distance : distance matrix

  Examples
    { header: id123, distance: d123 } = distanceMatrix(adjacent123)
    { header: atomID, distance: myMatrix } = distanceMatrix(A1)
    { header: atomsABC, distance: distABC } = distanceMatrix(adj123)

  References
    R. Seidel, 'On the All-Pairs Shortest-Path Problem', ACM, (1992) 745-749.
*/

function distanceMatrix(adjacency) {
    var header = arguments[1] === undefined ? [] : arguments[1];
    var distance = arguments[2] === undefined ? [] : arguments[2];

    if (typeof adjacency !== 'object') {
        console.log('Error: Tokens must be of type "object"');
        return null;
    }

    // Check input for molecule
    if (adjacency.atoms !== undefined && adjacency.bonds !== undefined) {
        adjacency = adjacencyMatrix(adjacency);
    }

    // Check for header
    if (adjacency.header !== undefined) {
        header = adjacency.header;
        adjacency = adjacency.adjacency;
    }

    // Check symmetry of adjacency matrix
    for (var i = 0, ii = adjacency.length; i < ii; i++) {
        if (adjacency[i].length !== adjacency.length) {
            console.log('Error: Adjacency matrix must be symmetric');
            return null;
        }
    }

    // Seidel's Algorithm (all-pairs shortest-paths)
    function Seidel(A) {
        var B = arguments[1] === undefined ? [] : arguments[1];
        var D = arguments[2] === undefined ? [] : arguments[2];

        var Z = Multiply(A, A);

        for (var i = 0, ii = A.length; i < ii; i++) {
            B[i] = [];

            for (var j = 0, jj = A[0].length; j < jj; j++) {

                if (i !== j && (A[i][j] === 1 || Z[i][j] > 0)) {
                    B[i][j] = 1;
                } else {
                    B[i][j] = 0;
                }
            }
        }

        var count = 0;

        for (var i = 0, ii = B.length; i < ii; i++) {
            for (var j = 0, jj = B[0].length; j < jj; j++) {

                if (i !== j && B[i][j] === 1) {
                    count += 1;
                }
            }
        }

        if (count === B.length * B.length - B.length) {
            return Subtract(Multiply(B, 2), A);
        }

        var T = Seidel(B),
            X = Multiply(T, A);

        var degree = [];

        for (var i = 0, ii = A.length; i < ii; i++) {
            degree[i] = A[i].reduce(function (a, b) {
                return a + b;
            });
        }

        for (var i = 0, ii = X.length; i < ii; i++) {
            D[i] = [];

            for (var j = 0, jj = X[0].length; j < jj; j++) {

                if (X[i][j] >= T[i][j] * degree[j]) {
                    D[i][j] = 2 * T[i][j];
                } else if (X[i][j] < T[i][j] * degree[j]) {
                    D[i][j] = 2 * T[i][j] - 1;
                }
            }
        }

        return D;
    }

    if (adjacency.length !== 0) {
        distance = Seidel(adjacency);
    }

    return { header: header, distance: distance };
}

/*
  Method      : reciprocalMatrix
  Description : return reciprocal of distance matrix

  Syntax
    { header, reciprocal } = reciprocalMatrix(distance)

  Input
    distance : distance matrix

  Output
    header     : atom identifier
    reciprocal : reciprocal matrix

  Examples
    { header: id123, reciprocal: r123 } = distanceMatrix(dist123)
    { header: atomID, reciprocal: R1 } = distanceMatrix(D1)
    { header: atomsABC, reciprocal: recipABC } = distanceMatrix(distABC)

*/

function reciprocalMatrix(distance) {
    var header = arguments[1] === undefined ? [] : arguments[1];
    var reciprocal = arguments[2] === undefined ? [] : arguments[2];

    if (typeof distance !== 'object') {
        console.log('Error: Tokens must be of type "object"');
        return null;
    }

    // Check input for molecule
    if (distance.atoms !== undefined && distance.bonds !== undefined) {
        distance = distanceMatrix(adjacencyMatrix(distance));
    }

    // Check for header
    if (distance.header !== undefined) {
        header = distance.header;
    }
    if (distance.distance !== undefined) {
        distance = distance.distance;
    }

    // Check symmetry of distance matrix
    for (var i = 0, ii = distance.length; i < ii; i++) {
        if (distance[i].length !== distance.length) {
            console.log('Error: Distance matrix must be symmetric');
            return null;
        }
    }

    for (var i = 0, ii = distance.length; i < ii; i++) {
        reciprocal[i] = [];

        for (var j = 0, jj = distance[i].length; j < jj; j++) {
            if (i === j) {
                reciprocal[i][j] = 0;
            } else {
                reciprocal[i][j] = Math.round(1 / distance[i][j] * 1000000) / 1000000;
            }
        }
    }

    if (reciprocal === undefined) {
        reciprocal = [];
    }

    return { header: header, reciprocal: reciprocal };
}

/*
  Method      : wienerIndex
  Description : return Wiener topology index

  Syntax
    index = wienerIndex(distance)

  Input
    distance : distance matrix

  Output
    index : Wiener index

  Examples
    wiener = wienerIndex(dist123)
    w123 = wienerIndex(distanceABC)
*/

function wienerIndex(distance) {
    var index = arguments[1] === undefined ? 0 : arguments[1];

    if (typeof distance !== 'object') {
        console.log('Error: Tokens must be of type "object"');
        return null;
    }

    // Check input for molecule
    if (distance.atoms !== undefined && distance.bonds !== undefined) {
        distance = distanceMatrix(adjacencyMatrix(distance));
    }

    // Check for header
    if (distance.distance !== undefined) {
        distance = distance.distance;
    }

    // Check symmetry of distance matrix
    for (var i = 0, ii = distance.length; i < ii; i++) {
        if (distance[i].length !== distance.length) {
            console.log('Error: Distance matrix must be symmetric');
            return null;
        }
    }

    // Calculate Wiener index
    for (var i = 0, ii = distance.length; i < ii; i++) {
        for (var j = 0, jj = distance[i].length; j < jj; j++) {
            index += distance[i][j];
        }
    }

    return index / 2;
}

/*
  Method      : hyperwienerIndex
  Description : return Hyper-Wiener topology index

  Syntax
    index = hyperwienerIndex(distance)

  Input
    distance : distance matrix

  Output
    index : Hyper-Wiener index

  Examples
    hyperwiener = hyperwienerIndex(dist123)
    hw123 = hyperwienerIndex(distanceABC)
*/

function hyperwienerIndex(distance) {
    var index = arguments[1] === undefined ? 0 : arguments[1];

    if (typeof distance !== 'object') {
        console.log('Error: Tokens must be of type "object"');
        return null;
    }

    // Check input for molecule
    if (distance.atoms !== undefined && distance.bonds !== undefined) {
        distance = distanceMatrix(adjacencyMatrix(distance));
    }

    // Check for header
    if (distance.distance !== undefined) {
        distance = distance.distance;
    }

    // Check symmetry of distance matrix
    for (var i = 0, ii = distance.length; i < ii; i++) {
        if (distance[i].length !== distance.length) {
            console.log('Error: Distance matrix must be symmetric');
            return null;
        }
    }

    // Calculate Hyper-Wiener index
    for (var i = 0, ii = distance.length; i < ii; i++) {
        for (var j = 0, jj = distance[i].length; j < jj; j++) {
            if (i !== j && i < j) {
                index += distance[i][j] + Math.pow(distance[i][j], 2);
            }
        }
    }

    return index / 2;
}

/*
  Method      : hararyIndex
  Description : return Harary topology index

  Syntax
    index = hararyIndex(reciprocal)

  Input
    reciprocal : reciprocal of distance matrix

  Output
    index : Harary index

  Examples
    harary = hararyIndex(recip123)
    h123 = hararyIndex(reciprocalABC)
*/

function hararyIndex(reciprocal) {
    var index = arguments[1] === undefined ? 0 : arguments[1];

    if (typeof reciprocal !== 'object') {
        console.log('Error: Tokens must be of type "object"');
        return null;
    }

    // Check input for molecule
    if (reciprocal.atoms !== undefined && reciprocal.bonds !== undefined) {
        reciprocal = reciprocalMatrix(distanceMatrix(adjacencyMatrix(reciprocal)));
    }

    // Check for header
    if (reciprocal.reciprocal !== undefined) {
        reciprocal = reciprocal.reciprocal;
    }

    // Check symmetry of reciprocal matrix
    for (var i = 0, ii = reciprocal.length; i < ii; i++) {
        if (reciprocal[i].length !== reciprocal.length) {
            console.log('Error: Distance matrix must be symmetric');
            return null;
        }
    }

    // Calculate Harary index
    for (var i = 0, ii = reciprocal.length; i < ii; i++) {
        for (var j = 0, jj = reciprocal[i].length; j < jj; j++) {
            if (i !== j) {
                index += reciprocal[i][j];
            }
        }
    }

    return Math.round(index / 2 * 1000) / 1000;
}

/*
  Method      : Matrix
  Description : return zeros matrix
*/

function Matrix(rows) {
    var columns = arguments[1] === undefined ? rows : arguments[1];
    var matrix = arguments[2] === undefined ? [] : arguments[2];
    return (function () {

        if (typeof rows !== 'number' || typeof columns !== 'number') {
            return null;
        }

        // Rows
        for (var i = 0, ii = rows; i < ii; i++) {
            matrix[i] = [];

            // Columns
            for (var j = 0, jj = columns; j < jj; j++) {
                matrix[i][j] = 0;
            }
        }

        return matrix;
    })();
}

/*
  Method      : Multiply
  Description : matrix multiplication
*/

function Multiply(a, b) {
    var output = arguments[2] === undefined ? [] : arguments[2];

    switch (typeof b) {

        case 'object':

            for (var i = 0, ii = a.length; i < ii; i++) {
                output[i] = [];

                for (var j = 0, jj = b[0].length; j < jj; j++) {
                    output[i][j] = 0;

                    for (var k = 0, kk = a[0].length; k < kk; k++) {
                        output[i][j] += a[i][k] * b[k][j];
                    }
                }
            }

            return output;

        case 'number':

            for (var i = 0, ii = a.length; i < ii; i++) {
                output[i] = [];

                for (var j = 0, jj = a[0].length; j < jj; j++) {
                    output[i][j] = a[i][j] * b;
                }
            }

            return output;
    }
}

/*
  Method      : Subtract
  Description : matrix subtraction
*/

function Subtract(a, b) {
    var output = arguments[2] === undefined ? [] : arguments[2];

    switch (typeof b) {

        case 'object':

            for (var i = 0, ii = a.length; i < ii; i++) {
                output[i] = [];

                for (var j = 0, jj = a[0].length; j < jj; j++) {
                    output[i][j] = a[i][j] - b[i][j];
                }
            }

            return output;

        case 'value':

            for (var i = 0, ii = a.length; i < ii; i++) {
                output[i] = [];

                for (var j = 0, jj = a[0].length; j < jj; j++) {
                    output[i][j] = a[i][j] - b;
                }
            }

            return output;
    }
}

/*
  Method      : Inverse
  Description : matrix inversion
*/

function Inverse(a) {
    var identity = arguments[1] === undefined ? [] : arguments[1];
    var inverse = arguments[2] === undefined ? [] : arguments[2];

    for (var i = 0, ii = a.length; i < ii; i++) {
        identity[i] = [];
        inverse[i] = [];

        for (var j = 0, jj = a.length; j < jj; j++) {

            if (i === j) {
                inverse[i][j] = 1;
            } else {
                inverse[i][j] = 0;
            }

            identity[i][j] = a[i][j];
        }
    }

    for (var i = 0, ii = identity.length; i < ii; i++) {
        var x = identity[i][i];

        if (x === 0) {

            for (var j = i + 1, jj = identity.length; j < jj; j++) {
                if (identity[j][i] !== 0) {

                    for (var k = 0, kk = identity.length; k < kk; k++) {

                        x = identity[i][k];
                        identity[i][k] = identity[j][k];
                        identity[j][k] = x;

                        x = inverse[i][k];
                        inverse[i][k] = inverse[j][k];
                        inverse[j][k] = x;
                    }

                    break;
                }
            }

            x = identity[i][i];

            if (x === 0) {
                return;
            }
        }

        for (var j = 0, jj = identity.length; j < jj; j++) {

            identity[i][j] = identity[i][j] / x;
            inverse[i][j] = inverse[i][j] / x;
        }

        for (var j = 0, jj = identity.length; j < jj; j++) {
            if (i === j) {
                continue;
            }

            x = identity[j][i];

            for (var k = 0, kk = identity.length; k < kk; k++) {

                identity[j][k] -= x * identity[i][k];
                inverse[j][k] -= x * inverse[i][k];
            }
        }
    }

    for (var i = 0, ii = inverse.length; i < ii; i++) {
        for (var j = 0, jj = inverse.length; j < jj; j++) {
            inverse[i][j] = Math.round(inverse[i][j] * 100000) / 100000;
        }
    }

    return inverse;
}

/*
  Exports
*/

exports.adjacencyMatrix = adjacencyMatrix;
exports.distanceMatrix = distanceMatrix;
exports.reciprocalMatrix = reciprocalMatrix;
exports.wienerIndex = wienerIndex;
exports.hyperwienerIndex = hyperwienerIndex;
exports.hararyIndex = hararyIndex;
},{}],3:[function(require,module,exports){
/*
  molecules.js

  Description : chemical graph theory library
  Imports     : periodic_table, tokenize, decode
  Exports     : parse, encode, connectivity, topology

*/

/*
  Imports
*/

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _referenceElements = require('./reference/elements');

var _encodingSmiles = require('./encoding/smiles');

var _extensionsTopology = require('./extensions/topology');

/*
  Method      : parse
  Description : convert input to molecule

  Options     : .smiles, .json

  Examples
    molecule123 = Molecules.parse.smiles('CC(=O)CN')
*/

var parse = {

    smiles: function smiles(input) {

        if (typeof input === 'string') {
            var _decode = (0, _encodingSmiles.decode)((0, _encodingSmiles.tokenize)(input));

            var atoms = _decode.atoms;
            var bonds = _decode.bonds;

            return getMolecule(atoms, bonds);
        }
    },

    json: function json(input) {

        return JSON.parse(input);
    }
};

/*
  Method      : encode
  Description : convert input to desired output

  Options     : .json

  Examples
    json123 = Molecules.encode.json(molecule123)
*/

var encode = {

    json: function json(input) {

        return JSON.stringify(input, null, '\t');
    }
};

/*
  Method      : connectivity
  Description : return chemical graph matrices

  Options     : .adjacency, .distance, .reciprocal
*/

var connectivity = {

    adjacency: function adjacency(molecule) {

        return (0, _extensionsTopology.adjacencyMatrix)(molecule);
    },

    distance: function distance(adjacency) {

        return (0, _extensionsTopology.distanceMatrix)(adjacency);
    },

    reciprocal: function reciprocal(distance) {

        return (0, _extensionsTopology.reciprocalMatrix)(distance);
    }
};

/*
  Method      : topology
  Description : return molecular topological indexes

  Options     : .harary, .hyperwiener, .wiener
*/

var topology = {

    harary: function harary(molecule) {

        return (0, _extensionsTopology.hararyIndex)(molecule);
    },

    hyperwiener: function hyperwiener(molecule) {

        return (0, _extensionsTopology.hyperwienerIndex)(molecule);
    },

    wiener: function wiener(molecule) {

        return (0, _extensionsTopology.wienerIndex)(molecule);
    }
};

/*
  Method      : getMolecule
  Description : return new molecule
*/

function getMolecule() {
    var atoms = arguments[0] === undefined ? {} : arguments[0];
    var bonds = arguments[1] === undefined ? {} : arguments[1];
    var id = arguments[2] === undefined ? 0 : arguments[2];

    var mass = getMass(atoms),
        formula = getFormula(atoms),
        name = getName(formula);

    return {
        id: id,
        name: name,
        atoms: atoms,
        bonds: bonds,
        properties: {
            mass: mass,
            formula: formula
        }
    };
}

/*
  Method      : getFormula
  Description : return molecular formula
*/

function getFormula(atoms) {
    var formula = arguments[1] === undefined ? {} : arguments[1];

    if (typeof atoms !== 'object') {
        return null;
    }

    var keys = Object.keys(atoms);

    for (var i = 0, ii = keys.length; i < ii; i++) {

        if (formula[atoms[keys[i]].name] === undefined) {
            formula[atoms[keys[i]].name] = 1;
        } else {
            formula[atoms[keys[i]].name] += 1;
        }
    }

    return formula;
}

/*
  Method      : getName
  Description : return molecular formula as string
*/

function getName(formula) {
    var name = arguments[1] === undefined ? [] : arguments[1];

    if (typeof formula !== 'object') {
        return null;
    }

    var keys = Object.keys(formula).sort();

    var remove = function remove(element) {
        return keys.splice(keys.indexOf(element), 1);
    };

    var update = function update(element) {
        if (formula[element] === 1) {
            name.push(element);
        } else {
            name.push(element + formula[element]);
        }
    };

    if (keys.indexOf('C') !== -1) {
        update('C');
        remove('C');
    }

    if (keys.indexOf('H') !== -1) {
        update('H');
        remove('H');
    }

    if (keys.length > 0) {

        for (var i = 0, ii = keys.length; i < ii; i++) {
            update(keys[i]);
        }
    }

    return name.join('');
}

/*
  Method      : getMass
  Description : return molecular weight
*/

function getMass(atoms) {
    var mass = arguments[1] === undefined ? 0 : arguments[1];

    if (typeof atoms !== 'object') {
        return null;
    }

    var keys = Object.keys(atoms);

    for (var i = 0, ii = keys.length; i < ii; i++) {
        mass += atoms[keys[i]].protons + atoms[keys[i]].neutrons;
    }

    return Math.round(mass * 10000) / 10000;
}

/*
  Exports
*/

exports.parse = parse;
exports.encode = encode;
exports.connectivity = connectivity;
exports.topology = topology;
},{"./encoding/smiles":1,"./extensions/topology":2,"./reference/elements":4}],4:[function(require,module,exports){
/*
  elements.js

  Description : basic properties of the elements
  Exports     : periodic_table

*/

/*
  Variable    : periodic_table
  Description : dictionary of atomic properties

  Fields
    protons   : atomic number
    neutrons  : weighted average number of neutrons
    electrons : total electrons
    group     : periodic table column number
    period    : periodic table row number
*/

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var periodic_table = {

  'H': { protons: 1, neutrons: 0.0079, electrons: 1, group: 1, period: 1 },
  'D': { protons: 1, neutrons: 1, electrons: 1, group: 1, period: 1 },
  'He': { protons: 2, neutrons: 2.0026, electrons: 2, group: 18, period: 1 },
  'Li': { protons: 3, neutrons: 3.941, electrons: 3, group: 1, period: 2 },
  'Be': { protons: 4, neutrons: 5.0122, electrons: 4, group: 2, period: 2 },
  'B': { protons: 5, neutrons: 5.811, electrons: 5, group: 13, period: 2 },
  'C': { protons: 6, neutrons: 6.0107, electrons: 6, group: 14, period: 2 },
  'N': { protons: 7, neutrons: 7.0067, electrons: 7, group: 15, period: 2 },
  'O': { protons: 8, neutrons: 7.9994, electrons: 8, group: 16, period: 2 },
  'F': { protons: 9, neutrons: 9.9984, electrons: 9, group: 17, period: 2 },
  'Ne': { protons: 10, neutrons: 10.1797, electrons: 10, group: 18, period: 2 },
  'Na': { protons: 11, neutrons: 11.9897, electrons: 11, group: 1, period: 3 },
  'Mg': { protons: 12, neutrons: 12.305, electrons: 12, group: 2, period: 3 },
  'Al': { protons: 13, neutrons: 13.9815, electrons: 13, group: 13, period: 3 },
  'Si': { protons: 14, neutrons: 14.0855, electrons: 14, group: 14, period: 3 },
  'P': { protons: 15, neutrons: 15.9738, electrons: 15, group: 15, period: 3 },
  'S': { protons: 16, neutrons: 16.065, electrons: 16, group: 16, period: 3 },
  'Cl': { protons: 17, neutrons: 18.45, electrons: 17, group: 17, period: 3 },
  'Ar': { protons: 18, neutrons: 21.948, electrons: 18, group: 18, period: 3 },
  'As': { protons: 33, neutrons: 41.9216, electrons: 33, group: 15, period: 4 },
  'Se': { protons: 34, neutrons: 44.96, electrons: 34, group: 16, period: 4 },
  'Br': { protons: 35, neutrons: 44.904, electrons: 35, group: 17, period: 4 },
  'I': { protons: 53, neutrons: 73.90447, electrons: 53, group: 17, period: 5 }
};

/*
  Method    : getElement
  Description : return info on element
*/

function getElement(element) {

  if (periodic_table[element] !== undefined) {

    return periodic_table[element];
  }

  return null;
}

/*
  Exports
*/

exports['default'] = periodic_table;
module.exports = exports['default'];
},{}]},{},[3])(3)
});